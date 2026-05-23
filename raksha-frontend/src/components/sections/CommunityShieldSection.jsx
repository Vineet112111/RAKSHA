import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HUDPanel from '../ui/HUDPanel'

const communityMembers = [
  { id: 1, name: 'Priya S.', status: 'active', distance: '0.3km', avatar: '👩', rating: 4.9, verified: true },
  { id: 2, name: 'Meera K.', status: 'active', distance: '0.5km', avatar: '👩‍🦱', rating: 4.8, verified: true },
  { id: 3, name: 'Anjali R.', status: 'active', distance: '0.7km', avatar: '👩‍💼', rating: 5.0, verified: true },
  { id: 4, name: 'Sneha D.', status: 'walking', distance: '0.2km', avatar: '🚶‍♀️', rating: 4.7, verified: true },
  { id: 5, name: 'Kavita P.', status: 'active', distance: '1.1km', avatar: '👩‍🔬', rating: 4.9, verified: false },
]

const communityAlerts = [
  { text: 'Poorly lit alley near Station Road — avoid after 9 PM', reporter: 'Priya S.', time: '2h ago', severity: 'high', votes: 47 },
  { text: 'Suspicious person loitering near Metro exit Gate 3', reporter: 'Meera K.', time: '4h ago', severity: 'high', votes: 89 },
  { text: 'Construction blocks sidewalk — use alternate route', reporter: 'Anjali R.', time: '6h ago', severity: 'medium', votes: 23 },
  { text: 'New CCTV installed at Linking Road junction', reporter: 'Sneha D.', time: '1d ago', severity: 'positive', votes: 156 },
]

const leaderboard = [
  { name: 'Anjali R.', points: 2847, badge: '🏆', rank: 1 },
  { name: 'Sneha D.', points: 2340, badge: '🥈', rank: 2 },
  { name: 'Priya S.', points: 1987, badge: '🥉', rank: 3 },
  { name: 'Meera K.', points: 1654, badge: '', rank: 4 },
  { name: 'You', points: 1245, badge: '', rank: 5 },
]

