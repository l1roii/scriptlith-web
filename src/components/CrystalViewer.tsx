'use client'

import { useRef, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, useAnimations, Plane } from '@react-three/drei'
import * as THREE from 'three'
import { useScroll, motion } from 'framer-motion'
import PerformanceSettings from './PerformanceSettings'

// Preload all models
useGLTF.preload('/crystal_animation.glb');
useGLTF.preload('/crystal_simple.glb');
useGLTF.preload('/crystals_no_materials.glb');

// Particle System for Explosion Effect
function ExplosionParticles({ 
  scrollProgress, 
  controlMode = 'scroll',
  cameraPosition 
}: { 
  scrollProgress: any;
  controlMode?: 'scroll' | 'manual';
  cameraPosition?: { x: number; y: number; z: number };
}) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const count = 200; // Reduced particle count for subtlety
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Start particles closer to crystal center
      positions[i * 3] = (Math.random() - 0.5) * 1;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1;
      
      // Warm, mystical colors
      colors[i * 3] = 0.8 + Math.random() * 0.2; // R - warm
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.2; // G - golden
      colors[i * 3 + 2] = 0.5 + Math.random() * 0.3; // B - muted
    }
    
    return { positions, colors };
  }, []);
  
  useFrame(() => {
    if (particlesRef.current) {
      let progress;
      
      if (controlMode === 'scroll') {
        progress = scrollProgress.get ? scrollProgress.get() : scrollProgress;
      } else if (cameraPosition) {
        // Use camera position to drive particle explosion
        const distance = Math.sqrt(
          cameraPosition.x * cameraPosition.x + 
          cameraPosition.y * cameraPosition.y + 
          cameraPosition.z * cameraPosition.z
        );
        
        const minDistance = 10;
        const maxDistance = 150;
        progress = Math.max(0, Math.min(1, (maxDistance - distance) / (maxDistance - minDistance)));
        
        const angleInfluence = Math.abs(cameraPosition.z) / 100;
        progress = Math.max(0, Math.min(1, progress + angleInfluence * 0.3));
      } else {
        progress = 0.1; // Minimal particles in fallback
      }
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      // Animate particles with gentle storytelling energy
      for (let i = 0; i < positions.length; i += 3) {
        const expansionRadius = progress * 8; // Much smaller, subtle expansion
        const angle1 = (i / 3) * 0.05 + progress * 0.5;
        const angle2 = (i / 3) * 0.03 + progress * 0.3;
        
        positions[i] = Math.sin(angle1) * expansionRadius;
        positions[i + 1] = Math.cos(angle1) * expansionRadius;
        positions[i + 2] = Math.sin(angle2) * expansionRadius;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Keep particles visible and warm
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = Math.max(0.3, 0.7 - progress * 0.4);
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        transparent
        opacity={0.8}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function BlenderCrystals({ 
  scrollProgress, 
  modelPath, 
  controlMode = 'scroll',
  cameraPosition 
}: { 
  scrollProgress: any; 
  modelPath: string;
  controlMode?: 'scroll' | 'manual';
  cameraPosition?: { x: number; y: number; z: number };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialCacheRef = useRef<Map<string, THREE.Material>>(new Map());
  
  // Load the model (full animation or simple version)
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, groupRef);

  // Create mystical storytelling crystal materials
  const createCrystalMaterial = (colorType: string, scrollProgress: number) => {
    const cacheKey = `${colorType}_${Math.floor(scrollProgress * 10)}`;
    if (materialCacheRef.current.has(cacheKey)) {
      return materialCacheRef.current.get(cacheKey)!;
    }
    
    // Mystical storytelling colors - more muted and legendary
    const colors = {
      ancient: new THREE.Color('#8B7355'), // Ancient bronze/gold
      mystic: new THREE.Color('#4A5568'), // Deep slate
      story: new THREE.Color('#2D3748'), // Storyteller's ink
      relic: new THREE.Color('#A78BFA'), // Mystical purple
      wisdom: new THREE.Color('#6B73FF'), // Deep wisdom blue
      legend: new THREE.Color('#F6AD55')  // Legendary amber
    };
    
    const baseColor = colors[colorType as keyof typeof colors] || colors.ancient;
    
    const material = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.85 + scrollProgress * 0.15, // More solid, less ghostly
      roughness: 0.2, // Slightly rough for ancient feel
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.3,
      transmission: 0.3, // Less transparent, more substantial
      thickness: 2.0,
      ior: 1.5,
      emissive: baseColor,
      emissiveIntensity: 0.1 + scrollProgress * 0.3, // Subtle mystical glow
      envMapIntensity: 1.5,
    });
    
    materialCacheRef.current.set(cacheKey, material);
    return material;
  };

  useFrame(() => {
    if (groupRef.current && scrollProgress && actions) {
      let progress;
      
      if (controlMode === 'scroll') {
        // Use scroll progress for animation
        progress = scrollProgress.get ? scrollProgress.get() : scrollProgress;
      } else if (cameraPosition) {
        // In manual mode, use camera position to drive animation
        // Calculate distance from crystal center (0,0,0)
        const distance = Math.sqrt(
          cameraPosition.x * cameraPosition.x + 
          cameraPosition.y * cameraPosition.y + 
          cameraPosition.z * cameraPosition.z
        );
        
        // Normalize distance to create animation progress
        // Close camera (distance ~10) = high explosion (progress ~1)
        // Far camera (distance ~100) = low explosion (progress ~0)
        const minDistance = 10;
        const maxDistance = 150;
        progress = Math.max(0, Math.min(1, (maxDistance - distance) / (maxDistance - minDistance)));
        
        // Add some camera angle influence
        const angleInfluence = Math.abs(cameraPosition.z) / 100; // Higher Z = more explosion
        progress = Math.max(0, Math.min(1, progress + angleInfluence * 0.3));
      } else {
        // Fallback to gentle idle animation
        progress = Math.sin(Date.now() * 0.001) * 0.1 + 0.1;
      }
      
      // Control ALL Blender animations based on progress - OPTIMIZED
      Object.keys(actions).forEach((actionName) => {
        const action = actions[actionName];
        if (action) {
          action.play();
          action.paused = true;
          // Map progress (0-1) to animation time (0 to duration)
          const duration = action.getClip().duration;
          action.time = progress * duration;
        }
      });

      // Update crystal materials based on progress
      if (scene) {
        scene.traverse((child: any) => {
          if (child.isMesh && child.name && child.name.toLowerCase().includes('crystal')) {
            const colorTypes = ['ancient', 'mystic', 'story', 'relic', 'wisdom', 'legend'];
            const colorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
            child.material = createCrystalMaterial(colorType, progress);
          }
        });
      }
    }
  });

  // Apply crystal-like materials and filter out ground objects - OPTIMIZED
  if (scene) {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        // Hide ground or plane objects
        if (child.name && (child.name.toLowerCase().includes('ground') || 
                          child.name.toLowerCase().includes('plane') ||
                          child.name.toLowerCase().includes('floor'))) {
          child.visible = false;
          return;
        }
        
        // Apply crystal-like material to crystal shards only - use cached materials
        if (child.name && child.name.toLowerCase().includes('crystal')) {
          const colorTypes = ['ancient', 'mystic', 'story', 'relic', 'wisdom', 'legend'];
          const colorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
          const progress = scrollProgress.get ? scrollProgress.get() : scrollProgress;
          child.material = createCrystalMaterial(colorType, progress || 0);
          
          // Enable frustum culling for better performance
          child.frustumCulled = true;
        }
      }
    });
  }

  return (
    <group 
      ref={groupRef} 
      scale={[2.2, 2.2, 2.2]} // Scale up for better fit
      position={[0, 0, 0]} // Keep centered
    >
      <primitive object={scene} />
    </group>
  );
}

