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
| **Shader Studio Panel** | Professional debug panel with 70+ real-time parameters |
| **Post-Processing** | Bloom, chromatic aberration, vignette with WebGPU-native TSL |
| **HDR Environment** | Load .hdr/.exr files for realistic reflections and backgrounds |
| **Capture Studio** | Screenshot (PNG/JPEG) + video recording (WebM up to 60fps) |
| **GLTF Import** | Load custom 3D models with auto-normalization |
| **10 Built-in Presets** | HAL 9000, Blue Crystal, Toxic Green, Golden Sun, Purple Void + 5 more |
| **AI Integration** | Gemini-powered natural language shader suggestions |
| **TSL Code Export** | Copy or download your shader code for external use |
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

## Changelog

<!-- CHANGELOG_START -->
### v3.5 (2025-12-18) - Sprint 3 & 4: Camera Control + UX
**Sprint 4 - UX & Versioning:**
- 📋 **Dropdown Menus** - Config (Import/Export/Reset) and Code (TSL) actions consolidated
- 🏷️ **Version Strategy** - Single Source of Truth (version.ts) for all version references
- 🎥 **Improved Camera Sync** - More aggressive zoom (+3 units) and target shift (+1.5 Y)

**Sprint 3 - Camera Control:**
- 🎥 **Panel-Camera Sync** - Camera zooms out and shifts up when panel opens (no overlap)
- 🎬 **Smooth Camera Animation** - easeOutCubic easing with 60fps transitions
- 🎯 **Camera Presets** - Default, Close-Up, Wide Shot, Top-Down instant switching
- 🔒 **Lock Camera** - Toggle to prevent user camera interaction
- 📐 **Orbit Target Y** - Control vertical position of orbit center
- 📏 **Distance Slider** - Direct camera distance control

### v3.0 (2025-12-18) - Sprint 2: Visual Capture
**New Features:**
- 🔲 **Vignette Effect** - Custom TSL vignette with UV-based distance calculation and smoothstep falloff
- 📸 **Screenshot Capture** - PNG (lossless) or JPEG with quality control
- 🎬 **Video Recording** - WebM with VP9/VP8 codec, configurable bitrate (1-15 Mbps) and FPS (24-60)
- 🌍 **HDR Environment Maps** - RGBELoader for .hdr/.exr files with realistic reflections
- 🖼️ **HDR Background** - Optional environment background with blur control
- ⏱️ **Recording Timer** - Real-time duration display during video capture
- 📊 **New Capture Tab** - Dedicated tab for all capture controls

### v2.5 (2025-12-18) - Sprint 1: Visual Evolution
**New Features:**
- ✨ **Post-Processing Pipeline** - WebGPU-native bloom, chromatic aberration, vignette
- 🎨 **TSL Bloom Effect** - Configurable intensity, threshold, and radius
- 🌈 **Chromatic Aberration** - RGB color separation effect
- 📦 **GLTF Import** - Load custom 3D models with automatic centering and normalization
- 📤 **TSL Code Export** - Copy/download shader code for external use
- 🎯 **Effects Tab** - Centralized post-processing controls

### v2.0 (2025-12-18)
**Shader Studio Update:**
- ✨ **Shader Studio Panel** - Professional debug interface inspired by Substance Designer
- 🎬 **Camera Tab** - FOV, distance limits, damping controls
- 💡 **Advanced Lighting** - Key light position (X/Y/Z), dynamic lighting toggle, orbit speed
- 🎡 **Animation Controls** - Mesh rotation speed, breathing sync, wobble intensity
- 🎲 **Random Button** - One-click color randomization
- ⌨️ **Keyboard Shortcuts** - ~ toggle panel, 1-8 switch tabs, Esc close
- 📊 **FPS Counter** - Real-time performance monitoring
- 🌈 **10 Presets** - HAL 9000, Blue Crystal, Toxic Green, Golden Sun, Purple Void, White Dwarf + 4 new
- 🤖 **Gemini AI Integration** - Natural language shader suggestions
- 📦 **Import/Export** - Save and share configurations as JSON

### v1.0 (2025-12-17)
**Initial Release:**
- 🌐 **WebGPU Rendering** - Three.js with TSL (Three Shading Language)
- 🔮 **Dual-Mesh System** - Inner core + outer gel shell
- 🎭 **HAL 9000 Aesthetic** - Iconic glowing red orb
- 🌊 **MaterialX Noise** - Procedural displacement
- 🔄 **Auto-Rotation** - Smooth orbital animation
- 💨 **60 FPS** - Optimized performance
<!-- CHANGELOG_END -->

---

## Roadmap

- [x] WebGPU rendering with Three.js TSL
- [x] Dual-mesh system (core + gel shell)
- [x] Real-time shader parameter controls
- [x] 10 built-in presets
- [x] Import/Export configurations
- [x] Gemini AI integration
- [x] Camera controls (FOV, distance)
- [x] Advanced animation controls
- [x] Keyboard shortcuts
- [x] GLTF import (custom meshes)
- [x] Post-processing effects (bloom, chromatic aberration, vignette)
- [x] TSL shader code export
- [x] Screenshot capture (PNG/JPEG)
- [x] Video recording (WebM)
- [x] HDR environment maps
- [x] Camera presets & panel-camera sync
- [ ] Audio reactivity (microphone/audio file input)
- [ ] VR/AR support via WebXR
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
[![Twitter](https://img.shields.io/badge/Twitter-@theRenaisseur-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/theRenaisseur)

</div>

---

<div align="center">

Part of [mustafasarac.com/labs](https://mustafasarac.com/labs) experimental projects.

<br />

**If you like this project, please give it a ⭐**

</div>
