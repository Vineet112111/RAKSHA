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
    primary: 'bg-cyan/10 border-cyan/30 text-cyan hover:bg-cyan/20 hover:border-cyan/60 hover:shadow-[0_0_30px_rgba(0,217,255,0.3)]',
    emergency: 'bg-emergency/10 border-emergency/30 text-emergency hover:bg-emergency/20 hover:border-emergency/60 hover:shadow-[0_0_30px_rgba(255,46,46,0.3)]',
    saffron: 'bg-saffron/10 border-saffron/30 text-saffron hover:bg-saffron/20 hover:border-saffron/60 hover:shadow-[0_0_30px_rgba(255,107,0,0.3)]',
  }

  return (
    <motion.button
      ref={ref}
      id={id}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative overflow-hidden font-hud text-sm tracking-widest
        px-8 py-4 border rounded-sm
        transition-all duration-500 cursor-pointer
        ${variants[variant]}
        ${className}
      `}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/20 animate-[ring-expand_0.8s_ease-out_forwards] pointer-events-none"
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
