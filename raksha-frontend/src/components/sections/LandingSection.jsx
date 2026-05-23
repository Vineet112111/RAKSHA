import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'

export default function LandingSection() {
  const sectionRef = useRef(null)
  const radarRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.from('.landing-line', {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 1.2,
        ease: 'power3.out',
        delay: 2.5,
      })

      // Radar rotation
      gsap.to(radarRef.current, {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: 'none',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="section-container min-h-screen relative"
      id="landing-section"
    >
      {/* Radar background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[500px] h-[500px] md:w-[700px] md:h-[700px] opacity-20">
          {/* Radar circles */}
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="absolute inset-0 m-auto rounded-full border border-cyan/20"
              style={{
                width: `${i * 20}%`,
                height: `${i * 20}%`,
              }}
            />
          ))}
          {/* Sweep */}
          <div
            ref={radarRef}
            className="absolute inset-0 m-auto w-full h-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 217, 255, 0.15) 30deg, transparent 60deg)',
              borderRadius: '50%',
            }}
          />
          {/* Cross lines */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan/10" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan/10" />
        </div>
      </div>

      {/* Content */}
      <div ref={titleRef} className="relative z-10 text-center max-w-4xl mx-auto">
        <div className="overflow-hidden mb-4">
          <p className="landing-line font-hud text-[10px] md:text-xs tracking-[0.4em] text-cyan/60 mb-6">
            ● EMERGENCY NETWORK ACTIVE — ALL SYSTEMS ONLINE
          </p>
        </div>

        <div className="overflow-hidden">
          <h1 className="landing-line font-hud text-5xl md:text-8xl font-black text-glow tracking-wider">
            RAKSHA
          </h1>
        </div>
        <div className="overflow-hidden">
          <p className="landing-line font-display text-4xl md:text-6xl text-saffron/80 mt-2 text-glow-saffron">
            रक्षा
          </p>
        </div>

        <div className="overflow-hidden mt-8">
          <p className="landing-line font-hud text-sm md:text-base tracking-[0.2em] text-white/50">
            WOMEN SAFETY COMMAND CENTER
          </p>
        </div>

        <div className="overflow-hidden mt-4">
          <p className="landing-line text-sm md:text-base text-white/30 max-w-lg mx-auto leading-relaxed">
            An AI-powered emergency operating system designed to protect, 
            predict, and respond — in real time.
          </p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1 }}
          className="mt-16 flex flex-col items-center gap-2"
        >
          <span className="font-hud text-[8px] tracking-[0.3em] text-cyan/40">SCROLL TO ENTER</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[1px] h-8 bg-gradient-to-b from-cyan/60 to-transparent"
          />
        </motion.div>
      </div>

      {/* Side HUD elements */}
      <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-40">
        {['LAT 19.0760°N', 'LNG 72.8777°E', 'ALT 14m', 'STATUS: LIVE'].map((text, i) => (
          <motion.span
            key={text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ delay: 3 + i * 0.2 }}
            className="font-hud text-[8px] md:text-[9px] tracking-widest text-cyan/60"
          >
            {text}
          </motion.span>
        ))}
      </div>

      {/* Time display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 3.5 }}
        className="absolute right-4 md:right-8 top-8 font-hud text-[9px] tracking-widest text-cyan/50 text-right"
      >
        <div>MAHARASHTRA, INDIA</div>
        <div className="text-saffron/50 mt-1">SECTOR: ACTIVE</div>
      </motion.div>
    </section>
  )
}
