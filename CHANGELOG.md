# Changelog

Moved from README.md. Entries are as written at the time.

### v5.0.0-alpha.1 (2025-12-19) - Three-Body Problem
**Physics Engine Sprint 1 - Foundation Complete!**
- 🌌 **Physics Engine** - Full N-body gravity simulation (Newton's F = Gm₁m₂/r²)
- ⚡ **Gravity Modes** - Newton (realistic), Artistic (exaggerated), Magnetic (attract/repel)
- 📦 **Boundary System** - Bounce, Wrap, or Contain objects within world boundaries
- 💎 **Gel Interaction** - Collision, Deformation, and Merge modes (UI ready)
- 🎨 **Orbit Trails** - Trail visualization for object paths (UI ready)
- 🌀 **Three-Body Chaos** - Chaotic dynamics with 3+ cores
- ⚖️ **Mass System** - Auto (scale-based) or manual mass for each instance
- ⏱️ **Time Scale** - Control simulation speed from 0.1x slow-mo to 3x fast-forward

### v4.0.0-rc1 (2025-12-19) - Multiverse
**Multi-Core & Gel System**
- 🌐 **Multi-Core System** - Create and manage up to 10 core instances
- 💎 **Multi-Gel System** - Create and manage up to 10 gel instances
- 📐 **Instance Transforms** - Position, rotation, and scale for each instance
- 🔗 **Core-Gel Linking** - Gels follow linked core position automatically
- ✨ **Arrangement Presets** - 6 presets: Single, Binary, Orbital, Triangle, Stack, Cluster
- 📋 **Duplicate Instances** - Clone any core or gel with one click
- 🎭 **Animation Sync** - Synchronized, independent, or staggered modes
- 👁️ **Instance Visibility** - Toggle each instance on/off independently

### v3.7.x (2025-12-19) - Master Light Control
**Light & Shader Toggles**
- 💡 **9 Light Toggles** - On/off for every light: Key, Fill, Top, Rim 1&2, HAL Core/Back, Red Rim, Ambient
- 🎭 **Shader Effect Toggles** - Fresnel, Specular, Red Bleed, Sheen, Env Reflection
- 🔆 **Fresnel/Specular Control** - Adjustable power & intensity for edge glow and highlights

### v3.6 (2025-12-19) - Sprint 5: Right-Side Panel
**New Features:**
- 📱 **Right-Side Panel** - Panel moved from bottom to right side for better UX
- 🎛️ **Vertical Tab Sidebar** - Icon + label tabs in a vertical layout
- 📜 **Scrollable Content** - Full-height scrollable content area
- ❌ **No Camera Zoom** - Removed camera zoom-out when panel opens (not needed with right layout)
- 🎨 **Compact UI** - Optimized all controls for narrow panel width

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
