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
      scale={[1, 1, 1]} // Use original scale to match Blender coordinates
      position={[0, 0, 0]} // No offset - use Blender's coordinate system
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
      {/* Mouse controls optimized for Blender camera position */}
      <OrbitControls 
        enablePan={true} // Allow panning to follow shards
        enableZoom={true}
        enableRotate={true}
        minDistance={10}   // Minimum distance to see explosion
        maxDistance={40}   // Maximum distance for overview
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
        target={[0, 0, 4]} // Look at the center of the crystal explosion area
        autoRotate={false}
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={performanceMode === 'high' ? 0.05 : 0.1}
      />
      
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
      
      {/* Helper to visualize the explosion bounds (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <>
          {/* Explosion boundary visualization */}
          <mesh position={[0, 0, 4]}>
            <boxGeometry args={[30, 1, 18]} />
            <meshBasicMaterial color="red" wireframe opacity={0.1} transparent />
          </mesh>
        </>
      )}

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

  // Adaptive performance adjustment
  const checkPerformance = () => {
    frameCountRef.current++;
    const now = performance.now();
    
    if (now - lastTimeRef.current >= 1000) { // Check every second
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
            position: [0, -20, 4], // Match Blender camera position exactly
            fov: 75, // Wider FOV to capture the full explosion range (-15 to +15 units)
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
          dpr={performanceMode === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 1} // Adaptive DPR
          frameloop="demand" // Only render when needed
          onCreated={({ gl }) => {
            console.log('WebGL Renderer created:', gl.getContext());
            // Optimize renderer settings
            gl.shadowMap.enabled = false;
            gl.toneMapping = THREE.NoToneMapping;
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              console.error('WebGL context lost event:', e);
              setCanvasError('WebGL context lost. Try reloading the page or closing other GPU-intensive apps.');
            });
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
      />
      
    </motion.div>
  )
}