import React, { useState, useEffect } from 'react';
import RockScene from './components/RockScene';
import { checkWebGPUSupport } from './services/webGpuService';
import { VERSION_SHORT } from './version';

const App: React.FC = () => {
  const [isWebGPUSupported, setIsWebGPUSupported] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <RockScene />
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start">
        <div>
          <h1 className="text-white/90 font-bold tracking-widest text-lg font-mono uppercase">
            Lithosphere <span className="text-xs text-amber-500 align-top">{VERSION_SHORT}</span>
          </h1>
          <p className="text-white/40 text-xs font-mono mt-1">
            WebGPU Procedural Generation
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-white/60 text-xs font-mono">60 FPS LOCKED</span>
          </div>
          <p className="text-white/30 text-[10px] font-mono mt-1">
            TSL / NOISE DERIVATIVES
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;