import React, { useState, useCallback, useEffect, useRef } from 'react';
import { VERSION_SHORT, VERSION_HISTORY } from '../version';

// ============================================
// === TYPES & INTERFACES ===
// ============================================

export interface CoreConfig {
  radius: number;
  subdivision: number;
  colorDeep: [number, number, number];
  colorMid: [number, number, number];
  colorGlow: [number, number, number];
  colorHot: [number, number, number];
  emissiveIntensity: number;
  pulseSpeed: number;
  pulseIntensity: number;
  noiseScale: number;
  noiseIntensity: number;
  roughness: number;
  metalness: number;
  clearcoat: number;
}

export interface GelConfig {
  radius: number;
  subdivision: number;
  opacity: number;
  transmission: number;
  ior: number;
  thickness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
  attenuationColor: [number, number, number];
  attenuationDistance: number;
  redBleedIntensity: number;
  specularIntensity: number;
  dispersion: number;
}

export interface LightingConfig {
  keyLightIntensity: number;
  keyLightColor: [number, number, number];
  keyLightX: number;
  keyLightY: number;
  keyLightZ: number;
  fillLightIntensity: number;
  fillLightColor: [number, number, number];
  rimLightIntensity: number;
  halCoreLightIntensity: number;
  halCoreLightColor: [number, number, number];
  halCoreLightDistance: number;
  ambientIntensity: number;
  orbitSpeed: number;
  dynamicLighting: boolean;
}

export interface AnimationConfig {
  autoRotate: boolean;
  autoRotateSpeed: number;
  breatheSpeed: number;
  breatheIntensity: number;
  wobbleSpeed: number;
  wobbleIntensity: number;
  noiseAnimSpeed: number;
  meshRotationSpeed: number;
  syncBreathing: boolean;
}

export interface ShapeConfig {
  type: 'icosahedron' | 'sphere' | 'octahedron' | 'dodecahedron' | 'torus' | 'torusKnot';
  coreVisible: boolean;
  gelVisible: boolean;
  wireframe: boolean;
}

// Mesh source for custom GLTF imports
export interface MeshSource {
  type: 'builtin' | 'gltf';
  builtinType?: ShapeConfig['type'];
  gltfUrl?: string;
  gltfName?: string;
  scale?: number;
}

export interface CameraConfig {
  fov: number;
  distance: number;
  targetY: number;
  minDistance: number;
  maxDistance: number;
  dampingFactor: number;
  locked: boolean;
}

export interface PostProcessConfig {
  exposure: number;
  toneMapping: 'aces' | 'reinhard' | 'linear' | 'cineon';
  // Bloom
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomRadius: number;
  // Chromatic Aberration
  chromaticAberrationEnabled: boolean;
  chromaticAberrationAmount: number;
  // Vignette
  vignetteEnabled: boolean;
  vignetteIntensity: number;
}

export interface EnvironmentConfig {
  enabled: boolean;
  intensity: number;
  backgroundBlur: number;
  backgroundVisible: boolean;
  hdrName?: string;
}

export interface ShaderConfig {
  core: CoreConfig;
  gel: GelConfig;
  lighting: LightingConfig;
  animation: AnimationConfig;
  shape: ShapeConfig;
  camera: CameraConfig;
  postProcess: PostProcessConfig;
  environment: EnvironmentConfig;
  meshSource: MeshSource;
}

export const DEFAULT_CONFIG: ShaderConfig = {
  core: {
    radius: 0.5,
    subdivision: 64,
    colorDeep: [0.01, 0.0, 0.0],
    colorMid: [0.15, 0.0, 0.0],
    colorGlow: [0.8, 0.0, 0.0],
    colorHot: [1.0, 0.4, 0.3],
    emissiveIntensity: 1.5,
    pulseSpeed: 0.8,
    pulseIntensity: 0.4,
    noiseScale: 2.0,
    noiseIntensity: 0.08,
    roughness: 0.05,
    metalness: 0.3,
    clearcoat: 1.0,
  },
  gel: {
    radius: 1.0,
    subdivision: 80,
    opacity: 0.35,
    transmission: 0.8,
    ior: 1.52,
    thickness: 1.5,
    roughness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 1.5,
    attenuationColor: [1.0, 0.7, 0.6],
    attenuationDistance: 2.5,
    redBleedIntensity: 0.25,
    specularIntensity: 2.0,
    dispersion: 0.0,
  },
  lighting: {
    keyLightIntensity: 2.5,
    keyLightColor: [1.0, 1.0, 1.0],
    keyLightX: 5,
    keyLightY: 5,
    keyLightZ: 6,
    fillLightIntensity: 1.2,
    fillLightColor: [0.63, 0.78, 1.0],
    rimLightIntensity: 3.0,
    halCoreLightIntensity: 5.0,
    halCoreLightColor: [1.0, 0.0, 0.0],
    halCoreLightDistance: 4.0,
    ambientIntensity: 0.1,
    orbitSpeed: 0.08,
    dynamicLighting: true,
  },
  animation: {
    autoRotate: true,
    autoRotateSpeed: 0.4,
    breatheSpeed: 0.8,
    breatheIntensity: 0.02,
    wobbleSpeed: 0.7,
    wobbleIntensity: 0.02,
    noiseAnimSpeed: 0.15,
    meshRotationSpeed: 0.05,
    syncBreathing: true,
  },
  shape: {
    type: 'icosahedron',
    coreVisible: true,
    gelVisible: true,
    wireframe: false,
  },
  camera: {
    fov: 35,
    distance: 5,
    targetY: 0,
    minDistance: 2,
    maxDistance: 15,
    dampingFactor: 0.03,
    locked: false,
  },
  postProcess: {
    exposure: 1.3,
    toneMapping: 'aces',
    // Bloom
    bloomEnabled: true,
    bloomIntensity: 1.0,
    bloomThreshold: 0.2,
    bloomRadius: 0.4,
    // Chromatic Aberration
    chromaticAberrationEnabled: false,
    chromaticAberrationAmount: 0.002,
    // Vignette
    vignetteEnabled: false,
    vignetteIntensity: 0.5,
  },
  environment: {
    enabled: false,
    intensity: 1.0,
    backgroundBlur: 0.0,
    backgroundVisible: false,
    hdrName: undefined,
  },
  meshSource: {
    type: 'builtin',
    builtinType: 'icosahedron',
    scale: 1.0,
  },
};

// ============================================
// === PRESETS ===
// ============================================

