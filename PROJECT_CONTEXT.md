---
# Project Metadata (YAML frontmatter - Machine-readable)
project:
  name: "Lithosphere"
  version: "7.0.0-alpha.1"
  version_name: "Crystallum"
  status: "production"
  last_updated: "2026-01-15"
  repository: "https://github.com/neurabytelabs/lithosphere"
  primary_maintainer: "Mustafa Sarac"

tech_stack:
  frontend:
    - "React 19.2.3"
    - "Three.js r182 (WebGPU)"
    - "TypeScript 5.8"
    - "Vite 6.2"
    - "Tailwind CSS"
  backend: []  # Frontend-only project
  infrastructure:
    - "Coolify"
    - "Hetzner Cloud"
    - "Docker (nixpacks)"
  dependencies:
    - "three: ^0.182.0 (3D rendering + WebGPU)"
    - "@mediapipe/tasks-vision: ^0.10.14 (Hand tracking)"

infrastructure:
  domain: "lithosphere.mustafasarac.com"
  server: "91.98.46.190"
  containers:
    - "lithosphere-*"
  ports:
    frontend: 5173  # Local dev
  environment_vars:
    - "VITE_GEMINI_API_KEY"  # For AI shader suggestions

deployment:
  method: "coolify"
  auto_deploy: true
  branch: "main"
  url: "https://lithosphere.mustafasarac.com"

current_tasks: []

blockers: []

recent_changes:
  - date: "2025-12-22"
    description: "v7.0.0-alpha.1 Crystallum - Multi-Material System release"
    files_affected:
      - "materials/"
      - "src/features/GeologicalStory/"
      - "src/components/MaterialSelector/"
      - "src/hooks/useMaterial.ts"
  - date: "2025-12-20"
    description: "v5.0.0 Three-Body N-body physics demo deployed"
    files_affected:
      - "services/physicsPresets.ts"
      - "components/RockScene.tsx"
---

# Lithosphere

> Procedural WebGPU Shader Studio - HAL 9000 inspired glowing orb with real-time controls and multi-material system

## Architecture & Patterns

### Folder Structure
```
lithosphere/
├── App.tsx                    # Main application entry
├── index.tsx                  # React DOM entry
├── index.css                  # Global styles (Tailwind)
├── version.ts                 # SSOT for versioning
├── components/                # Root-level components
│   ├── AudioPanel.tsx         # Audio reactivity controls
│   ├── DebugPanel.tsx         # Shader Studio panel (165k lines!)
│   ├── GesturePanel.tsx       # Hand tracking UI
│   ├── MaterialDemoScene.tsx  # Material showcase
│   └── RockScene.tsx          # Main 3D scene (80k lines)
├── src/
│   ├── components/
│   │   ├── MaterialPicker/    # Material selection UI
│   │   └── MaterialSelector/  # Material switching component
│   ├── features/
│   │   └── GeologicalStory/   # Geological formation storytelling
│   └── hooks/
│       └── useMaterial.ts     # React hook for material system
├── materials/                 # TSL Shader Materials
│   ├── base.ts                # Base material definitions
│   ├── types.ts               # TypeScript types
│   ├── registry.ts            # Material registry
│   ├── index.ts               # Exports
│   ├── gemstones/
│   │   └── diamond.ts         # Diamond shader (~12k lines)
│   ├── volcanic/
│   │   └── obsidian.ts        # Obsidian shader (~15k lines)
│   ├── crystalline/
│   │   └── quartz.ts          # Quartz shader (~14k lines)
│   ├── organic/
│   │   └── amber.ts           # Amber shader (~15k lines)
│   ├── exotic/
│   │   └── opal.ts            # Opal shader (~18k lines)
│   └── effects/               # Reusable shader effects
│       ├── inclusions.ts      # Material inclusions
│       ├── patterns.ts        # Pattern generators
│       ├── spectral.ts        # Spectral dispersion
│       └── subsurface.ts      # Subsurface scattering
└── services/                  # Business logic services
    ├── audioService.ts        # Audio reactivity (~17k lines)
    ├── collisionService.ts    # Physics collisions
    ├── gestureService.ts      # Hand gesture processing
    ├── physicsPresets.ts      # N-body physics presets
    ├── trailService.ts        # Motion trail effects
    ├── vectorVisualizationService.ts  # Force vector display
    └── webGpuService.ts       # WebGPU initialization
```

