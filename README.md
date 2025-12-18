<div align="center">

# Lithosphere

### Procedural WebGPU Shader Studio

*HAL 9000 inspired glowing orb with real-time controls*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-lithosphere.mustafasarac.com-red?style=for-the-badge&logo=webgl)](https://lithosphere.mustafasarac.com)
[![GitHub](https://img.shields.io/github/stars/mrsarac/lithosphere?style=for-the-badge&logo=github)](https://github.com/mrsarac/lithosphere)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br />

[**Live Demo**](https://lithosphere.mustafasarac.com) · [**Watch Video**](https://github.com/mrsarac/lithosphere/raw/main/videos/lithosphere5.mp4) · [**Report Bug**](https://github.com/mrsarac/lithosphere/issues)

<br />

https://github.com/mrsarac/lithosphere/raw/main/videos/lithosphere5.mp4

</div>

---

## About

**Lithosphere** is a real-time procedural shader playground built with WebGPU. It features a dual-mesh rendering system with an inner glowing core inspired by HAL 9000 and a transparent outer gel shell with advanced light transmission.

The project includes a professional **Shader Studio** debug panel (inspired by Substance Designer) that allows real-time manipulation of every shader parameter, plus **Gemini AI** integration for natural language shader suggestions.

---

## Features

| Feature | Description |
|---------|-------------|
| **WebGPU Rendering** | Next-gen graphics API with Three.js TSL (Three Shading Language) |
| **Dual-Mesh System** | Inner glowing core + transparent outer gel shell with light bleeding |
| **HAL 9000 Aesthetic** | Menacing red glow with pulsing animations |
| **Shader Studio Panel** | Professional debug panel with 50+ real-time parameters |
| **6 Built-in Presets** | HAL 9000, Blue Crystal, Toxic Green, Golden Sun, Purple Void, White Dwarf |
| **AI Integration** | Gemini-powered natural language shader suggestions |
| **Import/Export** | Save and share your shader configurations as JSON |
| **60 FPS Performance** | Optimized procedural noise with MaterialX functions |

---

## Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-r182-000000?style=flat-square&logo=three.js)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-red?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-06B6D4?style=flat-square&logo=tailwindcss)

</div>

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with concurrent features |
| **Three.js r182** | 3D rendering with WebGPU backend |
| **TSL** | Three Shading Language for node-based materials |
| **MaterialX Noise** | `mx_fractal_noise_float`, `mx_noise_float` for procedural textures |
| **Vite** | Blazing fast development and HMR |
| **Tailwind CSS** | Utility-first styling for debug panel |
| **Gemini API** | AI-powered shader suggestions |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mrsarac/lithosphere.git
cd lithosphere

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in a WebGPU-compatible browser.

---

## Browser Support

WebGPU is required. Check [caniuse.com/webgpu](https://caniuse.com/webgpu) for current support.

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 113+ | ✅ Supported |
| Edge | 113+ | ✅ Supported |
| Safari | 18+ (macOS Sonoma) | ✅ Supported |
| Firefox | Nightly | ⚠️ Experimental |

---

## Shader Studio Controls

Open the **SHADER STUDIO** panel at the bottom of the screen:

| Tab | Controls |
|-----|----------|
| **Core** | Geometry size, base/glow colors, metalness, roughness, pulse intensity, noise scale |
| **Gel** | Transmission, thickness, IOR, clearcoat, attenuation color/distance |
| **Light** | Key light, fill light, rim light, HAL core point light |
| **Anim** | Auto-rotate speed, breathing amplitude, wobble intensity |
| **Shape** | Geometry type (Sphere, Icosahedron, Torus), mesh visibility |
| **Presets** | One-click style presets with instant preview |
| **AI** | Natural language shader modification via Gemini |

---

## Presets

<table>
<tr>
<td align="center"><strong>HAL 9000</strong><br/>Classic menacing red</td>
<td align="center"><strong>Blue Crystal</strong><br/>Icy cold glow</td>
<td align="center"><strong>Toxic Green</strong><br/>Radioactive energy</td>
</tr>
<tr>
<td align="center"><strong>Golden Sun</strong><br/>Warm solar plasma</td>
<td align="center"><strong>Purple Void</strong><br/>Deep space anomaly</td>
<td align="center"><strong>White Dwarf</strong><br/>Stellar remnant</td>
</tr>
</table>

---

## Roadmap

- [x] WebGPU rendering with Three.js TSL
- [x] Dual-mesh system (core + gel shell)
- [x] Real-time shader parameter controls
- [x] 6 built-in presets
- [x] Import/Export configurations
- [x] Gemini AI integration
- [ ] More geometry types (custom meshes, GLTF import)
- [ ] Audio reactivity (microphone/audio file input)
- [ ] Post-processing effects (bloom, chromatic aberration)
- [ ] VR/AR support via WebXR
- [ ] Shader code export (GLSL/WGSL)
- [ ] Community preset gallery
- [ ] Mobile touch controls

---

## Project Structure

```
lithosphere/
├── src/
│   ├── components/
│   │   ├── RockScene.tsx      # Main WebGPU scene with dual-mesh system
│   │   └── DebugPanel.tsx     # Shader Studio control panel
│   ├── index.tsx              # App entry point
│   └── index.css              # Global styles
├── videos/
│   └── lithosphere5.mp4       # Demo video
├── index.html                 # HTML template
├── nixpacks.toml              # Deployment config
└── package.json
```

---

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Author

<div align="center">

**Mustafa Sarac**

[![Website](https://img.shields.io/badge/Website-mustafasarac.com-000?style=flat-square)](https://mustafasarac.com)
[![GitHub](https://img.shields.io/badge/GitHub-mrsarac-181717?style=flat-square&logo=github)](https://github.com/mrsarac)
[![Twitter](https://img.shields.io/badge/Twitter-@mikibox-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/mikibox)

</div>

---

<div align="center">

Part of [mustafasarac.com/labs](https://mustafasarac.com/labs) experimental projects.

<br />

**If you like this project, please give it a ⭐**

</div>
