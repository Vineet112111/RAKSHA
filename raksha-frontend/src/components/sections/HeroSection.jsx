import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../ui/MagneticButton'
import HUDPanel from '../ui/HUDPanel'
import { useEmergencyStore } from '../../stores/emergencyStore'

gsap.registerPlugin(ScrollTrigger)

const metrics = [
  { label: 'Active Guardians', value: '2,847', icon: '🛡' },
  { label: 'Safe Zones', value: '1,256', icon: '📍' },
  { label: 'Response Time', value: '< 8s', icon: '⚡' },
  { label: 'AI Confidence', value: '99.7%', icon: '🧠' },
]

export default function HeroSection() {
  const sectionRef = useRef(null)
  const activateSOS = useEmergencyStore(s => s.activateSOS)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-metric', {
        y: 40, opacity: 0, stagger: 0.1, duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="section-container min-h-screen relative" id="hero-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <p className="font-hud text-[10px] tracking-[0.4em] text-saffron/60 mb-6">◆ GUARDIAN PROTOCOL v3.0 — OPERATIONAL</p>
            <h2 className="text-4xl md:text-7xl font-bold leading-tight">
              <span className="text-white">Your Safety.</span><br />
              <span className="bg-gradient-to-r from-cyan via-saffron to-orange bg-clip-text text-transparent">Powered By Intelligence.</span>
            </h2>
            <p className="mt-6 text-white/40 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Real-time AI protection, predictive threat analysis, and instant emergency response — every second counts, and RAKSHA never sleeps.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-wrap justify-center gap-4 mt-10">
            <MagneticButton variant="emergency" onClick={activateSOS} id="hero-sos-btn">◉ ACTIVATE SOS</MagneticButton>
            <MagneticButton variant="primary" id="hero-safe-walk-btn">◈ ENTER SAFE WALK MODE</MagneticButton>
          </motion.div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div key={m.label} className="hero-metric">
              <HUDPanel delay={i * 0.1}>
                <div className="text-center">
                  <span className="text-2xl mb-2 block">{m.icon}</span>
                  <p className="font-hud text-2xl md:text-3xl font-bold text-cyan">{m.value}</p>
                  <p className="font-hud text-[8px] tracking-[0.2em] text-white/40 mt-1">{m.label}</p>
                </div>
              </HUDPanel>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
