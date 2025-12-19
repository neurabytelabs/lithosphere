# Lithosphere v5.0 - "THREE-BODY" Physics System

## Executive Summary

Transform Lithosphere from a static multi-instance display into a living, breathing physics simulation where cores and gels interact through gravity, soft-body collisions, and chaotic three-body dynamics.

---

## Vision

```
   BEFORE (v4.0)                    AFTER (v5.0)
   ══════════════                   ═══════════════

   ○   ○   ○                        ○ ←──────→ ○
                                       ╲     ╱
   Static positions                     ╲   ╱
   No interaction                        ╲ ╱
                                          ○
                                          │
                                    Gravity trails
                                    Soft collisions
                                    Chaos physics
```

---

## Feature Modules

### Module 1: Gravity System 🌌

**Newton's Universal Gravitation:**
```
F = G × (m₁ × m₂) / r²

Where:
- G = Gravitational constant (adjustable)
- m = Mass (derived from scale or separate slider)
- r = Distance between objects
```

**Features:**
- [x] Gravity ON/OFF toggle
- [x] Gravity strength slider (0.0 - 2.0)
- [x] Gravity type selector:
  - Newton (realistic)
  - Artistic (simplified, prettier)
  - Magnetic (attract + repel)
- [x] Mass system:
  - Auto (scale = mass)
  - Manual (per-instance mass slider)
- [x] Damping factor (prevents infinite acceleration)
- [x] Boundary mode (wrap, bounce, contain)

**Physics Config:**
```typescript
interface PhysicsConfig {
  // Gravity
  gravityEnabled: boolean;
  gravityStrength: number;        // 0.0 - 2.0
  gravityType: 'newton' | 'artistic' | 'magnetic';

  // Mass
  massMode: 'auto' | 'manual';    // auto = scale-based

  // Simulation
  damping: number;                // 0.0 - 1.0 (velocity decay)
  timeScale: number;              // 0.1 - 5.0 (simulation speed)

  // Boundaries
  boundaryMode: 'none' | 'wrap' | 'bounce' | 'contain';
  boundaryRadius: number;
}
```

---

### Module 2: Gel-Gel Interaction 💎

**Soft-Body Physics:**
```
   💎 ───proximity───→ 💎
      │                 │
      ▼                 ▼
   Deform            Deform
   Push              Push
   Merge?            Merge?
```

**Features:**
- [x] Gel interaction ON/OFF
- [x] Interaction modes:
  - Soft Collision (push apart)
  - Deformation (squish on contact)
  - Merge/Blend (visual merge when close)
  - All combined
- [x] Interaction strength slider
- [x] Interaction radius slider
- [x] Core-Gel attraction (gels orbit cores)

**Gel Interaction Config:**
```typescript
interface GelInteractionConfig {
  enabled: boolean;
  mode: 'collision' | 'deformation' | 'merge' | 'all';
  strength: number;               // 0.0 - 1.0
  radius: number;                 // Interaction distance
  coreAttraction: boolean;        // Gels attracted to cores
  coreAttractionStrength: number;
}
```

---

### Module 3: Three-Body Problem 🌀

**The Famous Unsolvable Problem:**
```
         ●₁
        ╱│╲
       ╱ │ ╲         No closed-form solution!
      ╱  │  ╲        Chaotic behavior
     ╱   │   ╲       Sensitive to initial conditions
    ●₂───┼───●₃      = BEAUTIFUL UNPREDICTABILITY
         │
      Lagrange
       Points
```

**Features:**
- [x] Chaos Mode toggle (activates with 3+ cores)
- [x] Orbit trails:
  - Trail ON/OFF
  - Trail length (10 - 500 points)
  - Trail fade (opacity over time)
  - Trail color (inherit or custom)
- [x] Famous orbit presets:
  - Figure-8 (stable 3-body orbit)
  - Binary + Satellite
  - Chaotic Dance
  - Lagrange Points Demo
- [x] Energy visualization:
  - Kinetic energy bars
  - Potential energy field
  - Total energy conservation check
- [x] Butterfly Effect demo:
  - Duplicate simulation with tiny offset
  - Show divergence over time
