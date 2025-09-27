'use client'

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useScroll, motion } from 'framer-motion'
import PerformanceSettings from './PerformanceSettings'

// Preload all models
useGLTF.preload('/crystal_animation.glb');
useGLTF.preload('/crystal_simple.glb');
useGLTF.preload('/crystals_no_materials.glb');

function BlenderCrystals({ scrollProgress, modelPath }: { scrollProgress: any; modelPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialCacheRef = useRef<Map<string, THREE.Material>>(new Map());
  
  // Load the model (full animation or simple version)
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, groupRef);

  // Create reusable materials
  const createCrystalMaterial = (colorType: string) => {
    if (materialCacheRef.current.has(colorType)) {
      return materialCacheRef.current.get(colorType)!;
    }
    
    const colors = {
      blue: '#87CEEB',
      purple: '#9370DB',
      royal: '#4169E1'
    };
    
    const material = new THREE.MeshStandardMaterial({
      color: colors[colorType as keyof typeof colors] || colors.blue,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.1
    });
    
    materialCacheRef.current.set(colorType, material);
    return material;
  };

  useFrame(() => {
    if (groupRef.current && scrollProgress && actions) {
      const progress = scrollProgress.get ? scrollProgress.get() : scrollProgress;
      
      // Control ALL Blender animations based on scroll - OPTIMIZED
      Object.keys(actions).forEach((actionName) => {
        const action = actions[actionName];
        if (action) {
          action.play();
          action.paused = true;
          // Map scroll progress (0-1) to animation time (0 to duration)
          const duration = action.getClip().duration;
          action.time = progress * duration;
          // Remove excessive console logging for better performance
          // console.log(`Animation ${actionName}: progress=${progress}, time=${action.time}, duration=${duration}`);
        }
      });
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
          const colorTypes = ['blue', 'purple', 'royal'];
          const colorType = colorTypes[Math.floor(Math.random() * colorTypes.length)];
          child.material = createCrystalMaterial(colorType);
          
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
  modelPath 
}: { 
  scrollProgress: any;
  performanceMode?: 'high' | 'low';
  onFrameRender?: () => void;
  modelPath: string;
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
  {/* Orbit-style camera controls */}
  <OrbitControls target={[0, 0, 0]} enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Lighting to match Blender setup */}
      <ambientLight intensity={0.2} />
      {/* Main light matching Blender's MainLight_Blue */}
      <directionalLight 
        position={[8, 8, 10]} 
        intensity={0.8} 
        color="#87CEEB"
        castShadow={false}
      />
      {/* Fill light for better visibility */}
      <directionalLight 
        position={[-5, -8, 5]} 
        intensity={0.3} 
        castShadow={false}
      />
      {/* Rim light to highlight crystal edges */}
      <pointLight 
        position={[0, -15, 8]} 
        intensity={0.4} 
        distance={30}
        decay={2}
      />
      
      {/* Removed wireframe/explosion bounds visualization for clean view */}

      {/* Your actual Blender crystals with loading fallback */}
      <Suspense fallback={
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      }>
        <BlenderCrystals scrollProgress={scrollProgress} modelPath={modelPath} />
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
      className="w-full h-screen sticky top-0 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a0b3d 50%, #0f0f23 100%)'
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
          />
        </Canvas>
      </div>
      {/* Performance Settings UI */}
      <PerformanceSettings
        performanceMode={performanceMode}
        onPerformanceModeChange={setPerformanceMode}
        fps={fpsRef.current}
        modelPath={modelPath}
        onModelChange={setModelPath}
        cameraRotation={cameraRotation}
        onCameraRotationChange={setCameraRotation}
        cameraPosition={cameraPosition}
        onCameraPositionChange={setCameraPosition}
      />
      
    </motion.div>
  )
}