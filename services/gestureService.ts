/**
 * Gesture Control Service - Lithosphere v6.0.0 "Cosmic Symphony"
 *
 * Provides real-time hand tracking and gesture recognition using MediaPipe.
 * Maps gestures to simulation controls for haptic-style interaction.
 *
 * @author Claude Code for NeuraByte Labs
 * @version 6.0.0
 */

import {
  GestureRecognizer,
  HandLandmarker,
  FilesetResolver,
  GestureRecognizerResult,
  HandLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type GestureType =
  | 'None'
  | 'Closed_Fist'
  | 'Open_Palm'
  | 'Pointing_Up'
  | 'Thumb_Down'
  | 'Thumb_Up'
  | 'Victory'
  | 'ILoveYou';

export type GestureAction =
  | 'pause'
  | 'resume'
  | 'increaseGravity'
  | 'decreaseGravity'
  | 'toggleTrails'
  | 'nextPreset'
  | 'spawnBody'
  | 'none';

export interface HandData {
  landmarks: NormalizedLandmark[];
  worldLandmarks: NormalizedLandmark[];
  gesture: GestureType;
  confidence: number;
  palmPosition: { x: number; y: number; z: number };
  palmRotation: number;  // degrees
  isPinching: boolean;
  pinchStrength: number;
}

export interface GestureState {
  leftHand: HandData | null;
  rightHand: HandData | null;
  twoHandsDistance: number | null;
  lastAction: GestureAction;
  lastActionTime: number;
}

export interface GestureConfig {
  numHands: number;
  minDetectionConfidence: number;
  minPresenceConfidence: number;
  minTrackingConfidence: number;
  gestureDebounce: number;  // ms between gesture triggers
  positionSmoothing: number;  // lerp factor for position
  pinchThreshold: number;  // normalized distance for pinch detection
}

export interface CameraControl {
  panX: number;      // -1 to 1
  panY: number;      // -1 to 1
  zoom: number;      // 0.5 to 2
  rotationY: number; // degrees
  scale: number;     // 0.5 to 2
}

// ============================================================================
// GESTURE TO ACTION MAPPING
// ============================================================================

const GESTURE_ACTION_MAP: Record<GestureType, GestureAction> = {
  'None': 'none',
  'Closed_Fist': 'pause',
  'Open_Palm': 'resume',
  'Pointing_Up': 'increaseGravity',
  'Thumb_Down': 'decreaseGravity',
  'Thumb_Up': 'toggleTrails',
  'Victory': 'nextPreset',
  'ILoveYou': 'spawnBody',
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_GESTURE_CONFIG: GestureConfig = {
  numHands: 2,
  minDetectionConfidence: 0.5,
  minPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  gestureDebounce: 300,
  positionSmoothing: 0.3,
  pinchThreshold: 0.05,
};

// ============================================================================
// HAND LANDMARK INDICES
// ============================================================================

export const LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

// ============================================================================
// GESTURE CONTROLLER CLASS
// ============================================================================

export class GestureController {
  private gestureRecognizer: GestureRecognizer | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private mediaStream: MediaStream | null = null;
  private config: GestureConfig;
  private isRunning = false;
  private animationFrameId: number | null = null;

  // State
  private _state: GestureState = {
    leftHand: null,
    rightHand: null,
    twoHandsDistance: null,
    lastAction: 'none',
    lastActionTime: 0,
  };

  // Smoothing
  private smoothedPositions: Map<string, { x: number; y: number; z: number }> = new Map();

  // Callbacks
  private onGestureCallback: ((action: GestureAction, hand: 'left' | 'right') => void) | null = null;
  private onFrameCallback: ((state: GestureState) => void) | null = null;

  constructor(config: Partial<GestureConfig> = {}) {
    this.config = { ...DEFAULT_GESTURE_CONFIG, ...config };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  get state(): GestureState {
    return { ...this._state };
  }

  get isInitialized(): boolean {
    return this.gestureRecognizer !== null;
  }

  get isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Initialize MediaPipe models
   */
  async initialize(): Promise<void> {
    if (this.gestureRecognizer) return;

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: this.config.numHands,
      minHandDetectionConfidence: this.config.minDetectionConfidence,
      minHandPresenceConfidence: this.config.minPresenceConfidence,
      minTrackingConfidence: this.config.minTrackingConfidence,
    });
  }

  /**
   * Start webcam and gesture recognition
   */
  async start(videoElement?: HTMLVideoElement): Promise<HTMLVideoElement> {
    await this.initialize();

    // Create or use provided video element
    this.videoElement = videoElement || document.createElement('video');
    this.videoElement.setAttribute('playsinline', 'true');
    this.videoElement.setAttribute('autoplay', 'true');
    this.videoElement.style.transform = 'scaleX(-1)'; // Mirror

    // Get webcam stream
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
    });

    this.videoElement.srcObject = this.mediaStream;
    await this.videoElement.play();

    this.isRunning = true;
    this.processFrame();

    return this.videoElement;
  }

  /**
   * Stop gesture recognition
   */
  stop(): void {
    this.isRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this._state = {
      leftHand: null,
      rightHand: null,
      twoHandsDistance: null,
      lastAction: 'none',
      lastActionTime: 0,
    };
  }

  /**
   * Set callback for gesture actions
   */
  onGesture(callback: (action: GestureAction, hand: 'left' | 'right') => void): void {
    this.onGestureCallback = callback;
  }

  /**
   * Set callback for each frame (for continuous tracking)
   */
  onFrame(callback: (state: GestureState) => void): void {
    this.onFrameCallback = callback;
  }

  /**
   * Get camera control values from hand positions
   */
  getCameraControl(): CameraControl {
    const defaultControl: CameraControl = {
      panX: 0,
      panY: 0,
      zoom: 1,
      rotationY: 0,
      scale: 1,
    };

    if (!this._state.leftHand && !this._state.rightHand) {
      return defaultControl;
    }

    // Single hand: pan and rotation
    const activeHand = this._state.rightHand || this._state.leftHand;
    if (activeHand && !this._state.twoHandsDistance) {
      return {
        panX: (activeHand.palmPosition.x - 0.5) * 2,
        panY: (activeHand.palmPosition.y - 0.5) * 2,
        zoom: 1 - (activeHand.palmPosition.z * 2), // Closer = zoom in
        rotationY: activeHand.palmRotation,
        scale: 1,
      };
    }

    // Two hands: scale
    if (this._state.twoHandsDistance !== null) {
      return {
        panX: 0,
        panY: 0,
        zoom: 1,
        rotationY: 0,
        scale: Math.max(0.5, Math.min(2, this._state.twoHandsDistance * 3)),
      };
    }

    return defaultControl;
  }

  /**
   * Get grab state for body manipulation
   */
  getGrabState(): { isGrabbing: boolean; position: { x: number; y: number; z: number } | null } {
    const activeHand = this._state.rightHand || this._state.leftHand;
    if (!activeHand) {
      return { isGrabbing: false, position: null };
    }

    return {
      isGrabbing: activeHand.isPinching,
      position: activeHand.isPinching ? activeHand.palmPosition : null,
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop();

    if (this.gestureRecognizer) {
      this.gestureRecognizer.close();
      this.gestureRecognizer = null;
    }

    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }

    this.videoElement = null;
    this.onGestureCallback = null;
    this.onFrameCallback = null;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private processFrame(): void {
    if (!this.isRunning || !this.gestureRecognizer || !this.videoElement) return;

    const startTimeMs = performance.now();

    try {
      const results = this.gestureRecognizer.recognizeForVideo(this.videoElement, startTimeMs);
      this.processResults(results);
    } catch (error) {
      console.error('Gesture recognition error:', error);
    }

    this.animationFrameId = requestAnimationFrame(() => this.processFrame());
  }

  private processResults(results: GestureRecognizerResult): void {
    const now = performance.now();

    // Reset state
    this._state.leftHand = null;
    this._state.rightHand = null;
    this._state.twoHandsDistance = null;

    if (!results.landmarks || results.landmarks.length === 0) {
      if (this.onFrameCallback) {
        this.onFrameCallback(this._state);
      }
      return;
    }

    // Process each detected hand
    for (let i = 0; i < results.landmarks.length; i++) {
      const landmarks = results.landmarks[i];
      const worldLandmarks = results.worldLandmarks?.[i] || landmarks;
      const handedness = results.handednesses?.[i]?.[0]?.categoryName || 'Right';
      const gesture = results.gestures?.[i]?.[0];

      const handData = this.createHandData(
        landmarks,
        worldLandmarks,
        gesture?.categoryName as GestureType || 'None',
        gesture?.score || 0,
        `hand_${i}`
      );

      // Note: MediaPipe handedness is from the camera's perspective (mirrored)
      // So 'Right' from camera = user's left hand
      if (handedness === 'Left') {
        this._state.rightHand = handData;
      } else {
        this._state.leftHand = handData;
      }

      // Trigger gesture action with debounce
      if (gesture && gesture.score > 0.7) {
        const action = GESTURE_ACTION_MAP[gesture.categoryName as GestureType] || 'none';
        if (action !== 'none' && now - this._state.lastActionTime > this.config.gestureDebounce) {
          this._state.lastAction = action;
          this._state.lastActionTime = now;
          if (this.onGestureCallback) {
            this.onGestureCallback(action, handedness === 'Left' ? 'right' : 'left');
          }
        }
      }
    }

    // Calculate two-hands distance
    if (this._state.leftHand && this._state.rightHand) {
      const dx = this._state.leftHand.palmPosition.x - this._state.rightHand.palmPosition.x;
      const dy = this._state.leftHand.palmPosition.y - this._state.rightHand.palmPosition.y;
      this._state.twoHandsDistance = Math.sqrt(dx * dx + dy * dy);
    }

    if (this.onFrameCallback) {
      this.onFrameCallback(this._state);
    }
  }

  private createHandData(
    landmarks: NormalizedLandmark[],
    worldLandmarks: NormalizedLandmark[],
    gesture: GestureType,
    confidence: number,
    handId: string
  ): HandData {
    // Calculate palm position (average of wrist and MCP joints)
    const palmLandmarks = [
      landmarks[LANDMARKS.WRIST],
      landmarks[LANDMARKS.INDEX_MCP],
      landmarks[LANDMARKS.MIDDLE_MCP],
      landmarks[LANDMARKS.RING_MCP],
      landmarks[LANDMARKS.PINKY_MCP],
    ];

    let palmX = 0, palmY = 0, palmZ = 0;
    for (const lm of palmLandmarks) {
      palmX += lm.x;
      palmY += lm.y;
      palmZ += lm.z || 0;
    }
    palmX /= palmLandmarks.length;
    palmY /= palmLandmarks.length;
    palmZ /= palmLandmarks.length;

    // Apply smoothing
    const smoothedPos = this.smoothPosition(handId, palmX, palmY, palmZ);

    // Calculate palm rotation (angle from wrist to middle MCP)
    const wrist = landmarks[LANDMARKS.WRIST];
    const middleMcp = landmarks[LANDMARKS.MIDDLE_MCP];
    const rotation = Math.atan2(middleMcp.y - wrist.y, middleMcp.x - wrist.x) * (180 / Math.PI);

    // Detect pinch (thumb tip to index tip distance)
    const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
    const indexTip = landmarks[LANDMARKS.INDEX_TIP];
    const pinchDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    );
    const isPinching = pinchDistance < this.config.pinchThreshold;
    const pinchStrength = Math.max(0, 1 - pinchDistance / this.config.pinchThreshold);

    return {
      landmarks,
      worldLandmarks,
      gesture,
      confidence,
      palmPosition: smoothedPos,
      palmRotation: rotation,
      isPinching,
      pinchStrength,
    };
  }

  private smoothPosition(
    id: string,
    x: number,
    y: number,
    z: number
  ): { x: number; y: number; z: number } {
    const prev = this.smoothedPositions.get(id);
    const alpha = this.config.positionSmoothing;

    if (!prev) {
      this.smoothedPositions.set(id, { x, y, z });
      return { x, y, z };
    }

    const smoothed = {
      x: prev.x + alpha * (x - prev.x),
      y: prev.y + alpha * (y - prev.y),
      z: prev.z + alpha * (z - prev.z),
    };

    this.smoothedPositions.set(id, smoothed);
    return smoothed;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createGestureController(config?: Partial<GestureConfig>): GestureController {
  return new GestureController(config);
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalGestureController: GestureController | null = null;

export function getGlobalGestureController(): GestureController {
  if (!globalGestureController) {
    globalGestureController = new GestureController();
  }
  return globalGestureController;
}

export function disposeGlobalGestureController(): void {
  if (globalGestureController) {
    globalGestureController.dispose();
    globalGestureController = null;
  }
}