### Design Patterns

- **TSL (Three Shading Language)**: Node-based material system for WebGPU shaders
- **Single Source of Truth (SSOT)**: Version info centralized in `version.ts`
- **Feature-Based Organization**: `src/features/` for complex features like GeologicalStory
- **Service Pattern**: `services/` for business logic separated from UI
- **Custom Hooks**: `useMaterial` hook for material system integration
- **Material Registry**: Centralized material definitions with metadata

### Coding Conventions

- TypeScript strict mode
- TSL shader nodes for all materials
- React 19 with concurrent features
- Tailwind CSS for UI styling
- Feature folders with index.ts exports

### Key Architectural Decisions

1. **WebGPU over WebGL**: Next-gen graphics API for better performance and shader capabilities
2. **TSL over GLSL**: Three Shading Language allows node-based material composition
3. **Material Registry Pattern**: Centralized material definitions enable dynamic switching
4. **Dual-Mesh System**: Inner core + outer shell for realistic light transmission
5. **Service Separation**: Audio, gesture, physics services decoupled from rendering

---

## Tech Stack Details

### Frontend
- **React 19.2.3**: Concurrent features, automatic batching
- **Three.js r182**: WebGPU renderer with TSL support
- **TypeScript 5.8**: Type safety for complex shader types
- **Vite 6.2**: Fast HMR, optimal bundling
- **Tailwind CSS**: Utility-first styling for debug panel
- **@mediapipe/tasks-vision**: Hand tracking via MediaPipe

### 3D Rendering
- **WebGPU Backend**: Chrome/Edge with WebGPU flag
- **TSL Shaders**: MaterialX noise functions (mx_fractal_noise_float, mx_noise_float)
- **Post-Processing**: Bloom, chromatic aberration, vignette
- **HDR Environment**: Support for .hdr/.exr files

### Materials System
- **5 Core Materials**: Diamond, Obsidian, Quartz, Amber, Opal
- **20+ TSL Effects**: Spectral dispersion, subsurface scattering, inclusions, patterns
- **Geological Story Mode**: Formation narratives for each material

---

## Deployment Information

### Local Development
```bash
# Clone the repository
git clone https://github.com/neurabytelabs/lithosphere.git
cd lithosphere

# Install dependencies
npm install

# Start development server
npm run dev

# Open in WebGPU-compatible browser
# http://localhost:5173
```

### Production Deploy
```bash
# Auto-deploy via Coolify webhook on push to main
git push origin main

# Or manual build
npm run build
npm run preview
```

### Environment Variables
```bash
# Development (optional)
VITE_GEMINI_API_KEY=your_key  # For AI shader suggestions
```

### Health Checks
- URL: https://lithosphere.mustafasarac.com
- Expected: WebGPU canvas renders (no health API - static site)

---

## Current Status

### Last Session (2025-12-22)
- Released v7.0.0-alpha.1 "Crystallum"
- Multi-Material System complete
- 5 core materials with unique TSL shaders
- Geological Story Mode feature added
- MaterialPicker and MaterialSelector components

### Active Branch
- `main` (production) - v7.0.0-alpha.1 deployed

### Known Issues
1. WebGPU required - no WebGL fallback
2. DebugPanel.tsx is 165k lines - needs refactoring
3. RockScene.tsx is 80k lines - monolithic component

### Performance Metrics
- Target: 60 FPS
- WebGPU-optimized procedural noise
- Instanced rendering for particles

---

## Development Workflow

### Starting Work
```bash
# 1. Check status
git status
git pull origin main

# 2. Create branch
git checkout -b feature/description

# 3. Start dev server
npm run dev
```

### Testing
```bash
# No automated tests currently
# Manual testing in WebGPU-compatible browser
# Chrome/Edge with WebGPU flag enabled
```

### Code Review Checklist
- [ ] TSL shader nodes render correctly
- [ ] No console.log/debugger
- [ ] TypeScript types correct
- [ ] Performance verified (60 FPS target)
- [ ] Works in Chrome + Edge WebGPU
- [ ] version.ts updated if release

---

