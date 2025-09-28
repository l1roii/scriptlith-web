'use client'


import { useRef, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useScroll, motion } from 'framer-motion'
import PerformanceSettings from './PerformanceSettings'

// Preload all models
useGLTF.preload('/crystal_animation.glb');
useGLTF.preload('/crystal_simple.glb');
useGLTF.preload('/crystals_no_materials.glb');

// Ancient Tech Background - Storytelling meets Modern Technology
function AncientTechBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create storytelling-tech hybrid texture
  const ancientTechTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    // Deep storytelling background with tech gradient
    const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
    gradient.addColorStop(0, '#2d3748');  // Storytelling slate center
    gradient.addColorStop(0.6, '#1a202c'); // Dark transition
    gradient.addColorStop(1, '#0f0f1a');   // Tech dark edges
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ancient manuscript grid pattern
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;
    const gridSize = 80;
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.strokeRect(x, y, gridSize, gridSize);
      }
    }
    
    // Tech circuit lines
    ctx.strokeStyle = '#6b73ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      const x1 = Math.random() * canvas.width;
      const y1 = Math.random() * canvas.height;
      const x2 = x1 + (Math.random() - 0.5) * 200;
      const y2 = y1 + (Math.random() - 0.5) * 200;
      
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      // Add right angles for tech feel
      if (Math.random() > 0.6) {
        const x3 = x2 + (Math.random() - 0.5) * 100;
        ctx.lineTo(x3, y2);
        ctx.lineTo(x3, y2 + (Math.random() - 0.5) * 100);
      }
      ctx.stroke();
    }
    
    // Ancient rune-like symbols (tech nodes)
    ctx.fillStyle = '#a78bfa';
    ctx.shadowColor = '#a78bfa';
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 8 + 3;
      
      // Draw hexagonal "rune" shapes
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // Glowing storytelling elements
    ctx.fillStyle = '#f6ad55';
    ctx.shadowColor = '#f6ad55';
    ctx.shadowBlur = 12;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 4 + 2;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add cross pattern for mystical feel
      ctx.strokeStyle = '#f6ad55';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - radius * 2, y);
      ctx.lineTo(x + radius * 2, y);
      ctx.moveTo(x, y - radius * 2);
      ctx.lineTo(x, y + radius * 2);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    return texture;
  }, []);

  // Gentle animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      ancientTechTexture.offset.x = Math.sin(time * 0.05) * 0.01;
      ancientTechTexture.offset.y = time * 0.005;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[400, 32, 16]} />
      <meshBasicMaterial 
        map={ancientTechTexture} 
        transparent 
        opacity={0.4}  // Much more subtle to highlight crystals
        side={THREE.BackSide}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// Floating Ancient-Tech Particles
function AncientTechParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Distribute in a large sphere around the scene
      const radius = 80 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Ancient-tech color palette
      const colorType = Math.random();
      if (colorType < 0.4) {
        // Mystical purple (ancient magic)
        colors[i * 3] = 0.65 + Math.random() * 0.3;     // R
        colors[i * 3 + 1] = 0.54 + Math.random() * 0.2; // G  
        colors[i * 3 + 2] = 0.98;                       // B
      } else if (colorType < 0.7) {
        // Tech blue (modern element)
        colors[i * 3] = 0.42;                           // R
        colors[i * 3 + 1] = 0.45 + Math.random() * 0.3; // G
        colors[i * 3 + 2] = 1.0;                        // B
      } else {
        // Legendary amber (storytelling warmth)
        colors[i * 3] = 0.96;                           // R
        colors[i * 3 + 1] = 0.68 + Math.random() * 0.2; // G
        colors[i * 3 + 2] = 0.33;                       // B
      }
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      // Gentle floating motion
      for (let i = 0; i < positions.length; i += 3) {
        const originalY = positions[i + 1];
        positions[i + 1] = originalY + Math.sin(time * 0.5 + i) * 0.3;
        
        // Slight rotation around center
        const x = positions[i];
        const z = positions[i + 2];
        positions[i] = x * Math.cos(time * 0.02) - z * Math.sin(time * 0.02);
        positions[i + 2] = x * Math.sin(time * 0.02) + z * Math.cos(time * 0.02);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
        size={3}
        transparent
        opacity={0.8}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function SimpleCrystals({ scrollProgress, modelPath }: { scrollProgress: any; modelPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<(THREE.ShaderMaterial | THREE.MeshToonMaterial)[]>([]);
  
  // Load the model
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, groupRef);

  // Enhanced Holographic Crystal Shader
  const createEnhancedCrystalMaterial = () => {
    // Custom vertex shader for cartoonish surface
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      
      uniform float time;
      uniform float scrollProgress;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // Simple position with minimal deformation for cartoon style
        vec3 pos = position;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        vPosition = pos;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    // Custom fragment shader for cartoon/toon crystal appearance
    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      
      uniform float crystalId;
      
      // Toon shading: strong steps for flat faces
      float toonShade(float intensity) {
        if (intensity > 0.85) return 1.0;
        else if (intensity > 0.5) return 0.7;
        else return 0.4;
      }
      
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        float NdotL = dot(normal, normalize(vec3(1.2, 1.5, 1.0)));
        float shade = toonShade(NdotL);
        
        // Distinct, vibrant colors for each shard
        vec3 baseColor;
        float colorSelector = mod(crystalId, 6.0);
        if (colorSelector < 1.0) {
          baseColor = vec3(0.8, 0.3, 1.0); // Vivid purple
        } else if (colorSelector < 2.0) {
          baseColor = vec3(0.2, 0.7, 1.0); // Electric blue
        } else if (colorSelector < 3.0) {
          baseColor = vec3(1.0, 0.7, 0.2); // Orange
        } else if (colorSelector < 4.0) {
          baseColor = vec3(0.3, 1.0, 0.5); // Green
        } else if (colorSelector < 5.0) {
          baseColor = vec3(1.0, 0.2, 0.4); // Red
        } else {
          baseColor = vec3(1.0, 1.0, 0.2); // Yellow
        }
        
        // Flat toon shading
        vec3 toonColor = baseColor * shade;
        
        // Strong edge detection for thick, bold marker outlines
        float edge = 1.0 - abs(dot(viewDir, normal));
        float outline = smoothstep(0.08, 0.5, edge); // Lower threshold for thicker edge
        vec3 edgeColor = vec3(0.0, 0.0, 0.0);
        
        // Mix color and edge, make edge extremely bold
        vec3 finalColor = mix(toonColor, edgeColor, outline * 1.2);
        
        // Add glow effect to crystals
        float glow = smoothstep(0.0, 0.3, edge) * 0.7 + shade * 0.3;
        vec3 glowColor = baseColor * vec3(1.5, 1.5, 1.5) * glow;
        
        // Mix color, edge, and glow
        finalColor += glowColor;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Create ultra-sharp shader material for center-of-attention crystals
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        scrollProgress: { value: 0 },
        crystalId: { value: Math.random() * 10 },
        primaryColor: { value: new THREE.Color('#a855f7') },   // Vivid purple
        secondaryColor: { value: new THREE.Color('#3b82f6') }, // Electric blue  
        accentColor: { value: new THREE.Color('#f97316') },    // Brilliant orange
      },
      transparent: false,  // Solid for maximum impact
      side: THREE.FrontSide,
      // Perfect sharpness settings
      depthTest: true,
      depthWrite: true,
      // No anti-aliasing for razor-sharp edges
      polygonOffset: false,
    });
  };

  useFrame((state) => {
    if (groupRef.current && scrollProgress && actions) {
      const progress = scrollProgress.get ? scrollProgress.get() : scrollProgress;
      const time = state.clock.elapsedTime;
      
      // Update shader uniforms for all crystal materials
      materialRef.current.forEach((material) => {
        if ('uniforms' in material) {
          material.uniforms.time.value = time;
          material.uniforms.scrollProgress.value = progress;
        }
      });
      
      // Animation control
      Object.keys(actions).forEach((actionName) => {
        const action = actions[actionName];
        if (action) {
          action.play();
          action.paused = true;
          const duration = action.getClip().duration;
          action.time = progress * duration;
        }
      });
    }
  });

  // Apply cartoon/cel-shaded materials to crystals
  if (scene) {
    let crystalIndex = 0;
    const palette = [
      '#F5A623', // orange
      '#D28B6C', // light brown
      '#4B2C3B', // dark plum
      '#181A22', // deep navy
      '#004C5A', // teal blue
      '#00707B', // blue-green
      '#5BA7B7', // sky blue
    ];
    scene.traverse((child: any) => {
      if (child.isMesh) {
        // Hide ground objects
        if (child.name && (child.name.toLowerCase().includes('ground') || 
                          child.name.toLowerCase().includes('plane') ||
                          child.name.toLowerCase().includes('floor'))) {
          child.visible = false;
          return;
        }
        // Apply cartoon/cel-shaded material to crystal pieces
        if (child.name && child.name.toLowerCase().includes('crystal')) {
          const colorHex = palette[crystalIndex % palette.length];
          // Toon material with strong color, no transparency/reflection
          const toonMaterial = new THREE.MeshToonMaterial({
            color: colorHex,
            gradientMap: THREE.TextureLoader ? new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/gradientMaps/threeTone.jpg') : null,
            emissive: colorHex,
            emissiveIntensity: 0.18,
            transparent: false,
          });
          child.material = toonMaterial;
          child.frustumCulled = true;
          materialRef.current.push(toonMaterial);
          // Add bold outline by rendering backfaces in black, slightly scaled up
          const outlineGeom = child.geometry.clone();
          const outlineMat = new THREE.MeshBasicMaterial({ color: '#000', side: THREE.BackSide });
          const outlineMesh = new THREE.Mesh(outlineGeom, outlineMat);
          outlineMesh.position.copy(child.position);
          outlineMesh.rotation.copy(child.rotation);
          outlineMesh.scale.copy(child.scale).multiplyScalar(1.07); // Slightly larger for outline
          outlineMesh.renderOrder = child.renderOrder - 1;
          if (child.parent) {
            child.parent.add(outlineMesh);
          }
          crystalIndex++;
        }
      }
    });
  }

  return (
    <group 
      ref={groupRef} 
      scale={[2.2, 2.2, 2.2]}
      position={[0, 0, 0]}
    >
      <primitive object={scene} />
    </group>
  );
}

