# Lithosphere v4.0 - Multi Core & Multi Gel System

## Executive Summary

Transform Lithosphere from a single-core/single-gel system to a multi-instance system where users can create, position, and independently control multiple cores and gel layers.

---

## Current State Analysis

### Single System (v3.7.2)
```
Scene
├── Core Mesh (1x)
│   ├── TSL Shader
│   ├── Config: CoreConfig
│   └── Position: (0, 0, 0)
└── Gel Mesh (1x)
    ├── TSL Shader + MeshPhysicalNodeMaterial
    ├── Config: GelConfig
    └── Position: (0, 0, 0)
```

### Target Multi-System (v4.0)
```
Scene
├── Core Instances[]
│   ├── Core 0 (Primary)
│   │   ├── TSL Shader
│   │   ├── Config: CoreConfig
│   │   └── Transform: { position, rotation, scale }
│   ├── Core 1
│   │   └── ...
│   └── Core N
│       └── ...
└── Gel Instances[]
    ├── Gel 0 (Primary)
    │   ├── TSL Shader
    │   ├── Config: GelConfig
    │   └── Transform: { position, rotation, scale }
    ├── Gel 1
    │   └── ...
    └── Gel N
        └── ...
```

---

## Architecture Design

### Phase 1: Data Structure Refactoring

#### New Interfaces

```typescript
// Instance Transform
interface InstanceTransform {
  position: [number, number, number];
  rotation: [number, number, number]; // Euler angles in radians
  scale: [number, number, number];
}

// Core Instance
interface CoreInstance {
  id: string;
  name: string;
  enabled: boolean;
  config: CoreConfig;
  transform: InstanceTransform;
}

// Gel Instance
interface GelInstance {
  id: string;
  name: string;
  enabled: boolean;
  config: GelConfig;
  transform: InstanceTransform;
  parentCoreId: string | null; // Optional link to a core
}

// Updated ShaderConfig
interface ShaderConfig {
  // Legacy single-instance (for backwards compatibility)
  core: CoreConfig;
  gel: GelConfig;

  // New multi-instance
  cores: CoreInstance[];
  gels: GelInstance[];

  // Selection state
  selectedCoreId: string | null;
  selectedGelId: string | null;

  // Global settings (unchanged)
  lighting: LightingConfig;
  animation: AnimationConfig;
  // ...
}
```

#### Default Factory Functions

```typescript
const createDefaultCore = (index: number): CoreInstance => ({
  id: `core-${Date.now()}-${index}`,
  name: `Core ${index + 1}`,
  enabled: true,
  config: { ...DEFAULT_CONFIG.core },
  transform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
});

const createDefaultGel = (index: number, parentCoreId?: string): GelInstance => ({
  id: `gel-${Date.now()}-${index}`,
  name: `Gel ${index + 1}`,
  enabled: true,
  config: { ...DEFAULT_CONFIG.gel },
  transform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  parentCoreId: parentCoreId || null,
});
```

---

### Phase 2: RockScene.tsx Refactoring

#### SceneRefs Update

```typescript
interface SceneRefs {
  // Multi-instance meshes
  coreMeshes: Map<string, THREE.Mesh>;
  gelMeshes: Map<string, THREE.Mesh>;
  coreMaterials: Map<string, any>;
  gelMaterials: Map<string, any>;
  coreGeometries: Map<string, THREE.BufferGeometry>;
  gelGeometries: Map<string, THREE.BufferGeometry>;

  // Instance uniforms (for animation sync)
  instanceUniforms: Map<string, {
    uTime: any;
    uPulseSpeed: any;
    // ...
  }>;

  // Existing refs...
  keyLight: THREE.DirectionalLight | null;
  // ...
}
```

#### Mesh Management Functions

```typescript
// Create a new core mesh
const createCoreMesh = (instance: CoreInstance): THREE.Mesh => {
  // Generate geometry based on config
  // Create TSL material with instance.config
  // Apply transform
  // Return mesh
};

// Create a new gel mesh
const createGelMesh = (instance: GelInstance): THREE.Mesh => {
  // Generate geometry based on config
  // Create TSL material with instance.config
  // Apply transform
  // Return mesh
};

// Remove mesh from scene
const removeMesh = (id: string, type: 'core' | 'gel') => {
  // Dispose geometry
  // Dispose material
  // Remove from scene
  // Clean up refs
};

// Update mesh transform
const updateMeshTransform = (id: string, type: 'core' | 'gel', transform: InstanceTransform) => {
  const mesh = type === 'core' ? refs.coreMeshes.get(id) : refs.gelMeshes.get(id);
  if (mesh) {
    mesh.position.set(...transform.position);
    mesh.rotation.set(...transform.rotation);
    mesh.scale.set(...transform.scale);
  }
};
```

---

### Phase 3: UI Components

#### Instance List Panel

