/**
 * Audio Panel Component - Lithosphere v7.2.0 "Studio Design"
 *
 * UI for audio source selection and real-time visualization.
 * Supports file upload, microphone, and tab audio capture.
 *
 * Studio Design System:
 * - Collapsible sections
 * - 12px border radius
 * - 12px backdrop blur
 * - Blue accent (#6688ff)
 *
 * @author Claude Code for NeuraByte Labs
 * @version 7.2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AudioAnalyzer,
  createAudioAnalyzer,
  AudioSourceType,
  FrequencyBands,
  AudioMood,
  BeatInfo,
} from '../services/audioService';

// ============================================================================
// TYPES
// ============================================================================

interface AudioPanelProps {
  onAudioAnalyzer?: (analyzer: AudioAnalyzer | null) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface SectionState {
  sources: boolean;
  visualizer: boolean;
  stats: boolean;
}

// ============================================================================
// STYLES - Studio Design System
// ============================================================================

const ACCENT = {
  primary: '#6688ff',
  primaryDim: 'rgba(100, 136, 255, 0.3)',
  primaryGlow: 'rgba(100, 136, 255, 0.2)',
  bg: 'rgba(10, 15, 20, 0.92)',
  bgSection: 'rgba(20, 25, 35, 0.6)',
  border: 'rgba(100, 136, 255, 0.25)',
  text: '#fff',
  textDim: '#888',
  textMuted: '#666',
};

const styles = {
  panel: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '20px',
    width: '320px',
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
    background: 'rgba(100, 136, 255, 0.05)',
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
  sourceButtons: {
    display: 'flex',
    gap: '8px',
  },
  sourceButton: {
    flex: 1,
    padding: '10px 8px',
    fontSize: '10px',
    backgroundColor: 'rgba(40, 45, 60, 0.5)',
    border: `1px solid ${ACCENT.border}`,
    borderRadius: '8px',
    color: ACCENT.textDim,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  sourceButtonActive: {
    backgroundColor: 'rgba(100, 136, 255, 0.2)',
    borderColor: ACCENT.primary,
    color: ACCENT.text,
    boxShadow: `0 0 12px ${ACCENT.primaryGlow}`,
  },
  sourceIcon: {
    fontSize: '16px',
  },
  dropZone: {
    border: `2px dashed ${ACCENT.border}`,
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '12px',
  },
  dropZoneActive: {
    borderColor: ACCENT.primary,
    backgroundColor: ACCENT.primaryGlow,
  },
  visualizer: {
    height: '70px',
    backgroundColor: 'rgba(0, 5, 15, 0.6)',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '12px',
  },
  playButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(100, 136, 255, 0.2)',
    border: `2px solid ${ACCENT.primary}`,
    color: ACCENT.text,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    fontFamily: "'JetBrains Mono', monospace",
  },
  progressBar: {
    flex: 1,
    height: '4px',
    backgroundColor: 'rgba(40, 45, 60, 0.5)',
    borderRadius: '2px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT.primary,
    borderRadius: '2px',
    transition: 'width 0.1s linear',
  },
  time: {
    fontSize: '10px',
    color: ACCENT.textDim,
    fontVariantNumeric: 'tabular-nums',
    minWidth: '70px',
    textAlign: 'right' as const,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  stat: {
    textAlign: 'center' as const,
    padding: '8px 4px',
    backgroundColor: 'rgba(30, 35, 50, 0.5)',
    borderRadius: '6px',
    border: `1px solid rgba(100, 136, 255, 0.1)`,
  },
  statValue: {
    fontSize: '14px',
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
  beatIndicator: {
    position: 'absolute' as const,
    top: '6px',
    right: '6px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#333',
    transition: 'all 0.05s ease',
  },
  beatIndicatorActive: {
    backgroundColor: '#ff4466',
    boxShadow: '0 0 10px #ff4466',
  },
  collapsedPanel: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '20px',
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

// ============================================================================
// COMPONENT
// ============================================================================

export const AudioPanel: React.FC<AudioPanelProps> = ({
  onAudioAnalyzer,
  isCollapsed = false,
  onToggle,
}) => {
  const [analyzer, setAnalyzer] = useState<AudioAnalyzer | null>(null);
  const [sourceType, setSourceType] = useState<AudioSourceType>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [bands, setBands] = useState<FrequencyBands | null>(null);
  const [mood, setMood] = useState<AudioMood | null>(null);
  const [beat, setBeat] = useState<BeatInfo | null>(null);

  // Collapsible sections
  const [sections, setSections] = useState<SectionState>({
    sources: true,
    visualizer: true,
    stats: true,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);

  const toggleSection = (section: keyof SectionState) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ============================================================================
  // AUDIO VISUALIZATION
  // ============================================================================

  const drawVisualization = useCallback(() => {
    if (!canvasRef.current || !analyzer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const frequencyData = analyzer.getRawFrequencyData();
    const currentBands = analyzer.getFrequencyBands();
    const currentMood = analyzer.analyzeMood();
    const currentBeat = analyzer.detectBeat();

    setBands(currentBands);
    setMood(currentMood);
    setBeat(currentBeat);

    const state = analyzer.state;
    setCurrentTime(state.currentTime);
    setDuration(state.duration);
    setIsPlaying(state.isPlaying);

    ctx.fillStyle = 'rgba(0, 5, 15, 0.3)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const barWidth = rect.width / frequencyData.length;
    const heightScale = rect.height / 255;

    for (let i = 0; i < frequencyData.length; i++) {
      const value = frequencyData[i];
      const height = value * heightScale;
      const x = i * barWidth;
      const y = rect.height - height;

      const hue = 220 + (i / frequencyData.length) * 40;
      const saturation = 70;
      const lightness = 35 + (value / 255) * 35;

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(x, y, barWidth - 1, height);
    }

    animationRef.current = requestAnimationFrame(drawVisualization);
  }, [analyzer]);

  useEffect(() => {
    if (analyzer && (isPlaying || sourceType === 'microphone' || sourceType === 'tab')) {
      drawVisualization();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyzer, isPlaying, sourceType, drawVisualization]);

  // ============================================================================
  // SOURCE HANDLERS
  // ============================================================================

  const initializeAnalyzer = useCallback(async () => {
    if (!analyzer) {
      const newAnalyzer = createAudioAnalyzer();
      await newAnalyzer.initialize();
      setAnalyzer(newAnalyzer);
      onAudioAnalyzer?.(newAnalyzer);
      return newAnalyzer;
    }
    return analyzer;
  }, [analyzer, onAudioAnalyzer]);

  const handleFileSelect = async (file: File) => {
    const currentAnalyzer = await initializeAnalyzer();
    await currentAnalyzer.loadFile(file);
    setSourceType('file');
    currentAnalyzer.play();
  };

  const handleMicrophoneClick = async () => {
    if (sourceType === 'microphone') {
      analyzer?.cleanup();
      setSourceType('none');
      return;
    }

    const currentAnalyzer = await initializeAnalyzer();
    await currentAnalyzer.connectMicrophone();
    setSourceType('microphone');
  };

  const handleTabCaptureClick = async () => {
    if (sourceType === 'tab') {
      analyzer?.cleanup();
      setSourceType('none');
      return;
    }

    const currentAnalyzer = await initializeAnalyzer();
    try {
      await currentAnalyzer.captureTabAudio();
      setSourceType('tab');
    } catch (error) {
      console.error('Failed to capture tab audio:', error);
      alert('Failed to capture tab audio. Make sure to select "Share audio" when prompted.');
    }
  };

  const handlePlayPause = () => {
    if (!analyzer) return;
    if (isPlaying) {
      analyzer.pause();
    } else {
      analyzer.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!analyzer || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    analyzer.seek(newTime);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      handleFileSelect(file);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + String(secs).padStart(2, '0');
  };

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      analyzer?.dispose();
    };
  }, [analyzer]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isCollapsed) {
    return (
      <div style={styles.collapsedPanel} onClick={onToggle}>
        <span style={{ color: ACCENT.primary, fontSize: '14px' }}>AUDIO</span>
        <div style={{
          ...styles.statusDot,
          ...(sourceType !== 'none' ? styles.statusDotActive : {}),
        }} />
        {beat?.isBeat && <span style={{ color: '#ff4466', fontSize: '12px' }}>*</span>}
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>AUDIO REACTIVE</h3>
          <div style={{
            ...styles.statusDot,
            ...(sourceType !== 'none' ? styles.statusDotActive : {}),
          }} />
        </div>
        {onToggle && (
          <button style={styles.toggleButton} onClick={onToggle}>
            −
          </button>
        )}
      </div>

      {/* Sources Section */}
      <div style={styles.section}>
        <div
          style={styles.sectionHeader}
          onClick={() => toggleSection('sources')}
        >
          <span style={styles.sectionTitle}>Sources</span>
          <span style={{
            ...styles.chevron,
            ...(sections.sources ? styles.chevronOpen : {}),
          }}>▼</span>
        </div>
        {sections.sources && (
          <div style={styles.sectionContent}>
            <div style={styles.sourceButtons}>
              <button
                style={{
                  ...styles.sourceButton,
                  ...(sourceType === 'file' ? styles.sourceButtonActive : {}),
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <span style={styles.sourceIcon}>FILE</span>
              </button>
              <button
                style={{
                  ...styles.sourceButton,
                  ...(sourceType === 'microphone' ? styles.sourceButtonActive : {}),
                }}
                onClick={handleMicrophoneClick}
              >
                <span style={styles.sourceIcon}>MIC</span>
              </button>
              <button
                style={{
                  ...styles.sourceButton,
                  ...(sourceType === 'tab' ? styles.sourceButtonActive : {}),
                }}
                onClick={handleTabCaptureClick}
              >
                <span style={styles.sourceIcon}>TAB</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {sourceType === 'none' && (
              <div
                style={{
                  ...styles.dropZone,
                  ...(isDragging ? styles.dropZoneActive : {}),
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px', color: ACCENT.textDim }}>
                  DROP AUDIO
                </span>
                <span style={{ color: ACCENT.textMuted, fontSize: '10px' }}>
                  or click to browse
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visualizer Section */}
      {sourceType !== 'none' && (
        <div style={styles.section}>
          <div
            style={styles.sectionHeader}
            onClick={() => toggleSection('visualizer')}
          >
            <span style={styles.sectionTitle}>Visualizer</span>
            <span style={{
              ...styles.chevron,
              ...(sections.visualizer ? styles.chevronOpen : {}),
            }}>▼</span>
          </div>
          {sections.visualizer && (
            <div style={styles.sectionContent}>
              <div style={styles.visualizer}>
                <canvas ref={canvasRef} style={styles.canvas} />
                <div
                  style={{
                    ...styles.beatIndicator,
                    ...(beat?.isBeat ? styles.beatIndicatorActive : {}),
                  }}
                />
              </div>

              {sourceType === 'file' && (
                <div style={styles.controls}>
                  <button style={styles.playButton} onClick={handlePlayPause}>
                    {isPlaying ? '||' : '▶'}
                  </button>
                  <div style={styles.progressBar} onClick={handleSeek}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: duration ? ((currentTime / duration) * 100) + '%' : '0%',
                      }}
                    />
                  </div>
                  <span style={styles.time}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats Section */}
      {sourceType !== 'none' && (
        <div style={{ ...styles.section, borderBottom: 'none' }}>
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
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <div style={styles.statValue}>{beat?.bpm || '--'}</div>
                  <div style={styles.statLabel}>BPM</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statValue}>
                    {mood ? Math.round(mood.energy * 100) : '--'}%
                  </div>
                  <div style={styles.statLabel}>Energy</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statValue}>
                    {bands ? Math.round(bands.bass) : '--'}
                  </div>
                  <div style={styles.statLabel}>Bass</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statValue}>
                    {mood ? (mood.valence > 0.5 ? 'BRT' : 'DRK') : '--'}
                  </div>
                  <div style={styles.statLabel}>Mood</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPanel;