export const PRESETS: Record<string, ShaderConfig> = {
  'HAL 9000': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.01, 0.0, 0.0],
      colorMid: [0.15, 0.0, 0.0],
      colorGlow: [0.8, 0.0, 0.0],
      colorHot: [1.0, 0.4, 0.3],
      emissiveIntensity: 1.5,
      pulseSpeed: 0.8,
      pulseIntensity: 0.4,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [1.0, 0.0, 0.0],
      halCoreLightIntensity: 5.0,
    },
    meshSource: { ...DEFAULT_CONFIG.meshSource },
  },
  'Blue Crystal': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.0, 0.0, 0.05],
      colorMid: [0.0, 0.1, 0.3],
      colorGlow: [0.1, 0.4, 1.0],
      colorHot: [0.5, 0.8, 1.0],
      emissiveIntensity: 2.0,
      pulseSpeed: 0.5,
      pulseIntensity: 0.3,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [0.6, 0.8, 1.0],
      redBleedIntensity: 0.15,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.2, 0.5, 1.0],
      halCoreLightIntensity: 6.0,
    },
  },
  'Toxic Green': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.0, 0.02, 0.0],
      colorMid: [0.0, 0.2, 0.0],
      colorGlow: [0.2, 1.0, 0.1],
      colorHot: [0.6, 1.0, 0.3],
      emissiveIntensity: 2.5,
      pulseSpeed: 1.2,
      pulseIntensity: 0.5,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [0.5, 1.0, 0.5],
      redBleedIntensity: 0.3,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.2, 1.0, 0.1],
      halCoreLightIntensity: 7.0,
    },
  },
  'Golden Sun': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.1, 0.05, 0.0],
      colorMid: [0.4, 0.2, 0.0],
      colorGlow: [1.0, 0.6, 0.0],
      colorHot: [1.0, 0.9, 0.5],
      emissiveIntensity: 3.0,
      pulseSpeed: 0.4,
      pulseIntensity: 0.2,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [1.0, 0.9, 0.6],
      redBleedIntensity: 0.2,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [1.0, 0.6, 0.0],
      halCoreLightIntensity: 8.0,
    },
  },
  'Purple Void': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.02, 0.0, 0.03],
      colorMid: [0.15, 0.0, 0.2],
      colorGlow: [0.6, 0.1, 1.0],
      colorHot: [0.9, 0.5, 1.0],
      emissiveIntensity: 2.0,
      pulseSpeed: 0.6,
      pulseIntensity: 0.35,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [0.8, 0.6, 1.0],
      redBleedIntensity: 0.25,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.6, 0.1, 1.0],
      halCoreLightIntensity: 6.0,
    },
  },
  'White Dwarf': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.1, 0.1, 0.12],
      colorMid: [0.5, 0.5, 0.55],
      colorGlow: [0.9, 0.92, 1.0],
      colorHot: [1.0, 1.0, 1.0],
      emissiveIntensity: 4.0,
      pulseSpeed: 0.3,
      pulseIntensity: 0.15,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [0.95, 0.95, 1.0],
      redBleedIntensity: 0.1,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.9, 0.95, 1.0],
      halCoreLightIntensity: 10.0,
    },
  },
  'Nebula': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.05, 0.0, 0.1],
      colorMid: [0.3, 0.1, 0.4],
      colorGlow: [1.0, 0.3, 0.8],
      colorHot: [1.0, 0.6, 0.9],
      emissiveIntensity: 2.2,
      pulseSpeed: 0.5,
      pulseIntensity: 0.4,
      noiseScale: 3.0,
      noiseIntensity: 0.12,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [1.0, 0.5, 0.8],
      redBleedIntensity: 0.35,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [1.0, 0.3, 0.8],
      halCoreLightIntensity: 5.5,
    },
  },
  'Deep Ocean': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.0, 0.02, 0.08],
      colorMid: [0.0, 0.1, 0.2],
      colorGlow: [0.0, 0.4, 0.6],
      colorHot: [0.2, 0.8, 1.0],
      emissiveIntensity: 1.8,
      pulseSpeed: 0.4,
      pulseIntensity: 0.25,
      noiseScale: 1.5,
      noiseIntensity: 0.06,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [0.4, 0.7, 0.9],
      attenuationDistance: 3.5,
      redBleedIntensity: 0.15,
      ior: 1.33,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.0, 0.5, 0.8],
      halCoreLightIntensity: 4.0,
      fillLightColor: [0.3, 0.5, 0.7],
    },
  },
  'Lava Core': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.1, 0.02, 0.0],
      colorMid: [0.4, 0.1, 0.0],
      colorGlow: [1.0, 0.3, 0.0],
      colorHot: [1.0, 0.8, 0.2],
      emissiveIntensity: 3.5,
      pulseSpeed: 1.5,
      pulseIntensity: 0.6,
      noiseScale: 2.5,
      noiseIntensity: 0.15,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [1.0, 0.5, 0.2],
      attenuationDistance: 1.5,
      redBleedIntensity: 0.5,
      opacity: 0.25,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [1.0, 0.4, 0.0],
      halCoreLightIntensity: 9.0,
    },
    animation: {
      ...DEFAULT_CONFIG.animation,
      breatheSpeed: 1.2,
      breatheIntensity: 0.04,
      wobbleIntensity: 0.03,
    },
  },
  'Frozen': {
    ...DEFAULT_CONFIG,
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.05, 0.08, 0.1],
      colorMid: [0.3, 0.4, 0.5],
      colorGlow: [0.7, 0.85, 1.0],
      colorHot: [0.9, 0.95, 1.0],
      emissiveIntensity: 1.2,
      pulseSpeed: 0.2,
      pulseIntensity: 0.1,
      roughness: 0.15,
    },
    gel: {
      ...DEFAULT_CONFIG.gel,
      attenuationColor: [0.8, 0.9, 1.0],
      attenuationDistance: 4.0,
      redBleedIntensity: 0.05,
      ior: 1.31,
      clearcoat: 1.0,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.7, 0.85, 1.0],
      halCoreLightIntensity: 3.0,
      keyLightColor: [0.9, 0.95, 1.0],
    },
    animation: {
      ...DEFAULT_CONFIG.animation,
      breatheSpeed: 0.3,
      breatheIntensity: 0.01,
      wobbleSpeed: 0.3,
      wobbleIntensity: 0.01,
    },
  },
};

// ============================================
// === VERSION INFO ===
// ============================================
// IMPORTANT: Version data is now centralized in version.ts (SSOT)
// Import VERSION_SHORT and VERSION_HISTORY from '../version'

// ============================================
// === UI COMPONENTS ===
// ============================================

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  tooltip?: string;
}

const Slider: React.FC<SliderProps> = ({
  label, value, min, max, step = 0.01, onChange, unit = '', tooltip
}) => (
  <div className="flex flex-col gap-1 group" title={tooltip}>
    <div className="flex justify-between text-[10px]">
      <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors">{label}</span>
      <span className="text-amber-400 font-mono">{value.toFixed(step >= 1 ? 0 : 2)}{unit}</span>
    </div>
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider-thumb hover:bg-zinc-700 transition-colors"
      />
      {/* Visual range indicator */}
      <div
        className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-amber-600/50 to-amber-500/50 rounded-l-lg pointer-events-none"
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
    </div>
  </div>
);

// Dropdown Menu Component for consolidated actions
interface DropdownItem {
  icon: string;
  label: string;
  onClick: () => void;
  color?: string;
}