```
┌─────────────────────────────────────┐
│ 🔴 CORES                    [+ Add] │
├─────────────────────────────────────┤
│ ● Core 1 (Primary)           [👁️][🗑️] │
│ ○ Core 2                     [👁️][🗑️] │
│ ○ Core 3                     [👁️][🗑️] │
├─────────────────────────────────────┤
│ 💎 GELS                     [+ Add] │
├─────────────────────────────────────┤
│ ● Gel 1 → Core 1             [👁️][🗑️] │
│ ○ Gel 2 → Core 2             [👁️][🗑️] │
│ ○ Gel 3 (Standalone)         [👁️][🗑️] │
└─────────────────────────────────────┘
```

#### Instance Controls (when selected)

```
┌─────────────────────────────────────┐
│ 📐 Transform                        │
├─────────────────────────────────────┤
│ Position X  [----●----------] 0.5   │
│ Position Y  [------●--------] 0.0   │
│ Position Z  [--------●------] -0.3  │
│                                     │
│ Rotation X  [●--------------] 0°    │
│ Rotation Y  [------●--------] 45°   │
│ Rotation Z  [●--------------] 0°    │
│                                     │
│ Scale       [------●--------] 1.0   │
│ Scale X     [------●--------] 1.0   │
│ Scale Y     [------●--------] 1.0   │
│ Scale Z     [------●--------] 1.0   │
│ 🔗 Uniform Scale              [ON]  │
└─────────────────────────────────────┘
```

#### New Tab: "Instances" (or modify existing tabs)

Option A: New dedicated "Instances" tab
Option B: Add instance selector to Core/Gel tabs

---

### Phase 4: Animation System Updates

#### Per-Instance Animation

Each instance can have independent animation parameters:
- Pulse speed/intensity
- Breathe speed/intensity
- Wobble speed/intensity

#### Sync Modes

```typescript
type AnimationSyncMode =
  | 'independent'  // Each instance animates separately
  | 'synchronized' // All instances share the same phase
  | 'staggered';   // Instances have phase offset

interface AnimationConfig {
  // ... existing
  syncMode: AnimationSyncMode;
  staggerOffset: number; // For staggered mode
}
```

---

### Phase 5: Performance Optimization

#### Instanced Rendering (Optional Future)

For many identical cores/gels, use THREE.InstancedMesh:
```typescript
// When cores have identical geometry but different transforms
const instancedCore = new THREE.InstancedMesh(geometry, material, count);
// Set per-instance transforms via instancedCore.setMatrixAt()
```

#### LOD System

```typescript
interface LODConfig {
  enabled: boolean;
  distances: [number, number, number]; // Low, Medium, High detail thresholds
  subdivisions: {
    low: number;
    medium: number;
    high: number;
  };
}
```

#### Culling

- Frustum culling (Three.js default)
- Distance-based visibility toggle

---

## Implementation Phases

### Sprint 1: Foundation (v4.0-alpha) ✅ COMPLETE
**Duration: 3-4 hours**

1. [x] Define new interfaces (CoreInstance, GelInstance, etc.)
2. [x] Update ShaderConfig with multi-instance support
3. [x] Create factory functions for new instances
4. [x] Backwards compatibility layer (migrate single to multi)

### Sprint 2: Scene Management (v4.0-beta) ✅ COMPLETE
**Duration: 4-5 hours**

1. [x] Refactor SceneRefs to use Maps
2. [x] Implement mesh creation and storage in Maps
3. [x] Implement cleanup function for multi-instance Maps
4. [x] Animation loop backwards compatible (uses legacy refs for primary)
5. [x] Update config change handlers for multi-instance

### Sprint 3: UI Implementation (v4.0-rc1) ✅ COMPLETE
**Duration: 4-5 hours**

1. [x] Create "Multi" tab with instance management UI
2. [x] Create Core instance list with visibility/delete buttons
3. [x] Create Gel instance list with visibility/delete buttons
4. [x] Create Transform controls section (position, scale)
5. [x] Implement Add/Remove instance buttons
6. [x] Add Animation Sync mode selector (synchronized/independent/staggered)

### Sprint 4: Advanced Features (v4.0-beta) ✅ COMPLETE
**Duration: 3-4 hours**

1. [x] Mesh instantiation in RockScene (apply transforms to meshes)
2. [x] Parent-child linking behavior (Gel follows Core transform)
3. [x] Instance visibility toggle (enabled flag + global visibility)
4. [x] Breathing animation respects instance scale

### Sprint 5: Polish & Performance (v4.0-rc1) ✅ COMPLETE
**Duration: 2-3 hours**

1. [x] Create additional meshes for new instances (mesh cloning)
2. [x] Duplicate instance buttons (📋)
3. [x] Instance presets (6 arrangements: Single, Binary, Orbital, Triangle, Stack, Cluster)
4. [ ] Full staggered animation mode (deferred)
5. [ ] Performance profiling & optimization (deferred)

