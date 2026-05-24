import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMagnetic } from '../../hooks/useInteractions'

export default function MagneticButton({ children, onClick, variant = 'primary', className = '', id }) {
  const { ref, handleMouseMove, handleMouseLeave } = useMagnetic(0.25)
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newRipple = { x, y, id: Date.now() }
    setRipples(prev => [...prev, newRipple])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 800)
    onClick?.()
  }

  const variants = {
    primary: 'bg-saffron text-white border-transparent hover:bg-saffron-dark shadow-md shadow-saffron/10 hover:shadow-lg hover:shadow-saffron/20',
    emergency: 'bg-emergency text-white border-transparent hover:bg-emergency-dark shadow-md shadow-emergency/10 hover:shadow-lg hover:shadow-emergency/20',
    outline: 'bg-transparent border-white/20 text-white/80 hover:bg-white/5 hover:border-white/40 hover:text-white',
  }

  return (
    <motion.button
      ref={ref}
      id={id}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden font-semibold text-xs tracking-wider uppercase
        px-8 py-4 border rounded-xl
        transition-all duration-300 cursor-pointer
        ${variants[variant]}
        ${className}
      `}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/25 animate-[ring-expand_0.8s_ease-out_forwards] pointer-events-none"
          style={{
            left: ripple.x - 5,
            top: ripple.y - 5,
            width: 10,
            height: 10,
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