- [x] Collision events:
  - Flash effect
  - Merge option
  - Scatter option

**Three-Body Config:**
```typescript
interface ThreeBodyConfig {
  // Chaos
  chaosEnabled: boolean;

  // Trails
  trailsEnabled: boolean;
  trailLength: number;            // 10 - 500
  trailFade: boolean;
  trailWidth: number;
  trailColorMode: 'inherit' | 'velocity' | 'custom';
  trailColor: [number, number, number];

  // Visualization
  showEnergyBars: boolean;
  showVelocityVectors: boolean;
  showForceVectors: boolean;

  // Collision
  collisionMode: 'none' | 'bounce' | 'merge' | 'scatter';
  collisionEffect: boolean;       // Visual flash

  // Presets
  activePreset: string | null;
}
```

---

### Module 4: Orbit Trail System 🎨

**Trail Rendering:**
```
        ○ Current position
       ╱
      ╱  ← Recent (bright)
     ╱
    ╱    ← Older (fading)
   ╱
  ·      ← Oldest (dim)
```

**Implementation:**
```typescript
interface TrailPoint {
  position: THREE.Vector3;
  timestamp: number;
  velocity: number;  // For velocity-based coloring
}

interface TrailSystem {
  points: Map<string, TrailPoint[]>;  // Per-instance trails
  maxPoints: number;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
}
```

---

## Sprint Plan

### Sprint 1: Physics Foundation ⚡
**Duration: 4-5 hours**

1. [ ] Create PhysicsConfig interface
2. [ ] Add physics state to SceneRefs (velocity, acceleration per instance)
3. [ ] Implement basic gravity calculation
4. [ ] Add velocity/position update loop
5. [ ] Create Physics tab in DebugPanel
6. [ ] Gravity ON/OFF + strength slider

### Sprint 2: Advanced Gravity 🌌
**Duration: 3-4 hours**

1. [ ] Implement Newton gravity formula
2. [ ] Add Artistic gravity mode
3. [ ] Add Magnetic gravity mode (attract/repel)
4. [ ] Mass system (auto + manual)
5. [ ] Damping factor
6. [ ] Boundary modes (wrap, bounce, contain)

### Sprint 3: Gel Interaction 💎
**Duration: 4-5 hours**

1. [ ] Gel-Gel collision detection
2. [ ] Soft collision response (push apart)
3. [ ] Deformation shader effect
4. [ ] Visual merge effect
5. [ ] Core-Gel attraction
6. [ ] Panel controls for all modes

### Sprint 4: Trail System 🎨
**Duration: 3-4 hours**

1. [ ] Trail point storage per instance
2. [ ] Trail geometry generation
3. [ ] Trail shader (fading, color modes)
4. [ ] Trail cleanup (remove old points)
5. [ ] Panel controls (length, fade, color)
6. [ ] Performance optimization

### Sprint 5: Three-Body Chaos 🌀
**Duration: 4-5 hours**

1. [ ] Chaos mode activation (3+ cores)
2. [ ] Famous orbit presets (Figure-8, etc.)
3. [ ] Energy calculation (kinetic + potential)
4. [ ] Energy visualization bars
5. [ ] Velocity/Force vector display
6. [ ] Collision detection & effects

### Sprint 6: Polish & Presets ✨
**Duration: 3-4 hours**

1. [ ] Butterfly Effect demo mode
2. [ ] Lagrange Points visualization
3. [ ] Preset save/load system
4. [ ] Performance profiling
5. [ ] Mobile/touch optimization
6. [ ] Final testing & bug fixes

---

## Panel Structure

