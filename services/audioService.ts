/**
 * Audio Reactivity Service - Lithosphere v6.0.0 "Cosmic Symphony"
 *
 * Provides real-time audio analysis for driving visual effects.
 * Supports file upload, microphone input, and tab audio capture.
 *
 * @author Claude Code for NeuraByte Labs
 * @version 6.0.0
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AudioSourceType = 'file' | 'microphone' | 'tab' | 'stream' | 'none';

export interface FrequencyBands {
  subBass: number;    // 20-60Hz - Body SCALE pulsing
  bass: number;       // 60-250Hz - Body GLOW intensity
  lowMid: number;     // 250-500Hz - ORBIT RADIUS
  mid: number;        // 500-2kHz - ROTATION SPEED
  highMid: number;    // 2-4kHz - TRAIL LENGTH
  presence: number;   // 4-6kHz - PARTICLE emission
  brilliance: number; // 6-20kHz - SHIMMER effects
}

export interface AudioMood {
  energy: number;     // RMS amplitude (0-1) - overall loudness
  valence: number;    // Spectral brightness (0=dark, 1=bright)
  tempo: number;      // Estimated BPM
  intensity: number;  // Dynamic range (0-1)
}

export interface BeatInfo {
  isBeat: boolean;
  beatStrength: number;  // 0-1
  timeSinceLastBeat: number; // ms
  bpm: number;
}

export interface AudioReactiveConfig {
  fftSize: number;
  smoothingTimeConstant: number;
  sensitivity: {
    scale: number;
    glow: number;
    orbit: number;
    rotation: number;
    trails: number;
    particles: number;
    shimmer: number;
  };
}

export interface AudioState {
  isPlaying: boolean;
  sourceType: AudioSourceType;
  currentTime: number;
  duration: number;
  volume: number;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_AUDIO_CONFIG: AudioReactiveConfig = {
  fftSize: 512,  // 256 frequency bins, optimal for 60fps
  smoothingTimeConstant: 0.8,
  sensitivity: {
    scale: 1.5,
    glow: 2.0,
    orbit: 1.2,
    rotation: 1.0,
    trails: 1.8,
    particles: 2.5,
    shimmer: 1.5,
  },
};

// Frequency bin ranges for each band (based on 256 bins at 44.1kHz)
const BAND_RANGES = {
  subBass: { start: 0, end: 2 },      // ~0-86Hz
  bass: { start: 2, end: 8 },         // ~86-344Hz
  lowMid: { start: 8, end: 16 },      // ~344-688Hz
  mid: { start: 16, end: 64 },        // ~688-2.75kHz
  highMid: { start: 64, end: 128 },   // ~2.75-5.5kHz
  presence: { start: 128, end: 180 }, // ~5.5-7.7kHz
  brilliance: { start: 180, end: 256 }, // ~7.7-22kHz
};

// ============================================================================
// AUDIO ANALYZER CLASS
// ============================================================================

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaStream: MediaStream | null = null;
  private frequencyData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;
  private config: AudioReactiveConfig;

  // Beat detection state
  private beatThreshold = 1.3;
  private beatDecay = 0.98;
  private beatMinInterval = 200; // ms
  private lastBeatTime = 0;
  private beatEnergy = 0;
  private beatHistory: number[] = [];
  private bpmHistory: number[] = [];

  // Mood analysis state
  private energyHistory: number[] = [];
  private valenceHistory: number[] = [];

  // State
  private _state: AudioState = {
    isPlaying: false,
    sourceType: 'none',
    currentTime: 0,
    duration: 0,
    volume: 1,
  };

  constructor(config: Partial<AudioReactiveConfig> = {}) {
    this.config = { ...DEFAULT_AUDIO_CONFIG, ...config };
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  get state(): AudioState {
    if (this.audioElement) {
      this._state.currentTime = this.audioElement.currentTime;
      this._state.duration = this.audioElement.duration || 0;
      this._state.isPlaying = !this.audioElement.paused;
    }
    return { ...this._state };
  }

  get isInitialized(): boolean {
    return this.audioContext !== null && this.analyserNode !== null;
  }

  /**
   * Initialize audio context (must be called after user gesture)
   */
  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.config.fftSize;
    this.analyserNode.smoothingTimeConstant = this.config.smoothingTimeConstant;

    const bufferLength = this.analyserNode.frequencyBinCount;
    this.frequencyData = new Uint8Array(bufferLength);
    this.timeData = new Uint8Array(bufferLength);

    this.analyserNode.connect(this.audioContext.destination);
  }

  /**
   * Load audio from file
   */
  async loadFile(file: File): Promise<void> {
    await this.initialize();
    this.cleanup();

    const url = URL.createObjectURL(file);
    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      this.audioElement!.addEventListener('canplaythrough', () => resolve(), { once: true });
      this.audioElement!.addEventListener('error', reject, { once: true });
      this.audioElement!.load();
    });

    this.sourceNode = this.audioContext!.createMediaElementSource(this.audioElement);
    this.sourceNode.connect(this.analyserNode!);
    this._state.sourceType = 'file';
    this._state.duration = this.audioElement.duration;
  }

  /**
   * Load audio from URL
   */
  async loadUrl(url: string): Promise<void> {
    await this.initialize();
    this.cleanup();

    this.audioElement = new Audio(url);
    this.audioElement.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      this.audioElement!.addEventListener('canplaythrough', () => resolve(), { once: true });
      this.audioElement!.addEventListener('error', reject, { once: true });
      this.audioElement!.load();
    });

    this.sourceNode = this.audioContext!.createMediaElementSource(this.audioElement);
    this.sourceNode.connect(this.analyserNode!);
    this._state.sourceType = 'stream';
    this._state.duration = this.audioElement.duration;
  }

  /**
   * Connect to microphone
   */
  async connectMicrophone(): Promise<void> {
    await this.initialize();
    this.cleanup();

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.sourceNode = this.audioContext!.createMediaStreamSource(this.mediaStream);
    this.sourceNode.connect(this.analyserNode!);
    // Don't connect to destination for mic (prevents feedback)
    this.analyserNode!.disconnect();
    this._state.sourceType = 'microphone';
    this._state.isPlaying = true;
  }

  /**
   * Capture tab/screen audio (requires user permission)
   */
  async captureTabAudio(): Promise<void> {
    await this.initialize();
    this.cleanup();

    try {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true, // Required for getDisplayMedia
      });

      // Stop video track (we only want audio)
      this.mediaStream.getVideoTracks().forEach(track => track.stop());

      const audioTracks = this.mediaStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track available. Make sure to select "Share audio" when prompted.');
      }

      this.sourceNode = this.audioContext!.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyserNode!);
      this._state.sourceType = 'tab';
      this._state.isPlaying = true;
    } catch (error) {
      console.error('Tab audio capture failed:', error);
      throw error;
    }
  }

  /**
   * Play audio (for file/url sources)
   */
  play(): void {
    if (this.audioElement && this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.audioElement.play();
      this._state.isPlaying = true;
    }
  }

  /**
   * Pause audio
   */
  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this._state.isPlaying = false;
    }
  }

  /**
   * Seek to time (seconds)
   */
  seek(time: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(time, this.audioElement.duration));
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this._state.volume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this._state.volume;
    }
  }

  /**
   * Get current frequency bands (call every frame)
   */
  getFrequencyBands(): FrequencyBands {
    if (!this.analyserNode || !this.frequencyData) {
      return this.getEmptyBands();
    }

    this.analyserNode.getByteFrequencyData(this.frequencyData);

    return {
      subBass: this.getAverageInRange(BAND_RANGES.subBass.start, BAND_RANGES.subBass.end),
      bass: this.getAverageInRange(BAND_RANGES.bass.start, BAND_RANGES.bass.end),
      lowMid: this.getAverageInRange(BAND_RANGES.lowMid.start, BAND_RANGES.lowMid.end),
      mid: this.getAverageInRange(BAND_RANGES.mid.start, BAND_RANGES.mid.end),
      highMid: this.getAverageInRange(BAND_RANGES.highMid.start, BAND_RANGES.highMid.end),
      presence: this.getAverageInRange(BAND_RANGES.presence.start, BAND_RANGES.presence.end),
      brilliance: this.getAverageInRange(BAND_RANGES.brilliance.start, BAND_RANGES.brilliance.end),
    };
  }

  /**
   * Get raw frequency data (0-255 per bin)
   */
  getRawFrequencyData(): Uint8Array {
    if (!this.analyserNode || !this.frequencyData) {
      return new Uint8Array(256);
    }
    this.analyserNode.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  /**
   * Get raw time domain data (waveform)
   */
  getWaveformData(): Uint8Array {
    if (!this.analyserNode || !this.timeData) {
      return new Uint8Array(256);
    }
    this.analyserNode.getByteTimeDomainData(this.timeData);
    return this.timeData;
  }

  /**
   * Detect beats in audio
   */
  detectBeat(): BeatInfo {
    const bands = this.getFrequencyBands();
    const now = performance.now();

    // Use bass for beat detection
    const currentEnergy = (bands.subBass + bands.bass) / 2;

    // Update beat energy with decay
    this.beatEnergy = Math.max(currentEnergy, this.beatEnergy * this.beatDecay);

    // Check for beat
    const isBeat = currentEnergy > this.beatEnergy * this.beatThreshold &&
                   now - this.lastBeatTime > this.beatMinInterval;

    if (isBeat) {
      // Calculate BPM from beat intervals
      const interval = now - this.lastBeatTime;
      if (this.lastBeatTime > 0 && interval < 2000) {
        const instantBpm = 60000 / interval;
        this.bpmHistory.push(instantBpm);
        if (this.bpmHistory.length > 8) this.bpmHistory.shift();
      }
      this.lastBeatTime = now;
    }

    // Calculate average BPM
    const bpm = this.bpmHistory.length > 0
      ? this.bpmHistory.reduce((a, b) => a + b, 0) / this.bpmHistory.length
      : 0;

    return {
      isBeat,
      beatStrength: Math.min(1, currentEnergy / 255),
      timeSinceLastBeat: now - this.lastBeatTime,
      bpm: Math.round(bpm),
    };
  }

  /**
   * Analyze audio mood
   */
  analyzeMood(): AudioMood {
    const bands = this.getFrequencyBands();
    const waveform = this.getWaveformData();

    // Calculate RMS energy from waveform
    let rmsSum = 0;
    for (let i = 0; i < waveform.length; i++) {
      const normalized = (waveform[i] - 128) / 128;
      rmsSum += normalized * normalized;
    }
    const energy = Math.sqrt(rmsSum / waveform.length);

    // Calculate spectral centroid (brightness)
    let weightedSum = 0;
    let magnitudeSum = 0;
    for (let i = 0; i < this.frequencyData!.length; i++) {
      weightedSum += i * this.frequencyData![i];
      magnitudeSum += this.frequencyData![i];
    }
    const centroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    const valence = Math.min(1, centroid / 128); // Normalize to 0-1

    // Get tempo from beat detection
    const beat = this.detectBeat();
    const tempo = beat.bpm;

    // Calculate intensity from dynamic range
    const bandValues = Object.values(bands);
    const maxBand = Math.max(...bandValues);
    const minBand = Math.min(...bandValues);
    const intensity = (maxBand - minBand) / 255;

    // Smooth values over time
    this.energyHistory.push(energy);
    this.valenceHistory.push(valence);
    if (this.energyHistory.length > 30) this.energyHistory.shift();
    if (this.valenceHistory.length > 30) this.valenceHistory.shift();

    return {
      energy: this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length,
      valence: this.valenceHistory.reduce((a, b) => a + b, 0) / this.valenceHistory.length,
      tempo,
      intensity,
    };
  }

  /**
   * Apply audio to visual parameters
   */
  getVisualParameters(): {
    scale: number;
    glow: number;
    orbitRadius: number;
    rotationSpeed: number;
    trailLength: number;
    particleRate: number;
    shimmer: number;
  } {
    const bands = this.getFrequencyBands();
    const sens = this.config.sensitivity;

    return {
      scale: 1.0 + (bands.subBass / 255) * 0.3 * sens.scale,
      glow: (bands.bass / 255) * sens.glow,
      orbitRadius: 1.0 + (bands.lowMid / 255) * 0.5 * sens.orbit,
      rotationSpeed: (bands.mid / 255) * sens.rotation,
      trailLength: (bands.highMid / 255) * sens.trails,
      particleRate: (bands.presence / 255) * sens.particles,
      shimmer: (bands.brilliance / 255) * sens.shimmer,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    this._state.sourceType = 'none';
    this._state.isPlaying = false;
    this.beatHistory = [];
    this.bpmHistory = [];
    this.energyHistory = [];
    this.valenceHistory = [];
  }

  /**
   * Full disposal
   */
  dispose(): void {
    this.cleanup();

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.frequencyData = null;
    this.timeData = null;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private getAverageInRange(start: number, end: number): number {
    if (!this.frequencyData) return 0;
    let sum = 0;
    const count = end - start;
    for (let i = start; i < end && i < this.frequencyData.length; i++) {
      sum += this.frequencyData[i];
    }
    return count > 0 ? sum / count : 0;
  }

  private getEmptyBands(): FrequencyBands {
    return {
      subBass: 0,
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      presence: 0,
      brilliance: 0,
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createAudioAnalyzer(config?: Partial<AudioReactiveConfig>): AudioAnalyzer {
  return new AudioAnalyzer(config);
}

// ============================================================================
// SINGLETON INSTANCE (optional global access)
// ============================================================================

let globalAudioAnalyzer: AudioAnalyzer | null = null;

export function getGlobalAudioAnalyzer(): AudioAnalyzer {
  if (!globalAudioAnalyzer) {
    globalAudioAnalyzer = new AudioAnalyzer();
  }
  return globalAudioAnalyzer;
}

export function disposeGlobalAudioAnalyzer(): void {
  if (globalAudioAnalyzer) {
    globalAudioAnalyzer.dispose();
    globalAudioAnalyzer = null;
  }
}