---

## Current Status (Updated 2025-12-19)

**🎉 Sprints 1-5 Complete! v4.0.0-RC1 Released!**

### Core Features Implemented:
- ✅ New interfaces and data structures (CoreInstance, GelInstance, etc.)
- ✅ Multi-instance Maps in SceneRefs for mesh management
- ✅ Helper functions for instance management
- ✅ "Multi" tab with full instance list UI
- ✅ Transform controls (position/scale per instance)
- ✅ Add/Remove/Toggle visibility/Duplicate buttons
- ✅ Animation sync mode selector (synchronized/independent/staggered)
- ✅ Transforms applied to meshes in updateSceneFromConfig
- ✅ Parent-child linking (gel follows core position)
- ✅ Visibility toggle (instance enabled + global visible)
- ✅ Breathing animation uses baseScale from transform
- ✅ **Mesh cloning for new instances** (Sprint 5)
- ✅ **Duplicate instance functionality** (Sprint 5)
- ✅ **6 Arrangement Presets** (Sprint 5)

### What Works:
- Add/remove cores and gels (up to 10 each)
- Duplicate any instance with one click
- Select from 6 preset arrangements (Single, Binary, Orbital, Triangle, Stack, Cluster)
- Instance list shows all instances with selection highlighting
- Transform controls update config AND 3D meshes
- Gels linked to cores follow parent position automatically
- Each instance can be toggled visible/hidden independently
- Scale changes reflected in breathing animation

### Deferred to v4.1:
- Full staggered animation mode (phase offsets)
- Performance profiling & optimization
- Copy/paste instance settings between instances

---

## UI/UX Considerations

### Selection Behavior
- Click instance in list → Select for editing
- Ctrl+Click → Multi-select (future)
- Click in 3D viewport → Select nearest instance (future)

### Visual Feedback
- Selected instance: Highlight outline in 3D
- Hovered instance: Subtle glow
- Disabled instance: Semi-transparent

### Keyboard Shortcuts
- `Ctrl+D` - Duplicate selected instance
- `Delete` - Remove selected instance
- `Ctrl+A` - Add new instance
- `Tab` - Cycle through instances

---

## Presets / Arrangements

### Built-in Multi-Instance Presets

```typescript
const MULTI_PRESETS = {
  'Orbital System': {
    cores: [
      { transform: { position: [0, 0, 0], scale: [1, 1, 1] } },
      { transform: { position: [2, 0, 0], scale: [0.3, 0.3, 0.3] } },
      { transform: { position: [-1.5, 1, 0], scale: [0.2, 0.2, 0.2] } },
    ],
    gels: [/* matching gels */],
  },
  'Binary Stars': {
    cores: [
      { transform: { position: [-0.8, 0, 0], scale: [0.8, 0.8, 0.8] } },
      { transform: { position: [0.8, 0, 0], scale: [0.8, 0.8, 0.8] } },
    ],
    gels: [/* matching gels */],
  },
  'Cluster': {
    // 5-7 small cores clustered together
  },
  'Stack': {
    // Vertical stack of cores
  },
};
```

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance degradation with many instances | High | LOD, culling, instance limits |
| Memory leaks from improper disposal | High | Strict cleanup in removeMesh |
| UI complexity overwhelming users | Medium | Progressive disclosure, presets |
| Breaking existing configs | Medium | Migration function, version check |
| Shader compilation time | Low | Cache compiled shaders |

---

## Success Metrics

- [ ] Support 10+ cores without FPS drop below 30
- [ ] Support 10+ gels without FPS drop below 30
- [ ] Add/Remove instance < 100ms
- [ ] No memory leaks after 100 add/remove cycles
- [ ] Existing v3.x configs load correctly

---

## Questions for User

1. **Max Instances**: Should there be a limit? (e.g., max 20 cores, max 20 gels)
2. **Instance Hierarchy**: Should gels always link to a core, or standalone?
3. **Shared Settings**: Should there be "global" settings that apply to all instances?
4. **3D Selection**: Priority on clicking to select in 3D viewport?
5. **Animation**: Independent or synchronized animations preferred as default?

---

## Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Sprint 1: Foundation | 3-4h | 3-4h |
| Sprint 2: Scene Management | 4-5h | 7-9h |
| Sprint 3: UI Implementation | 4-5h | 11-14h |
| Sprint 4: Advanced Features | 3-4h | 14-18h |
| Sprint 5: Polish | 2-3h | 16-21h |

**Total Estimated: 16-21 hours**

---

## Next Steps

1. Review this plan
2. Answer questions above
3. Approve or modify scope
4. Begin Sprint 1

---

*Plan Created: 2025-12-19*
*Target Version: v4.0*
*Codename: "Multiverse"*
