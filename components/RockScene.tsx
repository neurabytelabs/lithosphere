import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { WebGPURenderer, MeshPhysicalNodeMaterial, TSL } from 'three/webgpu';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import DebugPanel, { ShaderConfig, DEFAULT_CONFIG } from './DebugPanel';

const {
  positionLocal,
  normalLocal,
  normalWorld,
  cameraPosition,
  vec3,
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
} = TSL;

// ============================================
// === SCENE REFS FOR RUNTIME UPDATES ===
// ============================================

interface SceneRefs {
  coreMesh: THREE.Mesh | null;
  gelMesh: THREE.Mesh | null;
  coreMaterial: any;
  gelMaterial: any;
  coreGeometry: THREE.BufferGeometry | null;
  gelGeometry: THREE.BufferGeometry | null;
  keyLight: THREE.DirectionalLight | null;
  fillLight: THREE.DirectionalLight | null;
  rimLight: THREE.DirectionalLight | null;
  halCoreLight: THREE.PointLight | null;
  halBackLight: THREE.PointLight | null;
  ambientLight: THREE.AmbientLight | null;
  controls: OrbitControls | null;
  scene: THREE.Scene | null;
  uniforms: {
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
  } | null;
}

const RockScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [config, setConfig] = useState<ShaderConfig>(DEFAULT_CONFIG);
  const sceneRefs = useRef<SceneRefs>({
    coreMesh: null,
    gelMesh: null,
    coreMaterial: null,
    gelMaterial: null,
    coreGeometry: null,
    gelGeometry: null,
    keyLight: null,
    fillLight: null,
    rimLight: null,
    halCoreLight: null,
    halBackLight: null,
    ambientLight: null,
    controls: null,
    scene: null,
    uniforms: null,
  });

  // Update scene when config changes
  const updateSceneFromConfig = useCallback((newConfig: ShaderConfig) => {
    const refs = sceneRefs.current;

    // Update lighting
    if (refs.keyLight) {
      refs.keyLight.intensity = newConfig.lighting.keyLightIntensity;
      refs.keyLight.color.setRGB(...newConfig.lighting.keyLightColor);
    }
    if (refs.fillLight) {
      refs.fillLight.intensity = newConfig.lighting.fillLightIntensity;
      refs.fillLight.color.setRGB(...newConfig.lighting.fillLightColor);
    }
    if (refs.rimLight) {
      refs.rimLight.intensity = newConfig.lighting.rimLightIntensity;
    }
    if (refs.halCoreLight) {
      refs.halCoreLight.intensity = newConfig.lighting.halCoreLightIntensity;
      refs.halCoreLight.color.setRGB(...newConfig.lighting.halCoreLightColor);
    }
    if (refs.ambientLight) {
      refs.ambientLight.intensity = newConfig.lighting.ambientIntensity;
    }

    // Update controls
    if (refs.controls) {
      refs.controls.autoRotate = newConfig.animation.autoRotate;
      refs.controls.autoRotateSpeed = newConfig.animation.autoRotateSpeed;
    }

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
    }

    // Update core material properties
    if (refs.coreMaterial) {
      refs.coreMaterial.clearcoat = newConfig.core.clearcoat;
    }

    // Update visibility
    if (refs.coreMesh) {
      refs.coreMesh.visible = newConfig.shape.coreVisible;
    }
    if (refs.gelMesh) {
      refs.gelMesh.visible = newConfig.shape.gelVisible;
    }

    // Update uniforms
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
    }
  }, []);

  const handleConfigChange = useCallback((newConfig: ShaderConfig) => {
    setConfig(newConfig);
    updateSceneFromConfig(newConfig);
  }, [updateSceneFromConfig]);

  useEffect(() => {
    if (!mountRef.current) return;

    let frameId: number;
    let renderer: any;
    let isDisposed = false;

    const initScene = async () => {
      if (!mountRef.current || isDisposed) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      camera.position.set(0, 0.5, 5);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#000000');
      sceneRefs.current.scene = scene;

      try {
        renderer = new WebGPURenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;

        await renderer.init();

        if (isDisposed || !mountRef.current) return;
        mountRef.current.appendChild(renderer.domElement);
      } catch (e) {
        console.error("Failed to initialize WebGPURenderer", e);
        return;
      }

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.03;
      controls.autoRotate = config.animation.autoRotate;
      controls.autoRotateSpeed = config.animation.autoRotateSpeed;
      controls.enableZoom = true;
      controls.minDistance = 2;
      controls.maxDistance = 15;
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
        coreAnimPos.mul(uNoiseScale).add(vec3(uTime.mul(0.15), 0, 0)),
        float(3),
        float(2.0),
        float(0.5)
      );
      const coreNoise2 = mx_noise_float(
        coreAnimPos.mul(uNoiseScale.mul(2)).add(vec3(0, uTime.mul(0.12), uTime.mul(0.1)))
      );

      const breathe = sin(uTime.mul(0.8)).mul(0.03).add(1.0);
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
        gelAnimPos.mul(1.2).add(vec3(uTime.mul(0.1), uTime.mul(0.08), 0)),
        float(2),
        float(2.0),
        float(0.5)
      );
      const gelNoise2 = mx_noise_float(
        gelAnimPos.mul(2.5).add(vec3(0, 0, uTime.mul(0.15)))
      );

      const gelBreathe = sin(uTime.mul(0.8).add(0.2)).mul(0.02).add(1.0);
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
      const redBleed = coreColorGlowVec.mul(coreInfluence.mul(config.gel.redBleedIntensity).mul(halIntensity));

      const gelBase = mix(gelClear, gelTint, gelDepth.mul(0.3));
      const gelWithEdge = mix(gelBase, gelEdge, pow(gelFresnel, float(2.5)));

      const envUp = clamp(normalWorld.y.mul(0.5).add(0.5), float(0), float(1));
      const envSide = clamp(normalWorld.x.abs().mul(0.5), float(0), float(1));

      const skyReflect = vec3(0.7, 0.8, 1.0);
      const groundReflect = vec3(0.15, 0.12, 0.1);
      const sideReflect = vec3(0.4, 0.35, 0.3);

      const envReflection = mix(groundReflect, skyReflect, envUp);
      const fullEnvReflect = mix(envReflection, sideReflect, envSide.mul(0.5));

      const fresnelReflect = pow(gelFresnel, float(1.8));
      const reflection = fullEnvReflect.mul(fresnelReflect.mul(0.7));
      const specular = vec3(1.0, 1.0, 1.0).mul(pow(gelFresnel, float(5.0)).mul(0.6));

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
        sheen: 0.15,
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

      // ============================================
      // === CINEMATIC LIGHTING ===
      // ============================================

      const keyLight = new THREE.DirectionalLight('#ffffff', config.lighting.keyLightIntensity);
      keyLight.color.setRGB(...config.lighting.keyLightColor);
      keyLight.position.set(5, 5, 6);
      scene.add(keyLight);
      sceneRefs.current.keyLight = keyLight;

      const fillLight = new THREE.DirectionalLight('#a0c8ff', config.lighting.fillLightIntensity);
      fillLight.color.setRGB(...config.lighting.fillLightColor);
      fillLight.position.set(-5, 3, -4);
      scene.add(fillLight);
      sceneRefs.current.fillLight = fillLight;

      const topLight = new THREE.DirectionalLight('#ffffff', 2.0);
      topLight.position.set(0, 8, 3);
      scene.add(topLight);

      const rimLight = new THREE.DirectionalLight('#ffffff', config.lighting.rimLightIntensity);
      rimLight.position.set(-4, 2, -6);
      scene.add(rimLight);
      sceneRefs.current.rimLight = rimLight;

      const rimLight2 = new THREE.DirectionalLight('#e0e8ff', 2.0);
      rimLight2.position.set(4, 1, -5);
      scene.add(rimLight2);

      const halCoreLight = new THREE.PointLight('#ff0000', config.lighting.halCoreLightIntensity, 4);
      halCoreLight.color.setRGB(...config.lighting.halCoreLightColor);
      halCoreLight.position.set(0, 0, 0);
      scene.add(halCoreLight);
      sceneRefs.current.halCoreLight = halCoreLight;

      const halBackLight = new THREE.PointLight('#ff2200', 3.0, 5);
      halBackLight.position.set(0, 0, -1.5);
      scene.add(halBackLight);
      sceneRefs.current.halBackLight = halBackLight;

      const redRimLight = new THREE.PointLight('#ff1100', 2.0, 3);
      redRimLight.position.set(0, -0.5, 0.5);
      scene.add(redRimLight);

      const ambientLight = new THREE.AmbientLight('#050508', config.lighting.ambientIntensity);
      scene.add(ambientLight);
      sceneRefs.current.ambientLight = ambientLight;

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

        // Mesh movement
        const baseRotY = elapsed * 0.05;
        const wobbleX = Math.sin(elapsed * 0.7) * 0.02;
        const wobbleZ = Math.cos(elapsed * 0.6) * 0.015;

        coreMesh.rotation.y = baseRotY;
        coreMesh.rotation.x = wobbleX;
        coreMesh.rotation.z = wobbleZ;

        gelMesh.rotation.y = baseRotY + Math.sin(elapsed * 0.3) * 0.01;
        gelMesh.rotation.x = wobbleX + Math.cos(elapsed * 0.4) * 0.008;
        gelMesh.rotation.z = wobbleZ + Math.sin(elapsed * 0.5) * 0.006;

        // Breathing
        const breatheCore = 1.0 + Math.sin(elapsed * 0.8) * 0.02;
        const breatheGel = 1.0 + Math.sin(elapsed * 0.8 + 0.15) * 0.015;

        coreMesh.scale.setScalar(breatheCore);
        gelMesh.scale.setScalar(breatheGel);

        // Dynamic lighting
        const lightAngle = elapsed * 0.08;
        keyLight.position.x = Math.sin(lightAngle) * 7;
        keyLight.position.z = Math.cos(lightAngle) * 7;

        rimLight2.position.x = Math.sin(lightAngle + Math.PI) * 5;
        rimLight2.position.z = Math.cos(lightAngle + Math.PI) * 5;

        const halLightPulse = Math.sin(elapsed * 0.8) * 0.5 + 1.0;
        halCoreLight.intensity = sceneRefs.current.halCoreLight?.intensity || 5.0;
        halBackLight.intensity = 3.0 * halLightPulse;
        redRimLight.intensity = 2.0 * halLightPulse;

        const redShift = Math.sin(elapsed * 0.4) * 0.05;
        halBackLight.color.setRGB(1.0, 0.1 + redShift, 0);

        renderer.render(scene, camera);
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
        coreGeometry.dispose();
        gelGeometry.dispose();
        coreMaterial.dispose();
        gelMaterial.dispose();
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
      <DebugPanel config={config} onConfigChange={handleConfigChange} />
    </div>
  );
};

export default RockScene;
