import { useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import HUDPanel from '../ui/HUDPanel'
import GlowCard from '../ui/GlowCard'

const features = [
  { icon: '🔍', title: 'Unsafe Route Prediction', desc: 'AI analyzes routes in real-time for potential threats' },
  { icon: '🚨', title: 'Silent Alert Mode', desc: 'Trigger emergency alerts without visible interaction' },
  { icon: '👮', title: 'Police Detection', desc: 'Locates nearest police stations and patrol units' },
  { icon: '🛡', title: 'Smart Guardian', desc: 'Continuous background protection with ML threat models' },
  { icon: '📡', title: 'Emergency Broadcast', desc: 'Multi-channel SOS across SMS, call, and network' },
  { icon: '🧠', title: 'Behavioral Analysis', desc: 'Detects unusual patterns and proactive risk scoring' },
]

export default function AIGuardianSection() {
  const canvasRef = useRef(null)

  const drawNeuralNet = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth * 2
    const h = canvas.height = canvas.offsetHeight * 2
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
    }))

    const animate = () => {
      ctx.fillStyle = 'rgba(6, 15, 26, 0.1)'
      ctx.fillRect(0, 0, w, h)

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 217, 255, 0.5)'
        ctx.fill()
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
          if (d < 150) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0, 217, 255, ${(1 - d / 150) * 0.15})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  useEffect(() => { drawNeuralNet() }, [drawNeuralNet])

  return (
    <section className="section-container min-h-screen relative" id="ai-guardian-section">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-40" />
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ ARTIFICIAL INTELLIGENCE ENGINE</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">AI GUARDIAN</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">Jarvis for women safety. Predictive AI that thinks, analyzes, and protects — before danger arrives.</p>
        </motion.div>

        {/* AI Orb Visualization */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex justify-center mb-16">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan/20 to-saffron/10 animate-pulse-glow" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan/10 to-transparent border border-cyan/20" style={{ animation: 'radar-sweep 3s linear infinite' }} />
            <div className="absolute inset-8 rounded-full bg-cyan/5 border border-cyan/10 animate-breathe" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-hud text-3xl font-bold text-cyan">AI</p>
                <p className="font-hud text-[8px] text-cyan/50 tracking-widest">ACTIVE</p>
              </div>
            </div>
            {/* Orbiting dot */}
            <div className="absolute inset-0 animate-radar">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-saffron shadow-[0_0_10px_rgba(255,107,0,0.6)]" />
            </div>
          </div>
        </motion.div>

        {/* Safety Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <HUDPanel title="DANGER SCORE">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00D9FF" strokeWidth="2" strokeDasharray="12 88" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-hud text-sm text-cyan">12%</span>
              </div>
              <div>
                <p className="font-hud text-xs text-green-400">LOW RISK</p>
                <p className="text-[10px] text-white/30 mt-1">Area is secure</p>
              </div>
            </div>
          </HUDPanel>
          <HUDPanel title="CONFIDENCE" delay={0.1}>
            <div className="text-center">
              <p className="font-hud text-4xl font-bold text-cyan">99.7<span className="text-lg">%</span></p>
              <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden"><div className="h-full w-[99.7%] bg-gradient-to-r from-cyan to-saffron rounded-full" /></div>
            </div>
          </HUDPanel>
          <HUDPanel title="NEARBY UNITS" delay={0.2}>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-[10px] text-white/40">Police Patrol</span><span className="font-hud text-[10px] text-cyan">0.8km</span></div>
              <div className="flex justify-between"><span className="text-[10px] text-white/40">Safe House</span><span className="font-hud text-[10px] text-cyan">1.2km</span></div>
              <div className="flex justify-between"><span className="text-[10px] text-white/40">Hospital</span><span className="font-hud text-[10px] text-saffron">2.1km</span></div>
            </div>
          </HUDPanel>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <GlowCard key={f.title} className="p-5">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-hud text-xs tracking-wider text-cyan mb-2">{f.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  )
}
