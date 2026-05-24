import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../ui/MagneticButton'
import HUDPanel from '../ui/HUDPanel'
import { useEmergencyStore } from '../../stores/emergencyStore'

gsap.registerPlugin(ScrollTrigger)

const metrics = [
  { label: 'Distress Alerts Resolved', value: '100%', icon: '🛡' },
  { label: 'Active Responders', value: '2,847', icon: '👮' },
  { label: 'Emergency Response Time', value: '< 8s', icon: '⚡' },
  { label: 'Verification Rate', value: '99.9%', icon: '✓' },
]

export default function HeroSection() {
  const sectionRef = useRef(null)
  const activateSOS = useEmergencyStore(s => s.activateSOS)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-metric', {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="section-container relative min-h-[90vh] py-24 flex items-center justify-center" id="hero-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4">
        
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <span className="text-xs font-bold text-saffron tracking-widest uppercase bg-saffron/10 px-4.5 py-1.5 rounded-full">
              RAKSHA Women Safety Network
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white mt-6">
              Your Trusted Security Shield<br />
              <span className="text-saffron">Active & Reliable.</span>
            </h1>
            <p className="mt-6 text-white/50 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Fast, real-time safety tracking, automated WhatsApp responder alerts, and continuous background security monitors designed to protect you, wherever you are.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6, delay: 0.2 }} 
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <MagneticButton variant="emergency" onClick={activateSOS} id="hero-sos-btn">
              Activate SOS Alert
            </MagneticButton>
            <a href="#safe-walk-section">
              <MagneticButton variant="outline" id="hero-safe-walk-btn">
                Safe Walk Mode
              </MagneticButton>
            </a>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {metrics.map((m, i) => (
            <div key={m.label} className="hero-metric">
              <HUDPanel delay={i * 0.08}>
                <div className="text-center">
                  <span className="text-3xl mb-2 block">{m.icon}</span>
                  <p className="text-2xl md:text-3xl font-extrabold text-saffron">{m.value}</p>
                  <p className="text-[10px] font-bold text-white/40 tracking-wider uppercase mt-1.5">{m.label}</p>
                </div>
              </HUDPanel>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
