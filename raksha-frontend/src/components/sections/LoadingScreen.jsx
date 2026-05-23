import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('loading') // loading | reveal | done
  const canvasRef = useRef(null)

  // Pulse canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animFrame
    let startTime = Date.now()

    const draw = () => {
      const w = canvas.width = canvas.offsetWidth * 2
      const h = canvas.height = canvas.offsetHeight * 2
      ctx.clearRect(0, 0, w, h)
      const t = (Date.now() - startTime) / 1000

      // Pulse rings
      for (let i = 0; i < 5; i++) {
        const radius = ((t * 80 + i * 60) % 300)
        const alpha = 1 - radius / 300
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 217, 255, ${alpha * 0.3})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.05)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      animFrame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animFrame)
  }, [])

  // Progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setPhase('reveal'), 300)
          setTimeout(() => {
            setPhase('done')
            onComplete?.()
          }, 2500)
          return 100
        }
        return prev + Math.random() * 8 + 2
      })
    }, 100)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-navy-dark"
          id="loading-screen"
        >
          {/* Background canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-40"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: phase === 'reveal' ? 1 : progress > 30 ? 1 : 0,
                scale: phase === 'reveal' ? 1.1 : 1,
              }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
              className="mb-8 text-center"
            >
              <h1 className="font-hud text-5xl md:text-7xl font-bold text-glow tracking-[0.15em]">
                RAKSHA
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: progress > 50 ? 1 : 0 }}
                className="font-display text-3xl md:text-4xl text-cyan/70 mt-2"
              >
                रक्षा
              </motion.p>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: progress > 60 ? 0.6 : 0 }}
              className="font-hud text-[10px] tracking-[0.3em] text-white/40 mb-12"
            >
              WOMEN SAFETY COMMAND SYSTEM
            </motion.p>

            {/* Progress bar */}
            <div className="w-64 md:w-80">
              <div className="flex justify-between mb-2">
                <span className="font-hud text-[9px] tracking-widest text-cyan/50">INITIALIZING</span>
                <span className="font-hud text-[9px] tracking-widest text-cyan/50">
                  {Math.min(Math.round(progress), 100)}%
                </span>
              </div>
              <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan via-saffron to-cyan"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-3">
                {['SYS', 'NET', 'GPS', 'AI', 'SEC'].map((label, i) => (
                  <motion.span
                    key={label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: progress > (i + 1) * 18 ? 1 : 0.2 }}
                    className="font-hud text-[8px] tracking-widest text-cyan/60"
                  >
                    {label} ✓
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