function CrystalScene({ 
  scrollProgress, 
  performanceMode = 'high',
  onFrameRender,
  modelPath,
  controlMode = 'scroll',
  cameraPosition
}: { 
  scrollProgress: any;
  performanceMode?: 'high' | 'low';
  onFrameRender?: () => void;
  modelPath: string;
  controlMode?: 'scroll' | 'manual';
  cameraPosition?: { x: number; y: number; z: number };
}) {
  const { invalidate } = useThree();

  useFrame(() => {
    if (onFrameRender) {
      onFrameRender();
    }
    invalidate(); // Force re-render when needed
  });

  return (
    <>
  {/* Orbit-style camera controls - only enabled in manual mode */}
  {controlMode === 'manual' && (
    <OrbitControls 
      target={[0, 0, 0]} 
      enablePan={true} 
      enableZoom={true} 
      enableRotate={true}
      zoomSpeed={0.5}
      panSpeed={0.5}
      rotateSpeed={0.5}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={150}
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
    />
  )}
      
      {/* Explosion particle effects */}
      {/* {performanceMode === 'high' && (
        <ExplosionParticles 
          scrollProgress={scrollProgress}
          controlMode={controlMode}
          cameraPosition={cameraPosition}
        />
      )} */}
      
      {/* Mystical storytelling lighting */}
      <ambientLight intensity={0.3} color="#f4f1de" />
      
      {/* Main storyteller's light - warm and inviting */}
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.0} 
        color="#f4f1de"
        castShadow={false}
      />
      
      {/* Mystical accent light */}
      <directionalLight 
        position={[-8, 10, -5]} 
        intensity={0.6} 
        color="#a78bfa"
        castShadow={false}
      />
      
      {/* Subtle rim lighting to define crystal edges */}
      <pointLight 
        position={[0, -20, 15]} 
        intensity={0.8} 
        distance={50}
        decay={2}
        color="#e2e8f0"
      />
      
      {/* Your actual Blender crystals with loading fallback */}
      <Suspense fallback={
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00ffff" emissive="#004444" />
        </mesh>
      }>
        <BlenderCrystals 
          scrollProgress={scrollProgress} 
          modelPath={modelPath} 
          controlMode={controlMode}
          cameraPosition={cameraPosition}
        />
      </Suspense>
    </>
  )
}

