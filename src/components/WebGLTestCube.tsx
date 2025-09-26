'use client'
import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function SpinningCube() {
  const meshRef = useRef<any>(null)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })
  return (
    <mesh ref={meshRef} position={[0,0,0]}>
      <boxGeometry args={[2,2,2]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export default function WebGLTestCube() {
  return (
    <div style={{ width: '100vw', height: '60vh', background: '#222', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SpinningCube />
      </Canvas>
    </div>
  )
}
