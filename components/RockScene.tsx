import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { WebGPURenderer, MeshPhysicalNodeMaterial, TSL, PostProcessing } from 'three/webgpu';
// @ts-ignore
import { pass } from 'three/tsl';
// @ts-ignore
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
// @ts-ignore
import { rgbShift } from 'three/addons/tsl/display/RGBShiftNode.js';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// @ts-ignore
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// @ts-ignore
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import DebugPanel, {
  ShaderConfig,
  DEFAULT_CONFIG,
  MeshSource,
  CoreInstance,
  GelInstance,
  InstanceTransform,
  CoreConfig,
  GelConfig,
  migrateConfigToMultiInstance,
  getSelectedCore,
  getSelectedGel,
} from './DebugPanel';

// ============================================
// === SPRINT 2 SERVICES (v5.0.0-alpha.2) ===
// ============================================
import {
  TrailSystem,
  TrailConfig,
  DEFAULT_TRAIL_CONFIG,
  createTrailSystem,
  updateTrailGeometry,
  clearAllTrails,
} from '../services/trailService';
import {
  CollisionConfig,
  CollisionEvent,
  InstancePhysics,
  DEFAULT_COLLISION_CONFIG,
  processCollisions,
  createCollisionEffect,
} from '../services/collisionService';
import {
  VectorSystem,
  VectorConfig,
  DEFAULT_VECTOR_CONFIG,
  createVectorSystem,
  updateVelocityVector,
  updateForceVector,
  clearAllVectors,
  calculateTotalEnergy,
} from '../services/vectorVisualizationService';
import {
  PHYSICS_PRESETS,
  getPresetById,
  applyPreset,
  PhysicsPreset,
} from '../services/physicsPresets';

// ============================================
// === SPRINT 3 SERVICES (v6.0.0-alpha.1) ===
// ============================================
import {
  AudioAnalyzer,
  FrequencyBands,
  AudioMood,
  BeatInfo,
} from '../services/audioService';
import {
  GestureController,
  GestureAction,
  CameraControl,
} from '../services/gestureService';
import AudioPanel from './AudioPanel';
import GesturePanel from './GesturePanel';

const {
  positionLocal,
  normalLocal,
  normalWorld,
  cameraPosition,
  vec3,
  vec4,
  vec2,
  uv,
  uniform,
  float,
  mx_noise_float,
  mx_fractal_noise_float,
  mix,
  clamp,
  pow,
  dot,
  normalize,
  max,
  sin,
  cos,
  sub,
  mul,
  length,
  smoothstep,
  Fn,
} = TSL;

// ============================================
// === SCENE REFS FOR RUNTIME UPDATES ===
// ============================================

// Easing and interpolation utilities
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface CameraAnimationState {
  isAnimating: boolean;
  startDistance: number;
  targetDistance: number;
  startTargetY: number;
  targetTargetY: number;
  startFov: number;
  targetFov: number;
  startTime: number;
  duration: number;
}

// Per-instance uniforms for animation
interface InstanceUniforms {
  uTime: any;
  uPulseSpeed: any;
  uPulseIntensity: any;
  uNoiseScale: any;
  uNoiseIntensity: any;
  uCoreColorDeep: any;
  uCoreColorMid: any;
  uCoreColorGlow: any;
  uCoreColorHot: any;
  uEmissiveIntensity: any;
  uBreatheSpeed: any;
  uBreatheIntensity: any;
  uWobbleSpeed: any;
  uWobbleIntensity: any;
  uNoiseAnimSpeed: any;
}

// ============================================
// === PHYSICS SYSTEM (v5.0) ===
// ============================================

// Trail point for orbit visualization
interface TrailPoint {
  position: THREE.Vector3;
  time: number;
  velocity: number;
}

// Physics state for each instance
interface InstancePhysicsState {
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  trail: TrailPoint[];
}

// Physics configuration for animation loop
interface PhysicsState {
  instances: Map<string, InstancePhysicsState>;
  lastUpdateTime: number;
  trailGeometries: Map<string, THREE.BufferGeometry>;
  trailMeshes: Map<string, THREE.Line>;
}

// Collision effect for visualization
interface CollisionEffectState {
  position: THREE.Vector3;
  intensity: number;
  startTime: number;
  duration: number;
}

interface SceneRefs {
  // Legacy single-instance refs (for backwards compatibility)
  coreMesh: THREE.Mesh | null;
  gelMesh: THREE.Mesh | null;
  coreMaterial: any;
  gelMaterial: any;
  coreGeometry: THREE.BufferGeometry | null;
  gelGeometry: THREE.BufferGeometry | null;

  // Multi-instance Maps (v4.0)
  coreMeshes: Map<string, THREE.Mesh>;
  gelMeshes: Map<string, THREE.Mesh>;
  coreMaterials: Map<string, any>;
  gelMaterials: Map<string, any>;
  coreGeometries: Map<string, THREE.BufferGeometry>;
  gelGeometries: Map<string, THREE.BufferGeometry>;
  instanceUniforms: Map<string, InstanceUniforms>;

  // Lights
  keyLight: THREE.DirectionalLight | null;
  fillLight: THREE.DirectionalLight | null;
  topLight: THREE.DirectionalLight | null;
  rimLight: THREE.DirectionalLight | null;
  rimLight2: THREE.DirectionalLight | null;
  halCoreLight: THREE.PointLight | null;
  halBackLight: THREE.PointLight | null;
  redRimLight: THREE.PointLight | null;
  ambientLight: THREE.AmbientLight | null;

  // Scene components
  controls: OrbitControls | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: any;

  // Environment
  envMap: THREE.Texture | null;

  // Camera animation
  cameraAnimation: CameraAnimationState | null;
  panelOpenDistance: number;
  panelClosedDistance: number;

  // Post-processing
  postProcessing: any;
  bloomPass: any;
  rgbShiftPass: any;
  vignettePass: any;

  // Legacy single-instance uniforms (will sync with primary instance)
  uniforms: InstanceUniforms | null;

  // Animation state
  animationConfig: {
    meshRotationSpeed: number;
    syncBreathing: boolean;
    dynamicLighting: boolean;
    orbitSpeed: number;
  };

  // Current lighting config (for animation loop access)
  lightingConfig: {
    halCoreLightEnabled: boolean;
    halCoreLightIntensity: number;
    halBackLightEnabled: boolean;
    halBackLightIntensity: number;
    redRimLightEnabled: boolean;
    redRimLightIntensity: number;
  };

  // Physics system (v5.0)
  physicsState: PhysicsState;

  // Sprint 2 Systems (v5.0.0-alpha.2)
  trailSystem: TrailSystem;
  vectorSystem: VectorSystem;
  collisionConfig: CollisionConfig;
  trailConfig: TrailConfig;
  vectorConfig: VectorConfig;
  collisionEffects: CollisionEffectState[];
  energyStats: {
    kinetic: number;
    potential: number;
    total: number;
  };

  // Sprint 3: Audio Reactivity (v6.0.0-alpha.1)
  audioAnalyzer: AudioAnalyzer | null;
  audioReactive: {
    enabled: boolean;
    bands: FrequencyBands | null;
    mood: AudioMood | null;
    beat: BeatInfo | null;
    sensitivity: {
      scale: number;
      glow: number;
      rotation: number;
      trails: number;
    };
    // Smoothed values for organic motion
    smoothedScale: number;
    smoothedGlow: number;
    smoothedRotation: number;
    lastBeatTime: number;
    beatPulse: number; // 0-1, decays after beat
  };

  // Sprint 3: Gesture Control (v6.0.0-alpha.1)
  gestureController: GestureController | null;
  gestureControl: {
    enabled: boolean;
    cameraControl: CameraControl;
    lastAction: GestureAction;
    // Smoothed camera values
    smoothedPanX: number;
    smoothedPanY: number;
    smoothedZoom: number;
    smoothedRotation: number;
    // Grab state
    isGrabbing: boolean;
    grabbedBodyId: string | null;
  };
}

const RockScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [config, setConfig] = useState<ShaderConfig>(DEFAULT_CONFIG);
  const configRef = useRef<ShaderConfig>(config); // Ref for animation loop access
  const gltfLoaderRef = useRef<any>(null);
  const rgbeLoaderRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const sceneRefs = useRef<SceneRefs>({
    // Legacy single-instance refs
    coreMesh: null,
    gelMesh: null,
    coreMaterial: null,
    gelMaterial: null,
    coreGeometry: null,
    gelGeometry: null,

    // Multi-instance Maps (v4.0)
    coreMeshes: new Map(),
    gelMeshes: new Map(),
    coreMaterials: new Map(),
    gelMaterials: new Map(),
    coreGeometries: new Map(),
    gelGeometries: new Map(),
    instanceUniforms: new Map(),

    // Lights
    keyLight: null,
    fillLight: null,
    topLight: null,
    rimLight: null,
    rimLight2: null,
    halCoreLight: null,
    halBackLight: null,
    redRimLight: null,
    ambientLight: null,

    // Scene components
    controls: null,
    scene: null,
    camera: null,
    renderer: null,

    // Environment
    envMap: null,

    // Camera animation
    cameraAnimation: null,
    panelOpenDistance: DEFAULT_CONFIG.camera.distance + 3,
    panelClosedDistance: DEFAULT_CONFIG.camera.distance,

    // Post-processing
    postProcessing: null,
    bloomPass: null,
    rgbShiftPass: null,
    vignettePass: null,

    // Legacy uniforms
    uniforms: null,

    animationConfig: {
      meshRotationSpeed: DEFAULT_CONFIG.animation.meshRotationSpeed,
      syncBreathing: DEFAULT_CONFIG.animation.syncBreathing,
      dynamicLighting: DEFAULT_CONFIG.lighting.dynamicLighting,
      orbitSpeed: DEFAULT_CONFIG.lighting.orbitSpeed,
    },

    // Lighting config for animation loop
    lightingConfig: {
      halCoreLightEnabled: DEFAULT_CONFIG.lighting.halCoreLightEnabled,
      halCoreLightIntensity: DEFAULT_CONFIG.lighting.halCoreLightIntensity,
      halBackLightEnabled: DEFAULT_CONFIG.lighting.halBackLightEnabled,
      halBackLightIntensity: DEFAULT_CONFIG.lighting.halBackLightIntensity,
      redRimLightEnabled: DEFAULT_CONFIG.lighting.redRimLightEnabled,
      redRimLightIntensity: DEFAULT_CONFIG.lighting.redRimLightIntensity,
    },

    // Physics system (v5.0)
    physicsState: {
      instances: new Map(),
      lastUpdateTime: 0,
      trailGeometries: new Map(),
      trailMeshes: new Map(),
    },

    // Sprint 2 Systems (v5.0.0-alpha.2)
    trailSystem: createTrailSystem(),
    vectorSystem: createVectorSystem(),
    collisionConfig: { ...DEFAULT_COLLISION_CONFIG },
    trailConfig: { ...DEFAULT_TRAIL_CONFIG },
    vectorConfig: { ...DEFAULT_VECTOR_CONFIG },
    collisionEffects: [],
    energyStats: { kinetic: 0, potential: 0, total: 0 },

    // Sprint 3: Audio Reactivity (v6.0.0-alpha.1)
    audioAnalyzer: null,
    audioReactive: {
      enabled: false,
      bands: null,
      mood: null,
      beat: null,
      sensitivity: {
        scale: 1.5,
        glow: 2.0,
        rotation: 1.0,
        trails: 1.8,
      },
      smoothedScale: 1.0,
      smoothedGlow: 0.0,
      smoothedRotation: 0.0,
      lastBeatTime: 0,
      beatPulse: 0,
    },

    // Sprint 3: Gesture Control (v6.0.0-alpha.1)
    gestureController: null,
    gestureControl: {
      enabled: false,
      cameraControl: { panX: 0, panY: 0, zoom: 1, rotationY: 0, scale: 1 },
      lastAction: 'none',
      smoothedPanX: 0,
      smoothedPanY: 0,
      smoothedZoom: 1,
      smoothedRotation: 0,
      isGrabbing: false,
      grabbedBodyId: null,
    },
  });

  // Update scene when config changes
  const updateSceneFromConfig = useCallback((newConfig: ShaderConfig) => {
    const refs = sceneRefs.current;

    // Update camera
    if (refs.camera) {
      refs.camera.fov = newConfig.camera.fov;
      refs.camera.updateProjectionMatrix();
    }

    // Update controls
    if (refs.controls) {
      refs.controls.autoRotate = newConfig.animation.autoRotate;
      refs.controls.autoRotateSpeed = newConfig.animation.autoRotateSpeed;
      refs.controls.minDistance = newConfig.camera.minDistance;
      refs.controls.maxDistance = newConfig.camera.maxDistance;
      refs.controls.dampingFactor = newConfig.camera.dampingFactor;
      refs.controls.enabled = !newConfig.camera.locked; // Lock camera toggle
      refs.controls.target.y = newConfig.camera.targetY; // Orbit target Y position
    }

    // Update camera distance (smooth transition via damping)
    if (refs.camera && refs.controls) {
      const currentDistance = refs.camera.position.length();
      const targetDistance = newConfig.camera.distance;
      // Only update if difference is significant (> 0.1) to avoid jitter from slider
      if (Math.abs(currentDistance - targetDistance) > 0.1) {
        const direction = refs.camera.position.clone().normalize();
        refs.camera.position.copy(direction.multiplyScalar(targetDistance));
      }
    }

    // Update renderer (tone mapping)
    if (refs.renderer) {
      refs.renderer.toneMappingExposure = newConfig.postProcess.exposure;
      // Tone mapping type mapping
      const toneMappingMap: Record<string, number> = {
        'aces': THREE.ACESFilmicToneMapping,
        'reinhard': THREE.ReinhardToneMapping,
        'linear': THREE.LinearToneMapping,
        'cineon': THREE.CineonToneMapping,
      };
      refs.renderer.toneMapping = toneMappingMap[newConfig.postProcess.toneMapping] || THREE.ACESFilmicToneMapping;
    }

    // Update post-processing effects
    if (refs.bloomPass) {
      refs.bloomPass.strength.value = newConfig.postProcess.bloomEnabled ? newConfig.postProcess.bloomIntensity : 0;
      refs.bloomPass.radius.value = newConfig.postProcess.bloomRadius;
      refs.bloomPass.threshold.value = newConfig.postProcess.bloomThreshold;
    }
    if (refs.rgbShiftPass) {
      refs.rgbShiftPass.amount.value = newConfig.postProcess.chromaticAberrationEnabled
        ? newConfig.postProcess.chromaticAberrationAmount
        : 0;
    }
    if (refs.vignettePass) {
      refs.vignettePass.intensity.value = newConfig.postProcess.vignetteEnabled
        ? newConfig.postProcess.vignetteIntensity
        : 0;
    }

    // Update lighting (v3.7.2 - all lights now have on/off toggles)
    if (refs.keyLight) {
      refs.keyLight.intensity = newConfig.lighting.keyLightEnabled ? newConfig.lighting.keyLightIntensity : 0;
      refs.keyLight.color.setRGB(...newConfig.lighting.keyLightColor);
      refs.keyLight.position.set(newConfig.lighting.keyLightX, newConfig.lighting.keyLightY, newConfig.lighting.keyLightZ);
    }
    if (refs.fillLight) {
      refs.fillLight.intensity = newConfig.lighting.fillLightEnabled ? newConfig.lighting.fillLightIntensity : 0;
      refs.fillLight.color.setRGB(...newConfig.lighting.fillLightColor);
    }
    if (refs.topLight) {
      refs.topLight.intensity = newConfig.lighting.topLightEnabled ? newConfig.lighting.topLightIntensity : 0;
    }
    if (refs.rimLight) {
      refs.rimLight.intensity = newConfig.lighting.rimLightEnabled ? newConfig.lighting.rimLightIntensity : 0;
    }
    if (refs.rimLight2) {
      refs.rimLight2.intensity = newConfig.lighting.rimLight2Enabled ? newConfig.lighting.rimLight2Intensity : 0;
    }
    if (refs.halCoreLight) {
      refs.halCoreLight.intensity = newConfig.lighting.halCoreLightEnabled ? newConfig.lighting.halCoreLightIntensity : 0;
      refs.halCoreLight.color.setRGB(...newConfig.lighting.halCoreLightColor);
      refs.halCoreLight.distance = newConfig.lighting.halCoreLightDistance;
    }
    if (refs.halBackLight) {
      refs.halBackLight.intensity = newConfig.lighting.halBackLightEnabled ? newConfig.lighting.halBackLightIntensity : 0;
    }
    if (refs.redRimLight) {
      refs.redRimLight.intensity = newConfig.lighting.redRimLightEnabled ? newConfig.lighting.redRimLightIntensity : 0;
    }
    if (refs.ambientLight) {
      refs.ambientLight.intensity = newConfig.lighting.ambientEnabled ? newConfig.lighting.ambientIntensity : 0;
    }

    // Update lightingConfig for animation loop access (v4.0)
    refs.lightingConfig = {
      halCoreLightEnabled: newConfig.lighting.halCoreLightEnabled,
      halCoreLightIntensity: newConfig.lighting.halCoreLightIntensity,
      halBackLightEnabled: newConfig.lighting.halBackLightEnabled,
      halBackLightIntensity: newConfig.lighting.halBackLightIntensity,
      redRimLightEnabled: newConfig.lighting.redRimLightEnabled,
      redRimLightIntensity: newConfig.lighting.redRimLightIntensity,
    };

    // Update gel material properties
    if (refs.gelMaterial) {
      refs.gelMaterial.opacity = newConfig.gel.opacity;
      refs.gelMaterial.transmission = newConfig.gel.transmission;
      refs.gelMaterial.ior = newConfig.gel.ior;
      refs.gelMaterial.thickness = newConfig.gel.thickness;
      refs.gelMaterial.clearcoat = newConfig.gel.clearcoat;
      refs.gelMaterial.clearcoatRoughness = newConfig.gel.clearcoatRoughness;
      refs.gelMaterial.envMapIntensity = newConfig.gel.envMapIntensity;
      refs.gelMaterial.specularIntensity = newConfig.gel.specularIntensity;
      refs.gelMaterial.attenuationColor.setRGB(...newConfig.gel.attenuationColor);
      refs.gelMaterial.attenuationDistance = newConfig.gel.attenuationDistance;
      refs.gelMaterial.wireframe = newConfig.shape.wireframe;
    }

    // Update core material properties
    if (refs.coreMaterial) {
      refs.coreMaterial.clearcoat = newConfig.core.clearcoat;
      refs.coreMaterial.wireframe = newConfig.shape.wireframe;
    }

    // Update visibility
    if (refs.coreMesh) {
      refs.coreMesh.visible = newConfig.shape.coreVisible;
    }
    if (refs.gelMesh) {
      refs.gelMesh.visible = newConfig.shape.gelVisible;
    }

    // Update uniforms for shader parameters
    if (refs.uniforms) {
      refs.uniforms.uPulseSpeed.value = newConfig.core.pulseSpeed;
      refs.uniforms.uPulseIntensity.value = newConfig.core.pulseIntensity;
      refs.uniforms.uNoiseScale.value = newConfig.core.noiseScale;
      refs.uniforms.uNoiseIntensity.value = newConfig.core.noiseIntensity;
      refs.uniforms.uEmissiveIntensity.value = newConfig.core.emissiveIntensity;
      refs.uniforms.uCoreColorDeep.value.set(...newConfig.core.colorDeep);
      refs.uniforms.uCoreColorMid.value.set(...newConfig.core.colorMid);
      refs.uniforms.uCoreColorGlow.value.set(...newConfig.core.colorGlow);
      refs.uniforms.uCoreColorHot.value.set(...newConfig.core.colorHot);
      // Animation uniforms
      refs.uniforms.uBreatheSpeed.value = newConfig.animation.breatheSpeed;
      refs.uniforms.uBreatheIntensity.value = newConfig.animation.breatheIntensity;
      refs.uniforms.uWobbleSpeed.value = newConfig.animation.wobbleSpeed;
      refs.uniforms.uWobbleIntensity.value = newConfig.animation.wobbleIntensity;
      refs.uniforms.uNoiseAnimSpeed.value = newConfig.animation.noiseAnimSpeed;
    }

    // Update animation config for the render loop
    refs.animationConfig = {
      meshRotationSpeed: newConfig.animation.meshRotationSpeed,
      syncBreathing: newConfig.animation.syncBreathing,
      dynamicLighting: newConfig.lighting.dynamicLighting,
      orbitSpeed: newConfig.lighting.orbitSpeed,
    };

    // Update environment settings
    if (refs.scene && refs.envMap) {
      // Update environment intensity on materials
      if (refs.gelMaterial) {
        refs.gelMaterial.envMapIntensity = newConfig.environment.enabled
          ? newConfig.environment.intensity
          : 0;
        refs.gelMaterial.needsUpdate = true;
      }

      // Update background visibility
      if (newConfig.environment.backgroundVisible && newConfig.environment.enabled) {
        refs.scene.background = refs.envMap;
        refs.scene.backgroundBlurriness = newConfig.environment.backgroundBlur;
      } else {
        refs.scene.background = new THREE.Color('#000000');
      }
    }

    // Clear environment if disabled
    if (!newConfig.environment.enabled && refs.scene) {
      refs.scene.environment = null;
      refs.scene.background = new THREE.Color('#000000');
      if (refs.gelMaterial) {
        refs.gelMaterial.envMap = null;
        refs.gelMaterial.needsUpdate = true;
      }
      if (refs.coreMaterial) {
        refs.coreMaterial.envMap = null;
        refs.coreMaterial.needsUpdate = true;
      }
      refs.envMap = null;
    }

    // ============================================
    // === MULTI-INSTANCE TRANSFORMS (v4.0) ===
    // ============================================

    // Create new core meshes if they don't exist (v4.0 - mesh cloning)
    console.log('[v4.0] updateSceneFromConfig - cores:', newConfig.cores.length, 'gels:', newConfig.gels.length);
    console.log('[v4.0] refs.coreMesh:', !!refs.coreMesh, 'refs.scene:', !!refs.scene);
    console.log('[v4.0] coreMeshes Map size:', refs.coreMeshes.size);

    newConfig.cores.forEach((coreInstance) => {
      const hasInMap = refs.coreMeshes.has(coreInstance.id);
      console.log(`[v4.0] Core ${coreInstance.id}: inMap=${hasInMap}, coreMesh=${!!refs.coreMesh}, scene=${!!refs.scene}`);

      if (!hasInMap && refs.coreMesh && refs.scene) {
        // Clone the primary core mesh for new instances
        const newMesh = refs.coreMesh.clone();
        newMesh.material = refs.coreMaterial; // Share material for performance
        refs.scene.add(newMesh);
        refs.coreMeshes.set(coreInstance.id, newMesh);
        console.log(`[v4.0] ✅ Created new core mesh: ${coreInstance.name} (${coreInstance.id})`);
      }
    });

    // Create new gel meshes if they don't exist
    newConfig.gels.forEach((gelInstance) => {
      const hasInMap = refs.gelMeshes.has(gelInstance.id);
      console.log(`[v4.0] Gel ${gelInstance.id}: inMap=${hasInMap}, gelMesh=${!!refs.gelMesh}, scene=${!!refs.scene}`);

      if (!hasInMap && refs.gelMesh && refs.scene) {
        // Clone the primary gel mesh for new instances
        const newMesh = refs.gelMesh.clone();
        newMesh.material = refs.gelMaterial; // Share material for performance
        refs.scene.add(newMesh);
        refs.gelMeshes.set(gelInstance.id, newMesh);
        console.log(`[v4.0] ✅ Created new gel mesh: ${gelInstance.name} (${gelInstance.id})`);
      }
    });

    // Remove meshes for deleted instances
    refs.coreMeshes.forEach((mesh, id) => {
      if (!newConfig.cores.find(c => c.id === id)) {
        refs.scene?.remove(mesh);
        mesh.geometry?.dispose();
        refs.coreMeshes.delete(id);
        console.log(`[v4.0] Removed core mesh: ${id}`);
      }
    });

    refs.gelMeshes.forEach((mesh, id) => {
      if (!newConfig.gels.find(g => g.id === id)) {
        refs.scene?.remove(mesh);
        mesh.geometry?.dispose();
        refs.gelMeshes.delete(id);
        console.log(`[v4.0] Removed gel mesh: ${id}`);
      }
    });

    // Update core instance transforms and visibility
    newConfig.cores.forEach((coreInstance) => {
      const mesh = refs.coreMeshes.get(coreInstance.id);
      if (mesh) {
        // Apply transform
        mesh.position.set(...coreInstance.transform.position);
        mesh.rotation.set(...coreInstance.transform.rotation);
        // Apply scale immediately (animation loop will use baseScale for breathing)
        const scale = coreInstance.transform.scale[0];
        mesh.scale.setScalar(scale);
        (mesh.userData as any).baseScale = scale;

        // Apply visibility (combine instance enabled with global coreVisible)
        mesh.visible = coreInstance.enabled && newConfig.shape.coreVisible;
        console.log(`[v4.0] Core ${coreInstance.id}: pos=${mesh.position.toArray()}, scale=${scale}, visible=${mesh.visible}`);
      } else {
        console.log(`[v4.0] Core ${coreInstance.id}: mesh NOT FOUND in Map!`);
      }
    });

    // Update gel instance transforms and visibility
    newConfig.gels.forEach((gelInstance) => {
      const mesh = refs.gelMeshes.get(gelInstance.id);
      if (mesh) {
        // If gel has a parent core, offset from parent position
        let basePosition: [number, number, number] = [...gelInstance.transform.position];

        if (gelInstance.parentCoreId) {
          const parentCore = newConfig.cores.find(c => c.id === gelInstance.parentCoreId);
          if (parentCore) {
            basePosition = [
              parentCore.transform.position[0] + gelInstance.transform.position[0],
              parentCore.transform.position[1] + gelInstance.transform.position[1],
              parentCore.transform.position[2] + gelInstance.transform.position[2],
            ];
          }
        }

        // Apply transform
        mesh.position.set(...basePosition);
        mesh.rotation.set(...gelInstance.transform.rotation);
        // Apply scale immediately (animation loop will use baseScale for breathing)
        const scale = gelInstance.transform.scale[0];
        mesh.scale.setScalar(scale);
        (mesh.userData as any).baseScale = scale;

        // Apply visibility (combine instance enabled with global gelVisible)
        mesh.visible = gelInstance.enabled && newConfig.shape.gelVisible;
        console.log(`[v4.0] Gel ${gelInstance.id}: pos=${mesh.position.toArray()}, scale=${scale}, visible=${mesh.visible}`);
      } else {
        console.log(`[v4.0] Gel ${gelInstance.id}: mesh NOT FOUND in Map!`);
      }
    });

    // Sync legacy refs with primary instance for backwards compatibility
    if (newConfig.cores.length > 0) {
      const primaryCore = newConfig.cores[0];
      if (refs.coreMesh) {
        refs.coreMesh.position.set(...primaryCore.transform.position);
        (refs.coreMesh.userData as any).baseScale = primaryCore.transform.scale[0];
        refs.coreMesh.visible = primaryCore.enabled && newConfig.shape.coreVisible;
      }
    }

    if (newConfig.gels.length > 0) {
      const primaryGel = newConfig.gels[0];
      let gelPos: [number, number, number] = [...primaryGel.transform.position];

      if (primaryGel.parentCoreId && newConfig.cores.length > 0) {
        const parentCore = newConfig.cores.find(c => c.id === primaryGel.parentCoreId);
        if (parentCore) {
          gelPos = [
            parentCore.transform.position[0] + primaryGel.transform.position[0],
            parentCore.transform.position[1] + primaryGel.transform.position[1],
            parentCore.transform.position[2] + primaryGel.transform.position[2],
          ];
        }
      }

      if (refs.gelMesh) {
        refs.gelMesh.position.set(...gelPos);
        (refs.gelMesh.userData as any).baseScale = primaryGel.transform.scale[0];
        refs.gelMesh.visible = primaryGel.enabled && newConfig.shape.gelVisible;
      }
    }
  }, []);

  const handleConfigChange = useCallback((newConfig: ShaderConfig) => {
    setConfig(newConfig);
    configRef.current = newConfig; // Update ref for animation loop
    updateSceneFromConfig(newConfig);
  }, [updateSceneFromConfig]);

  // Handle panel toggle - no camera animation needed since panel is on the right side
  const handlePanelToggle = useCallback((isOpen: boolean) => {
    // Panel is now on the right side, no camera adjustment needed
    console.log(`[Panel] ${isOpen ? 'opened' : 'closed'}`);
  }, []);

  // Handle audio analyzer connection (v6.0.0)
  const handleAudioAnalyzer = useCallback((analyzer: AudioAnalyzer | null) => {
    const refs = sceneRefs.current;
    refs.audioAnalyzer = analyzer;
    refs.audioReactive.enabled = analyzer !== null;
    console.log(`[Audio] Analyzer ${analyzer ? 'connected' : 'disconnected'}`);
  }, []);

  // Handle gesture controller connection (v6.0.0)
  const handleGestureController = useCallback((controller: GestureController | null) => {
    const refs = sceneRefs.current;
    refs.gestureController = controller;
    refs.gestureControl.enabled = controller !== null;
    console.log(`[Gesture] Controller ${controller ? 'connected' : 'disconnected'}`);
  }, []);

  // Handle camera control from gestures (v6.0.0)
  const handleCameraControl = useCallback((control: CameraControl) => {
    const refs = sceneRefs.current;
    refs.gestureControl.cameraControl = control;
  }, []);

  // Handle gesture actions (v6.0.0)
  const handleGestureAction = useCallback((action: GestureAction) => {
    const refs = sceneRefs.current;
    refs.gestureControl.lastAction = action;

    // Execute actions
    switch (action) {
      case 'pause':
        // Pause physics
        if (configRef.current.physics.enabled) {
          setConfig(prev => ({
            ...prev,
            physics: { ...prev.physics, enabled: false }
          }));
        }
        break;
      case 'resume':
        // Resume physics
        if (!configRef.current.physics.enabled) {
          setConfig(prev => ({
            ...prev,
            physics: { ...prev.physics, enabled: true }
          }));
        }
        break;
      case 'increaseGravity':
        setConfig(prev => ({
          ...prev,
          physics: {
            ...prev.physics,
            gravityStrength: Math.min(prev.physics.gravityStrength + 0.1, 2.0)
          }
        }));
        break;
      case 'decreaseGravity':
        setConfig(prev => ({
          ...prev,
          physics: {
            ...prev.physics,
            gravityStrength: Math.max(prev.physics.gravityStrength - 0.1, 0.1)
          }
        }));
        break;
      case 'toggleTrails':
        setConfig(prev => ({
          ...prev,
          physics: { ...prev.physics, trailsEnabled: !prev.physics.trailsEnabled }
        }));
        break;
      case 'nextPreset':
        // Cycle through physics presets
        const presets = PHYSICS_PRESETS;
        const currentIndex = presets.findIndex(p => p.id === configRef.current.physics.preset);
        const nextIndex = (currentIndex + 1) % presets.length;
        const nextPreset = presets[nextIndex];
        console.log(`[Gesture] Switching to preset: ${nextPreset.name}`);
        // Apply preset would go here
        break;
      default:
        break;
    }

    console.log(`[Gesture] Action: ${action}`);
  }, []);

  // State for panel visibility
  const [isAudioPanelCollapsed, setIsAudioPanelCollapsed] = useState(false);
  const [isGesturePanelCollapsed, setIsGesturePanelCollapsed] = useState(false);

  // Handle GLTF mesh import
  const handleMeshImport = useCallback((file: File) => {
    if (!gltfLoaderRef.current) {
      gltfLoaderRef.current = new GLTFLoader();
    }

    const url = URL.createObjectURL(file);
    const loader = gltfLoaderRef.current;

    loader.load(
      url,
      (gltf: any) => {
        console.log('[GLTF] Loaded:', file.name, gltf);

        // Find the first mesh in the loaded scene
        let importedGeometry: THREE.BufferGeometry | null = null;

        gltf.scene.traverse((child: any) => {
          if (child.isMesh && !importedGeometry) {
            importedGeometry = child.geometry.clone();
            // Center and normalize the geometry
            importedGeometry.computeBoundingBox();
            const bbox = importedGeometry.boundingBox;
            if (bbox) {
              const center = new THREE.Vector3();
              bbox.getCenter(center);
              importedGeometry.translate(-center.x, -center.y, -center.z);

              // Normalize scale to fit roughly in a unit sphere
              const size = new THREE.Vector3();
              bbox.getSize(size);
              const maxDim = Math.max(size.x, size.y, size.z);
              if (maxDim > 0) {
                const scaleFactor = 1.0 / maxDim;
                importedGeometry.scale(scaleFactor, scaleFactor, scaleFactor);
              }
            }
            console.log('[GLTF] Extracted geometry from:', child.name || 'unnamed mesh');
          }
        });

        if (importedGeometry && sceneRefs.current.coreMesh && sceneRefs.current.gelMesh) {
          // Apply the imported geometry to both core and gel meshes
          const refs = sceneRefs.current;

          // Dispose old geometries
          refs.coreGeometry?.dispose();
          refs.gelGeometry?.dispose();

          // Create scaled versions for core and gel
          const coreGeo = importedGeometry.clone();
          coreGeo.scale(config.core.radius * 2, config.core.radius * 2, config.core.radius * 2);
          refs.coreMesh.geometry = coreGeo;
          refs.coreGeometry = coreGeo;

          const gelGeo = importedGeometry.clone();
          gelGeo.scale(config.gel.radius, config.gel.radius, config.gel.radius);
          refs.gelMesh.geometry = gelGeo;
          refs.gelGeometry = gelGeo;

          console.log('[GLTF] Applied custom geometry to scene meshes');
        }

        URL.revokeObjectURL(url);
      },
      (progress: any) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log('[GLTF] Loading:', percent.toFixed(0) + '%');
      },
      (error: any) => {
        console.error('[GLTF] Error loading:', error);
        URL.revokeObjectURL(url);
      }
    );
  }, [config.core.radius, config.gel.radius]);

  // Handle HDR Environment Map import
  const handleEnvMapImport = useCallback((file: File) => {
    if (!rgbeLoaderRef.current) {
      rgbeLoaderRef.current = new RGBELoader();
    }

    const url = URL.createObjectURL(file);
    const loader = rgbeLoaderRef.current;

    loader.load(
      url,
      (texture: THREE.Texture) => {
        console.log('[HDR] Loaded:', file.name);

        texture.mapping = THREE.EquirectangularReflectionMapping;

        const refs = sceneRefs.current;
        if (refs.scene) {
          // Apply to scene environment (for reflections)
          refs.scene.environment = texture;
          refs.envMap = texture;

          // Apply to materials for PBR reflections
          if (refs.gelMaterial) {
            refs.gelMaterial.envMap = texture;
            refs.gelMaterial.envMapIntensity = config.environment.intensity;
            refs.gelMaterial.needsUpdate = true;
          }
          if (refs.coreMaterial) {
            refs.coreMaterial.envMap = texture;
            refs.coreMaterial.needsUpdate = true;
          }

          // Set as background if enabled
          if (config.environment.backgroundVisible) {
            refs.scene.background = texture;
            refs.scene.backgroundBlurriness = config.environment.backgroundBlur;
          }

          console.log('[HDR] Applied environment map to scene');
        }

        URL.revokeObjectURL(url);
      },
      (progress: any) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log('[HDR] Loading:', percent.toFixed(0) + '%');
      },
      (error: any) => {
        console.error('[HDR] Error loading:', error);
        URL.revokeObjectURL(url);
      }
    );
  }, [config.environment.intensity, config.environment.backgroundVisible, config.environment.backgroundBlur]);

  useEffect(() => {
    if (!mountRef.current) return;

    let frameId: number;
    let renderer: any;
    let isDisposed = false;

    const initScene = async () => {
      if (!mountRef.current || isDisposed) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const camera = new THREE.PerspectiveCamera(config.camera.fov, width / height, 0.1, 100);
      camera.position.set(0, 0.5, config.camera.distance);
      sceneRefs.current.camera = camera;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#000000');
      sceneRefs.current.scene = scene;

      try {
        renderer = new WebGPURenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Apply post-processing settings from config
        const toneMappingMap: Record<string, number> = {
          'aces': THREE.ACESFilmicToneMapping,
          'reinhard': THREE.ReinhardToneMapping,
          'linear': THREE.LinearToneMapping,
          'cineon': THREE.CineonToneMapping,
        };
        renderer.toneMapping = toneMappingMap[config.postProcess.toneMapping] || THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = config.postProcess.exposure;

        await renderer.init();

        if (isDisposed || !mountRef.current) return;
        mountRef.current.appendChild(renderer.domElement);
        sceneRefs.current.renderer = renderer;
        rendererRef.current = renderer;
      } catch (e) {
        console.error("Failed to initialize WebGPURenderer", e);
        return;
      }

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = config.camera.dampingFactor;
      controls.autoRotate = config.animation.autoRotate;
      controls.autoRotateSpeed = config.animation.autoRotateSpeed;
      controls.enableZoom = true;
      controls.minDistance = config.camera.minDistance;
      controls.maxDistance = config.camera.maxDistance;
      sceneRefs.current.controls = controls;

      // ============================================
      // === CONFIGURABLE UNIFORMS ===
      // ============================================

      const uTime = uniform(0);
      const uPulseSpeed = uniform(config.core.pulseSpeed);
      const uPulseIntensity = uniform(config.core.pulseIntensity);
      const uNoiseScale = uniform(config.core.noiseScale);
      const uNoiseIntensity = uniform(config.core.noiseIntensity);
      const uEmissiveIntensity = uniform(config.core.emissiveIntensity);
      const uCoreColorDeep = uniform(new THREE.Color(...config.core.colorDeep));
      const uCoreColorMid = uniform(new THREE.Color(...config.core.colorMid));
      const uCoreColorGlow = uniform(new THREE.Color(...config.core.colorGlow));
      const uCoreColorHot = uniform(new THREE.Color(...config.core.colorHot));

      // Animation uniforms
      const uBreatheSpeed = uniform(config.animation.breatheSpeed);
      const uBreatheIntensity = uniform(config.animation.breatheIntensity);
      const uWobbleSpeed = uniform(config.animation.wobbleSpeed);
      const uWobbleIntensity = uniform(config.animation.wobbleIntensity);
      const uNoiseAnimSpeed = uniform(config.animation.noiseAnimSpeed);

      sceneRefs.current.uniforms = {
        uTime,
        uPulseSpeed,
        uPulseIntensity,
        uNoiseScale,
        uNoiseIntensity,
        uCoreColorDeep,
        uCoreColorMid,
        uCoreColorGlow,
        uCoreColorHot,
        uEmissiveIntensity,
        uBreatheSpeed,
        uBreatheIntensity,
        uWobbleSpeed,
        uWobbleIntensity,
        uNoiseAnimSpeed,
      };

      // ============================================
      // === INNER CORE ===
      // ============================================

      const coreGeometry = new THREE.IcosahedronGeometry(config.core.radius, config.core.subdivision);
      sceneRefs.current.coreGeometry = coreGeometry;

      // Organic flowing animation
      const coreAnimPos = positionLocal.add(
        vec3(
          sin(uTime.mul(0.3)).mul(0.02),
          cos(uTime.mul(0.25)).mul(0.015),
          sin(uTime.mul(0.35)).mul(0.02)
        )
      );

      // Noise displacement using configurable uniforms
      const coreNoise1 = mx_fractal_noise_float(
        coreAnimPos.mul(uNoiseScale).add(vec3(uTime.mul(uNoiseAnimSpeed), 0, 0)),
        float(3),
        float(2.0),
        float(0.5)
      );
      const coreNoise2 = mx_noise_float(
        coreAnimPos.mul(uNoiseScale.mul(2)).add(vec3(0, uTime.mul(uNoiseAnimSpeed.mul(0.8)), uTime.mul(uNoiseAnimSpeed.mul(0.67))))
      );

      // Use configurable breathing parameters
      const breathe = sin(uTime.mul(uBreatheSpeed)).mul(uBreatheIntensity.mul(1.5)).add(1.0);
      const coreDisplacement = coreNoise1.mul(uNoiseIntensity).add(coreNoise2.mul(uNoiseIntensity.mul(0.4))).mul(breathe);
      const coreFinalPosition = positionLocal.add(normalLocal.mul(coreDisplacement));

      // View calculations
      const coreViewDir = normalize(cameraPosition.sub(positionLocal));
      const coreNdotV = max(dot(normalLocal, coreViewDir), float(0.001));
      const coreFresnel = pow(float(1).sub(coreNdotV), float(2.5));
      const coreDepth = pow(coreNdotV, float(1.5));

      // HAL pulse
      const halPulse = sin(uTime.mul(uPulseSpeed)).mul(uPulseIntensity).add(float(1).sub(uPulseIntensity.mul(0.5)));
      const halIntensity = halPulse.mul(0.4).add(0.6);

      // HAL gradients with configurable colors
      const halCenter = pow(coreNdotV, float(2.0));

      const coreColorDeepVec = vec3(uCoreColorDeep);
      const coreColorMidVec = vec3(uCoreColorMid);
      const coreColorGlowVec = vec3(uCoreColorGlow);
      const coreColorHotVec = vec3(uCoreColorHot);

      const halBase = mix(coreColorDeepVec, coreColorMidVec, coreDepth);
      const halMid = mix(halBase, coreColorGlowVec, halCenter.mul(halIntensity));
      const halBright = mix(halMid, coreColorGlowVec, pow(halCenter, float(1.5)).mul(halIntensity));
      const coreColor = mix(halBright, coreColorHotVec, pow(halCenter, float(3.0)).mul(halPulse).mul(0.6));

      // Emissive
      const coreEmissive = coreColorGlowVec.mul(halCenter.mul(uEmissiveIntensity).mul(halIntensity)).add(
        coreColorGlowVec.mul(pow(halCenter, float(2.0)).mul(halPulse).mul(0.8))
      );

      const coreMaterial = new MeshPhysicalNodeMaterial({
        colorNode: coreColor,
        emissiveNode: coreEmissive,
        roughnessNode: mix(float(config.core.roughness), float(config.core.roughness + 0.15), coreFresnel),
        metalnessNode: float(config.core.metalness),
        positionNode: coreFinalPosition,
        clearcoat: config.core.clearcoat,
        clearcoatRoughness: 0.05,
        sheen: 0.3,
        sheenRoughness: 0.2,
        sheenColor: new THREE.Color(...config.core.colorGlow),
      });
      sceneRefs.current.coreMaterial = coreMaterial;

      const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
      scene.add(coreMesh);
      sceneRefs.current.coreMesh = coreMesh;

      // Store in multi-instance Maps (v4.0)
      const primaryCoreId = config.cores[0]?.id || 'core-primary';
      sceneRefs.current.coreMeshes.set(primaryCoreId, coreMesh);
      sceneRefs.current.coreMaterials.set(primaryCoreId, coreMaterial);
      sceneRefs.current.coreGeometries.set(primaryCoreId, coreGeometry);

      // Store uniforms for this instance
      sceneRefs.current.instanceUniforms.set(primaryCoreId, {
        uTime,
        uPulseSpeed,
        uPulseIntensity,
        uNoiseScale,
        uNoiseIntensity,
        uCoreColorDeep,
        uCoreColorMid,
        uCoreColorGlow,
        uCoreColorHot,
        uEmissiveIntensity,
        uBreatheSpeed,
        uBreatheIntensity,
        uWobbleSpeed,
        uWobbleIntensity,
        uNoiseAnimSpeed,
      });

      // ============================================
      // === OUTER GEL SHELL ===
      // ============================================

      const gelGeometry = new THREE.IcosahedronGeometry(config.gel.radius, config.gel.subdivision);
      sceneRefs.current.gelGeometry = gelGeometry;

      const gelAnimPos = positionLocal.add(
        vec3(
          sin(uTime.mul(0.3).add(0.5)).mul(0.015),
          cos(uTime.mul(0.25).add(0.3)).mul(0.012),
          sin(uTime.mul(0.35).add(0.8)).mul(0.018)
        )
      );

      const gelNoise1 = mx_fractal_noise_float(
        gelAnimPos.mul(1.2).add(vec3(uTime.mul(uNoiseAnimSpeed.mul(0.67)), uTime.mul(uNoiseAnimSpeed.mul(0.53)), 0)),
        float(2),
        float(2.0),
        float(0.5)
      );
      const gelNoise2 = mx_noise_float(
        gelAnimPos.mul(2.5).add(vec3(0, 0, uTime.mul(uNoiseAnimSpeed)))
      );

      // Use configurable breathing parameters for gel
      const gelBreathe = sin(uTime.mul(uBreatheSpeed).add(0.2)).mul(uBreatheIntensity).add(1.0);
      const gelDisplacement = gelNoise1.mul(0.06).add(gelNoise2.mul(0.025)).mul(gelBreathe);
      const gelFinalPosition = positionLocal.add(normalLocal.mul(gelDisplacement));

      const gelViewDir = normalize(cameraPosition.sub(positionLocal));
      const gelNdotV = max(dot(normalLocal, gelViewDir), float(0.001));
      const gelFresnel = pow(float(1).sub(gelNdotV), float(3.0));
      const gelDepth = pow(gelNdotV, float(1.2));

      const gelClear = vec3(0.98, 0.98, 0.99);
      const gelTint = vec3(1.0, 0.95, 0.92);
      const gelEdge = vec3(1.0, 1.0, 1.0);

      const coreInfluence = pow(float(1).sub(gelNdotV), float(1.2));
      // Red Bleed - controllable (v3.7.2)
      const redBleedAmount = config.gel.redBleedEnabled ? config.gel.redBleedIntensity : 0;
      const redBleed = coreColorGlowVec.mul(coreInfluence.mul(redBleedAmount).mul(halIntensity));

      const gelBase = mix(gelClear, gelTint, gelDepth.mul(0.3));
      const gelWithEdge = mix(gelBase, gelEdge, pow(gelFresnel, float(2.5)));

      // Environment Reflection - controllable (v3.7.2)
      const envUp = clamp(normalWorld.y.mul(0.5).add(0.5), float(0), float(1));
      const envSide = clamp(normalWorld.x.abs().mul(0.5), float(0), float(1));

      const skyReflect = vec3(0.7, 0.8, 1.0);
      const groundReflect = vec3(0.15, 0.12, 0.1);
      const sideReflect = vec3(0.4, 0.35, 0.3);

      const envReflection = mix(groundReflect, skyReflect, envUp);
      const fullEnvReflect = mix(envReflection, sideReflect, envSide.mul(0.5));

      // Fresnel & Glare - fully controllable (v3.7.1 + v3.7.2 toggles)
      const fresnelReflect = pow(gelFresnel, float(config.gel.fresnelPower));
      const fresnelMult = config.gel.fresnelEnabled ? config.gel.fresnelIntensity : 0;
      const reflection = config.gel.envReflectionEnabled
        ? fullEnvReflect.mul(fresnelReflect.mul(fresnelMult))
        : vec3(0, 0, 0);
      const specularMult = config.gel.specularEnabled ? config.gel.specularMultiplier : 0;
      const specular = vec3(1.0, 1.0, 1.0).mul(pow(gelFresnel, float(config.gel.specularPower)).mul(specularMult));

      const finalGelColor = gelWithEdge.add(reflection).add(redBleed).add(specular);

      const gelMaterial = new MeshPhysicalNodeMaterial({
        colorNode: finalGelColor,
        roughnessNode: mix(float(config.gel.roughness), float(config.gel.roughness + 0.03), pow(gelFresnel, float(3.0))),
        metalnessNode: float(0.05),
        positionNode: gelFinalPosition,
        transparent: true,
        opacity: config.gel.opacity,
        transmission: config.gel.transmission,
        thickness: config.gel.thickness,
        ior: config.gel.ior,
        clearcoat: config.gel.clearcoat,
        clearcoatRoughness: config.gel.clearcoatRoughness,
        sheen: config.gel.sheenEnabled ? 0.15 : 0,
        sheenRoughness: 0.1,
        sheenColor: new THREE.Color(0.8, 0.85, 1.0),
        attenuationColor: new THREE.Color(...config.gel.attenuationColor),
        attenuationDistance: config.gel.attenuationDistance,
        specularIntensity: config.gel.specularIntensity,
        specularColor: new THREE.Color(1.0, 1.0, 1.0),
        envMapIntensity: config.gel.envMapIntensity,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      sceneRefs.current.gelMaterial = gelMaterial;

      const gelMesh = new THREE.Mesh(gelGeometry, gelMaterial);
      scene.add(gelMesh);
      sceneRefs.current.gelMesh = gelMesh;

      // Store in multi-instance Maps (v4.0)
      const primaryGelId = config.gels[0]?.id || 'gel-primary';
      sceneRefs.current.gelMeshes.set(primaryGelId, gelMesh);
      sceneRefs.current.gelMaterials.set(primaryGelId, gelMaterial);
      sceneRefs.current.gelGeometries.set(primaryGelId, gelGeometry);

      // ============================================
      // === CINEMATIC LIGHTING ===
      // ============================================

      // Key Light
      const keyLight = new THREE.DirectionalLight('#ffffff', config.lighting.keyLightEnabled ? config.lighting.keyLightIntensity : 0);
      keyLight.color.setRGB(...config.lighting.keyLightColor);
      keyLight.position.set(config.lighting.keyLightX, config.lighting.keyLightY, config.lighting.keyLightZ);
      scene.add(keyLight);
      sceneRefs.current.keyLight = keyLight;

      // Fill Light
      const fillLight = new THREE.DirectionalLight('#a0c8ff', config.lighting.fillLightEnabled ? config.lighting.fillLightIntensity : 0);
      fillLight.color.setRGB(...config.lighting.fillLightColor);
      fillLight.position.set(-5, 3, -4);
      scene.add(fillLight);
      sceneRefs.current.fillLight = fillLight;

      // Top Light (v3.7.2 - now controllable)
      const topLight = new THREE.DirectionalLight('#ffffff', config.lighting.topLightEnabled ? config.lighting.topLightIntensity : 0);
      topLight.position.set(0, 8, 3);
      scene.add(topLight);
      sceneRefs.current.topLight = topLight;

      // Rim Light
      const rimLight = new THREE.DirectionalLight('#ffffff', config.lighting.rimLightEnabled ? config.lighting.rimLightIntensity : 0);
      rimLight.position.set(-4, 2, -6);
      scene.add(rimLight);
      sceneRefs.current.rimLight = rimLight;

      // Rim Light 2 (v3.7.2 - now controllable)
      const rimLight2 = new THREE.DirectionalLight('#e0e8ff', config.lighting.rimLight2Enabled ? config.lighting.rimLight2Intensity : 0);
      rimLight2.position.set(4, 1, -5);
      scene.add(rimLight2);
      sceneRefs.current.rimLight2 = rimLight2;

      // HAL Core Light
      const halCoreLight = new THREE.PointLight('#ff0000', config.lighting.halCoreLightEnabled ? config.lighting.halCoreLightIntensity : 0, config.lighting.halCoreLightDistance);
      halCoreLight.color.setRGB(...config.lighting.halCoreLightColor);
      halCoreLight.position.set(0, 0, 0);
      scene.add(halCoreLight);
      sceneRefs.current.halCoreLight = halCoreLight;

      // HAL Back Light (v3.7.2 - now controllable)
      const halBackLight = new THREE.PointLight('#ff2200', config.lighting.halBackLightEnabled ? config.lighting.halBackLightIntensity : 0, 5);
      halBackLight.position.set(0, 0, -1.5);
      scene.add(halBackLight);
      sceneRefs.current.halBackLight = halBackLight;

      // Red Rim Light (v3.7.2 - now controllable)
      const redRimLight = new THREE.PointLight('#ff1100', config.lighting.redRimLightEnabled ? config.lighting.redRimLightIntensity : 0, 3);
      redRimLight.position.set(0, -0.5, 0.5);
      scene.add(redRimLight);
      sceneRefs.current.redRimLight = redRimLight;

      // Ambient Light
      const ambientLight = new THREE.AmbientLight('#050508', config.lighting.ambientEnabled ? config.lighting.ambientIntensity : 0);
      scene.add(ambientLight);
      sceneRefs.current.ambientLight = ambientLight;

      // ============================================
      // === POST-PROCESSING PIPELINE ===
      // ============================================

      let postProcessing: any = null;
      let bloomPassNode: any = null;
      let rgbShiftNode: any = null;

      try {
        // Create PostProcessing instance
        postProcessing = new PostProcessing(renderer);

        // Create scene pass
        const scenePass = pass(scene, camera);
        const scenePassColor = scenePass.getTextureNode('output');

        // Create bloom effect with initial values from config
        const bloomStrength = uniform(config.postProcess.bloomEnabled ? config.postProcess.bloomIntensity : 0);
        const bloomRadius = uniform(config.postProcess.bloomRadius);
        const bloomThreshold = uniform(config.postProcess.bloomThreshold);

        bloomPassNode = bloom(scenePassColor, bloomStrength, bloomThreshold, bloomRadius);

        // Create chromatic aberration (RGB shift) effect
        const rgbShiftAmount = uniform(config.postProcess.chromaticAberrationEnabled
          ? config.postProcess.chromaticAberrationAmount
          : 0);

        // Chain effects: scene + bloom, then apply rgbShift
        const bloomedScene = scenePassColor.add(bloomPassNode);
        rgbShiftNode = rgbShift(bloomedScene, rgbShiftAmount);

        // Create vignette effect (custom TSL implementation)
        const vignetteIntensity = uniform(config.postProcess.vignetteEnabled
          ? config.postProcess.vignetteIntensity
          : 0);

        // Vignette: darken edges based on distance from center
        // Uses uv coordinates (0-1), center is at 0.5, 0.5
        const vignetteNode = Fn(() => {
          const screenUV = uv();
          const centeredUV = screenUV.sub(vec2(0.5, 0.5));
          const dist = length(centeredUV).mul(1.4142); // sqrt(2) to normalize diagonal
          const vignette = float(1.0).sub(smoothstep(float(0.5), float(1.5), dist).mul(vignetteIntensity));
          return rgbShiftNode.mul(vec4(vignette, vignette, vignette, 1.0));
        })();

        // Set final output node
        postProcessing.outputNode = vignetteNode;

        // Store refs for runtime updates
        sceneRefs.current.postProcessing = postProcessing;
        sceneRefs.current.bloomPass = {
          strength: bloomStrength,
          radius: bloomRadius,
          threshold: bloomThreshold,
        };
        sceneRefs.current.rgbShiftPass = {
          amount: rgbShiftAmount,
        };
        sceneRefs.current.vignettePass = {
          intensity: vignetteIntensity,
        };

        console.log('[PostProcessing] Pipeline initialized with bloom, chromatic aberration, and vignette');
      } catch (e) {
        console.warn('[PostProcessing] Failed to initialize, falling back to direct render:', e);
        postProcessing = null;
      }

      // ============================================
      // === ANIMATION LOOP ===
      // ============================================

      const clock = new THREE.Clock();
      const state = { loaded: false };

      coreMaterial.transparent = true;
      coreMaterial.opacity = 0;
      gelMaterial.opacity = 0;

      const animate = () => {
        if (isDisposed) return;

        frameId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        uTime.value = elapsed;

        // Camera animation system
        const refs = sceneRefs.current;
        if (refs.cameraAnimation?.isAnimating) {
          const anim = refs.cameraAnimation;
          const animElapsed = (performance.now() - anim.startTime) / anim.duration;
          const t = Math.min(animElapsed, 1);
          const eased = easeOutCubic(t);

          // Interpolate camera distance
          const newDistance = lerp(anim.startDistance, anim.targetDistance, eased);
          const direction = camera.position.clone().normalize();
          camera.position.copy(direction.multiplyScalar(newDistance));

          // Interpolate orbit target Y
          const newTargetY = lerp(anim.startTargetY, anim.targetTargetY, eased);
          controls.target.y = newTargetY;

          // Interpolate FOV if needed
          if (anim.startFov !== anim.targetFov) {
            camera.fov = lerp(anim.startFov, anim.targetFov, eased);
            camera.updateProjectionMatrix();
          }

          // End animation
          if (t >= 1) {
            refs.cameraAnimation.isAnimating = false;
          }
        }

        controls.update();

        // Loading sequence
        if (elapsed < 0.8) {
          const t = elapsed / 0.8;
          coreMaterial.opacity = t;
          gelMaterial.opacity = t * 0.5;
          setLoadProgress(Math.floor(t * 50));
        } else if (elapsed < 2.0) {
          const t = (elapsed - 0.8) / 1.2;
          coreMaterial.opacity = THREE.MathUtils.lerp(coreMaterial.opacity, 1.0, delta * 2);
          gelMaterial.opacity = THREE.MathUtils.lerp(gelMaterial.opacity, 0.5, delta * 2);
          setLoadProgress(50 + Math.floor(t * 50));
        } else if (!state.loaded) {
          state.loaded = true;
          coreMaterial.opacity = 1;
          gelMaterial.opacity = 0.5;
          setIsLoaded(true);
          setLoadProgress(100);
        }

        // Get animation config from refs
        const animConfig = sceneRefs.current.animationConfig;
        const uniforms = sceneRefs.current.uniforms;

        // Mesh movement with configurable rotation speed
        const baseRotY = elapsed * animConfig.meshRotationSpeed;
        const wobbleX = Math.sin(elapsed * (uniforms?.uWobbleSpeed?.value || 0.7)) * (uniforms?.uWobbleIntensity?.value || 0.02);
        const wobbleZ = Math.cos(elapsed * (uniforms?.uWobbleSpeed?.value || 0.6) * 0.857) * ((uniforms?.uWobbleIntensity?.value || 0.02) * 0.75);

        coreMesh.rotation.y = baseRotY;
        coreMesh.rotation.x = wobbleX;
        coreMesh.rotation.z = wobbleZ;

        // Gel can sync with core or have slight offset
        if (animConfig.syncBreathing) {
          gelMesh.rotation.y = baseRotY;
          gelMesh.rotation.x = wobbleX * 0.8;
          gelMesh.rotation.z = wobbleZ * 0.8;
        } else {
          gelMesh.rotation.y = baseRotY + Math.sin(elapsed * 0.3) * 0.01;
          gelMesh.rotation.x = wobbleX + Math.cos(elapsed * 0.4) * 0.008;
          gelMesh.rotation.z = wobbleZ + Math.sin(elapsed * 0.5) * 0.006;
        }

        // Breathing with configurable parameters
        const breatheSpeed = uniforms?.uBreatheSpeed?.value || 0.8;
        const breatheIntensity = uniforms?.uBreatheIntensity?.value || 0.02;
        const breatheFactor = Math.sin(elapsed * breatheSpeed) * breatheIntensity;

        // Get base scale from userData (set by transform controls) or default to 1
        const coreBaseScale = (coreMesh.userData as any).baseScale || 1;
        const gelBaseScale = (gelMesh.userData as any).baseScale || 1;

        const breatheCore = coreBaseScale * (1.0 + breatheFactor);
        const breatheGel = gelBaseScale * (animConfig.syncBreathing
          ? (1.0 + breatheFactor * 0.75)
          : (1.0 + Math.sin(elapsed * breatheSpeed + 0.15) * breatheIntensity * 0.75));

        coreMesh.scale.setScalar(breatheCore);
        gelMesh.scale.setScalar(breatheGel);

        // Update all instances in Maps (v4.0) - apply breathing to all
        sceneRefs.current.coreMeshes.forEach((mesh, id) => {
          const baseScale = (mesh.userData as any).baseScale || 1;
          mesh.scale.setScalar(baseScale * (1.0 + breatheFactor));
        });

        sceneRefs.current.gelMeshes.forEach((mesh, id) => {
          const baseScale = (mesh.userData as any).baseScale || 1;
          const gelBreatheFactor = animConfig.syncBreathing
            ? breatheFactor * 0.75
            : Math.sin(elapsed * breatheSpeed + 0.15) * breatheIntensity * 0.75;
          mesh.scale.setScalar(baseScale * (1.0 + gelBreatheFactor));
        });

        // ============================================
        // === PHYSICS UPDATE (v5.0) ===
        // ============================================
        const physicsConfig = configRef.current.physics;
        if (physicsConfig.enabled && physicsConfig.gravityEnabled) {
          const physicsState = sceneRefs.current.physicsState;
          const timeScale = physicsConfig.timeScale;
          const damping = physicsConfig.damping;
          const G = physicsConfig.gravityStrength;

          // Get all core meshes as physics bodies
          const coreMeshArray = Array.from(sceneRefs.current.coreMeshes.entries());

          // Initialize physics state for new instances
          coreMeshArray.forEach(([id, mesh]) => {
            if (!physicsState.instances.has(id)) {
              physicsState.instances.set(id, {
                velocity: new THREE.Vector3(0, 0, 0),
                acceleration: new THREE.Vector3(0, 0, 0),
                mass: mesh.scale.x, // Scale = mass in auto mode
                trail: [],
              });
            }
          });

          // Calculate gravitational forces between all cores
          for (let i = 0; i < coreMeshArray.length; i++) {
            const [id1, mesh1] = coreMeshArray[i];
            const state1 = physicsState.instances.get(id1);
            if (!state1) continue;

            // Update mass based on scale (auto mode)
            if (physicsConfig.massMode === 'auto') {
              state1.mass = mesh1.scale.x;
            }

            // Reset acceleration
            state1.acceleration.set(0, 0, 0);

            for (let j = 0; j < coreMeshArray.length; j++) {
              if (i === j) continue;

              const [id2, mesh2] = coreMeshArray[j];
              const state2 = physicsState.instances.get(id2);
              if (!state2) continue;

              // Newton's gravitational formula: F = G * m1 * m2 / r^2
              const direction = new THREE.Vector3().subVectors(mesh2.position, mesh1.position);
              const distance = Math.max(direction.length(), 0.3); // Prevent singularity
              direction.normalize();

              let forceMagnitude = 0;

              if (physicsConfig.gravityType === 'newton') {
                // Realistic Newton gravity
                forceMagnitude = G * state1.mass * state2.mass / (distance * distance);
              } else if (physicsConfig.gravityType === 'artistic') {
                // Simplified artistic gravity (linear falloff, capped)
                forceMagnitude = G * Math.min(state1.mass * state2.mass / distance, 2.0);
              } else if (physicsConfig.gravityType === 'magnetic') {
                // Magnetic: attract if close, repel if far
                const threshold = 1.5;
                if (distance < threshold) {
                  forceMagnitude = -G * (threshold - distance) * 0.5; // Repel
                } else {
                  forceMagnitude = G * (distance - threshold) * 0.3; // Attract
                }
              }

              // Apply force to acceleration (F = ma, so a = F/m)
              const force = direction.multiplyScalar(forceMagnitude / state1.mass);
              state1.acceleration.add(force);
            }
          }

          // Update velocities and positions
          const physicsDeltaTime = delta * timeScale;
          coreMeshArray.forEach(([id, mesh]) => {
            const instanceState = physicsState.instances.get(id);
            if (!instanceState) return;

            // Update velocity: v = v + a * dt
            instanceState.velocity.add(instanceState.acceleration.clone().multiplyScalar(physicsDeltaTime));

            // Apply damping: v = v * (1 - damping)
            instanceState.velocity.multiplyScalar(1 - damping);

            // Update position: p = p + v * dt
            mesh.position.add(instanceState.velocity.clone().multiplyScalar(physicsDeltaTime));

            // Boundary handling
            if (physicsConfig.boundaryMode !== 'none') {
              const radius = physicsConfig.boundaryRadius;
              const distFromCenter = mesh.position.length();

              if (distFromCenter > radius) {
                if (physicsConfig.boundaryMode === 'bounce') {
                  // Reflect velocity
                  const normal = mesh.position.clone().normalize();
                  instanceState.velocity.reflect(normal);
                  mesh.position.setLength(radius - 0.1);
                } else if (physicsConfig.boundaryMode === 'wrap') {
                  // Wrap to opposite side
                  mesh.position.multiplyScalar(-0.9);
                } else if (physicsConfig.boundaryMode === 'contain') {
                  // Stop at boundary
                  mesh.position.setLength(radius);
                  instanceState.velocity.set(0, 0, 0);
                }
              }
            }

            // Update trails (if enabled)
            if (physicsConfig.trailsEnabled) {
              instanceState.trail.push({
                position: mesh.position.clone(),
                time: elapsed,
                velocity: instanceState.velocity.length(),
              });

              // Limit trail length
              while (instanceState.trail.length > physicsConfig.trailLength) {
                instanceState.trail.shift();
              }
            }
          });

          // ============================================
          // === SPRINT 2: TRAIL RENDERING ===
          // ============================================
          if (physicsConfig.trailsEnabled && refs.scene) {
            coreMeshArray.forEach(([id, mesh]) => {
              const instanceState = physicsState.instances.get(id);
              if (instanceState) {
                updateTrailGeometry(
                  id,
                  instanceState.trail,
                  refs.trailSystem,
                  refs.scene!,
                  refs.trailConfig
                );
              }
            });
          }

          // ============================================
          // === SPRINT 2: COLLISION DETECTION ===
          // ============================================
          if (refs.collisionConfig.enabled && refs.scene) {
            const collisionInstances: InstancePhysics[] = coreMeshArray.map(([id, mesh]) => {
              const instanceState = physicsState.instances.get(id)!;
              return {
                id,
                position: mesh.position.clone(),
                velocity: instanceState.velocity.clone(),
                radius: mesh.scale.x * 0.5,
                mass: instanceState.mass,
              };
            });

            const events = processCollisions(collisionInstances, refs.collisionConfig, (event) => {
              const effect = createCollisionEffect(event, refs.collisionConfig);
              if (effect) {
                refs.collisionEffects.push(effect);
              }
            });

            // Update positions and velocities back to meshes after collision resolution
            collisionInstances.forEach(inst => {
              const mesh = refs.coreMeshes.get(inst.id);
              if (mesh) {
                mesh.position.copy(inst.position);
              }
              const instanceState = physicsState.instances.get(inst.id);
              if (instanceState) {
                instanceState.velocity.copy(inst.velocity);
              }
            });

            // Clean up expired collision effects
            const now = performance.now();
            refs.collisionEffects = refs.collisionEffects.filter(
              effect => now - effect.startTime < effect.duration
            );
          }

          // ============================================
          // === SPRINT 2: VECTOR VISUALIZATION ===
          // ============================================
          if (refs.scene) {
            coreMeshArray.forEach(([id, mesh]) => {
              const instanceState = physicsState.instances.get(id);
              if (instanceState) {
                updateVelocityVector(
                  id,
                  mesh.position,
                  instanceState.velocity,
                  refs.vectorSystem,
                  refs.scene!,
                  refs.vectorConfig
                );
                updateForceVector(
                  id,
                  mesh.position,
                  instanceState.acceleration,
                  refs.vectorSystem,
                  refs.scene!,
                  refs.vectorConfig
                );
              }
            });
          }

          // ============================================
          // === SPRINT 2: ENERGY CALCULATION ===
          // ============================================
          const energyInstances = coreMeshArray.map(([id, mesh]) => {
            const instanceState = physicsState.instances.get(id)!;
            return {
              mass: instanceState.mass,
              velocity: instanceState.velocity,
              position: mesh.position,
            };
          });
          refs.energyStats = calculateTotalEnergy(energyInstances, G);
        }
        // === END PHYSICS UPDATE ===

        // ============================================
        // === AUDIO REACTIVITY (v6.0.0-alpha.1) ===
        // ============================================
        const audioReactive = refs.audioReactive;
        if (refs.audioAnalyzer && audioReactive.enabled) {
          const analyzer = refs.audioAnalyzer;

          // Get current audio data
          audioReactive.bands = analyzer.getFrequencyBands();
          audioReactive.beat = analyzer.detectBeat();
          audioReactive.mood = analyzer.analyzeMood();

          const bands = audioReactive.bands;
          const beat = audioReactive.beat;
          const sens = audioReactive.sensitivity;

          // Normalize frequency values (0-255 -> 0-1)
          const normalizedBass = (bands.subBass + bands.bass) / 510;
          const normalizedMid = bands.mid / 255;
          const normalizedHigh = (bands.highMid + bands.brilliance) / 510;

          // Target values based on audio
          const targetScale = 1.0 + normalizedBass * 0.3 * sens.scale;
          const targetGlow = normalizedBass * sens.glow;
          const targetRotation = normalizedMid * sens.rotation * 2.0;

          // Smooth interpolation for organic motion (lerp factor ~0.1)
          const lerpFactor = 0.1;
          audioReactive.smoothedScale = lerp(audioReactive.smoothedScale, targetScale, lerpFactor);
          audioReactive.smoothedGlow = lerp(audioReactive.smoothedGlow, targetGlow, lerpFactor);
          audioReactive.smoothedRotation = lerp(audioReactive.smoothedRotation, targetRotation, lerpFactor);

          // Beat pulse effect (decays over time)
          if (beat.isBeat) {
            audioReactive.beatPulse = 1.0;
            audioReactive.lastBeatTime = performance.now();
          } else {
            // Decay pulse over 200ms
            const timeSinceBeat = performance.now() - audioReactive.lastBeatTime;
            audioReactive.beatPulse = Math.max(0, 1.0 - timeSinceBeat / 200);
          }

          // Apply audio reactivity to all core meshes
          refs.coreMeshes.forEach((mesh, id) => {
            const baseScale = (mesh.userData as any).baseScale || 1;

            // Scale: base + breathing + audio pulse + beat punch
            const audioScale = audioReactive.smoothedScale;
            const beatPunch = audioReactive.beatPulse * 0.15;
            mesh.scale.setScalar(baseScale * audioScale * (1 + beatPunch));

            // Rotation: add audio-driven rotation on Y axis
            mesh.rotation.y += audioReactive.smoothedRotation * delta;
          });

          // Apply glow to materials (emissive intensity)
          refs.coreMaterials.forEach((material, id) => {
            if (material.emissiveIntensity !== undefined) {
              const baseEmissive = 0.5; // Default emissive
              material.emissiveIntensity = baseEmissive + audioReactive.smoothedGlow;
            }
          });

          // Apply to gel meshes with reduced intensity
          refs.gelMeshes.forEach((mesh, id) => {
            const baseScale = (mesh.userData as any).baseScale || 1;
            const audioScale = audioReactive.smoothedScale * 0.7 + 0.3; // Less reactive
            const beatPunch = audioReactive.beatPulse * 0.08;
            mesh.scale.setScalar(baseScale * audioScale * (1 + beatPunch));
          });

          // Modulate trail config based on high frequencies
          if (physicsConfig.trailsEnabled) {
            refs.trailConfig.maxLength = Math.floor(50 + normalizedHigh * 100 * sens.trails);
            refs.trailConfig.opacity = 0.3 + normalizedHigh * 0.5;
          }

          // Beat-triggered color flash on HAL lights
          if (beat.isBeat && audioReactive.beatPulse > 0.8) {
            const lc = refs.lightingConfig;
            if (lc.halCoreLightEnabled && refs.halCoreLight) {
              // Flash brighter on beat
              refs.halCoreLight.intensity = lc.halCoreLightIntensity * 2.5;
            }
          }
        }
        // === END AUDIO REACTIVITY ===

        // ============================================
        // === GESTURE CAMERA CONTROL (v6.0.0) ===
        // ============================================
        const gestureControl = refs.gestureControl;
        if (gestureControl.enabled && refs.controls) {
          const control = gestureControl.cameraControl;
          const lerpFactor = 0.08; // Smooth camera movement

          // Smooth interpolation for camera values
          gestureControl.smoothedPanX = lerp(gestureControl.smoothedPanX, control.panX, lerpFactor);
          gestureControl.smoothedPanY = lerp(gestureControl.smoothedPanY, control.panY, lerpFactor);
          gestureControl.smoothedZoom = lerp(gestureControl.smoothedZoom, control.zoom, lerpFactor);
          gestureControl.smoothedRotation = lerp(gestureControl.smoothedRotation, control.rotationY, lerpFactor);

          // Apply camera orbit based on hand position
          // Pan X/Y maps to orbit angles
          const orbitSpeed = 0.02;
          const targetAzimuth = gestureControl.smoothedPanX * Math.PI * 0.5; // -90 to +90 degrees
          const targetPolar = (gestureControl.smoothedPanY * 0.5 + 0.5) * Math.PI * 0.4 + Math.PI * 0.3; // 54-126 degrees

          // Get current camera spherical coordinates
          const cameraDistance = refs.camera!.position.length();

          // Apply smooth rotation (orbit around target)
          if (Math.abs(gestureControl.smoothedPanX) > 0.05 || Math.abs(gestureControl.smoothedPanY) > 0.05) {
            const currentAngle = Math.atan2(refs.camera!.position.x, refs.camera!.position.z);
            const newAngle = currentAngle + gestureControl.smoothedPanX * orbitSpeed;

            // Calculate new camera position
            const newX = Math.sin(newAngle) * cameraDistance * Math.cos(targetPolar - Math.PI / 2);
            const newY = refs.camera!.position.y + gestureControl.smoothedPanY * orbitSpeed * cameraDistance * 0.5;
            const newZ = Math.cos(newAngle) * cameraDistance * Math.cos(targetPolar - Math.PI / 2);

            refs.camera!.position.x = lerp(refs.camera!.position.x, newX, lerpFactor);
            refs.camera!.position.y = lerp(refs.camera!.position.y, Math.max(0.5, Math.min(newY, cameraDistance * 0.8)), lerpFactor);
            refs.camera!.position.z = lerp(refs.camera!.position.z, newZ, lerpFactor);

            refs.camera!.lookAt(refs.controls.target);
          }

          // Apply zoom based on hand distance from camera (Z depth)
          const zoomFactor = gestureControl.smoothedZoom;
          if (Math.abs(zoomFactor - 1) > 0.05) {
            const targetDistance = cameraDistance / zoomFactor;
            const clampedDistance = Math.max(refs.controls.minDistance, Math.min(targetDistance, refs.controls.maxDistance));

            if (Math.abs(clampedDistance - cameraDistance) > 0.1) {
              const direction = refs.camera!.position.clone().normalize();
              refs.camera!.position.copy(direction.multiplyScalar(lerp(cameraDistance, clampedDistance, lerpFactor * 0.5)));
            }
          }

          // Two-hand scale: adjust simulation scale (all bodies)
          if (control.scale !== 1 && Math.abs(control.scale - 1) > 0.05) {
            const scaleFactor = control.scale;
            refs.coreMeshes.forEach((mesh) => {
              const baseScale = (mesh.userData as any).baseScale || 1;
              mesh.scale.setScalar(baseScale * scaleFactor);
            });
          }

          // Update controls target to keep camera focused
          refs.controls.update();
        }
        // === END GESTURE CAMERA CONTROL ===

        // Dynamic lighting (can be toggled)
        if (animConfig.dynamicLighting) {
          const lightAngle = elapsed * animConfig.orbitSpeed;
          keyLight.position.x = Math.sin(lightAngle) * 7;
          keyLight.position.z = Math.cos(lightAngle) * 7;

          rimLight2.position.x = Math.sin(lightAngle + Math.PI) * 5;
          rimLight2.position.z = Math.cos(lightAngle + Math.PI) * 5;
        }

        // HAL light pulsing animation (respects enabled state from sceneRefs.lightingConfig)
        const halLightPulse = Math.sin(elapsed * 0.8) * 0.5 + 1.0;
        const lc = sceneRefs.current.lightingConfig;

        // Only pulse if enabled - check current config state via sceneRefs
        if (lc.halCoreLightEnabled) {
          halCoreLight.intensity = lc.halCoreLightIntensity;
        } else {
          halCoreLight.intensity = 0;
        }

        if (lc.halBackLightEnabled) {
          halBackLight.intensity = lc.halBackLightIntensity * halLightPulse;
        } else {
          halBackLight.intensity = 0;
        }

        if (lc.redRimLightEnabled) {
          redRimLight.intensity = lc.redRimLightIntensity * halLightPulse;
        } else {
          redRimLight.intensity = 0;
        }

        const redShift = Math.sin(elapsed * 0.4) * 0.05;
        if (lc.halBackLightEnabled) {
          halBackLight.color.setRGB(1.0, 0.1 + redShift, 0);
        }

        // Use post-processing if available, otherwise direct render
        if (postProcessing) {
          postProcessing.render();
        } else {
          renderer.render(scene, camera);
        }
      };

      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);
      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameId);
        if (mountRef.current && renderer?.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        controls.dispose();

        // Dispose legacy refs
        coreGeometry.dispose();
        gelGeometry.dispose();
        coreMaterial.dispose();
        gelMaterial.dispose();

        // Dispose all multi-instance Maps (v4.0)
        sceneRefs.current.coreGeometries.forEach(geo => geo.dispose());
        sceneRefs.current.gelGeometries.forEach(geo => geo.dispose());
        sceneRefs.current.coreMaterials.forEach(mat => mat.dispose());
        sceneRefs.current.gelMaterials.forEach(mat => mat.dispose());

        // Clear Maps
        sceneRefs.current.coreMeshes.clear();
        sceneRefs.current.gelMeshes.clear();
        sceneRefs.current.coreGeometries.clear();
        sceneRefs.current.gelGeometries.clear();
        sceneRefs.current.coreMaterials.clear();
        sceneRefs.current.gelMaterials.clear();
        sceneRefs.current.instanceUniforms.clear();

        // Cleanup Sprint 2 systems (v5.0.0-alpha.2)
        clearAllTrails(sceneRefs.current.trailSystem, scene);
        clearAllVectors(sceneRefs.current.vectorSystem, scene);

        renderer?.dispose();
      };
    };

    let cleanup: (() => void) | undefined;
    initScene().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full block cursor-move" />

      {!isLoaded && (
        <div className="absolute bottom-10 left-10 text-white font-mono pointer-events-none z-10">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-36 bg-zinc-900 overflow-hidden rounded-full">
              <div
                className="h-full bg-gradient-to-r from-red-900 via-orange-500 to-yellow-300 transition-all duration-100"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-xs text-amber-400 tabular-nums font-bold">
              {loadProgress.toString().padStart(3, '0')}%
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-2 tracking-widest uppercase">
            Initializing Shader Studio...
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel
        config={config}
        onConfigChange={handleConfigChange}
        onMeshImport={handleMeshImport}
        onEnvMapImport={handleEnvMapImport}
        onPanelToggle={handlePanelToggle}
        rendererRef={rendererRef}
      />

      {/* Audio Panel (v6.0.0) */}
      <AudioPanel
        onAudioAnalyzer={handleAudioAnalyzer}
        isCollapsed={isAudioPanelCollapsed}
        onToggle={() => setIsAudioPanelCollapsed(!isAudioPanelCollapsed)}
      />

      {/* Gesture Panel (v6.0.0) */}
      <GesturePanel
        onGestureController={handleGestureController}
        onCameraControl={handleCameraControl}
        onGestureAction={handleGestureAction}
        isCollapsed={isGesturePanelCollapsed}
        onToggle={() => setIsGesturePanelCollapsed(!isGesturePanelCollapsed)}
      />
    </div>
  );
};

export default RockScene;