export default function CrystalViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Track the entire page scroll instead of just the container
  const { scrollYProgress } = useScroll()
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'low'>('high');
  const [modelPath, setModelPath] = useState('/crystal_animation.glb');

  // Performance monitoring
  const fpsRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Camera rotation state (degrees)
  const [cameraRotation, setCameraRotation] = useState({ yaw: 0, pitch: 0, roll: 0 });
  
  // Camera position state
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 95 });
  
  // Control mode state - switch between scroll animation and manual camera control
  const [controlMode, setControlMode] = useState<'scroll' | 'manual'>('scroll');

  // Adaptive performance adjustment
  const checkPerformance = () => {
    frameCountRef.current++;
    const now = performance.now();
    
    if (now - lastTimeRef.current >= 1000) { 
      const fps = frameCountRef.current;
      fpsRef.current = fps;
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      
      // Auto-switch to simpler model if FPS is very low
      if (fps < 20 && modelPath === '/crystal_animation.glb') {
        setModelPath('/crystal_simple.glb');
        console.log('Auto-switching to simple model due to low FPS:', fps);
      }
    }
  };

  // Debug logging - reduced
  // console.log('CrystalViewer render, scrollYProgress:', scrollYProgress);

  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-screen sticky top-0 relative"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #2d3748 0%, #1a202c 60%, #0f0f23 100%)'
      }}
    >
      {canvasError && (
        <div style={{ color: 'red', position: 'absolute', top: 120, left: 40, zIndex: 30, background: 'white', padding: 12, borderRadius: 8 }}>
          WebGL/Canvas Error: {canvasError}
        </div>
      )}
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <Canvas
          camera={{ 
            position: [cameraPosition.x, cameraPosition.y, cameraPosition.z], // Dynamic camera position
            fov: 45, // Use previous FOV unless Blender FOV is specified
            near: 0.1,
            far: 100
          }}
          className="w-full h-full"
          gl={{ 
            antialias: performanceMode === 'high', 
            alpha: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
            logarithmicDepthBuffer: false,
            preserveDrawingBuffer: false
          }}
          dpr={performanceMode === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 1}
          frameloop="demand"
          onCreated={({ gl, camera }) => {
            gl.shadowMap.enabled = false;
            gl.toneMapping = THREE.NoToneMapping;
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              setCanvasError('WebGL context lost. Try reloading the page or closing other GPU-intensive apps.');
            });
            camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z); // Dynamic camera position
            // Convert degrees to radians for rotation
            camera.rotation.set(
              (cameraRotation.pitch * Math.PI) / 180,
              (cameraRotation.yaw * Math.PI) / 180,
              (cameraRotation.roll * Math.PI) / 180
            );
            camera.lookAt(0, 0, 0); // Always look at the crystal
          }}
        >
          <CrystalScene 
            scrollProgress={scrollYProgress} 
            performanceMode={performanceMode} 
            onFrameRender={checkPerformance} 
            modelPath={modelPath}
            controlMode={controlMode}
            cameraPosition={cameraPosition}
          />
        </Canvas>
      </div>
      {/* Performance Settings UI */}
      {/* <PerformanceSettings
        performanceMode={performanceMode}
        onPerformanceModeChange={setPerformanceMode}
        fps={fpsRef.current}
        modelPath={modelPath}
        onModelChange={setModelPath}
        cameraRotation={cameraRotation}
        onCameraRotationChange={setCameraRotation}
        cameraPosition={cameraPosition}
        onCameraPositionChange={setCameraPosition}
        controlMode={controlMode}
        onControlModeChange={setControlMode}
      /> */}
      
    </motion.div>
  )
}