```
┌─────────────────────────────────────────────────────────┐
│ 🌌 PHYSICS                                      [v5.0] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ⚡ Gravity System                              [ON/OFF] │
│ ├─ Strength      [━━━━━●━━━━━━━━━━━━━] 0.50           │
│ ├─ Type          [Newton ▼] [Artistic] [Magnetic]     │
│ ├─ Mass Mode     [Auto ▼] (scale = mass)              │
│ └─ Damping       [━━━━━━━━●━━━━━━━━━━] 0.02           │
│                                                         │
│ 📦 Boundaries                                           │
│ ├─ Mode          [Bounce ▼]                            │
│ └─ Radius        [━━━━━━━━━━●━━━━━━━━] 5.0            │
│                                                         │
│ 💎 Gel Interaction                             [ON/OFF] │
│ ├─ Mode          [All ▼]                               │
│ ├─ Strength      [━━━━●━━━━━━━━━━━━━━] 0.30           │
│ ├─ Radius        [━━━━━━●━━━━━━━━━━━━] 0.50           │
│ └─ Core Attract  [ON/OFF] Strength [━━●━━] 0.20       │
│                                                         │
│ 🌀 Three-Body Mode                             [ON/OFF] │
│ ├─ Chaos         [Enabled when 3+ cores]               │
│ ├─ Sim Speed     [━━━━━━●━━━━━━━━━━━━] 1.0x           │
│ └─ Collision     [Bounce ▼] + Effect [ON]             │
│                                                         │
│ 🎨 Orbit Trails                                [ON/OFF] │
│ ├─ Length        [━━━━━━━━●━━━━━━━━━━] 100            │
│ ├─ Width         [━━●━━━━━━━━━━━━━━━━] 2px            │
│ ├─ Fade          [ON/OFF]                              │
│ └─ Color         [Inherit ▼] [Velocity] [Custom 🎨]   │
│                                                         │
│ 📊 Visualization                                        │
│ ├─ Energy Bars   [ON/OFF]                              │
│ ├─ Velocity Vec  [ON/OFF]                              │
│ └─ Force Vectors [ON/OFF]                              │
│                                                         │
│ 🎯 Presets                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Figure-8] [Binary★] [Chaos] [Lagrange] [Custom+]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 🦋 Butterfly Effect                            [DEMO]  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

### Physics Loop Integration

```typescript
// In animation loop (RockScene.tsx)
const updatePhysics = (deltaTime: number) => {
  if (!physicsConfig.gravityEnabled) return;

  const instances = [...cores, ...gels];

  // Calculate forces between all pairs
  for (let i = 0; i < instances.length; i++) {
    for (let j = i + 1; j < instances.length; j++) {
      const force = calculateGravity(instances[i], instances[j]);
      applyForce(instances[i], force);
      applyForce(instances[j], force.negate());
    }
  }

  // Update velocities and positions
  for (const instance of instances) {
    instance.velocity.add(instance.acceleration.multiplyScalar(deltaTime));
    instance.velocity.multiplyScalar(1 - physicsConfig.damping);
    instance.position.add(instance.velocity.multiplyScalar(deltaTime));
    instance.acceleration.set(0, 0, 0);

    // Update trail
    if (trailConfig.enabled) {
      addTrailPoint(instance.id, instance.position.clone());
    }
  }

  // Check boundaries
  applyBoundaries(instances);

  // Check collisions
  checkCollisions(instances);
};
```

### Performance Considerations

| Concern | Solution |
|---------|----------|
| N² force calculations | Spatial partitioning (future) |
| Trail memory | Ring buffer, max points |
| Trail rendering | Instanced line geometry |
| Many instances | LOD for distant objects |
| Mobile | Reduced trail length, simpler physics |

---

## Success Metrics

- [ ] 60 FPS with 5 cores + 5 gels + trails
- [ ] 30 FPS with 10 cores + 10 gels + trails
- [ ] Physics feels natural and responsive
- [ ] Trails are beautiful and performant
- [ ] Three-body chaos is mesmerizing
- [ ] UI is intuitive and complete

---

## Inspiration & References

- **Three-Body Problem:** Liu Cixin's novel, actual astrophysics
- **Figure-8 Orbit:** Discovered by Moore (1993), proven stable
- **Lagrange Points:** L1-L5 equilibrium points
- **Soft-Body Physics:** Verlet integration, spring-mass systems
- **Trail Rendering:** Particle systems, GPU lines

---

*Plan Created: 2025-12-19*
*Target Version: v5.0*
*Codename: "THREE-BODY"*
*Inspired by: The laws of the universe itself* 🌌
