import React, { useState, useEffect, useCallback } from 'react';
import RockScene from './components/RockScene';
import MaterialDemoScene from './components/MaterialDemoScene';
import { MaterialSelector } from './src/components/MaterialSelector';
import { AIPanel } from './src/components/AIPanel/AIPanel';
import { useMaterial } from './src/hooks';
import { checkWebGPUSupport } from './services/webGpuService';
import { matchSuggestionToMaterial, applyParameterTweaks } from './services/materialMatcher';
import { VERSION_SHORT } from './version';
import type { MaterialSuggestion } from './services/geminiService';

type SceneMode = 'classic' | 'crystallum';

const App: React.FC = () => {
  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [sceneMode, setSceneMode] = useState<SceneMode>('classic'); // Default: classic
  const [isAIPanelOpen, setAIPanelOpen] = useState(false);

  // Material system hook (only used in crystallum mode)
  const materialHook = useMaterial({
    initialMaterial: 'diamond',
    onMaterialChange: (material, def) => {
      console.log(`[App] Material changed to: ${def.name}`);
    },
  });

  // Handle AI suggestion - match to material and apply tweaks
  const handleApplySuggestion = useCallback((suggestion: MaterialSuggestion) => {
    console.log('[App] AI suggestion received:', suggestion.name);

    // Switch to crystallum mode if not already
    if (sceneMode !== 'crystallum') {
      setSceneMode('crystallum');
    }

    // Find the best matching material
    const matchedMaterialId = matchSuggestionToMaterial(suggestion);

    // Select the matched material
    materialHook.selectMaterial(matchedMaterialId);

    // Apply parameter tweaks after a short delay (let material load)
    setTimeout(() => {
      if (materialHook.threeMaterial) {
        applyParameterTweaks(materialHook.threeMaterial, suggestion);
      }
    }, 300);
  }, [sceneMode, materialHook]);

  useEffect(() => {
    checkWebGPUSupport().then((supported) => {
      setIsWebGPUSupported(supported);
      if (!supported) {
        setErrorMessage("Your browser does not support WebGPU. Please use Chrome 113+, Edge 113+, or Safari 18+.");
      }
    });
  }, []);

  if (isWebGPUSupported === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse font-mono text-sm">INITIALIZING GPU KERNEL...</div>
      </div>
    );
  }

  if (!isWebGPUSupported) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-900 text-red-500 p-8 text-center">
        <div className="max-w-md border border-red-500/30 p-6 rounded bg-red-950/10 backdrop-blur-md">
          <h1 className="text-xl font-bold mb-4 font-mono">SYSTEM ERROR</h1>
          <p className="font-mono text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Get current material name for AI panel
  const currentMaterialName = sceneMode === 'crystallum' && materialHook.currentDefinition
    ? materialHook.currentDefinition.name
    : 'Classic Rock';

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Scene */}
      {sceneMode === 'classic' ? (
        <RockScene />
      ) : (
        <MaterialDemoScene materialHook={materialHook} />
      )}

      {/* Material Selector (only in crystallum mode) */}
      {sceneMode === 'crystallum' && materialHook.isInitialized && (
        <MaterialSelector materialHook={materialHook} />
      )}

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start">
        <div>
          <h1 className="text-white/90 font-bold tracking-widest text-lg font-mono uppercase">
            Lithosphere <span className="text-xs text-amber-500 align-top">{VERSION_SHORT}</span>
          </h1>
          <p className="text-white/40 text-xs font-mono mt-1">
            {sceneMode === 'crystallum' ? 'Material System Demo' : 'WebGPU Procedural Generation'}
          </p>
          {/* Scene Mode Toggle */}
          <div className="flex gap-2 mt-3 pointer-events-auto">
            <button
              onClick={() => setSceneMode('classic')}
              className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                sceneMode === 'classic'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setSceneMode('crystallum')}
              className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                sceneMode === 'crystallum'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              Crystallum
            </button>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <div>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-white/60 text-xs font-mono">60 FPS LOCKED</span>
            </div>
            <p className="text-white/30 text-[10px] font-mono mt-1">
              {sceneMode === 'crystallum' ? 'TSL / MATERIAL SYSTEM' : 'TSL / NOISE DERIVATIVES'}
            </p>
          </div>
          {/* AI Button - Visible in both modes */}
          <button
            onClick={() => setAIPanelOpen(true)}
            className="pointer-events-auto relative flex items-center gap-2 px-4 py-2 rounded-xl 
                       bg-gradient-to-br from-cyan-900/80 to-cyan-950/90 
                       border border-cyan-500/30 text-cyan-400 text-xs font-mono
                       hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20
                       transition-all backdrop-blur-lg"
            title="AI Studio - Free AI Features"
          >
            <span className="text-base">🤖</span>
            <span className="font-semibold">AI Studio</span>
            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-400 to-green-400 
                           text-black text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
              FREE
            </span>
          </button>
        </div>
      </div>

      {/* AI Panel Modal */}
      <AIPanel
        isOpen={isAIPanelOpen}
        onClose={() => setAIPanelOpen(false)}
        currentMaterial={currentMaterialName}
        onApplySuggestion={handleApplySuggestion}
      />
    </div>
  );
};

export default App;
