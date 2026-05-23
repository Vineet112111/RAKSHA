import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function GlowCard({ children, className = '', glowColor = 'cyan' }) {
  const cardRef = useRef(null)
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGlowPosition({ x, y })
  }, [])

  const colors = {
    cyan: 'rgba(0, 217, 255, 0.15)',
    saffron: 'rgba(255, 107, 0, 0.15)',
    emergency: 'rgba(255, 46, 46, 0.15)',
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`relative glass rounded-sm overflow-hidden group ${className}`}
      style={{
        background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, ${colors[glowColor]}, transparent 60%), rgba(13, 27, 42, 0.6)`,
      }}
    >
      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, ${colors[glowColor]}, transparent 50%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
