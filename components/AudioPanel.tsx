/**
 * Audio Panel Component - Lithosphere v6.0.0 "Cosmic Symphony"
 *
 * UI for audio source selection and real-time visualization.
 * Supports file upload, microphone, and tab audio capture.
 *
 * @author Claude Code for NeuraByte Labs
 * @version 6.0.0
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

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  panel: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '20px',
    width: '320px',
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderRadius: '12px',
    border: '1px solid rgba(100, 100, 255, 0.3)',
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
    marginBottom: '16px',
    borderBottom: '1px solid rgba(100, 100, 255, 0.2)',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#8888ff',
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
  sourceButtons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  sourceButton: {
    flex: 1,
    padding: '10px 8px',
    fontSize: '11px',
    backgroundColor: 'rgba(50, 50, 80, 0.5)',
    border: '1px solid rgba(100, 100, 255, 0.3)',
    borderRadius: '8px',
    color: '#aaa',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  sourceButtonActive: {
    backgroundColor: 'rgba(80, 80, 255, 0.4)',
    borderColor: '#6666ff',
    color: '#fff',
  },
  sourceIcon: {
    fontSize: '18px',
  },
  dropZone: {
    border: '2px dashed rgba(100, 100, 255, 0.4)',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dropZoneActive: {
    borderColor: '#6666ff',
    backgroundColor: 'rgba(80, 80, 255, 0.1)',
  },
  visualizer: {
    height: '80px',
    backgroundColor: 'rgba(0, 0, 10, 0.5)',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
    position: 'relative' as const,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  playButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(80, 80, 255, 0.5)',
    border: '2px solid #6666ff',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.2s ease',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'rgba(50, 50, 80, 0.5)',
    borderRadius: '3px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6666ff',
    borderRadius: '3px',
    transition: 'width 0.1s linear',
  },
  time: {
    fontSize: '11px',
    color: '#888',
    fontVariantNumeric: 'tabular-nums',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginTop: '12px',
  },
  stat: {
    textAlign: 'center' as const,
    padding: '8px',
    backgroundColor: 'rgba(30, 30, 50, 0.5)',
    borderRadius: '6px',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
  },
  statLabel: {
    fontSize: '9px',
    color: '#888',
    textTransform: 'uppercase' as const,
    marginTop: '2px',
  },
  beatIndicator: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#333',
    transition: 'background-color 0.05s ease',
  },
  beatIndicatorActive: {
    backgroundColor: '#ff4444',
    boxShadow: '0 0 10px #ff4444',
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number | null>(null);

  // ============================================================================
  // AUDIO VISUALIZATION
  // ============================================================================

  const drawVisualization = useCallback(() => {
    if (!canvasRef.current || !analyzer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Get data
    const frequencyData = analyzer.getRawFrequencyData();
    const currentBands = analyzer.getFrequencyBands();
    const currentMood = analyzer.analyzeMood();
    const currentBeat = analyzer.detectBeat();

    setBands(currentBands);
    setMood(currentMood);
    setBeat(currentBeat);

    // Update time
    const state = analyzer.state;
    setCurrentTime(state.currentTime);
    setDuration(state.duration);
    setIsPlaying(state.isPlaying);

    // Clear
    ctx.fillStyle = 'rgba(0, 0, 10, 0.3)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw frequency bars
    const barWidth = rect.width / frequencyData.length;
    const heightScale = rect.height / 255;

    for (let i = 0; i < frequencyData.length; i++) {
      const value = frequencyData[i];
      const height = value * heightScale;
      const x = i * barWidth;
      const y = rect.height - height;

      // Color gradient based on frequency
      const hue = 240 - (i / frequencyData.length) * 60; // Blue to purple
      const saturation = 80;
      const lightness = 30 + (value / 255) * 40;

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(x, y, barWidth - 1, height);
    }

    // Schedule next frame
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
      <div
        style={{
          ...styles.panel,
          width: 'auto',
          padding: '12px 16px',
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <span style={{ fontSize: '16px' }}>AUDIO</span>
        {beat?.isBeat && <span style={{ marginLeft: '8px', color: '#ff4444' }}>*</span>}
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>AUDIO REACTIVE</h3>
        {onToggle && (
          <button style={styles.toggleButton} onClick={onToggle}>
            -
          </button>
        )}
      </div>

      {/* Source Selection */}
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

      {/* Hidden file input */}
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

      {/* Drop Zone (when no source) */}
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
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>AUDIO</span>
          <span style={{ color: '#888', fontSize: '12px' }}>
            Drop audio file or click to browse
          </span>
        </div>
      )}

      {/* Visualizer */}
      {sourceType !== 'none' && (
        <>
          <div style={styles.visualizer}>
            <canvas ref={canvasRef} style={styles.canvas} />
            <div
              style={{
                ...styles.beatIndicator,
                ...(beat?.isBeat ? styles.beatIndicatorActive : {}),
              }}
            />
          </div>

          {/* Playback Controls (for file source) */}
          {sourceType === 'file' && (
            <div style={styles.controls}>
              <button style={styles.playButton} onClick={handlePlayPause}>
                {isPlaying ? '||' : '>'}
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

          {/* Stats */}
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
                {mood ? (mood.valence > 0.5 ? 'BRIGHT' : 'DARK') : '--'}
              </div>
              <div style={styles.statLabel}>Mood</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AudioPanel;
