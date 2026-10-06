# Lithosphere

Lithosphere is a browser app that renders a glowing orb with Three.js and WebGPU shaders, with a panel to change the shader parameters live.

**Status:** Prototype. It runs in WebGPU browsers. It has no tests. The type check (`tsc --noEmit`) reports 6 errors; the Vite build still passes and CI runs only the build.

**Live:** https://lithosphere.mustafasarac.com (needs a browser with WebGPU)
**Video:** [videos/lithosphere5.mp4](videos/lithosphere5.mp4)

## Run it

```bash
git clone https://github.com/neurabytelabs/lithosphere.git
cd lithosphere
npm ci
npm run dev      # http://localhost:3000
npm run build    # output in dist/
```

## Browser requirement

The app needs WebGPU. Without it the app shows an error message and does not render the scene. Chrome and Edge 113 or later and Safari 18 or later expose WebGPU; I have only checked Chrome. Check [caniuse.com/webgpu](https://caniuse.com/webgpu) for your browser.

## What it does

- Renders an inner glowing core and a transparent outer gel shell, using Three.js (r182) TSL node materials.
- Shader Studio panel: sliders and toggles for core, gel, lights, animation, shape, camera and post-processing (bloom, chromatic aberration, vignette).
- 10 built-in presets (`PRESETS` in `components/DebugPanel.tsx`), JSON import and export of the configuration, and TSL code export.
- Screenshot (PNG or JPEG) and WebM video capture, HDR environment maps, GLTF import.
- Multiple cores and gels, a simple N-body gravity mode, and a material demo scene.
- Optional AI suggestions through the Gemini API (see below).

I have not measured frame rate, so this README makes no FPS claim.

## AI suggestions (Gemini)

The AI panel calls the Gemini API from the browser. The repo ships no API key. To enable it, put your own key in the browser: `localStorage.setItem('lithosphere.geminiKey', '<your key>')`. The key stays in your browser and goes only to `generativelanguage.googleapis.com`. Without a key, the AI panel reports that it is unavailable.

## Layout

- `App.tsx`, `index.tsx`: app entry.
- `components/`: scene (`RockScene.tsx`), Shader Studio panel (`DebugPanel.tsx`), audio, gesture and debug panels.
- `materials/`, `src/`: material system and panels added later.
- `services/`: WebGPU check, physics presets, Gemini client, hand-gesture input (MediaPipe).
- `CHANGELOG.md`: version history.

## License

MIT. See [LICENSE](LICENSE). Third-party packages keep their own licenses.

Author: Mustafa Saraç, [mustafasarac.com](https://mustafasarac.com)
