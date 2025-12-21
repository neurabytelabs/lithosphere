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

export const VERSION = '5.0.0-alpha.2';
export const VERSION_SHORT = 'v5.0.0-α2';
export const VERSION_NAME = 'Three-Body';
export const BUILD_DATE = '2025-12-21';

// Version history for changelog display
export interface VersionEntry {
  version: string;
  date: string;
  name: string;
  features: { emoji: string; title: string; description: string }[];
}

export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '5.0.0-alpha.2',
    date: '2025-12-21',
    name: 'Three-Body',
    features: [
      { emoji: '🎨', title: 'Trail Rendering', description: 'Orbit visualization with velocity-based color gradients (blue→red)' },
      { emoji: '💥', title: 'Collision System', description: 'Sphere-sphere detection with bounce, merge, and scatter modes' },
      { emoji: '🎯', title: 'Vector Visualization', description: 'Velocity (green) and force (orange) arrows for physics debugging' },
      { emoji: '📊', title: 'Energy Calculations', description: 'Kinetic, potential, and total system energy tracking' },
      { emoji: '∞', title: 'Figure-8 Preset', description: 'Famous stable 3-body orbit discovered by Moore (1993)' },
      { emoji: '☀', title: 'Trisolaran Preset', description: 'Liu Cixin inspired chaotic three-sun system' },
      { emoji: '🦋', title: 'Butterfly Effect', description: 'Two nearly identical systems diverging over time' },
      { emoji: '△', title: 'Lagrange Points', description: 'L4/L5 equilibrium demonstration' },
    ],
  },
  {
    version: '5.0.0-alpha.1',
    date: '2025-12-19',
    name: 'Three-Body',
    features: [
      { emoji: '🌌', title: 'Physics Engine', description: 'Full gravity simulation with Newton, Artistic, and Magnetic modes' },
      { emoji: '⚡', title: 'Gravity System', description: 'Cores attract each other with configurable gravitational force' },
      { emoji: '📦', title: 'Boundary System', description: 'Bounce, wrap, or contain objects within world boundaries' },
      { emoji: '💎', title: 'Gel Interaction', description: 'Collision, deformation, and merge modes (UI ready)' },
      { emoji: '🎨', title: 'Orbit Trails', description: 'Trail visualization for object paths (UI ready)' },
      { emoji: '🌀', title: 'Three-Body Chaos', description: 'Chaotic dynamics with 3+ cores' },
      { emoji: '⚖️', title: 'Mass System', description: 'Auto (scale-based) or manual mass for each instance' },
      { emoji: '⏱️', title: 'Time Scale', description: 'Control simulation speed from slow-mo to fast-forward' },
    ],
  },
  {
    version: '4.0.0-rc1',
    date: '2025-12-19',
    name: 'Multiverse',
    features: [
      { emoji: '🌐', title: 'Multi-Core System', description: 'Create and manage up to 10 core instances' },
      { emoji: '💎', title: 'Multi-Gel System', description: 'Create and manage up to 10 gel instances' },
      { emoji: '📐', title: 'Instance Transforms', description: 'Position, rotation, and scale for each instance' },
      { emoji: '🔗', title: 'Core-Gel Linking', description: 'Gels follow linked core position automatically' },
      { emoji: '✨', title: 'Arrangement Presets', description: '6 presets: Single, Binary, Orbital, Triangle, Stack, Cluster' },
      { emoji: '📋', title: 'Duplicate Instances', description: 'Clone any core or gel with one click' },
      { emoji: '🎭', title: 'Animation Sync', description: 'Synchronized, independent, or staggered modes' },
      { emoji: '👁️', title: 'Instance Visibility', description: 'Toggle each instance on/off independently' },
    ],
  },
  {
    version: '3.7.2',
    date: '2025-12-19',
    name: 'Master Light Control',
    features: [
      { emoji: '💡', title: '9 Light Toggles', description: 'On/off for every light: Key, Fill, Top, Rim 1&2, HAL Core/Back, Red Rim, Ambient' },
      { emoji: '🎭', title: 'Shader Effect Toggles', description: 'Fresnel, Specular, Red Bleed, Sheen, Env Reflection' },
      { emoji: '🔥', title: 'Hidden Lights Exposed', description: 'Top Light, Rim Light 2, HAL Back Light, Red Rim Light now controllable' },
      { emoji: '🎮', title: 'Full Control', description: 'Every light and shader effect can be individually toggled' },
    ],
  },
  {
    version: '3.7.1',
    date: '2025-12-19',
    name: 'Full Glare Control',
    features: [
      { emoji: '🔆', title: 'Fresnel Control', description: 'Adjustable fresnel power & intensity for edge glow' },
      { emoji: '✨', title: 'Specular Control', description: 'Fine-tune specular power & multiplier for highlights' },
      { emoji: '🎛️', title: 'Complete Light Mastery', description: 'All shader lighting now fully controllable' },
      { emoji: '🎲', title: 'Smart Random', description: 'Light random includes all glare/fresnel params' },
    ],
  },
  {
    version: '3.7.0',
    date: '2025-12-19',
    name: 'Enhanced Controls',
    features: [
      { emoji: '🎚️', title: 'Custom Scrollbar', description: 'Elegant thin scrollbar with hover effects' },
      { emoji: '🎲', title: 'Section Random', description: 'Per-tab randomize buttons (Core, Gel, Light, etc.)' },
      { emoji: '✨', title: 'Reflections & Glare', description: 'New Light tab section for specular/reflection control' },
      { emoji: '💡', title: 'Emission Control', description: 'Core emissive, metalness, roughness in Light tab' },
    ],
  },
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
