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
    <section className="py-24 relative" id="safe-walk-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6">
        
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-bold text-saffron uppercase tracking-widest bg-saffron/10 px-3 py-1 rounded-full">
            Tactical Guard
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-2">Safe Walk Mode</h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Simulate your route and share telemetry with your emergency contacts for continuous arrival tracking.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route display */}
          <div className="lg:col-span-2">
            <HUDPanel title="ACTIVE WALK ROUTE">
              <div className="relative py-4 px-2">
                {/* Route line */}
                <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-saffron via-saffron/40 to-white/10" />
                {checkpoints.map((cp, i) => (
                  <motion.div
                    key={cp.name}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex items-center gap-6 mb-6 last:mb-0"
                  >
                    <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                      cp.status === 'passed' ? 'bg-saffron border-saffron' :
                      cp.status === 'current' ? 'bg-emergency border-emergency animate-pulse' :
                      'bg-navy-light border-white/20'
                    }`}>
                      {cp.status === 'current' && <div className="absolute -inset-1 rounded-full bg-emergency/25 animate-ping" />}
                    </div>
                    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-semibold ${
                          cp.status === 'current' ? 'text-emergency' : cp.status === 'passed' ? 'text-saffron' : 'text-white/30'
                        }`}>
                          {cp.name}
                        </span>
                        <span className="text-[10px] text-white/30 font-medium">{cp.distance}</span>
                      </div>
                      {cp.status === 'current' && <p className="text-[9px] text-emergency/80 font-bold uppercase mt-1">● Current Checkpoint</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </HUDPanel>
          </div>

          {/* Side panels */}
          <div className="space-y-4">
            {/* Timer */}
            <HUDPanel title="ETA Timer">
              <div className="text-center py-2">
                <p className="text-5xl font-extrabold text-saffron tracking-tight">
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </p>
                <p className="text-[10px] text-white/35 font-bold uppercase tracking-wider mt-2">Time to Destination</p>
                <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-saffron to-emergency rounded-full" 
                    style={{ width: `${((420 - timer) / 420) * 100}%` }} 
                  />
                </div>
              </div>
            </HUDPanel>

            {/* Danger radar */}
            <HUDPanel title="Threat Radar">
              <div className="relative w-full aspect-square max-w-[160px] mx-auto py-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="absolute inset-0 m-auto rounded-full border border-saffron/10" style={{ width: `${i * 25}%`, height: `${i * 25}%` }} />
                ))}
                <div 
                  className="absolute inset-0 m-auto animate-radar" 
                  style={{ 
                    background: 'conic-gradient(from 0deg, transparent, rgba(255,107,0,0.12) 30deg, transparent 60deg)', 
                    borderRadius: '50%', 
                    width: '100%', 
                    height: '100%' 
                  }} 
                />
                <div className="absolute top-[30%] left-[60%] w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-md" />
                <div className="absolute top-[70%] left-[35%] w-2.5 h-2.5 rounded-full bg-saffron animate-pulse shadow-md" />
              </div>
              <p className="text-[10px] text-center text-saffron/70 font-semibold uppercase tracking-wider mt-4">
                2 Secure Points Verified Nearby
              </p>
            </HUDPanel>

            {/* Safe zones nearby */}
            <HUDPanel title="Nearby Safe Havens">
              <div className="space-y-3">
                {['Local Police Unit — 0.3km', 'Metro Station Guard — 0.5km', '24/7 Verified Store — 0.2km'].map((z, i) => (
                  <div key={z} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-saffron" />
                    <span className="text-xs text-white/55 font-medium">{z}</span>
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