## Key Files & Entry Points

### Entry Points
- `index.tsx` - React DOM entry
- `App.tsx` - Main application component
- `components/RockScene.tsx` - Core 3D rendering

### Version Management
- `version.ts` - SSOT for all version info

### Material System
- `materials/index.ts` - Material exports
- `materials/registry.ts` - Material registration
- `src/hooks/useMaterial.ts` - React integration

### Configuration Files
- `package.json` - Dependencies
- `vite.config.ts` - Build config
- `tsconfig.json` - TypeScript config
- `nixpacks.toml` - Coolify build config

---

## Common Tasks

### Add New Material
1. Create file in appropriate `materials/` subfolder
2. Define TSL shader nodes
3. Register in `materials/registry.ts`
4. Add geological story in `GeologicalStoryMode.ts`
5. Update version.ts features

### Update Shader Effect
1. Modify effect in `materials/effects/`
2. Test with MaterialDemoScene
3. Verify 60 FPS performance

### Add UI Control
1. Add to DebugPanel.tsx (Shader Studio)
2. Connect to material/scene parameters
3. Style with Tailwind

---

## Troubleshooting

### Common Issues

**Issue 1: Black screen / No render**
- **Symptom**: Canvas is black
- **Cause**: WebGPU not supported or not enabled
- **Fix**: Use Chrome/Edge with WebGPU flag: `chrome://flags/#enable-webgpu-developer-features`

**Issue 2: Low FPS**
- **Symptom**: Stuttering, <30 FPS
- **Cause**: Complex shader or too many particles
- **Fix**: Reduce particle count in DebugPanel, simplify shader

**Issue 3: Material not loading**
- **Symptom**: Default material shows instead of selected
- **Cause**: Material not registered in registry
- **Fix**: Check `materials/registry.ts` exports

### Debug Checklist
- [ ] WebGPU enabled in browser
- [ ] Console for shader compilation errors
- [ ] Network tab for HDR/GLTF loading
- [ ] Performance tab for FPS

---

## Agent Instructions

### Context for AI Agents
This project follows these conventions:
- TSL (Three Shading Language) for all materials - not raw GLSL
- version.ts is SSOT - never hardcode versions elsewhere
- Materials are registered in registry.ts
- Large files (DebugPanel, RockScene) - be careful with edits

### Before Making Changes
1. Read this entire document
2. Check version.ts for current version
3. Understand TSL shader node system
4. Review materials/effects/ for reusable nodes

### After Making Changes
1. Update `last_updated` date in this file
2. Add to `recent_changes` if significant
3. Update version.ts if releasing
4. Test in WebGPU-compatible browser

---

## Resources

### Documentation
- Internal: `PLAN_v5.0_THREE_BODY.md` (N-body physics)
- Three.js TSL: https://threejs.org/docs/#manual/en/introduction/TSL-getting-started
- WebGPU: https://gpuweb.github.io/gpuweb/

### External Links
- Production: https://lithosphere.mustafasarac.com
- Repository: https://github.com/neurabytelabs/lithosphere
- Video Demo: `videos/lithosphere5.mp4`

### Team Contacts
- Project Lead: Mustafa Sarac
- Company: NeuraByte Labs
- Email: mr.sarac@gmail.com

---

## Project Philosophy

### Core Principles
1. **Visual Excellence**: HAL 9000 aesthetic, professional shader quality
2. **Performance First**: 60 FPS target, WebGPU optimization
3. **Educational Value**: Geological Story Mode teaches material formation
4. **Creative Exploration**: Shader Studio enables experimentation

### Success Metrics
- 60 FPS on mid-range GPU
- All 5 core materials render correctly
- Geological stories accurate and engaging
- Shader Studio usable by non-programmers

---

## Privacy & Security Rules

### Before Deployment
- [x] No secrets in code (API key via env var)
- [x] No authentication needed (public demo)
- [x] Static site - no server-side security needed
- [x] CORS not applicable

### Classification
- **Level 0 (Public)**: This is a public demo/portfolio project
- No personal data collected
- No user accounts

---

**Last Updated**: 2026-01-15
**Updated By**: Claude Code Agent
**Template Version**: 2.0.0 (Comprehensive with YAML + Markdown Hybrid)
