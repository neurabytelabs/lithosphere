/**
 * Gesture Panel Component - Lithosphere v7.2.0 "Studio Design"
 *
 * UI for webcam-based gesture control with hand tracking visualization.
 * Uses MediaPipe for real-time hand landmark detection.
 *
 * Studio Design System:
 * - Collapsible sections
 * - 12px border radius
 * - 12px backdrop blur
 * - Green accent (#88ff88)
 * - Positioned: bottom-right
 *
 * @author Claude Code for NeuraByte Labs
 * @version 7.2.0
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

interface SectionState {
  video: boolean;
  stats: boolean;
  help: boolean;
}

// ============================================================================
// STYLES - Studio Design System (Green Accent)
// ============================================================================

const ACCENT = {
  primary: '#88ff88',
  primaryDim: 'rgba(136, 255, 136, 0.3)',
  primaryGlow: 'rgba(136, 255, 136, 0.2)',
  bg: 'rgba(10, 15, 20, 0.92)',
  bgSection: 'rgba(20, 30, 25, 0.6)',
  border: 'rgba(136, 255, 136, 0.25)',
  text: '#fff',
  textDim: '#888',
  textMuted: '#666',
};

const styles = {
  panel: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px', // Changed from left to right
    width: '280px',
    backgroundColor: ACCENT.bg,
    borderRadius: '12px',
    border: `1px solid ${ACCENT.border}`,
    fontFamily: "'JetBrains Mono', monospace",
    color: ACCENT.text,
    zIndex: 1000,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: `1px solid ${ACCENT.border}`,
    background: 'rgba(136, 255, 136, 0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: ACCENT.primary,
    margin: 0,
    letterSpacing: '0.5px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#333',
  },
  statusDotActive: {
    backgroundColor: ACCENT.primary,
    boxShadow: `0 0 8px ${ACCENT.primary}`,
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: ACCENT.textDim,
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px 8px',
    transition: 'color 0.2s ease',
  },
  section: {
    borderBottom: `1px solid ${ACCENT.border}`,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    userSelect: 'none' as const,
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: ACCENT.textDim,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  chevron: {
    fontSize: '10px',
    color: ACCENT.textMuted,
    transition: 'transform 0.2s ease',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  sectionContent: {
    padding: '12px 16px',
    backgroundColor: ACCENT.bgSection,
  },
  videoContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '140px',
    backgroundColor: 'rgba(0, 10, 5, 0.6)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transform: 'scaleX(-1)',
  },
  canvas: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
  },
  videoPlaceholder: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    color: ACCENT.textMuted,
  },
  startButton: {
    width: '100%',
    padding: '10px',
    fontSize: '11px',
    backgroundColor: 'rgba(40, 60, 45, 0.5)',
    border: `1px solid ${ACCENT.border}`,
    borderRadius: '8px',
    color: ACCENT.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.5px',
  },
  stopButton: {
    backgroundColor: 'rgba(60, 40, 40, 0.5)',
    borderColor: 'rgba(255, 136, 136, 0.3)',
    color: '#ff8888',
  },
  gestureDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(30, 50, 35, 0.5)',
    borderRadius: '6px',
    marginBottom: '10px',
    border: `1px solid rgba(136, 255, 136, 0.1)`,
  },
  gestureLabel: {
    fontSize: '10px',
    color: ACCENT.textDim,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  gestureValue: {
    fontSize: '12px',
    fontWeight: 600,
    color: ACCENT.primary,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  stat: {
    textAlign: 'center' as const,
    padding: '8px 4px',
    backgroundColor: 'rgba(30, 45, 35, 0.5)',
    borderRadius: '6px',
    border: `1px solid rgba(136, 255, 136, 0.1)`,
  },
  statValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: ACCENT.text,
  },
  statLabel: {
    fontSize: '8px',
    color: ACCENT.textMuted,
    textTransform: 'uppercase' as const,
    marginTop: '2px',
    letterSpacing: '0.5px',
  },
  helpText: {
    fontSize: '9px',
    color: ACCENT.textMuted,
    lineHeight: 1.5,
  },
  helpRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: `1px solid rgba(136, 255, 136, 0.08)`,
  },
  helpGesture: {
    color: ACCENT.textDim,
  },
  helpAction: {
    color: ACCENT.primary,
    fontWeight: 500,
  },
  collapsedPanel: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px', // Changed from left to right
    backgroundColor: ACCENT.bg,
    borderRadius: '12px',
    border: `1px solid ${ACCENT.border}`,
    padding: '10px 16px',
    fontFamily: "'JetBrains Mono', monospace",
    color: ACCENT.text,
    zIndex: 1000,
    backdropFilter: 'blur(12px)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
};

// Gesture labels
const GESTURE_LABELS: Record<string, string> = {
  'None': '--',
  'Closed_Fist': 'FIST',
  'Open_Palm': 'PALM',
  'Pointing_Up': 'POINT',
  'Thumb_Down': 'DOWN',
  'Thumb_Up': 'UP',
  'Victory': 'VICTORY',
  'ILoveYou': 'LOVE',
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

  // Collapsible sections
  const [sections, setSections] = useState<SectionState>({
    video: true,
    stats: true,
    help: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleSection = (section: keyof SectionState) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ============================================================================
  // HAND VISUALIZATION
  // ============================================================================

  const drawHandLandmarks = useCallback((state: GestureState) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const hands = [state.leftHand, state.rightHand].filter(h => h !== null);

    hands.forEach((hand, index) => {
      if (!hand) return;

      const color = index === 0 ? '#88ff88' : '#88ffff';

      // Draw landmarks
      hand.landmarks.forEach((lm, i) => {
        const x = lm.x * rect.width;
        const y = lm.y * rect.height;

        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Draw connections
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
      ];

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
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
        ctx.arc(midX, midY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
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

      newController.onGesture((action, hand) => {
        setLastAction(action);
        onGestureAction?.(action);
      });

      newController.onFrame((state) => {
        setGestureState(state);
        drawHandLandmarks(state);

        const cameraControl = newController.getCameraControl();
        onCameraControl?.(cameraControl);
      });

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
      <div style={styles.collapsedPanel} onClick={onToggle}>
        <span style={{ color: ACCENT.primary, fontSize: '14px' }}>GESTURE</span>
        <div style={{
          ...styles.statusDot,
          ...(isActive ? styles.statusDotActive : {}),
        }} />
      </div>
    );
  }

  const activeHand = gestureState?.rightHand || gestureState?.leftHand;
  const currentGesture = activeHand?.gesture || 'None';

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>GESTURE CONTROL</h3>
          <div style={{
            ...styles.statusDot,
            ...(isActive ? styles.statusDotActive : {}),
          }} />
        </div>
        {onToggle && (
          <button style={styles.toggleButton} onClick={onToggle}>
            −
          </button>
        )}
      </div>

      {/* Video Feed Section */}
      <div style={styles.section}>
        <div
          style={styles.sectionHeader}
          onClick={() => toggleSection('video')}
        >
          <span style={styles.sectionTitle}>Video Feed</span>
          <span style={{
            ...styles.chevron,
            ...(sections.video ? styles.chevronOpen : {}),
          }}>▼</span>
        </div>
        {sections.video && (
          <div style={styles.sectionContent}>
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
                <div style={styles.videoPlaceholder}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>WEBCAM</div>
                  <div style={{ fontSize: '10px' }}>Click Start</div>
                </div>
              )}
            </div>

            <button
              style={{
                ...styles.startButton,
                ...(isActive ? styles.stopButton : {}),
              }}
              onClick={isActive ? handleStop : handleStart}
            >
              {isActive ? 'STOP TRACKING' : 'START TRACKING'}
            </button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {isActive && (
        <div style={styles.section}>
          <div
            style={styles.sectionHeader}
            onClick={() => toggleSection('stats')}
          >
            <span style={styles.sectionTitle}>Stats</span>
            <span style={{
              ...styles.chevron,
              ...(sections.stats ? styles.chevronOpen : {}),
            }}>▼</span>
          </div>
          {sections.stats && (
            <div style={styles.sectionContent}>
              <div style={styles.gestureDisplay}>
                <span style={styles.gestureLabel}>Gesture</span>
                <span style={styles.gestureValue}>
                  {GESTURE_LABELS[currentGesture] || currentGesture}
                </span>
              </div>

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
                    {lastAction !== 'none' ? lastAction.slice(0, 5).toUpperCase() : '--'}
                  </div>
                  <div style={styles.statLabel}>Action</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div style={{ ...styles.section, borderBottom: 'none' }}>
        <div
          style={styles.sectionHeader}
          onClick={() => toggleSection('help')}
        >
          <span style={styles.sectionTitle}>Help</span>
          <span style={{
            ...styles.chevron,
            ...(sections.help ? styles.chevronOpen : {}),
          }}>▼</span>
        </div>
        {sections.help && (
          <div style={styles.sectionContent}>
            <div style={styles.helpText}>
              <div style={styles.helpRow}>
                <span style={styles.helpGesture}>FIST</span>
                <span style={styles.helpAction}>Pause</span>
              </div>
              <div style={styles.helpRow}>
                <span style={styles.helpGesture}>PALM</span>
                <span style={styles.helpAction}>Resume</span>
              </div>
              <div style={styles.helpRow}>
                <span style={styles.helpGesture}>VICTORY</span>
                <span style={styles.helpAction}>Next Preset</span>
              </div>
              <div style={styles.helpRow}>
                <span style={styles.helpGesture}>MOVE</span>
                <span style={styles.helpAction}>Orbit Camera</span>
              </div>
              <div style={{ ...styles.helpRow, borderBottom: 'none' }}>
                <span style={styles.helpGesture}>PINCH</span>
                <span style={styles.helpAction}>Grab Body</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GesturePanel;
