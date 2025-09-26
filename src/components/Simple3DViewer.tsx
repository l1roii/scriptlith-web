'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Simple3DViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 360])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8])

  return (
    <motion.div 
      ref={containerRef}
      className="w-full h-screen sticky top-0 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a0b3d 50%, #0f0f23 100%)'
      }}
    >
      {/* Animated Crystal Placeholder */}
      <motion.div 
        className="relative"
        style={{ 
          rotateY,
          scale
        }}
      >
        {/* Crystal Formation Visualization */}
        <div className="relative w-96 h-96">
          {/* Center Crystal */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-20 bg-gradient-to-t from-blue-400 to-blue-200 opacity-90"
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              filter: 'blur(1px) drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))'
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Surrounding Crystals */}
          {[...Array(7)].map((_, i) => {
            const angle = (i * 360) / 7
            const radius = 120
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius
            
            return (
              <motion.div
                key={i}
                className={`absolute w-12 h-16 bg-gradient-to-t opacity-80`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  background: `linear-gradient(to top, hsl(${220 + i * 20}, 70%, 60%), hsl(${220 + i * 20}, 70%, 80%))`,
                  filter: `blur(0.5px) drop-shadow(0 0 15px hsla(${220 + i * 20}, 70%, 60%, 0.4))`
                }}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.6, 0.9, 0.6],
                  rotateZ: [0, 5, 0]
                }}
                transition={{
                  duration: 2.5 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            )
          })}
        </div>
      </motion.div>
      
      {/* Overlay UI */}
      <div className="absolute top-8 left-8 text-white z-10">
        <h3 className="text-2xl font-bold mb-2">Crystal Formation Preview</h3>
        <p className="text-sm text-gray-300 max-w-xs">
          Scroll to see the animation • 3D model loading...
        </p>
      </div>
      
      {/* Loading indicator for 3D model */}
      <div className="absolute bottom-8 right-8 text-white/70 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span>Loading 3D Crystal Model...</span>
        </div>
      </div>
    </motion.div>
  )
}