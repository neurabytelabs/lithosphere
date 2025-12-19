/**
 * LITHOSPHERE VERSION - Single Source of Truth (SSOT)
 *
 * IMPORTANT: This is the ONLY place where version should be defined.
 * All components MUST import from here. Never hardcode versions elsewhere.
 *
 * Versioning Strategy (Semantic Versioning):
 * - MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes, major rewrites
 * - MINOR: New features, sprints
 * - PATCH: Bug fixes, small improvements
 */

export const VERSION = '3.6.0';
export const VERSION_SHORT = 'v3.6';
export const VERSION_NAME = 'Right-Side Panel';
export const BUILD_DATE = '2025-12-19';

// Version history for changelog display
export interface VersionEntry {
  version: string;
  date: string;
  name: string;
  features: { emoji: string; title: string; description: string }[];
}

export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '3.6.0',
    date: '2025-12-19',
    name: 'Right-Side Panel',
    features: [
      { emoji: '📱', title: 'Right-Side Panel', description: 'Panel moved from bottom to right side' },
      { emoji: '🎛️', title: 'Vertical Tab Sidebar', description: 'Icon + label tabs in vertical layout' },
      { emoji: '📜', title: 'Scrollable Content', description: 'Full-height scrollable content area' },
      { emoji: '🎨', title: 'Compact UI', description: 'Optimized controls for narrow panel' },
    ],
  },
  {
    version: '3.5.0',
    date: '2025-12-18',
    name: 'Camera Control System',
    features: [
      { emoji: '🎥', title: 'Panel-Camera Sync', description: 'Camera zooms out when panel opens' },
      { emoji: '🎯', title: 'Camera Presets', description: 'Default, Close-Up, Wide Shot, Top-Down' },
      { emoji: '🔒', title: 'Lock Camera', description: 'Toggle to prevent user interaction' },
      { emoji: '📐', title: 'Orbit Target Y', description: 'Control vertical orbit center' },
      { emoji: '📏', title: 'Distance Slider', description: 'Direct camera distance control' },
    ],
  },
  {
    version: '3.0.0',
    date: '2025-12-18',
    name: 'Visual Capture',
    features: [
      { emoji: '📸', title: 'Screenshot Capture', description: 'PNG or JPEG with quality control' },
      { emoji: '🎬', title: 'Video Recording', description: 'WebM with configurable bitrate and FPS' },
      { emoji: '🌍', title: 'HDR Environment', description: 'Load .hdr/.exr files for reflections' },
      { emoji: '🔲', title: 'Vignette Effect', description: 'Custom TSL post-processing' },
    ],
  },
  {
    version: '2.5.0',
    date: '2025-12-18',
    name: 'Visual Evolution',
    features: [
      { emoji: '✨', title: 'Post-Processing', description: 'Bloom, chromatic aberration, vignette' },
      { emoji: '📦', title: 'GLTF Import', description: 'Load custom 3D models' },
      { emoji: '📤', title: 'TSL Code Export', description: 'Copy/download shader code' },
    ],
  },
  {
    version: '2.0.0',
    date: '2025-12-18',
    name: 'Shader Studio',
    features: [
      { emoji: '✨', title: 'Debug Panel', description: 'Professional interface inspired by Substance Designer' },
      { emoji: '🎨', title: '10 Presets', description: 'HAL 9000, Blue Crystal, Toxic Green + more' },
      { emoji: '🤖', title: 'Gemini AI', description: 'Natural language shader suggestions' },
      { emoji: '📦', title: 'Import/Export', description: 'Save and share configurations as JSON' },
    ],
  },
  {
    version: '1.0.0',
    date: '2025-12-17',
    name: 'Initial Release',
    features: [
      { emoji: '🌐', title: 'WebGPU Rendering', description: 'Three.js with TSL shading language' },
      { emoji: '🔮', title: 'Dual-Mesh System', description: 'Inner core + outer gel shell' },
      { emoji: '🎭', title: 'HAL 9000 Aesthetic', description: 'Iconic glowing red orb' },
      { emoji: '💨', title: '60 FPS', description: 'Optimized performance' },
    ],
  },
];

// Helper to get current version info
export const getCurrentVersion = () => ({
  version: VERSION,
  short: VERSION_SHORT,
  name: VERSION_NAME,
  date: BUILD_DATE,
});
