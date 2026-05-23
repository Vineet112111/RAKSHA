import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HUDPanel from '../ui/HUDPanel'

const checkpoints = [
  { name: 'Start Point', status: 'passed', distance: '0m' },
  { name: 'Checkpoint Alpha', status: 'passed', distance: '250m' },
  { name: 'Checkpoint Beta', status: 'current', distance: '600m' },
  { name: 'Safe Zone Gate', status: 'pending', distance: '900m' },
  { name: 'Destination', status: 'pending', distance: '1.2km' },
]

export default function SafeWalkSection() {
  const [timer, setTimer] = useState(420) // 7 min

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(timer / 60)
  const secs = timer % 60

  return (
    <section className="section-container min-h-screen relative" id="safe-walk-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ TACTICAL NAVIGATION</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">SAFE WALK MODE</h2>
          <p className="text-white/40 text-sm">AI-guided walking protection with real-time threat monitoring.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route display */}
          <div className="lg:col-span-2">
            <HUDPanel title="ACTIVE ROUTE — LIVE">
              <div className="relative py-8 px-4">
                {/* Route line */}
                <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan via-cyan/40 to-white/10" />
                {checkpoints.map((cp, i) => (
                  <motion.div
                    key={cp.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative flex items-center gap-6 mb-8 last:mb-0"
                  >
                    <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                      cp.status === 'passed' ? 'bg-cyan border-cyan' :
                      cp.status === 'current' ? 'bg-saffron border-saffron animate-pulse-glow' :
                      'bg-transparent border-white/20'
                    }`}>
                      {cp.status === 'current' && <div className="absolute -inset-2 rounded-full bg-saffron/20 animate-ping" />}
                    </div>
                    <div className="flex-1 glass rounded-sm p-4">
                      <div className="flex justify-between items-center">
                        <span className={`font-hud text-xs ${cp.status === 'current' ? 'text-saffron' : cp.status === 'passed' ? 'text-cyan/70' : 'text-white/30'}`}>{cp.name}</span>
                        <span className="font-hud text-[9px] text-white/30">{cp.distance}</span>
                      </div>
                      {cp.status === 'current' && <p className="text-[10px] text-saffron/60 mt-1 font-hud">● YOU ARE HERE</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </HUDPanel>
          </div>

          {/* Side panels */}
          <div className="space-y-4">
            {/* Timer */}
            <HUDPanel title="ETA TIMER">
              <div className="text-center">
                <p className="font-hud text-5xl font-bold text-cyan">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</p>
                <p className="font-hud text-[9px] text-white/30 mt-2 tracking-wider">ESTIMATED ARRIVAL</p>
                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-cyan to-saffron rounded-full" style={{ width: `${((420 - timer) / 420) * 100}%` }} />
                </div>
              </div>
            </HUDPanel>

            {/* Danger radar */}
            <HUDPanel title="THREAT RADAR" delay={0.2}>
              <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="absolute inset-0 m-auto rounded-full border border-cyan/10" style={{ width: `${i * 25}%`, height: `${i * 25}%` }} />
                ))}
                <div className="absolute inset-0 m-auto animate-radar" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(0,217,255,0.15) 30deg, transparent 60deg)', borderRadius: '50%', width: '100%', height: '100%' }} />
                <div className="absolute top-[30%] left-[60%] w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
                <div className="absolute top-[70%] left-[35%] w-2 h-2 rounded-full bg-saffron animate-pulse-glow" />
              </div>
              <p className="font-hud text-[9px] text-center text-cyan/50 mt-2">2 ENTITIES DETECTED</p>
            </HUDPanel>

            {/* Safe zones nearby */}
            <HUDPanel title="NEARBY SAFE ZONES" delay={0.4}>
              <div className="space-y-2">
                {['Police Station — 0.3km', 'Metro Station — 0.5km', '24/7 Store — 0.2km'].map((z, i) => (
                  <div key={z} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan" />
                    <span className="text-[10px] text-white/50">{z}</span>
                  </div>
                ))}
              </div>
            </HUDPanel>
          </div>
        </div>
      </div>
    </section>
  )
}