function SimpleScene({ 
  scrollProgress, 
  modelPath 
}: { 
  scrollProgress: any;
  modelPath: string;
}) {
  return (
    <>
      <OrbitControls target={[0, 0, 0]} enablePan={true} enableZoom={true} enableRotate={true} />
      
      {/* Subtle background - crystals are the star */}
      <AncientTechBackground />
      
      {/* Crystal-focused dramatic lighting */}
      <ambientLight intensity={0.2} color="#f4f1de" />
      
      {/* Primary crystal spotlight */}
      <directionalLight 
        position={[20, 25, 20]} 
        intensity={2.0} 
        color="#ffffff"
        castShadow={false}
      />
      
      {/* Secondary crystal accent light */}
      <directionalLight 
        position={[-15, 20, -10]} 
        intensity={1.5} 
        color="#f8f8ff"
        castShadow={false}
      />
      
      {/* Crystal rim lighting from below */}
      <pointLight 
        position={[0, -30, 15]} 
        intensity={1.8} 
        distance={80}
        color="#ffffff"
        castShadow={false}
      />
      
      {/* Crystal definition light */}
      <pointLight 
        position={[25, 15, 25]} 
        intensity={1.2} 
        distance={60}
        color="#f0f8ff"
        castShadow={false}
      />
      
      {/* Additional crystal pop light */}
      <spotLight
        position={[0, 40, 0]}
        angle={Math.PI / 3}
        penumbra={0.1}
        intensity={1.5}
        color="#ffffff"
        target-position={[0, 0, 0]}
        castShadow={false}
      />
      
      <Suspense fallback={
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
      }>
        <SimpleCrystals scrollProgress={scrollProgress} modelPath={modelPath} />
      </Suspense>
    </>
  )
}

export default function SimpleCrystalViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const [modelPath, setModelPath] = useState('/crystals_uniform_mesh.glb');
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 95 });
  const [cameraRotation, setCameraRotation] = useState({ yaw: 0, pitch: 0, roll: 0 });
  const [controlMode, setControlMode] = useState<'scroll' | 'manual'>('scroll');
  const [performanceMode, setPerformanceMode] = useState<'high' | 'low'>('high');

  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-screen sticky top-0 relative"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #f7fafc 0%, #e2e8f0 60%, #cbd5e1 100%)'
      }}
    >
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <Canvas
          camera={{ 
            position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          className="w-full h-full"
          gl={{ 
            antialias: performanceMode === 'high', 
            alpha: false,
          }}
          onCreated={({ camera }) => {
            camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            camera.lookAt(0, 0, 0);
          }}
        >
          <SimpleScene 
            scrollProgress={scrollYProgress} 
            modelPath={modelPath}
          />
        </Canvas>
      </div>
      
      <PerformanceSettings
        performanceMode={performanceMode}
        onPerformanceModeChange={setPerformanceMode}
        fps={60}
        modelPath={modelPath}
        onModelChange={setModelPath}
        cameraRotation={cameraRotation}
        onCameraRotationChange={setCameraRotation}
        cameraPosition={cameraPosition}
        onCameraPositionChange={setCameraPosition}
        controlMode={controlMode}
        onControlModeChange={setControlMode}
      />
    </motion.div>
  )
}