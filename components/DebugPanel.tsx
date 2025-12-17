import React, { useState, useCallback, useEffect } from 'react';

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
}

export interface LightingConfig {
  keyLightIntensity: number;
  keyLightColor: [number, number, number];
  fillLightIntensity: number;
  fillLightColor: [number, number, number];
  rimLightIntensity: number;
  halCoreLightIntensity: number;
  halCoreLightColor: [number, number, number];
  ambientIntensity: number;
  orbitSpeed: number;
}

export interface AnimationConfig {
  autoRotate: boolean;
  autoRotateSpeed: number;
  breatheSpeed: number;
  breatheIntensity: number;
  wobbleSpeed: number;
  wobbleIntensity: number;
  noiseAnimSpeed: number;
}

export interface ShapeConfig {
  type: 'icosahedron' | 'sphere' | 'octahedron' | 'dodecahedron' | 'torus' | 'torusKnot';
  coreVisible: boolean;
  gelVisible: boolean;
}

export interface ShaderConfig {
  core: CoreConfig;
  gel: GelConfig;
  lighting: LightingConfig;
  animation: AnimationConfig;
  shape: ShapeConfig;
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
  },
  lighting: {
    keyLightIntensity: 2.5,
    keyLightColor: [1.0, 1.0, 1.0],
    fillLightIntensity: 1.2,
    fillLightColor: [0.63, 0.78, 1.0],
    rimLightIntensity: 3.0,
    halCoreLightIntensity: 5.0,
    halCoreLightColor: [1.0, 0.0, 0.0],
    ambientIntensity: 0.1,
    orbitSpeed: 0.08,
  },
  animation: {
    autoRotate: true,
    autoRotateSpeed: 0.4,
    breatheSpeed: 0.8,
    breatheIntensity: 0.02,
    wobbleSpeed: 0.7,
    wobbleIntensity: 0.02,
    noiseAnimSpeed: 0.15,
  },
  shape: {
    type: 'icosahedron',
    coreVisible: true,
    gelVisible: true,
  },
};

// ============================================
// === PRESETS ===
// ============================================

export const PRESETS: Record<string, Partial<ShaderConfig>> = {
  'HAL 9000': DEFAULT_CONFIG,
  'Blue Crystal': {
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.0, 0.0, 0.05],
      colorMid: [0.0, 0.1, 0.3],
      colorGlow: [0.1, 0.4, 1.0],
      colorHot: [0.5, 0.8, 1.0],
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.2, 0.5, 1.0],
    },
  },
  'Toxic Green': {
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.0, 0.02, 0.0],
      colorMid: [0.0, 0.2, 0.0],
      colorGlow: [0.2, 1.0, 0.1],
      colorHot: [0.6, 1.0, 0.3],
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.2, 1.0, 0.1],
    },
  },
  'Golden Sun': {
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.1, 0.05, 0.0],
      colorMid: [0.4, 0.2, 0.0],
      colorGlow: [1.0, 0.6, 0.0],
      colorHot: [1.0, 0.9, 0.5],
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [1.0, 0.6, 0.0],
    },
  },
  'Purple Void': {
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.02, 0.0, 0.03],
      colorMid: [0.15, 0.0, 0.2],
      colorGlow: [0.6, 0.1, 1.0],
      colorHot: [0.9, 0.5, 1.0],
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.6, 0.1, 1.0],
    },
  },
  'White Dwarf': {
    core: {
      ...DEFAULT_CONFIG.core,
      colorDeep: [0.1, 0.1, 0.12],
      colorMid: [0.5, 0.5, 0.55],
      colorGlow: [0.9, 0.92, 1.0],
      colorHot: [1.0, 1.0, 1.0],
      emissiveIntensity: 2.5,
    },
    lighting: {
      ...DEFAULT_CONFIG.lighting,
      halCoreLightColor: [0.9, 0.95, 1.0],
    },
  },
};

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
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 0.01, onChange, unit = '' }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-[10px]">
      <span className="text-zinc-400">{label}</span>
      <span className="text-amber-400 font-mono">{value.toFixed(2)}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider-thumb"
    />
  </div>
);

