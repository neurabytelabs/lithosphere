/**
 * Gesture Panel Component - Lithosphere v6.0.0 "Cosmic Symphony"
 *
 * UI for webcam-based gesture control with hand tracking visualization.
 * Uses MediaPipe for real-time hand landmark detection.
 *
 * @author Claude Code for NeuraByte Labs
 * @version 6.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  GestureController,
  createGestureController,
  GestureState,
  GestureAction,
  CameraControl,
  LANDMARKS,
} from '../services/gestureService';

// ============================================================================
// TYPES
// ============================================================================

interface GesturePanelProps {
  onGestureController?: (controller: GestureController | null) => void;
  onCameraControl?: (control: CameraControl) => void;
  onGestureAction?: (action: GestureAction) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  panel: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '360px', // Next to AudioPanel
    width: '280px',
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: '12px',
    border: '1px solid rgba(100, 255, 100, 0.3)',
    padding: '16px',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#fff',
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    borderBottom: '1px solid rgba(100, 255, 100, 0.2)',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#88ff88',
    margin: 0,
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '4px 8px',
  },
  videoContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '160px',
    backgroundColor: 'rgba(0, 0, 10, 0.5)',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transform: 'scaleX(-1)', // Mirror
  },
  canvas: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
  },
  startButton: {
    width: '100%',
    padding: '12px',
    fontSize: '12px',
    backgroundColor: 'rgba(50, 80, 50, 0.5)',
    border: '1px solid rgba(100, 255, 100, 0.3)',
    borderRadius: '8px',
    color: '#88ff88',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '12px',
  },
  stopButton: {
    backgroundColor: 'rgba(80, 50, 50, 0.5)',
    borderColor: 'rgba(255, 100, 100, 0.3)',
    color: '#ff8888',
  },
  gestureDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(30, 50, 30, 0.5)',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  gestureLabel: {
    fontSize: '11px',
    color: '#888',
    textTransform: 'uppercase' as const,
  },
  gestureValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#88ff88',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  stat: {
    textAlign: 'center' as const,
    padding: '8px',
    backgroundColor: 'rgba(30, 50, 30, 0.5)',
    borderRadius: '6px',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
  },
  statLabel: {
    fontSize: '9px',
    color: '#888',
    textTransform: 'uppercase' as const,
    marginTop: '2px',
  },
  helpText: {
    fontSize: '10px',
    color: '#666',
    marginTop: '12px',
    lineHeight: 1.4,
  },
};

// Gesture icons/labels
const GESTURE_LABELS: Record<string, string> = {
  'None': '--',
  'Closed_Fist': 'FIST (Pause)',
  'Open_Palm': 'PALM (Resume)',
  'Pointing_Up': 'POINT (Gravity+)',
  'Thumb_Down': 'DOWN (Gravity-)',
  'Thumb_Up': 'UP (Trails)',
  'Victory': 'VICTORY (Preset)',
  'ILoveYou': 'LOVE (Spawn)',
};

// ============================================================================
// COMPONENT
// ============================================================================

export const GesturePanel: React.FC<GesturePanelProps> = ({
  onGestureController,
  onCameraControl,
  onGestureAction,
  isCollapsed = false,
  onToggle,
}) => {
  const [controller, setController] = useState<GestureController | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState | null>(null);
  const [lastAction, setLastAction] = useState<GestureAction>('none');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================================================
  // HAND VISUALIZATION
  // ============================================================================

  const drawHandLandmarks = useCallback((state: GestureState) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw each hand
    const hands = [state.leftHand, state.rightHand].filter(h => h !== null);

    hands.forEach((hand, index) => {
      if (!hand) return;

      const color = index === 0 ? '#88ff88' : '#88ffff';

      // Draw landmarks
      hand.landmarks.forEach((lm, i) => {
        const x = lm.x * rect.width;
        const y = lm.y * rect.height;

        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 6 : 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Draw connections
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17], // Palm
      ];

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;

      connections.forEach(([a, b]) => {
        const lmA = hand.landmarks[a];
        const lmB = hand.landmarks[b];
        if (lmA && lmB) {
          ctx.beginPath();
          ctx.moveTo(lmA.x * rect.width, lmA.y * rect.height);
          ctx.lineTo(lmB.x * rect.width, lmB.y * rect.height);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;

      // Draw pinch indicator
      if (hand.isPinching) {
        const thumbTip = hand.landmarks[LANDMARKS.THUMB_TIP];
        const indexTip = hand.landmarks[LANDMARKS.INDEX_TIP];
        const midX = (thumbTip.x + indexTip.x) / 2 * rect.width;
        const midY = (thumbTip.y + indexTip.y) / 2 * rect.height;

        ctx.beginPath();
        ctx.arc(midX, midY, 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  }, []);

  // ============================================================================
  // CONTROLLER HANDLERS
  // ============================================================================

  const handleStart = async () => {
    try {
      const newController = createGestureController();

      // Set up callbacks
      newController.onGesture((action, hand) => {
        setLastAction(action);
        onGestureAction?.(action);
      });

      newController.onFrame((state) => {
        setGestureState(state);
        drawHandLandmarks(state);

        // Send camera control
        const cameraControl = newController.getCameraControl();
        onCameraControl?.(cameraControl);
      });

      // Start with video element
      const videoElement = await newController.start(videoRef.current || undefined);
      if (videoRef.current && videoElement !== videoRef.current) {
        videoRef.current.srcObject = videoElement.srcObject;
      }

      setController(newController);
      setIsActive(true);
      onGestureController?.(newController);
    } catch (error) {
      console.error('Failed to start gesture control:', error);
      alert('Failed to access webcam. Please ensure camera permissions are granted.');
    }
  };

  const handleStop = () => {
    if (controller) {
      controller.stop();
      setController(null);
      setIsActive(false);
      setGestureState(null);
      onGestureController?.(null);
    }
  };

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      controller?.dispose();
    };
  }, [controller]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isCollapsed) {
    return (
      <div
        style={{
          ...styles.panel,
          width: 'auto',
          padding: '12px 16px',
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <span style={{ fontSize: '16px' }}>GESTURE</span>
        {isActive && <span style={{ marginLeft: '8px', color: '#88ff88' }}>*</span>}
      </div>
    );
  }

  const activeHand = gestureState?.rightHand || gestureState?.leftHand;
  const currentGesture = activeHand?.gesture || 'None';

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>GESTURE CONTROL</h3>
        {onToggle && (
          <button style={styles.toggleButton} onClick={onToggle}>
            -
          </button>
        )}
      </div>

      {/* Video Feed */}
      <div style={styles.videoContainer}>
        <video
          ref={videoRef}
          style={styles.video}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={styles.canvas} />

        {!isActive && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#666',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>WEBCAM</div>
            <div style={{ fontSize: '11px' }}>Click Start to enable</div>
          </div>
        )}
      </div>

      {/* Start/Stop Button */}
      <button
        style={{
          ...styles.startButton,
          ...(isActive ? styles.stopButton : {}),
        }}
        onClick={isActive ? handleStop : handleStart}
      >
        {isActive ? 'STOP TRACKING' : 'START TRACKING'}
      </button>

      {/* Current Gesture */}
      {isActive && (
        <>
          <div style={styles.gestureDisplay}>
            <span style={styles.gestureLabel}>Gesture</span>
            <span style={styles.gestureValue}>
              {GESTURE_LABELS[currentGesture] || currentGesture}
            </span>
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statValue}>
                {gestureState?.leftHand ? 'L' : '-'}
                {gestureState?.rightHand ? 'R' : '-'}
              </div>
              <div style={styles.statLabel}>Hands</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>
                {activeHand?.isPinching ? 'YES' : 'NO'}
              </div>
              <div style={styles.statLabel}>Pinch</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>
                {lastAction !== 'none' ? lastAction.slice(0, 6).toUpperCase() : '--'}
              </div>
              <div style={styles.statLabel}>Action</div>
            </div>
          </div>

          {/* Help */}
          <div style={styles.helpText}>
            FIST=Pause | PALM=Resume | VICTORY=Next Preset<br/>
            Move hand to orbit camera | Pinch to grab body
          </div>
        </>
      )}
    </div>
  );
};

export default GesturePanel;