export default function CommunityShieldSection() {
  const [activeTab, setActiveTab] = useState('guardians')
  const canvasRef = useRef(null)

  // Network visualization
  const drawNetwork = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth * 2
    const h = canvas.height = canvas.offsetHeight * 2
    
    const nodes = communityMembers.map((m, i) => ({
      x: w * 0.5 + Math.cos(i * Math.PI * 2 / communityMembers.length) * Math.min(w, h) * 0.3,
      y: h * 0.5 + Math.sin(i * Math.PI * 2 / communityMembers.length) * Math.min(w, h) * 0.3,
      status: m.status,
    }))
    
    let t = 0
    const animate = () => {
      t += 0.01
      ctx.clearRect(0, 0, w, h)
      
      // Center node (you)
      const cx = w / 2, cy = h / 2
      ctx.beginPath()
      ctx.arc(cx, cy, 12, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 217, 255, 0.3)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#00D9FF'
      ctx.fill()
      
      // Pulse from center
      const pulseR = ((t * 60) % 150)
      ctx.beginPath()
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 217, 255, ${(1 - pulseR / 150) * 0.3})`
      ctx.lineWidth = 1
      ctx.stroke()
      
      // Draw connections and nodes
      nodes.forEach((node, i) => {
        const nx = node.x + Math.sin(t * 2 + i) * 5
        const ny = node.y + Math.cos(t * 2 + i * 0.7) * 5
        
        // Connection line
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(nx, ny)
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.stroke()
        
        // Data packet traveling along line
        const packetT = (t * 0.5 + i * 0.2) % 1
        const px = cx + (nx - cx) * packetT
        const py = cy + (ny - cy) * packetT
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 217, 255, 0.6)'
        ctx.fill()
        
        // Node
        const color = node.status === 'walking' ? [255, 107, 0] : [0, 217, 255]
        ctx.beginPath()
        ctx.arc(nx, ny, 8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.join(',')}, 0.2)`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(nx, ny, 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.join(',')}, 0.8)`
        ctx.fill()
      })
      
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  useEffect(() => { drawNetwork() }, [drawNetwork])

  const tabs = [
    { id: 'guardians', label: 'GUARDIANS' },
    { id: 'alerts', label: 'COMMUNITY ALERTS' },
    { id: 'leaderboard', label: 'LEADERBOARD' },
  ]

  return (
    <section className="section-container min-h-screen relative" id="community-shield-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ DECENTRALIZED PROTECTION NETWORK</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">COMMUNITY SHIELD</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            Crowd-sourced safety network. Real women, real-time protection. Every guardian matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network visualization */}
          <div>
            <HUDPanel title="GUARDIAN MESH NETWORK">
              <div className="relative aspect-square">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan" />
                  <span className="text-[9px] text-white/40">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-saffron" />
                  <span className="text-[9px] text-white/40">Walking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
                  <span className="text-[9px] text-white/40">You</span>
                </div>
              </div>
            </HUDPanel>
          </div>

          {/* Tabbed content */}
          <div className="lg:col-span-2">
            {/* Tab bar */}
            <div className="flex gap-1 mb-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 font-hud text-[9px] tracking-widest py-3 px-4 rounded-t-sm border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-cyan text-cyan bg-cyan/5'
                      : 'border-transparent text-white/30 hover:text-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'guardians' && (
                <motion.div key="guardians" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <HUDPanel title="NEARBY GUARDIANS">
                    <div className="space-y-3">
                      {communityMembers.map((member, i) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-4 p-3 rounded-sm border border-white/5 hover:border-cyan/20 transition-all"
                        >
                          <div className="relative">
                            <span className="text-2xl">{member.avatar}</span>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-navy-dark ${
                              member.status === 'active' ? 'bg-green-400' : 'bg-saffron'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-hud text-xs text-white/80">{member.name}</span>
                              {member.verified && <span className="text-[9px] text-cyan">✓</span>}
                            </div>
                            <p className="text-[10px] text-white/30 mt-0.5">{member.distance} away • ★ {member.rating}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="font-hud text-[8px] tracking-wider px-3 py-1.5 rounded-sm bg-cyan/10 border border-cyan/20 text-cyan/70 cursor-pointer hover:bg-cyan/20 transition-colors"
                          >
                            CONNECT
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </HUDPanel>
                </motion.div>
              )}

              {activeTab === 'alerts' && (
                <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <HUDPanel title="RECENT COMMUNITY ALERTS">
                    <div className="space-y-3">
                      {communityAlerts.map((alert, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`p-3 rounded-sm border ${
                            alert.severity === 'high' ? 'border-emergency/20 bg-emergency/[0.03]' :
                            alert.severity === 'positive' ? 'border-green-500/20 bg-green-500/[0.03]' :
                            'border-saffron/20 bg-saffron/[0.03]'
                          }`}
                        >
                          <p className="text-xs text-white/60 leading-relaxed">{alert.text}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[9px] text-white/30">by {alert.reporter}</span>
                            <span className="text-[9px] text-white/20">•</span>
                            <span className="text-[9px] text-white/30">{alert.time}</span>
                            <span className="ml-auto font-hud text-[9px] text-cyan/50">▲ {alert.votes}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </HUDPanel>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <HUDPanel title="GUARDIAN LEADERBOARD — THIS MONTH">
                    <div className="space-y-2">
                      {leaderboard.map((entry, i) => (
                        <motion.div
                          key={entry.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`flex items-center gap-4 p-3 rounded-sm border ${
                            entry.name === 'You' ? 'border-cyan/30 bg-cyan/5' : 'border-white/5'
                          }`}
                        >
                          <span className={`font-hud text-lg ${i < 3 ? 'text-saffron' : 'text-white/20'}`}>
                            {entry.badge || `#${entry.rank}`}
                          </span>
                          <span className={`font-hud text-xs flex-1 ${entry.name === 'You' ? 'text-cyan' : 'text-white/70'}`}>
                            {entry.name}
                          </span>
                          <span className="font-hud text-sm text-cyan">{entry.points.toLocaleString()}</span>
                          <span className="font-hud text-[8px] text-white/20">PTS</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-sm bg-cyan/5 border border-cyan/10 text-center">
                      <p className="text-[10px] text-white/40">Earn points by reporting alerts, walking guardians, and community verification</p>
                    </div>
                  </HUDPanel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
