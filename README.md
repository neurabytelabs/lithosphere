# Lithosphere

> Procedural WebGPU Shader Studio - HAL 9000 inspired glowing orb with real-time controls

[![Lithosphere Demo](https://lithosphere.mustafasarac.com/og-image.png)](https://github.com/mrsarac/lithosphere/raw/main/videos/lithosphere5.mp4)

> *Click image to watch demo video*

## Features

- **WebGPU Rendering** - Next-gen graphics API with Three.js TSL (Three Shading Language)
- **Dual-Mesh System** - Inner glowing core + transparent outer gel shell
- **HAL 9000 Aesthetic** - Menacing red glow with pulsing animations
- **Shader Studio Panel** - Professional debug panel inspired by Substance Designer
  - Real-time parameter controls (colors, materials, lighting, animation)
  - 6 Built-in presets (HAL 9000, Blue Crystal, Toxic Green, Golden Sun, Purple Void, White Dwarf)
  - Import/Export configurations
  - Gemini AI integration for natural language shader suggestions
- **60 FPS Performance** - Optimized procedural noise and MaterialX functions

## Tech Stack

- **React 19** + TypeScript
- **Three.js r182** with WebGPU backend
- **TSL** (Three Shading Language) for node-based materials
- **MaterialX Noise** - `mx_fractal_noise_float`, `mx_noise_float`
- **Vite** for blazing fast development
- **Tailwind CSS** for UI styling

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Browser Requirements

WebGPU is required. Supported browsers:
- Chrome 113+
- Edge 113+
- Safari 18+ (macOS Sonoma+)

## Shader Controls

Open the **SHADER STUDIO** panel (bottom of screen) to access:

| Tab | Controls |
|-----|----------|
| Core | Geometry, Colors, Material, Pulse, Noise |
| Gel | Transparency, Surface, Attenuation, Effects |
| Light | Key, Fill, Rim, HAL Core lights |
| Anim | Auto-rotate, Breathing, Wobble |
| Shape | Geometry type, Visibility |
| Presets | One-click style presets |
| AI | Gemini-powered shader suggestions |

## License

MIT

## Author

**Mustafa Sarac** - [mustafasarac.com](https://mustafasarac.com)

---

Part of [mustafasarac.com/labs](https://mustafasarac.com/labs) experimental projects.
