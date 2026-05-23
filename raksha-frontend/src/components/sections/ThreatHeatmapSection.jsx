import { useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import HUDPanel from '../ui/HUDPanel'
import HolographicCard from '../ui/HolographicCard'
import AnimatedCounter from '../ui/AnimatedCounter'

const heatmapData = [
  // [x%, y%, intensity 0-1, label]
  [25, 30, 0.9, 'Andheri Station'],
  [40, 55, 0.7, 'Bandra Link'],
  [60, 40, 0.85, 'Dadar Bridge'],
  [75, 25, 0.6, 'Kurla Complex'],
  [35, 70, 0.4, 'Worli Sea Face'],
  [55, 65, 0.3, 'Lower Parel'],
  [20, 50, 0.5, 'Borivali'],
  [80, 60, 0.75, 'Thane'],
  [45, 35, 0.65, 'Sion'],
  [65, 50, 0.45, 'Chembur'],
]

const predictions = [
  { time: '18:00 - 20:00', area: 'Andheri Station Exit', risk: 'HIGH', confidence: 94, trend: '↑' },
  { time: '20:00 - 22:00', area: 'Bandra Linking Road', risk: 'MEDIUM', confidence: 87, trend: '→' },
  { time: '22:00 - 00:00', area: 'Dadar East Bridge', risk: 'HIGH', confidence: 91, trend: '↑' },
  { time: '00:00 - 02:00', area: 'Lower Parel', risk: 'CRITICAL', confidence: 96, trend: '↑↑' },
]

export default function ThreatHeatmapSection() {
  const canvasRef = useRef(null)

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth * 2
    const h = canvas.height = canvas.offsetHeight * 2
    let t = 0

    const animate = () => {
      t += 0.01
      ctx.clearRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.03)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

      // Heatmap blobs
      heatmapData.forEach(([xp, yp, intensity, label]) => {
        const x = (xp / 100) * w
        const y = (yp / 100) * h
        const pulse = Math.sin(t * 2 + x * 0.01) * 0.15 + 0.85
        const r = 40 + intensity * 60

        // Gradient blob
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * pulse)
        if (intensity > 0.7) {
          gradient.addColorStop(0, `rgba(255, 46, 46, ${intensity * 0.4})`)
          gradient.addColorStop(0.5, `rgba(255, 107, 0, ${intensity * 0.2})`)
          gradient.addColorStop(1, 'transparent')
        } else if (intensity > 0.4) {
          gradient.addColorStop(0, `rgba(255, 138, 0, ${intensity * 0.3})`)
          gradient.addColorStop(0.5, `rgba(255, 138, 0, ${intensity * 0.1})`)
          gradient.addColorStop(1, 'transparent')
        } else {
          gradient.addColorStop(0, `rgba(0, 217, 255, ${intensity * 0.3})`)
          gradient.addColorStop(0.5, `rgba(0, 217, 255, ${intensity * 0.1})`)
          gradient.addColorStop(1, 'transparent')
        }

        ctx.beginPath()
        ctx.arc(x, y, r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Center dot
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = intensity > 0.7 ? 'rgba(255, 46, 46, 0.9)' : intensity > 0.4 ? 'rgba(255, 138, 0, 0.9)' : 'rgba(0, 217, 255, 0.9)'
        ctx.fill()

        // Label
        ctx.font = '16px Orbitron'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.textAlign = 'center'
        ctx.fillText(label, x, y - 15)
      })

      // Scan line
      const scanY = ((t * 50) % h)
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(w, scanY)
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  useEffect(() => { drawHeatmap() }, [drawHeatmap])

  return (
    <section className="section-container min-h-screen relative" id="threat-heatmap-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ PREDICTIVE THREAT INTELLIGENCE</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">THREAT HEATMAP</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            ML-powered crime prediction engine. Analyzes historical data, time patterns, and environmental factors to predict high-risk zones.
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'ZONES ANALYZED', value: 12847, suffix: '', color: 'cyan' },
            { label: 'INCIDENTS PREVENTED', value: 847, suffix: '+', color: 'green-400' },
            { label: 'PREDICTION ACCURACY', value: 94.3, suffix: '%', decimals: 1, color: 'saffron' },
            { label: 'ACTIVE SENSORS', value: 3291, suffix: '', color: 'cyan' },
          ].map((stat, i) => (
            <HolographicCard key={stat.label}>
              <div className="p-4 text-center">
                <p className="font-hud text-[8px] tracking-widest text-white/30 mb-2">{stat.label}</p>
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                  className={`font-hud text-2xl md:text-3xl font-bold text-${stat.color}`}
                />
              </div>
            </HolographicCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap */}
          <div className="lg:col-span-2">
            <HUDPanel title="CRIME PROBABILITY HEATMAP — LIVE">
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emergency/60" />
                  <span className="text-[9px] text-white/40">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-saffron/60" />
                  <span className="text-[9px] text-white/40">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan/60" />
                  <span className="text-[9px] text-white/40">Low Risk</span>
                </div>
              </div>
            </HUDPanel>
          </div>

          {/* Predictions */}
          <div>
            <HUDPanel title="AI PREDICTIONS — NEXT 8 HRS">
              <div className="space-y-3">
                {predictions.map((pred, i) => (
                  <motion.div
                    key={pred.area}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-sm border ${
                      pred.risk === 'CRITICAL' ? 'border-emergency/30 bg-emergency/[0.05]' :
                      pred.risk === 'HIGH' ? 'border-saffron/30 bg-saffron/[0.03]' :
                      'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-hud text-[9px] text-white/30">{pred.time}</span>
                      <span className={`font-hud text-[9px] font-bold ${
                        pred.risk === 'CRITICAL' ? 'text-emergency' :
                        pred.risk === 'HIGH' ? 'text-saffron' :
                        'text-cyan'
                      }`}>{pred.risk} {pred.trend}</span>
                    </div>
                    <p className="text-xs text-white/60">{pred.area}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pred.confidence}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: i * 0.15 }}
                          className={`h-full rounded-full ${
                            pred.risk === 'CRITICAL' ? 'bg-emergency' :
                            pred.risk === 'HIGH' ? 'bg-saffron' :
                            'bg-cyan'
                          }`}
                        />
                      </div>
                      <span className="font-hud text-[8px] text-white/30">{pred.confidence}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </HUDPanel>
          </div>
        </div>
      </div>
    </section>
  )
}