interface DropdownProps {
  icon: string;
  label: string;
  items: DropdownItem[];
  color?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ icon, label, items, color = 'zinc' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colorClasses = {
    zinc: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
    purple: 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10',
    amber: 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 text-[10px] ${colorClasses[color as keyof typeof colorClasses]} rounded transition-colors flex items-center gap-1`}
      >
        <span>{icon}</span>
        <span>{label}</span>
        <span className="text-[8px] opacity-60">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[140px] overflow-hidden">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-[10px] text-left flex items-center gap-2 ${
                item.color === 'red' ? 'text-red-400 hover:bg-red-500/10' :
                item.color === 'purple' ? 'text-purple-400 hover:bg-purple-500/10' :
                'text-zinc-300 hover:bg-zinc-800'
              } transition-colors`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface ColorPickerProps {
  label: string;
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const toHex = (rgb: [number, number, number]) => {
    const r = Math.round(Math.min(1, Math.max(0, rgb[0])) * 255).toString(16).padStart(2, '0');
    const g = Math.round(Math.min(1, Math.max(0, rgb[1])) * 255).toString(16).padStart(2, '0');
    const b = Math.round(Math.min(1, Math.max(0, rgb[2])) * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const fromHex = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-[10px] text-zinc-400 flex-1 group-hover:text-zinc-300 transition-colors">{label}</span>
      <input
        type="color"
        value={toHex(value)}
        onChange={(e) => onChange(fromHex(e.target.value))}
        className="w-8 h-5 rounded cursor-pointer bg-transparent border border-zinc-700 hover:border-amber-500 transition-colors"
      />
      <span className="text-[9px] text-zinc-500 font-mono w-14">{toHex(value)}</span>
    </div>
  );
};

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  tooltip?: string;
}

const Toggle: React.FC<ToggleProps> = ({ label, value, onChange, tooltip }) => (
  <div className="flex items-center justify-between group" title={tooltip}>
    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300 transition-colors">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`w-9 h-5 rounded-full transition-all ${value ? 'bg-amber-500' : 'bg-zinc-700'}
        hover:${value ? 'bg-amber-400' : 'bg-zinc-600'}`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-4.5' : 'translate-x-0.5'}`}
        style={{ transform: value ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  </div>
);

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] text-zinc-400">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-800 text-zinc-200 text-[11px] px-2 py-1.5 rounded border border-zinc-700
        focus:border-amber-500 hover:border-zinc-600 outline-none cursor-pointer transition-colors"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ============================================
// === SECTION COMPONENT ===
// ============================================

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = false, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors"
      >
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-medium text-zinc-300 flex-1 text-left">{title}</span>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">{badge}</span>
        )}
        <span className={`text-zinc-500 transition-transform text-[10px] ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      <div className={`transition-all overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-3 py-3 space-y-3 bg-zinc-900/40">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================
// === FPS COUNTER ===
// ============================================

const FPSCounter: React.FC = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const updateFPS = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const fpsColor = fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${fps >= 55 ? 'bg-green-400' : fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`} />
      <span className={`text-[10px] font-mono ${fpsColor}`}>{fps} FPS</span>
    </div>
  );
};

// ============================================
// === AI PANEL COMPONENT ===
// ============================================

interface AIPanelProps {
  config: ShaderConfig;
  onApplySuggestion: (config: Partial<ShaderConfig>) => void;
  geminiApiKey: string;
  onApiKeyChange: (key: string) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ config, onApplySuggestion, geminiApiKey, onApiKeyChange }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestion = async () => {
    if (!geminiApiKey || !prompt) return;

    setIsLoading(true);
    setResponse('');

    try {
      const systemPrompt = `You are an expert 3D shader designer. The user is working with a WebGPU shader that has:
- Inner core: HAL 9000 style glowing orb with configurable colors (colorDeep, colorMid, colorGlow, colorHot)
- Outer gel: Transparent glass-like shell with transmission, IOR, and attenuation
- Dynamic lighting with multiple light sources
- Procedural noise-based displacement
- Animation controls (pulse, breathing, wobble)

Current config (JSON): ${JSON.stringify(config, null, 2)}

Based on the user's request, suggest specific parameter changes. Respond with:
1. A brief description of the visual effect (1-2 sentences)
2. A JSON object with ONLY the parameters that need to change (nested structure matching the config)

Keep the JSON minimal - only include changed values. Example:
{"core": {"colorGlow": [0.2, 0.8, 1.0], "emissiveIntensity": 2.5}}

User request: ${prompt}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      setResponse(text);

      // Try to extract JSON from response
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const suggestedConfig = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          setSuggestions([JSON.stringify(suggestedConfig)]);
        } catch (e) {
          console.log('Could not parse suggestion JSON');
        }
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Make it look like a dying star',
    'Create a cyberpunk neon effect',
    'Make it pulse like a heartbeat',
    'Add aurora borealis colors',
    'Make it look underwater',
    'Create a ghostly ethereal look',
    'Make it radioactive green',
    'Solar flare explosion effect',
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder="Gemini API Key"
            value={geminiApiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="flex-1 bg-zinc-800 text-zinc-200 text-[11px] px-3 py-2 rounded border border-zinc-700 focus:border-amber-500 outline-none"
          />
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-amber-400 hover:text-amber-300"
          >
            Get Key
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {quickPrompts.map((qp) => (
          <button
            key={qp}
            onClick={() => setPrompt(qp)}
            className="text-[9px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Describe the look you want..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateSuggestion()}
          className="flex-1 bg-zinc-800 text-zinc-200 text-[11px] px-3 py-2 rounded border border-zinc-700 focus:border-amber-500 outline-none"
        />
        <button
          onClick={generateSuggestion}
          disabled={isLoading || !geminiApiKey}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-700 disabled:to-zinc-700 text-white text-[11px] font-medium rounded transition-all disabled:cursor-not-allowed"
        >
          {isLoading ? '...' : 'Generate'}
        </button>
      </div>

      {response && (
        <div className="bg-zinc-800/50 rounded p-3 max-h-40 overflow-y-auto">
          <pre className="text-[10px] text-zinc-300 whitespace-pre-wrap">{response}</pre>
        </div>
      )}

      {suggestions.length > 0 && (
        <button
          onClick={() => {
            try {
              const suggestedConfig = JSON.parse(suggestions[0]);
              onApplySuggestion(suggestedConfig);
              setResponse('Applied! Adjust the parameters further in the panel.');
              setSuggestions([]);
            } catch (e) {
              console.error('Failed to apply suggestion');
            }
          }}
          className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-[11px] font-medium rounded transition-all"
        >
          Apply AI Suggestion
        </button>
      )}
    </div>
  );
};

// ============================================
// === MAIN DEBUG PANEL ===
// ============================================

// Capture configuration
export interface CaptureConfig {
  screenshotFormat: 'png' | 'jpeg';
  screenshotQuality: number;
  videoFormat: 'webm';
  videoBitrate: number;
  videoFps: number;
}

export const DEFAULT_CAPTURE_CONFIG: CaptureConfig = {
  screenshotFormat: 'png',
  screenshotQuality: 0.95,
  videoFormat: 'webm',
  videoBitrate: 5000000, // 5 Mbps
  videoFps: 60,
};

interface DebugPanelProps {
  config: ShaderConfig;
  onConfigChange: (config: ShaderConfig) => void;
  onMeshImport?: (file: File) => void;
  onEnvMapImport?: (file: File) => void;
  onPanelToggle?: (isOpen: boolean) => void;
  rendererRef?: React.MutableRefObject<any>;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ config, onConfigChange, onMeshImport, onEnvMapImport, onPanelToggle, rendererRef }) => {
  const [isOpen, setIsOpenState] = useState(false);
  const [activeTab, setActiveTab] = useState<'core' | 'gel' | 'lighting' | 'animation' | 'shape' | 'camera' | 'effects' | 'capture' | 'presets' | 'ai' | 'info'>('core');

  // Wrapper to notify parent of panel state changes
  const setIsOpen = useCallback((newState: boolean | ((prev: boolean) => boolean)) => {
    setIsOpenState((prev) => {
      const nextState = typeof newState === 'function' ? newState(prev) : newState;
      // Notify parent of panel state change
      if (onPanelToggle && nextState !== prev) {
        onPanelToggle(nextState);
      }
      return nextState;
    });
  }, [onPanelToggle]);

  // Capture state
  const [captureConfig, setCaptureConfig] = useState<CaptureConfig>(DEFAULT_CAPTURE_CONFIG);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [meshLoading, setMeshLoading] = useState(false);
  const [envLoading, setEnvLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const envInputRef = useRef<HTMLInputElement>(null);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini-api-key') || '';
    }
    return '';
  });

  // Save API key to localStorage
  useEffect(() => {
    if (geminiApiKey) {
      localStorage.setItem('gemini-api-key', geminiApiKey);
    }
  }, [geminiApiKey]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      if (e.key === '`' || e.key === '~') {
        setIsOpen(!isOpen);
      }
      // Number keys for tabs
      if (isOpen && e.key >= '1' && e.key <= '9') {
        const tabs = ['core', 'gel', 'lighting', 'animation', 'shape', 'camera', 'presets', 'ai', 'info'] as const;
        const index = parseInt(e.key) - 1;
        if (tabs[index]) setActiveTab(tabs[index]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const updateCore = useCallback((updates: Partial<CoreConfig>) => {
    onConfigChange({ ...config, core: { ...config.core, ...updates } });
  }, [config, onConfigChange]);

  const updateGel = useCallback((updates: Partial<GelConfig>) => {
    onConfigChange({ ...config, gel: { ...config.gel, ...updates } });
  }, [config, onConfigChange]);

  const updateLighting = useCallback((updates: Partial<LightingConfig>) => {
    onConfigChange({ ...config, lighting: { ...config.lighting, ...updates } });
  }, [config, onConfigChange]);

  const updateAnimation = useCallback((updates: Partial<AnimationConfig>) => {
    onConfigChange({ ...config, animation: { ...config.animation, ...updates } });
  }, [config, onConfigChange]);

  const updateShape = useCallback((updates: Partial<ShapeConfig>) => {
    onConfigChange({ ...config, shape: { ...config.shape, ...updates } });
  }, [config, onConfigChange]);

  const updateCamera = useCallback((updates: Partial<CameraConfig>) => {
    onConfigChange({ ...config, camera: { ...config.camera, ...updates } });
  }, [config, onConfigChange]);

  const updatePostProcess = useCallback((updates: Partial<PostProcessConfig>) => {
    onConfigChange({ ...config, postProcess: { ...config.postProcess, ...updates } });
  }, [config, onConfigChange]);

  const updateMeshSource = useCallback((updates: Partial<MeshSource>) => {
    onConfigChange({ ...config, meshSource: { ...config.meshSource, ...updates } });
  }, [config, onConfigChange]);

  const updateEnvironment = useCallback((updates: Partial<EnvironmentConfig>) => {
    onConfigChange({ ...config, environment: { ...config.environment, ...updates } });
  }, [config, onConfigChange]);

  const handleEnvFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onEnvMapImport) {
      setEnvLoading(true);
      onEnvMapImport(file);
      updateEnvironment({
        enabled: true,
        hdrName: file.name,
      });
      setTimeout(() => setEnvLoading(false), 2000);
    }
  }, [onEnvMapImport, updateEnvironment]);

  const clearEnvMap = useCallback(() => {
    updateEnvironment({
      enabled: false,
      hdrName: undefined,
    });
  }, [updateEnvironment]);

  const handleMeshFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onMeshImport) {
      setMeshLoading(true);
      onMeshImport(file);
      updateMeshSource({
        type: 'gltf',
        gltfName: file.name,
        gltfUrl: URL.createObjectURL(file),
      });
      setTimeout(() => setMeshLoading(false), 1500);
    }
  }, [onMeshImport, updateMeshSource]);

  const resetToBuiltinMesh = useCallback(() => {
    updateMeshSource({
      type: 'builtin',
      builtinType: config.shape.type,
      gltfUrl: undefined,
      gltfName: undefined,
    });
  }, [updateMeshSource, config.shape.type]);

  const applyPreset = useCallback((presetName: string) => {
    const preset = PRESETS[presetName];
    if (preset) {
      onConfigChange(preset);
    }
  }, [onConfigChange]);

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lithosphere-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            onConfigChange({ ...DEFAULT_CONFIG, ...imported });
          } catch (err) {
            console.error('Failed to import config');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const randomize = () => {
    const randomColor = (): [number, number, number] => [Math.random(), Math.random(), Math.random()];
    const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);

    onConfigChange({
      ...config,
      core: {
        ...config.core,
        colorDeep: randomColor(),
        colorMid: randomColor(),
        colorGlow: randomColor(),
        colorHot: randomColor(),
        emissiveIntensity: randomInRange(1, 4),
        pulseSpeed: randomInRange(0.3, 1.5),
        pulseIntensity: randomInRange(0.2, 0.6),
      },
      lighting: {
        ...config.lighting,
        halCoreLightColor: randomColor(),
        halCoreLightIntensity: randomInRange(3, 10),
      },
    });
  };

  // Generate TSL shader code from current config
  const generateTSLCode = useCallback(() => {
    const c = config.core;
    const g = config.gel;
    const colorToVec3 = (rgb: [number, number, number]) =>
      `vec3(${rgb[0].toFixed(3)}, ${rgb[1].toFixed(3)}, ${rgb[2].toFixed(3)})`;

    const code = `// ============================================
// Lithosphere TSL Shader Configuration
// Generated: ${new Date().toISOString()}
// ============================================

import {
  positionLocal, normalLocal, normalWorld, cameraPosition,
  vec3, uniform, float, mx_noise_float, mx_fractal_noise_float,
  mix, clamp, pow, dot, normalize, max, sin, cos
} from 'three/tsl';

// === UNIFORM DECLARATIONS ===
const uTime = uniform(0);
const uPulseSpeed = uniform(${c.pulseSpeed.toFixed(2)});
const uPulseIntensity = uniform(${c.pulseIntensity.toFixed(2)});
const uNoiseScale = uniform(${c.noiseScale.toFixed(2)});
const uNoiseIntensity = uniform(${c.noiseIntensity.toFixed(3)});
const uEmissiveIntensity = uniform(${c.emissiveIntensity.toFixed(2)});

// === CORE COLORS ===
const uCoreColorDeep = uniform(new THREE.Color(${colorToVec3(c.colorDeep)}));
const uCoreColorMid = uniform(new THREE.Color(${colorToVec3(c.colorMid)}));
const uCoreColorGlow = uniform(new THREE.Color(${colorToVec3(c.colorGlow)}));
const uCoreColorHot = uniform(new THREE.Color(${colorToVec3(c.colorHot)}));

// === ANIMATION UNIFORMS ===
const uBreatheSpeed = uniform(${config.animation.breatheSpeed.toFixed(2)});
const uBreatheIntensity = uniform(${config.animation.breatheIntensity.toFixed(3)});
const uWobbleSpeed = uniform(${config.animation.wobbleSpeed.toFixed(2)});
const uWobbleIntensity = uniform(${config.animation.wobbleIntensity.toFixed(3)});
const uNoiseAnimSpeed = uniform(${config.animation.noiseAnimSpeed.toFixed(3)});

// === CORE DISPLACEMENT ===
const coreAnimPos = positionLocal.add(
  vec3(
    sin(uTime.mul(0.3)).mul(0.02),
    cos(uTime.mul(0.25)).mul(0.015),
    sin(uTime.mul(0.35)).mul(0.02)
  )
);

const coreNoise1 = mx_fractal_noise_float(
  coreAnimPos.mul(uNoiseScale).add(vec3(uTime.mul(uNoiseAnimSpeed), 0, 0)),
  float(3), float(2.0), float(0.5)
);

const breathe = sin(uTime.mul(uBreatheSpeed)).mul(uBreatheIntensity.mul(1.5)).add(1.0);
const coreDisplacement = coreNoise1.mul(uNoiseIntensity).mul(breathe);
const coreFinalPosition = positionLocal.add(normalLocal.mul(coreDisplacement));

// === VIEW CALCULATIONS ===
const viewDir = normalize(cameraPosition.sub(positionLocal));
const ndotV = max(dot(normalLocal, viewDir), float(0.001));
const fresnel = pow(float(1).sub(ndotV), float(2.5));
const depth = pow(ndotV, float(1.5));

// === HAL PULSE EFFECT ===
const halPulse = sin(uTime.mul(uPulseSpeed)).mul(uPulseIntensity).add(float(1).sub(uPulseIntensity.mul(0.5)));
const halIntensity = halPulse.mul(0.4).add(0.6);
const halCenter = pow(ndotV, float(2.0));

// === COLOR MIXING ===
const halBase = mix(vec3(uCoreColorDeep), vec3(uCoreColorMid), depth);
const halMid = mix(halBase, vec3(uCoreColorGlow), halCenter.mul(halIntensity));
const halBright = mix(halMid, vec3(uCoreColorGlow), pow(halCenter, float(1.5)).mul(halIntensity));
const coreColor = mix(halBright, vec3(uCoreColorHot), pow(halCenter, float(3.0)).mul(halPulse).mul(0.6));

// === EMISSIVE ===
const coreEmissive = vec3(uCoreColorGlow).mul(halCenter.mul(uEmissiveIntensity).mul(halIntensity));

// === MATERIAL CONFIGURATION ===
const coreMaterial = new MeshPhysicalNodeMaterial({
  colorNode: coreColor,
  emissiveNode: coreEmissive,
  roughnessNode: mix(float(${c.roughness.toFixed(2)}), float(${(c.roughness + 0.15).toFixed(2)}), fresnel),
  metalnessNode: float(${c.metalness.toFixed(2)}),
  positionNode: coreFinalPosition,
  clearcoat: ${c.clearcoat.toFixed(2)},
  clearcoatRoughness: 0.05,
});

// === GEL SHELL MATERIAL ===
const gelMaterial = new MeshPhysicalNodeMaterial({
  transparent: true,
  opacity: ${g.opacity.toFixed(2)},
  transmission: ${g.transmission.toFixed(2)},
  thickness: ${g.thickness.toFixed(2)},
  ior: ${g.ior.toFixed(2)},
  clearcoat: ${g.clearcoat.toFixed(2)},
  clearcoatRoughness: ${g.clearcoatRoughness.toFixed(2)},
  attenuationColor: new THREE.Color(${colorToVec3(g.attenuationColor)}),
  attenuationDistance: ${g.attenuationDistance.toFixed(2)},
});
`;
    return code;
  }, [config]);

  const copyTSLCode = useCallback(async () => {
    const code = generateTSLCode();
    await navigator.clipboard.writeText(code);
    alert('TSL code copied to clipboard!');
  }, [generateTSLCode]);

  const downloadTSLCode = useCallback(() => {
    const code = generateTSLCode();
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lithosphere-shader-${Date.now()}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generateTSLCode]);

  // ============================================
  // === CAPTURE FUNCTIONS ===
  // ============================================

  const takeScreenshot = useCallback(() => {
    if (!rendererRef?.current) {
      console.warn('[Capture] No renderer available');
      return;
    }

    const renderer = rendererRef.current;
    const canvas = renderer.domElement;

    // Create a temporary canvas with the same dimensions
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext('2d');

    if (!ctx) {
      console.error('[Capture] Failed to get 2D context');
      return;
    }

    // Draw the WebGPU canvas to the temp canvas
    ctx.drawImage(canvas, 0, 0);

    // Convert to data URL with specified format and quality
    const mimeType = captureConfig.screenshotFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = tempCanvas.toDataURL(mimeType, captureConfig.screenshotQuality);

    // Download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `lithosphere-${Date.now()}.${captureConfig.screenshotFormat}`;
    link.click();

    console.log('[Capture] Screenshot saved');
  }, [rendererRef, captureConfig.screenshotFormat, captureConfig.screenshotQuality]);

  const startRecording = useCallback(() => {
    if (!rendererRef?.current) {
      console.warn('[Capture] No renderer available');
      return;
    }

    const renderer = rendererRef.current;
    const canvas = renderer.domElement;

    // Get stream from canvas
    const stream = canvas.captureStream(captureConfig.videoFps);

    // Create MediaRecorder
    const options: MediaRecorderOptions = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: captureConfig.videoBitrate,
    };

    // Fallback if vp9 is not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
      options.mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lithosphere-${Date.now()}.webm`;
        link.click();
        URL.revokeObjectURL(url);
        console.log('[Capture] Video saved');
      };

      mediaRecorder.start(100); // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log('[Capture] Recording started');
    } catch (error) {
      console.error('[Capture] Failed to start recording:', error);
    }
  }, [rendererRef, captureConfig.videoFps, captureConfig.videoBitrate]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      console.log('[Capture] Recording stopped');
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'core', label: 'Core', icon: '🔴', shortcut: '1' },
    { id: 'gel', label: 'Gel', icon: '💎', shortcut: '2' },
    { id: 'lighting', label: 'Light', icon: '💡', shortcut: '3' },
    { id: 'animation', label: 'Anim', icon: '🎬', shortcut: '4' },
    { id: 'shape', label: 'Shape', icon: '🔷', shortcut: '5' },
    { id: 'camera', label: 'Camera', icon: '📷', shortcut: '6' },
    { id: 'effects', label: 'Effects', icon: '✨', shortcut: '7' },
    { id: 'capture', label: 'Capture', icon: '📸', shortcut: '8' },
    { id: 'presets', label: 'Presets', icon: '📦', shortcut: '9' },
    { id: 'ai', label: 'AI', icon: '🤖', shortcut: '0' },
    { id: 'info', label: 'Info', icon: 'ℹ️', shortcut: '' },
  ] as const;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-2.5 rounded-full
          bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700
          hover:border-amber-500/50 transition-all shadow-2xl backdrop-blur-sm
          ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-sm">⚙</span>
          <span className="text-[11px] font-medium text-zinc-300 tracking-wide">SHADER STUDIO</span>
          <span className="text-[9px] text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded">~</span>
          <span className="text-zinc-500 text-[10px]">▲</span>
        </div>
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-t border-zinc-700 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[12px] font-bold text-zinc-200 tracking-wider">SHADER STUDIO</span>
                <span className="text-[9px] text-zinc-500 font-mono">{VERSION_SHORT}</span>
              </div>

              <FPSCounter />

              {/* Tabs */}
              <div className="flex gap-1 ml-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded text-[10px] font-medium transition-all flex items-center gap-1.5
                      ${activeTab === tab.id
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    title={`Press ${tab.shortcut}`}
                  >
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Quick Actions */}
              <button
                onClick={randomize}
                className="px-3 py-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                title="Randomize colors"
              >
                🎲
              </button>

              {/* Config Dropdown */}
              <Dropdown
                icon="📦"
                label="Config"
                items={[
                  { icon: '📥', label: 'Import JSON', onClick: importConfig },
                  { icon: '📤', label: 'Export JSON', onClick: exportConfig },
                  { icon: '🔄', label: 'Reset All', onClick: () => onConfigChange(DEFAULT_CONFIG), color: 'red' },
                ]}
              />

              {/* Code Export Dropdown */}
              <Dropdown
                icon="📋"
                label="Code"
                color="purple"
                items={[
                  { icon: '📋', label: 'Copy TSL', onClick: copyTSLCode, color: 'purple' },
                  { icon: '💾', label: 'Download .ts', onClick: downloadTSLCode, color: 'purple' },
                ]}
              />

              <div className="h-4 w-px bg-zinc-700 mx-1" />
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                title="Press Escape"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 max-h-[55vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4">
            {/* Core Tab */}
            {activeTab === 'core' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Section title="Geometry" icon="📐" defaultOpen badge="Live">
                  <Slider
                    label="Radius"
                    value={config.core.radius}
                    min={0.2} max={1.2} step={0.05}
                    onChange={(v) => updateCore({ radius: v })}
                    tooltip="Core sphere radius"
                  />
                  <Slider
                    label="Subdivision"
                    value={config.core.subdivision}
                    min={16} max={128} step={8}
                    onChange={(v) => updateCore({ subdivision: v })}
                    tooltip="Geometry detail level"
                  />
                </Section>

                <Section title="Colors" icon="🎨" defaultOpen>
                  <ColorPicker label="Deep (Center)" value={config.core.colorDeep} onChange={(v) => updateCore({ colorDeep: v })} />
                  <ColorPicker label="Mid" value={config.core.colorMid} onChange={(v) => updateCore({ colorMid: v })} />
                  <ColorPicker label="Glow (Edge)" value={config.core.colorGlow} onChange={(v) => updateCore({ colorGlow: v })} />
                  <ColorPicker label="Hot (Peak)" value={config.core.colorHot} onChange={(v) => updateCore({ colorHot: v })} />
                </Section>

                <Section title="Material" icon="✨" defaultOpen>
                  <Slider label="Emissive" value={config.core.emissiveIntensity} min={0} max={5} step={0.1} onChange={(v) => updateCore({ emissiveIntensity: v })} tooltip="Glow intensity" />
                  <Slider label="Roughness" value={config.core.roughness} min={0} max={1} step={0.01} onChange={(v) => updateCore({ roughness: v })} tooltip="Surface roughness" />
                  <Slider label="Metalness" value={config.core.metalness} min={0} max={1} step={0.01} onChange={(v) => updateCore({ metalness: v })} tooltip="Metallic appearance" />
                  <Slider label="Clearcoat" value={config.core.clearcoat} min={0} max={1} step={0.01} onChange={(v) => updateCore({ clearcoat: v })} tooltip="Clear coating layer" />
                </Section>

                <Section title="Pulse Animation" icon="💓" defaultOpen>
                  <Slider label="Speed" value={config.core.pulseSpeed} min={0.1} max={3} step={0.1} onChange={(v) => updateCore({ pulseSpeed: v })} unit="x" tooltip="Pulse rate" />
                  <Slider label="Intensity" value={config.core.pulseIntensity} min={0} max={1} step={0.05} onChange={(v) => updateCore({ pulseIntensity: v })} tooltip="Pulse strength" />
                </Section>

                <Section title="Noise Displacement" icon="🌊">
                  <Slider label="Scale" value={config.core.noiseScale} min={0.5} max={8} step={0.1} onChange={(v) => updateCore({ noiseScale: v })} tooltip="Noise pattern size" />
                  <Slider label="Intensity" value={config.core.noiseIntensity} min={0} max={0.25} step={0.01} onChange={(v) => updateCore({ noiseIntensity: v })} tooltip="Displacement amount" />
                </Section>
              </div>
            )}

            {/* Gel Tab */}
            {activeTab === 'gel' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Section title="Geometry" icon="📐" defaultOpen>
                  <Slider label="Radius" value={config.gel.radius} min={0.6} max={1.8} step={0.05} onChange={(v) => updateGel({ radius: v })} />
                  <Slider label="Subdivision" value={config.gel.subdivision} min={32} max={128} step={8} onChange={(v) => updateGel({ subdivision: v })} />
                </Section>

                <Section title="Glass Properties" icon="🔮" defaultOpen>
                  <Slider label="Transmission" value={config.gel.transmission} min={0} max={1} step={0.01} onChange={(v) => updateGel({ transmission: v })} tooltip="Light passing through" />
                  <Slider label="IOR" value={config.gel.ior} min={1.0} max={2.5} step={0.01} onChange={(v) => updateGel({ ior: v })} tooltip="Index of Refraction (glass=1.5, diamond=2.4)" />
                  <Slider label="Thickness" value={config.gel.thickness} min={0.1} max={5} step={0.1} onChange={(v) => updateGel({ thickness: v })} tooltip="Material thickness for light absorption" />
                  <Slider label="Opacity" value={config.gel.opacity} min={0} max={1} step={0.01} onChange={(v) => updateGel({ opacity: v })} tooltip="Overall transparency" />
                </Section>

                <Section title="Surface" icon="🪞" defaultOpen>
                  <Slider label="Roughness" value={config.gel.roughness} min={0} max={1} step={0.01} onChange={(v) => updateGel({ roughness: v })} tooltip="Surface smoothness" />
                  <Slider label="Clearcoat" value={config.gel.clearcoat} min={0} max={1} step={0.01} onChange={(v) => updateGel({ clearcoat: v })} tooltip="Coating layer" />
                  <Slider label="Clearcoat Roughness" value={config.gel.clearcoatRoughness} min={0} max={1} step={0.01} onChange={(v) => updateGel({ clearcoatRoughness: v })} />
                  <Slider label="Specular" value={config.gel.specularIntensity} min={0} max={5} step={0.1} onChange={(v) => updateGel({ specularIntensity: v })} tooltip="Highlight intensity" />
                </Section>

                <Section title="Environment" icon="🌍">
                  <Slider label="Env Map Intensity" value={config.gel.envMapIntensity} min={0} max={4} step={0.1} onChange={(v) => updateGel({ envMapIntensity: v })} tooltip="Environment reflection strength" />
                </Section>

                <Section title="Light Attenuation" icon="🌈">
                  <ColorPicker label="Attenuation Color" value={config.gel.attenuationColor} onChange={(v) => updateGel({ attenuationColor: v })} />
                  <Slider label="Distance" value={config.gel.attenuationDistance} min={0.5} max={10} step={0.1} onChange={(v) => updateGel({ attenuationDistance: v })} tooltip="How far light travels inside" />
                </Section>

                <Section title="Core Bleed" icon="⚡">
                  <Slider label="Red Bleed" value={config.gel.redBleedIntensity} min={0} max={1} step={0.01} onChange={(v) => updateGel({ redBleedIntensity: v })} tooltip="Inner core color bleeding through" />
                </Section>
              </div>
            )}

            {/* Lighting Tab */}
            {activeTab === 'lighting' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Section title="Key Light" icon="☀️" defaultOpen>
                  <Slider label="Intensity" value={config.lighting.keyLightIntensity} min={0} max={10} step={0.1} onChange={(v) => updateLighting({ keyLightIntensity: v })} />
                  <ColorPicker label="Color" value={config.lighting.keyLightColor} onChange={(v) => updateLighting({ keyLightColor: v })} />
                  <Slider label="Position X" value={config.lighting.keyLightX} min={-10} max={10} step={0.5} onChange={(v) => updateLighting({ keyLightX: v })} />
                  <Slider label="Position Y" value={config.lighting.keyLightY} min={-10} max={10} step={0.5} onChange={(v) => updateLighting({ keyLightY: v })} />
                  <Slider label="Position Z" value={config.lighting.keyLightZ} min={-10} max={10} step={0.5} onChange={(v) => updateLighting({ keyLightZ: v })} />
                </Section>

                <Section title="Fill Light" icon="🌤" defaultOpen>
                  <Slider label="Intensity" value={config.lighting.fillLightIntensity} min={0} max={5} step={0.1} onChange={(v) => updateLighting({ fillLightIntensity: v })} />
                  <ColorPicker label="Color" value={config.lighting.fillLightColor} onChange={(v) => updateLighting({ fillLightColor: v })} />
                </Section>

                <Section title="Rim Light" icon="🌙" defaultOpen>
                  <Slider label="Intensity" value={config.lighting.rimLightIntensity} min={0} max={10} step={0.1} onChange={(v) => updateLighting({ rimLightIntensity: v })} />
                </Section>

                <Section title="HAL Core Light" icon="🔴" defaultOpen badge="Important">
                  <Slider label="Intensity" value={config.lighting.halCoreLightIntensity} min={0} max={20} step={0.5} onChange={(v) => updateLighting({ halCoreLightIntensity: v })} />
                  <ColorPicker label="Color" value={config.lighting.halCoreLightColor} onChange={(v) => updateLighting({ halCoreLightColor: v })} />
                  <Slider label="Distance" value={config.lighting.halCoreLightDistance} min={1} max={10} step={0.5} onChange={(v) => updateLighting({ halCoreLightDistance: v })} tooltip="Light falloff distance" />
                </Section>

                <Section title="Environment" icon="🌍">
                  <Slider label="Ambient" value={config.lighting.ambientIntensity} min={0} max={1} step={0.01} onChange={(v) => updateLighting({ ambientIntensity: v })} />
                  <Toggle label="Dynamic Lighting" value={config.lighting.dynamicLighting} onChange={(v) => updateLighting({ dynamicLighting: v })} tooltip="Animated light orbiting" />
                  <Slider label="Orbit Speed" value={config.lighting.orbitSpeed} min={0} max={0.5} step={0.01} onChange={(v) => updateLighting({ orbitSpeed: v })} />
                </Section>
              </div>
            )}

            {/* Animation Tab */}
            {activeTab === 'animation' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Section title="Auto Rotate" icon="🔄" defaultOpen>
                  <Toggle label="Enabled" value={config.animation.autoRotate} onChange={(v) => updateAnimation({ autoRotate: v })} />
                  <Slider label="Speed" value={config.animation.autoRotateSpeed} min={0} max={3} step={0.1} onChange={(v) => updateAnimation({ autoRotateSpeed: v })} unit="x" />
                </Section>

                <Section title="Mesh Rotation" icon="🎡" defaultOpen>
                  <Slider label="Speed" value={config.animation.meshRotationSpeed} min={0} max={0.2} step={0.01} onChange={(v) => updateAnimation({ meshRotationSpeed: v })} unit="x" tooltip="Internal mesh rotation" />
                </Section>

                <Section title="Breathing" icon="🫁" defaultOpen>
                  <Slider label="Speed" value={config.animation.breatheSpeed} min={0.1} max={3} step={0.1} onChange={(v) => updateAnimation({ breatheSpeed: v })} unit="x" />
                  <Slider label="Intensity" value={config.animation.breatheIntensity} min={0} max={0.1} step={0.005} onChange={(v) => updateAnimation({ breatheIntensity: v })} />
                  <Toggle label="Sync Core/Gel" value={config.animation.syncBreathing} onChange={(v) => updateAnimation({ syncBreathing: v })} tooltip="Sync breathing animation" />
                </Section>

                <Section title="Wobble" icon="〰️" defaultOpen>
                  <Slider label="Speed" value={config.animation.wobbleSpeed} min={0.1} max={3} step={0.1} onChange={(v) => updateAnimation({ wobbleSpeed: v })} unit="x" />
                  <Slider label="Intensity" value={config.animation.wobbleIntensity} min={0} max={0.1} step={0.005} onChange={(v) => updateAnimation({ wobbleIntensity: v })} />
                </Section>

                <Section title="Noise Animation" icon="🌀">
                  <Slider label="Speed" value={config.animation.noiseAnimSpeed} min={0} max={1} step={0.01} onChange={(v) => updateAnimation({ noiseAnimSpeed: v })} unit="x" tooltip="Procedural noise movement" />
                </Section>
              </div>
            )}

            {/* Shape Tab */}
            {activeTab === 'shape' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Section title="Geometry Type" icon="🔷" defaultOpen>
                  <Select
                    label="Shape"
                    value={config.shape.type}
                    options={[
                      { value: 'icosahedron', label: 'Icosahedron (20 faces)' },
                      { value: 'sphere', label: 'Sphere (smooth)' },
                      { value: 'octahedron', label: 'Octahedron (8 faces)' },
                      { value: 'dodecahedron', label: 'Dodecahedron (12 faces)' },
                      { value: 'torus', label: 'Torus (donut)' },
                      { value: 'torusKnot', label: 'Torus Knot (complex)' },
                    ]}
                    onChange={(v) => {
                      updateShape({ type: v as ShapeConfig['type'] });
                      if (config.meshSource.type === 'builtin') {
                        updateMeshSource({ builtinType: v as ShapeConfig['type'] });
                      }
                    }}
                  />
                </Section>

                <Section title="Import GLTF" icon="📁" defaultOpen badge="New">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".gltf,.glb"
                    onChange={handleMeshFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={meshLoading}
                    className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/50 rounded text-[11px] text-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {meshLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>📥</span>
                        Upload GLTF/GLB
                      </span>
                    )}
                  </button>
                  {config.meshSource.type === 'gltf' && config.meshSource.gltfName && (
                    <div className="mt-2 p-2 bg-zinc-800/50 rounded border border-amber-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 truncate flex-1">
                          📦 {config.meshSource.gltfName}
                        </span>
                        <button
                          onClick={resetToBuiltinMesh}
                          className="text-[9px] text-zinc-500 hover:text-red-400 ml-2"
                          title="Remove custom mesh"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[9px] text-zinc-500 mt-2">
                    Upload .gltf or .glb files. The first mesh will be used with the TSL shader.
                  </p>
                </Section>

                <Section title="Mesh Scale" icon="📐" defaultOpen>
                  <Slider
                    label="Scale"
                    value={config.meshSource.scale || 1.0}
                    min={0.1} max={5} step={0.1}
                    onChange={(v) => updateMeshSource({ scale: v })}
                    tooltip="Uniform mesh scale"
                  />
                </Section>

                <Section title="Visibility" icon="👁" defaultOpen>
                  <Toggle label="Core Visible" value={config.shape.coreVisible} onChange={(v) => updateShape({ coreVisible: v })} />
                  <Toggle label="Gel Visible" value={config.shape.gelVisible} onChange={(v) => updateShape({ gelVisible: v })} />
                  <Toggle label="Wireframe" value={config.shape.wireframe} onChange={(v) => updateShape({ wireframe: v })} tooltip="Show wireframe overlay" />
                </Section>
              </div>
            )}

            {/* Camera Tab */}
            {activeTab === 'camera' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Section title="Position" icon="📷" defaultOpen badge="New">
                  <Slider
                    label="Distance"
                    value={config.camera.distance}
                    min={config.camera.minDistance}
                    max={config.camera.maxDistance}
                    step={0.1}
                    onChange={(v) => updateCamera({ distance: v })}
                    tooltip="Camera distance from center"
                  />
                  <Slider
                    label="FOV"
                    value={config.camera.fov}
                    min={20}
                    max={90}
                    step={1}
                    onChange={(v) => updateCamera({ fov: v })}
                    unit="°"
                    tooltip="Camera field of view"
                  />
                </Section>

                <Section title="Orbit Target" icon="🎯" defaultOpen badge="New">
                  <Slider
                    label="Target Y"
                    value={config.camera.targetY}
                    min={-2}
                    max={2}
                    step={0.1}
                    onChange={(v) => updateCamera({ targetY: v })}
                    tooltip="Vertical position of orbit center"
                  />
                  <Toggle
                    label="Lock Camera"
                    value={config.camera.locked}
                    onChange={(v) => updateCamera({ locked: v })}
                    tooltip="Prevent camera movement"
                  />
                </Section>

                <Section title="Distance Limits" icon="📏" defaultOpen>
                  <Slider
                    label="Min"
                    value={config.camera.minDistance}
                    min={1}
                    max={config.camera.distance - 0.5}
                    step={0.5}
                    onChange={(v) => updateCamera({ minDistance: v })}
                    tooltip="Minimum zoom distance"
                  />
                  <Slider
                    label="Max"
                    value={config.camera.maxDistance}
                    min={config.camera.distance + 0.5}
                    max={30}
                    step={1}
                    onChange={(v) => updateCamera({ maxDistance: v })}
                    tooltip="Maximum zoom distance"
                  />
                </Section>

                <Section title="Controls" icon="🎮" defaultOpen>
                  <Slider
                    label="Damping"
                    value={config.camera.dampingFactor}
                    min={0.01}
                    max={0.2}
                    step={0.01}
                    onChange={(v) => updateCamera({ dampingFactor: v })}
                    tooltip="Camera movement smoothness"
                  />
                  <button
                    onClick={() => updateCamera({
                      distance: DEFAULT_CONFIG.camera.distance,
                      targetY: DEFAULT_CONFIG.camera.targetY,
                      fov: DEFAULT_CONFIG.camera.fov,
                    })}
                    className="w-full mt-2 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/50 rounded text-[11px] text-zinc-300 transition-all flex items-center justify-center gap-2"
                  >
                    <span>🎯</span>
                    <span>Reset to Default</span>
                  </button>
                </Section>

                {/* Camera Presets */}
                <Section title="Presets" icon="🎬" defaultOpen badge="New" className="md:col-span-2 lg:col-span-4">
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => updateCamera({ distance: 5, targetY: 0, fov: 35 })}
                      className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/50 rounded text-[10px] text-zinc-300 transition-all"
                    >
                      🎯 Default
                    </button>
                    <button
                      onClick={() => updateCamera({ distance: 2.5, targetY: 0.2, fov: 45 })}
                      className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-cyan-500/50 rounded text-[10px] text-zinc-300 transition-all"
                    >
                      🔍 Close-Up
                    </button>
                    <button
                      onClick={() => updateCamera({ distance: 10, targetY: 0, fov: 25 })}
                      className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-purple-500/50 rounded text-[10px] text-zinc-300 transition-all"
                    >
                      🌌 Wide Shot
                    </button>
                    <button
                      onClick={() => updateCamera({ distance: 6, targetY: -1, fov: 40 })}
                      className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-emerald-500/50 rounded text-[10px] text-zinc-300 transition-all"
                    >
                      ⬆️ Top-Down
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 mt-2 text-center">
                    Click a preset to smoothly transition the camera
                  </p>
                </Section>
              </div>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Section title="Tone Mapping" icon="🎞️" defaultOpen>
                  <Select
                    label="Type"
                    value={config.postProcess.toneMapping}
                    options={[
                      { value: 'aces', label: 'ACES Filmic' },
                      { value: 'reinhard', label: 'Reinhard' },
                      { value: 'linear', label: 'Linear' },
                      { value: 'cineon', label: 'Cineon' },
                    ]}
                    onChange={(v) => updatePostProcess({ toneMapping: v as PostProcessConfig['toneMapping'] })}
                  />
                  <Slider
                    label="Exposure"
                    value={config.postProcess.exposure}
                    min={0.1} max={3} step={0.05}
                    onChange={(v) => updatePostProcess({ exposure: v })}
                    tooltip="Overall brightness"
                  />
                </Section>

                <Section title="Bloom" icon="🌟" defaultOpen badge="WebGPU">
                  <Toggle
                    label="Enabled"
                    value={config.postProcess.bloomEnabled}
                    onChange={(v) => updatePostProcess({ bloomEnabled: v })}
                    tooltip="Enable bloom glow effect"
                  />
                  <Slider
                    label="Intensity"
                    value={config.postProcess.bloomIntensity}
                    min={0} max={3} step={0.05}
                    onChange={(v) => updatePostProcess({ bloomIntensity: v })}
                    tooltip="Bloom glow strength"
                  />
                  <Slider
                    label="Threshold"
                    value={config.postProcess.bloomThreshold}
                    min={0} max={1} step={0.01}
                    onChange={(v) => updatePostProcess({ bloomThreshold: v })}
                    tooltip="Brightness threshold for bloom"
                  />
                  <Slider
                    label="Radius"
                    value={config.postProcess.bloomRadius}
                    min={0} max={1} step={0.01}
                    onChange={(v) => updatePostProcess({ bloomRadius: v })}
                    tooltip="Bloom spread radius"
                  />
                </Section>

                <Section title="Chromatic Aberration" icon="🌈" defaultOpen badge="WebGPU">
                  <Toggle
                    label="Enabled"
                    value={config.postProcess.chromaticAberrationEnabled}
                    onChange={(v) => updatePostProcess({ chromaticAberrationEnabled: v })}
                    tooltip="Enable RGB color separation effect"
                  />
                  <Slider
                    label="Amount"
                    value={config.postProcess.chromaticAberrationAmount}
                    min={0} max={0.02} step={0.0005}
                    onChange={(v) => updatePostProcess({ chromaticAberrationAmount: v })}
                    tooltip="Color separation strength"
                  />
                </Section>

                <Section title="Vignette" icon="🔲" defaultOpen badge="WebGPU">
                  <Toggle
                    label="Enabled"
                    value={config.postProcess.vignetteEnabled}
                    onChange={(v) => updatePostProcess({ vignetteEnabled: v })}
                    tooltip="Enable edge darkening effect"
                  />
                  <Slider
                    label="Intensity"
                    value={config.postProcess.vignetteIntensity}
                    min={0} max={1} step={0.01}
                    onChange={(v) => updatePostProcess({ vignetteIntensity: v })}
                    tooltip="Vignette darkness strength"
                  />
                </Section>

                <Section title="Environment Map (HDR)" icon="🌍" defaultOpen badge="New">
                  <input
                    ref={envInputRef}
                    type="file"
                    accept=".hdr,.exr"
                    onChange={handleEnvFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => envInputRef.current?.click()}
                    disabled={envLoading}
                    className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/50 rounded text-[11px] text-zinc-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {envLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin" />
                        Loading HDR...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>🌍</span>
                        Upload HDR/EXR
                      </span>
                    )}
                  </button>
                  {config.environment.enabled && config.environment.hdrName && (
                    <div className="mt-2 p-2 bg-zinc-800/50 rounded border border-emerald-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 truncate flex-1">
                          🌍 {config.environment.hdrName}
                        </span>
                        <button
                          onClick={clearEnvMap}
                          className="text-[9px] text-zinc-500 hover:text-red-400 ml-2"
                          title="Remove HDR"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  <Slider
                    label="Intensity"
                    value={config.environment.intensity}
                    min={0} max={3} step={0.1}
                    onChange={(v) => updateEnvironment({ intensity: v })}
                    tooltip="Environment map intensity"
                  />
                  <Toggle
                    label="Show Background"
                    value={config.environment.backgroundVisible}
                    onChange={(v) => updateEnvironment({ backgroundVisible: v })}
                    tooltip="Display HDR as scene background"
                  />
                  {config.environment.backgroundVisible && (
                    <Slider
                      label="Background Blur"
                      value={config.environment.backgroundBlur}
                      min={0} max={1} step={0.05}
                      onChange={(v) => updateEnvironment({ backgroundBlur: v })}
                      tooltip="Blur the background image"
                    />
                  )}
                  <p className="text-[9px] text-zinc-500 mt-2">
                    Upload .hdr or .exr files for realistic reflections
                  </p>
                </Section>
              </div>
            )}

            {/* Capture Tab */}
            {activeTab === 'capture' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Section title="Screenshot" icon="📸" defaultOpen badge="New">
                  <Select
                    label="Format"
                    value={captureConfig.screenshotFormat}
                    options={[
                      { value: 'png', label: 'PNG (Lossless)' },
                      { value: 'jpeg', label: 'JPEG (Smaller)' },
                    ]}
                    onChange={(v) => setCaptureConfig({ ...captureConfig, screenshotFormat: v as 'png' | 'jpeg' })}
                  />
                  {captureConfig.screenshotFormat === 'jpeg' && (
                    <Slider
                      label="Quality"
                      value={captureConfig.screenshotQuality}
                      min={0.5} max={1} step={0.05}
                      onChange={(v) => setCaptureConfig({ ...captureConfig, screenshotQuality: v })}
                      tooltip="JPEG compression quality"
                    />
                  )}
                  <button
                    onClick={takeScreenshot}
                    disabled={!rendererRef?.current}
                    className="w-full mt-3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-zinc-700 disabled:to-zinc-700 text-white text-[12px] font-medium rounded transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>📸</span>
                    <span>Take Screenshot</span>
                  </button>
                  <p className="text-[9px] text-zinc-500 mt-2 text-center">
                    Captures the current view at full resolution
                  </p>
                </Section>

                <Section title="Video Recording" icon="🎬" defaultOpen badge="New">
                  <Slider
                    label="Frame Rate"
                    value={captureConfig.videoFps}
                    min={24} max={60} step={1}
                    onChange={(v) => setCaptureConfig({ ...captureConfig, videoFps: v })}
                    unit=" fps"
                    tooltip="Recording frame rate"
                  />
                  <Slider
                    label="Bitrate"
                    value={captureConfig.videoBitrate / 1000000}
                    min={1} max={15} step={0.5}
                    onChange={(v) => setCaptureConfig({ ...captureConfig, videoBitrate: v * 1000000 })}
                    unit=" Mbps"
                    tooltip="Video quality (higher = larger file)"
                  />

                  {isRecording ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-center gap-3 py-3 bg-red-500/20 border border-red-500/30 rounded">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-400 font-mono text-[14px] font-bold">
                          {formatDuration(recordingDuration)}
                        </span>
                        <span className="text-[10px] text-red-400/70">Recording...</span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[12px] font-medium rounded transition-all flex items-center justify-center gap-2"
                      >
                        <span>⏹</span>
                        <span>Stop & Save</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={startRecording}
                      disabled={!rendererRef?.current}
                      className="w-full mt-3 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-zinc-700 disabled:to-zinc-700 text-white text-[12px] font-medium rounded transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <span>🔴</span>
                      <span>Start Recording</span>
                    </button>
                  )}
                  <p className="text-[9px] text-zinc-500 mt-2 text-center">
                    Records as WebM video with VP9 codec
                  </p>
                </Section>

                <Section title="Tips" icon="💡" defaultOpen>
                  <div className="space-y-2 text-[10px] text-zinc-400">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400">📸</span>
                      <span>Screenshots capture the current frame instantly</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400">🎬</span>
                      <span>Video captures animation in real-time</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400">⚡</span>
                      <span>Higher bitrate = better quality, larger files</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400">🎯</span>
                      <span>Use PNG for maximum quality screenshots</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400">🖥</span>
                      <span>Resolution matches your screen size</span>
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Object.keys(PRESETS).map((presetName) => (
                    <button
                      key={presetName}
                      onClick={() => applyPreset(presetName)}
                      className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 hover:border-amber-500/50 transition-all group"
                    >
                      <div className="text-3xl mb-2">
                        {presetName === 'HAL 9000' && '🔴'}
                        {presetName === 'Blue Crystal' && '💎'}
                        {presetName === 'Toxic Green' && '☢️'}
                        {presetName === 'Golden Sun' && '☀️'}
                        {presetName === 'Purple Void' && '🔮'}
                        {presetName === 'White Dwarf' && '⭐'}
                        {presetName === 'Nebula' && '🌌'}
                        {presetName === 'Deep Ocean' && '🌊'}
                        {presetName === 'Lava Core' && '🌋'}
                        {presetName === 'Frozen' && '❄️'}
                      </div>
                      <div className="text-[11px] font-medium text-zinc-300 group-hover:text-amber-400 transition-colors">
                        {presetName}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 text-center">
                  Click a preset to apply. Use Export to save your custom configurations.
                </p>
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div className="max-w-2xl mx-auto">
                <AIPanel
                  config={config}
                  onApplySuggestion={(suggestion) => {
                    const deepMerge = (target: any, source: any) => {
                      const result = { ...target };
                      for (const key in source) {
                        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                          result[key] = deepMerge(target[key] || {}, source[key]);
                        } else {
                          result[key] = source[key];
                        }
                      }
                      return result;
                    };
                    onConfigChange(deepMerge(config, suggestion));
                  }}
                  geminiApiKey={geminiApiKey}
                  onApiKeyChange={setGeminiApiKey}
                />
              </div>
            )}

            {/* Info Tab - Changelog */}
            {activeTab === 'info' && (
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <div className="text-center pb-4 border-b border-zinc-800">
                  <h2 className="text-lg font-bold text-zinc-200">Lithosphere Shader Studio</h2>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Real-time procedural shader playground built with WebGPU
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <a
                      href="https://github.com/mrsarac/lithosphere"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://lithosphere.mustafasarac.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded transition-colors"
                    >
                      Live Demo
                    </a>
                    <a
                      href="https://mustafasarac.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                    >
                      Author
                    </a>
                  </div>
                </div>

                {/* Changelog */}
                <div className="space-y-4">
                  <h3 className="text-[12px] font-bold text-zinc-300 uppercase tracking-wider">Changelog</h3>

                  {VERSION_HISTORY.map((entry, index) => (
                    <div key={entry.version} className="border border-zinc-800 rounded-lg overflow-hidden">
                      <div className={`px-4 py-2 ${index === 0 ? 'bg-amber-500/10 border-b border-amber-500/20' : 'bg-zinc-900/50 border-b border-zinc-800'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[12px] font-bold ${index === 0 ? 'text-amber-400' : 'text-zinc-300'}`}>
                            v{entry.version}
                            {index === 0 && <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">Latest</span>}
                          </span>
                          <span className="text-[10px] text-zinc-500">{entry.date}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">{entry.name}</span>
                      </div>
                      <div className="px-4 py-3 space-y-2 bg-zinc-900/30">
                        {entry.features.map((feature, fIndex) => (
                          <div key={fIndex} className="flex items-start gap-2 text-[10px]">
                            <span className="flex-shrink-0">{feature.emoji}</span>
                            <div>
                              <span className="font-medium text-zinc-300">{feature.title}</span>
                              <span className="text-zinc-500"> - {feature.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-500">
                    Made with ❤️ by <a href="https://mustafasarac.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">Mustafa Sarac</a>
                  </p>
                  <p className="text-[9px] text-zinc-600 mt-1">
                    MIT License • Part of mustafasarac.com/labs
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with keyboard shortcuts hint */}
        <div className="bg-zinc-900/90 border-t border-zinc-800 px-4 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-[9px] text-zinc-500">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1 py-0.5 bg-zinc-800 rounded">~</kbd> Toggle Panel</span>
              <span><kbd className="px-1 py-0.5 bg-zinc-800 rounded">1-9</kbd> Switch Tabs</span>
              <span><kbd className="px-1 py-0.5 bg-zinc-800 rounded">Esc</kbd> Close</span>
            </div>
            <div>
              <span>Lithosphere Shader Studio {VERSION_SHORT}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          border: 2px solid #18181b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          position: relative;
          z-index: 10;
        }
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider-thumb::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          border: 2px solid #18181b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        kbd {
          font-family: monospace;
          font-size: 9px;
        }
      `}</style>
    </>
  );
};

export default DebugPanel;