interface ColorPickerProps {
  label: string;
  value: [number, number, number];
  onChange: (value: [number, number, number]) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const toHex = (rgb: [number, number, number]) => {
    const r = Math.round(rgb[0] * 255).toString(16).padStart(2, '0');
    const g = Math.round(rgb[1] * 255).toString(16).padStart(2, '0');
    const b = Math.round(rgb[2] * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const fromHex = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-zinc-400 flex-1">{label}</span>
      <input
        type="color"
        value={toHex(value)}
        onChange={(e) => onChange(fromHex(e.target.value))}
        className="w-8 h-5 rounded cursor-pointer bg-transparent border border-zinc-700"
      />
      <span className="text-[9px] text-zinc-500 font-mono w-14">{toHex(value)}</span>
    </div>
  );
};

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] text-zinc-400">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`w-8 h-4 rounded-full transition-colors ${value ? 'bg-amber-500' : 'bg-zinc-700'}`}
    >
      <div
        className={`w-3 h-3 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
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
      className="bg-zinc-800 text-zinc-200 text-[11px] px-2 py-1 rounded border border-zinc-700 focus:border-amber-500 outline-none"
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
}

const Section: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors"
      >
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-medium text-zinc-300 flex-1 text-left">{title}</span>
        <span className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-3 py-3 space-y-3 bg-zinc-900/40">
          {children}
        </div>
      )}
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
- Inner core: HAL 9000 style glowing orb with configurable colors
- Outer gel: Transparent glass-like shell
- Dynamic lighting with multiple light sources
- Procedural noise-based displacement

Current config (JSON): ${JSON.stringify(config, null, 2)}

Based on the user's request, suggest specific parameter changes. Respond with:
1. A brief description of the visual effect
2. A JSON object with the exact parameter changes

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
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <input
          type="password"
          placeholder="Gemini API Key"
          value={geminiApiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="bg-zinc-800 text-zinc-200 text-[11px] px-3 py-2 rounded border border-zinc-700 focus:border-amber-500 outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {quickPrompts.map((qp) => (
          <button
            key={qp}
            onClick={() => setPrompt(qp)}
            className="text-[9px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded transition-colors"
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
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-700 disabled:to-zinc-700 text-white text-[11px] font-medium rounded transition-all"
        >
          {isLoading ? '...' : 'AI'}
        </button>
      </div>

      {response && (
        <div className="bg-zinc-800/50 rounded p-3 max-h-32 overflow-y-auto">
          <pre className="text-[10px] text-zinc-300 whitespace-pre-wrap">{response}</pre>
        </div>
      )}

      {suggestions.length > 0 && (
        <button
          onClick={() => {
            try {
              const suggestedConfig = JSON.parse(suggestions[0]);
              onApplySuggestion(suggestedConfig);
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

interface DebugPanelProps {
  config: ShaderConfig;
  onConfigChange: (config: ShaderConfig) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ config, onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'core' | 'gel' | 'lighting' | 'animation' | 'shape' | 'presets' | 'ai'>('core');
  const [geminiApiKey, setGeminiApiKey] = useState('');

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

  const applyPreset = useCallback((presetName: string) => {
    const preset = PRESETS[presetName];
    if (preset) {
      onConfigChange({
        ...DEFAULT_CONFIG,
        ...preset,
        core: { ...DEFAULT_CONFIG.core, ...preset.core },
        gel: { ...DEFAULT_CONFIG.gel, ...preset.gel },
        lighting: { ...DEFAULT_CONFIG.lighting, ...preset.lighting },
        animation: { ...DEFAULT_CONFIG.animation, ...preset.animation },
        shape: { ...DEFAULT_CONFIG.shape, ...preset.shape },
      });
    }
  }, [onConfigChange]);

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shader-config.json';
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

  const tabs = [
    { id: 'core', label: 'Core', icon: '🔴' },
    { id: 'gel', label: 'Gel', icon: '💎' },
    { id: 'lighting', label: 'Light', icon: '💡' },
    { id: 'animation', label: 'Anim', icon: '🎬' },
    { id: 'shape', label: 'Shape', icon: '🔷' },
    { id: 'presets', label: 'Presets', icon: '📦' },
    { id: 'ai', label: 'AI', icon: '🤖' },
  ] as const;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full
          bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700
          hover:border-amber-500/50 transition-all shadow-2xl backdrop-blur-sm
          ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">⚙</span>
          <span className="text-[11px] font-medium text-zinc-300">SHADER STUDIO</span>
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
                <span className="text-[9px] text-zinc-500 font-mono">v2.0</span>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 ml-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded text-[10px] font-medium transition-all flex items-center gap-1.5
                      ${activeTab === tab.id
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={importConfig}
                className="px-3 py-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
              >
                Import
              </button>
              <button
                onClick={exportConfig}
                className="px-3 py-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => onConfigChange(DEFAULT_CONFIG)}
                className="px-3 py-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-2 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 max-h-[50vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4">
            {/* Core Tab */}
            {activeTab === 'core' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Section title="Geometry" icon="📐" defaultOpen>
                  <Slider label="Radius" value={config.core.radius} min={0.1} max={1.5} onChange={(v) => updateCore({ radius: v })} />
                  <Slider label="Subdivision" value={config.core.subdivision} min={8} max={128} step={1} onChange={(v) => updateCore({ subdivision: v })} />
                </Section>

                <Section title="Colors" icon="🎨" defaultOpen>
                  <ColorPicker label="Deep" value={config.core.colorDeep} onChange={(v) => updateCore({ colorDeep: v })} />
                  <ColorPicker label="Mid" value={config.core.colorMid} onChange={(v) => updateCore({ colorMid: v })} />
                  <ColorPicker label="Glow" value={config.core.colorGlow} onChange={(v) => updateCore({ colorGlow: v })} />
                  <ColorPicker label="Hot Center" value={config.core.colorHot} onChange={(v) => updateCore({ colorHot: v })} />
                </Section>

                <Section title="Material" icon="✨" defaultOpen>
                  <Slider label="Emissive" value={config.core.emissiveIntensity} min={0} max={5} onChange={(v) => updateCore({ emissiveIntensity: v })} />
                  <Slider label="Roughness" value={config.core.roughness} min={0} max={1} onChange={(v) => updateCore({ roughness: v })} />
                  <Slider label="Metalness" value={config.core.metalness} min={0} max={1} onChange={(v) => updateCore({ metalness: v })} />
                  <Slider label="Clearcoat" value={config.core.clearcoat} min={0} max={1} onChange={(v) => updateCore({ clearcoat: v })} />
                </Section>

                <Section title="Pulse" icon="💓">
                  <Slider label="Speed" value={config.core.pulseSpeed} min={0.1} max={3} onChange={(v) => updateCore({ pulseSpeed: v })} />
                  <Slider label="Intensity" value={config.core.pulseIntensity} min={0} max={1} onChange={(v) => updateCore({ pulseIntensity: v })} />
                </Section>

                <Section title="Noise" icon="🌊">
                  <Slider label="Scale" value={config.core.noiseScale} min={0.5} max={10} onChange={(v) => updateCore({ noiseScale: v })} />
                  <Slider label="Intensity" value={config.core.noiseIntensity} min={0} max={0.3} onChange={(v) => updateCore({ noiseIntensity: v })} />
                </Section>
              </div>
            )}

            {/* Gel Tab */}
            {activeTab === 'gel' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Section title="Geometry" icon="📐" defaultOpen>
                  <Slider label="Radius" value={config.gel.radius} min={0.5} max={2.0} onChange={(v) => updateGel({ radius: v })} />
                  <Slider label="Subdivision" value={config.gel.subdivision} min={16} max={128} step={1} onChange={(v) => updateGel({ subdivision: v })} />
                </Section>

                <Section title="Transparency" icon="👁" defaultOpen>
                  <Slider label="Opacity" value={config.gel.opacity} min={0} max={1} onChange={(v) => updateGel({ opacity: v })} />
                  <Slider label="Transmission" value={config.gel.transmission} min={0} max={1} onChange={(v) => updateGel({ transmission: v })} />
                  <Slider label="IOR" value={config.gel.ior} min={1.0} max={2.5} onChange={(v) => updateGel({ ior: v })} />
                  <Slider label="Thickness" value={config.gel.thickness} min={0.1} max={5} onChange={(v) => updateGel({ thickness: v })} />
                </Section>

                <Section title="Surface" icon="🪞" defaultOpen>
                  <Slider label="Roughness" value={config.gel.roughness} min={0} max={1} onChange={(v) => updateGel({ roughness: v })} />
                  <Slider label="Clearcoat" value={config.gel.clearcoat} min={0} max={1} onChange={(v) => updateGel({ clearcoat: v })} />
                  <Slider label="Clearcoat Rough" value={config.gel.clearcoatRoughness} min={0} max={1} onChange={(v) => updateGel({ clearcoatRoughness: v })} />
                  <Slider label="Env Map" value={config.gel.envMapIntensity} min={0} max={3} onChange={(v) => updateGel({ envMapIntensity: v })} />
                </Section>

                <Section title="Attenuation" icon="🌈">
                  <ColorPicker label="Color" value={config.gel.attenuationColor} onChange={(v) => updateGel({ attenuationColor: v })} />
                  <Slider label="Distance" value={config.gel.attenuationDistance} min={0.1} max={10} onChange={(v) => updateGel({ attenuationDistance: v })} />
                </Section>

                <Section title="Effects" icon="⚡">
                  <Slider label="Red Bleed" value={config.gel.redBleedIntensity} min={0} max={1} onChange={(v) => updateGel({ redBleedIntensity: v })} />
                  <Slider label="Specular" value={config.gel.specularIntensity} min={0} max={5} onChange={(v) => updateGel({ specularIntensity: v })} />
                </Section>
              </div>
            )}

            {/* Lighting Tab */}
            {activeTab === 'lighting' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Section title="Key Light" icon="☀️" defaultOpen>
                  <Slider label="Intensity" value={config.lighting.keyLightIntensity} min={0} max={10} onChange={(v) => updateLighting({ keyLightIntensity: v })} />
                  <ColorPicker label="Color" value={config.lighting.keyLightColor} onChange={(v) => updateLighting({ keyLightColor: v })} />
                </Section>

                <Section title="Fill Light" icon="🌤" defaultOpen>
                  <Slider label="Intensity" value={config.lighting.fillLightIntensity} min={0} max={5} onChange={(v) => updateLighting({ fillLightIntensity: v })} />
                  <ColorPicker label="Color" value={config.lighting.fillLightColor} onChange={(v) => updateLighting({ fillLightColor: v })} />
                </Section>

                <Section title="Rim Light" icon="🌙" defaultOpen>
                  <Slider label="Intensity" value={config.lighting.rimLightIntensity} min={0} max={10} onChange={(v) => updateLighting({ rimLightIntensity: v })} />
                </Section>

                <Section title="HAL Core Light" icon="🔴" defaultOpen>
                  <Slider label="Intensity" value={config.lighting.halCoreLightIntensity} min={0} max={15} onChange={(v) => updateLighting({ halCoreLightIntensity: v })} />
                  <ColorPicker label="Color" value={config.lighting.halCoreLightColor} onChange={(v) => updateLighting({ halCoreLightColor: v })} />
                </Section>

                <Section title="Environment" icon="🌍">
                  <Slider label="Ambient" value={config.lighting.ambientIntensity} min={0} max={1} onChange={(v) => updateLighting({ ambientIntensity: v })} />
                  <Slider label="Orbit Speed" value={config.lighting.orbitSpeed} min={0} max={0.5} onChange={(v) => updateLighting({ orbitSpeed: v })} />
                </Section>
              </div>
            )}

            {/* Animation Tab */}
            {activeTab === 'animation' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Section title="Auto Rotate" icon="🔄" defaultOpen>
                  <Toggle label="Enabled" value={config.animation.autoRotate} onChange={(v) => updateAnimation({ autoRotate: v })} />
                  <Slider label="Speed" value={config.animation.autoRotateSpeed} min={0} max={2} onChange={(v) => updateAnimation({ autoRotateSpeed: v })} />
                </Section>

                <Section title="Breathing" icon="🫁" defaultOpen>
                  <Slider label="Speed" value={config.animation.breatheSpeed} min={0.1} max={3} onChange={(v) => updateAnimation({ breatheSpeed: v })} />
                  <Slider label="Intensity" value={config.animation.breatheIntensity} min={0} max={0.1} onChange={(v) => updateAnimation({ breatheIntensity: v })} />
                </Section>

                <Section title="Wobble" icon="〰️" defaultOpen>
                  <Slider label="Speed" value={config.animation.wobbleSpeed} min={0.1} max={3} onChange={(v) => updateAnimation({ wobbleSpeed: v })} />
                  <Slider label="Intensity" value={config.animation.wobbleIntensity} min={0} max={0.1} onChange={(v) => updateAnimation({ wobbleIntensity: v })} />
                </Section>

                <Section title="Noise Animation" icon="🌀">
                  <Slider label="Speed" value={config.animation.noiseAnimSpeed} min={0} max={1} onChange={(v) => updateAnimation({ noiseAnimSpeed: v })} />
                </Section>
              </div>
            )}

            {/* Shape Tab */}
            {activeTab === 'shape' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Section title="Geometry Type" icon="🔷" defaultOpen>
                  <Select
                    label="Shape"
                    value={config.shape.type}
                    options={[
                      { value: 'icosahedron', label: 'Icosahedron' },
                      { value: 'sphere', label: 'Sphere' },
                      { value: 'octahedron', label: 'Octahedron' },
                      { value: 'dodecahedron', label: 'Dodecahedron' },
                      { value: 'torus', label: 'Torus' },
                      { value: 'torusKnot', label: 'Torus Knot' },
                    ]}
                    onChange={(v) => updateShape({ type: v as ShapeConfig['type'] })}
                  />
                </Section>

                <Section title="Visibility" icon="👁" defaultOpen>
                  <Toggle label="Core Visible" value={config.shape.coreVisible} onChange={(v) => updateShape({ coreVisible: v })} />
                  <Toggle label="Gel Visible" value={config.shape.gelVisible} onChange={(v) => updateShape({ gelVisible: v })} />
                </Section>
              </div>
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.keys(PRESETS).map((presetName) => (
                  <button
                    key={presetName}
                    onClick={() => applyPreset(presetName)}
                    className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 hover:border-amber-500/50 transition-all group"
                  >
                    <div className="text-2xl mb-2">
                      {presetName === 'HAL 9000' && '🔴'}
                      {presetName === 'Blue Crystal' && '💎'}
                      {presetName === 'Toxic Green' && '☢️'}
                      {presetName === 'Golden Sun' && '☀️'}
                      {presetName === 'Purple Void' && '🔮'}
                      {presetName === 'White Dwarf' && '⭐'}
                    </div>
                    <div className="text-[11px] font-medium text-zinc-300 group-hover:text-amber-400 transition-colors">
                      {presetName}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div className="max-w-2xl">
                <AIPanel
                  config={config}
                  onApplySuggestion={(suggestion) => {
                    onConfigChange({
                      ...config,
                      ...suggestion,
                      core: { ...config.core, ...suggestion.core },
                      gel: { ...config.gel, ...suggestion.gel },
                      lighting: { ...config.lighting, ...suggestion.lighting },
                    });
                  }}
                  geminiApiKey={geminiApiKey}
                  onApiKeyChange={setGeminiApiKey}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          border: 2px solid #18181b;
        }
        .slider-thumb::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          border: 2px solid #18181b;
        }
      `}</style>
    </>
  );
};

export default DebugPanel;
