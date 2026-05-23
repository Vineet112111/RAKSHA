import { useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'

export default function HolographicCard({ children, className = '' }) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 })
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setTransform({
      rotateX: (y - 0.5) * -15,
      rotateY: (x - 0.5) * 15,
    })
    setGlowPos({ x: x * 100, y: y * 100 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0 })
    setGlowPos({ x: 50, y: 50 })
  }, [])

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      className={`relative group cursor-pointer ${className}`}
      style={{
        perspective: '1000px',
      }}
    >
      <div
        className="relative rounded-lg overflow-hidden transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Holographic shimmer */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `
              radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(0,217,255,0.2), transparent 50%),
              linear-gradient(135deg, 
                rgba(0,217,255,0.05) 0%, 
                rgba(255,107,0,0.05) 25%, 
                rgba(0,217,255,0.08) 50%, 
                rgba(255,107,0,0.05) 75%, 
                rgba(0,217,255,0.05) 100%
              )
            `,
          }}
        />

        {/* Edge glow */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `
              inset 0 0 30px rgba(0,217,255,0.1),
              0 0 20px rgba(0,217,255,0.15),
              0 0 40px rgba(0,217,255,0.05)
            `,
          }}
        />

        {/* Content */}
        <div className="relative z-0 glass rounded-lg border border-white/5 group-hover:border-cyan/20 transition-colors duration-500">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
