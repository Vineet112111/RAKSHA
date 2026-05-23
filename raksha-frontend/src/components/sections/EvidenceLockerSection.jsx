import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HUDPanel from '../ui/HUDPanel'

const evidenceItems = [
  { id: 1, type: 'audio', label: 'Ambient Audio Recording', duration: '3:42', size: '2.4 MB', time: '23:07 IST', status: 'recording' },
  { id: 2, type: 'photo', label: 'Auto-Captured Photo', resolution: '4K', size: '3.1 MB', time: '23:05 IST', status: 'saved' },
  { id: 3, type: 'location', label: 'GPS Trail Log', points: '847', size: '124 KB', time: '22:30 IST', status: 'saved' },
  { id: 4, type: 'video', label: 'Dashcam Recording', duration: '12:30', size: '89 MB', time: '22:15 IST', status: 'saved' },
]

const blockchainLedger = [
  { hash: '0x7f3a...c2e1', type: 'Location Proof', time: '23:07:42', verified: true },
  { hash: '0x9b1d...a4f8', type: 'Audio Hash', time: '23:07:38', verified: true },
  { hash: '0x2e5c...d7b3', type: 'Photo Signature', time: '23:05:12', verified: true },
  { hash: '0x6a8f...e1c9', type: 'GPS Snapshot', time: '22:30:05', verified: true },
  { hash: '0x4d2b...f3a6', type: 'Session Start', time: '22:15:00', verified: true },
]

export default function EvidenceLockerSection() {
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [isRecording, setIsRecording] = useState(true)
  const [recordingTime, setRecordingTime] = useState(222) // 3:42
  const canvasRef = useRef(null)

  // Recording timer
  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => setRecordingTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isRecording])

  // Audio waveform for recording indicator
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth * 2
    const h = canvas.height = canvas.offsetHeight * 2
    let t = 0

    const animate = () => {
      t += 0.02
      ctx.clearRect(0, 0, w, h)
      
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      
      for (let x = 0; x < w; x++) {
        const y = h / 2 + 
          Math.sin(x * 0.02 + t * 3) * 15 * (isRecording ? 1 : 0.2) +
          Math.sin(x * 0.05 + t * 2) * 10 * (isRecording ? 1 : 0.1) +
          Math.sin(x * 0.01 + t * 4) * 8 * (isRecording ? 1 : 0.1)
        ctx.lineTo(x, y)
      }
      
      ctx.strokeStyle = isRecording ? 'rgba(255, 46, 46, 0.6)' : 'rgba(0, 217, 255, 0.2)'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Glow
      ctx.shadowColor = isRecording ? 'rgba(255, 46, 46, 0.3)' : 'rgba(0, 217, 255, 0.1)'
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.shadowBlur = 0
      
      requestAnimationFrame(animate)
    }
    animate()
  }, [isRecording])

  useEffect(() => { drawWaveform() }, [drawWaveform])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <section className="section-container min-h-screen relative" id="evidence-locker-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ TAMPER-PROOF EVIDENCE SYSTEM</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">EVIDENCE LOCKER</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            Blockchain-verified evidence collection. Auto-records audio, photos, location, and video — tamper-proof and legally admissible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evidence list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Live recording indicator */}
            <HUDPanel title="LIVE RECORDING">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    isRecording 
                      ? 'bg-emergency/20 border-2 border-emergency/60 shadow-[0_0_20px_rgba(255,46,46,0.3)]' 
                      : 'bg-white/5 border-2 border-white/20 hover:border-cyan/30'
                  }`}
                >
                  {isRecording ? (
                    <div className="w-4 h-4 rounded-sm bg-emergency" />
                  ) : (
                    <div className="w-0 h-0 border-l-[10px] border-l-cyan border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                  )}
                </motion.button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isRecording && <div className="w-2 h-2 rounded-full bg-emergency animate-pulse" />}
                    <span className={`font-hud text-xs ${isRecording ? 'text-emergency' : 'text-white/40'}`}>
                      {isRecording ? 'RECORDING' : 'PAUSED'}
                    </span>
                    <span className="font-hud text-xs text-white/30 ml-auto">{formatTime(recordingTime)}</span>
                  </div>
                  <canvas ref={canvasRef} className="w-full h-8" />
                </div>
              </div>
            </HUDPanel>

            {/* Evidence items */}
            <HUDPanel title="COLLECTED EVIDENCE">
              <div className="space-y-2">
                {evidenceItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedEvidence(item)}
                    className={`flex items-center gap-4 p-3 rounded-sm border cursor-pointer transition-all ${
                      selectedEvidence?.id === item.id 
                        ? 'border-cyan/40 bg-cyan/5' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center text-lg ${
                      item.type === 'audio' ? 'bg-emergency/10 border border-emergency/20' :
                      item.type === 'photo' ? 'bg-cyan/10 border border-cyan/20' :
                      item.type === 'video' ? 'bg-saffron/10 border border-saffron/20' :
                      'bg-green-500/10 border border-green-500/20'
                    }`}>
                      {item.type === 'audio' ? '🎙' : item.type === 'photo' ? '📸' : item.type === 'video' ? '📹' : '📍'}
                    </div>
                    <div className="flex-1">
                      <p className="font-hud text-[10px] tracking-wider text-white/70">{item.label}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {item.duration || item.resolution || `${item.points} points`} • {item.size}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-hud text-[9px] text-white/30">{item.time}</p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'recording' ? 'bg-emergency animate-pulse' : 'bg-green-400'}`} />
                        <span className={`font-hud text-[8px] ${item.status === 'recording' ? 'text-emergency/60' : 'text-green-400/60'}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </HUDPanel>
          </div>

          {/* Blockchain verification */}
          <div className="space-y-4">
            <HUDPanel title="BLOCKCHAIN VERIFICATION">
              <div className="space-y-3">
                {blockchainLedger.map((entry, i) => (
                  <motion.div
                    key={entry.hash}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-2 rounded-sm border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9px] text-cyan/70">{entry.hash}</span>
                      {entry.verified && <span className="text-green-400 text-[10px]">✓</span>}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] text-white/30">{entry.type}</span>
                      <span className="font-hud text-[8px] text-white/20">{entry.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-sm bg-green-500/5 border border-green-500/20 text-center">
                <p className="font-hud text-[9px] text-green-400 tracking-wider">◆ ALL ENTRIES VERIFIED</p>
                <p className="text-[9px] text-white/30 mt-1">Immutable • Tamper-proof • Legally valid</p>
              </div>
            </HUDPanel>

            <HUDPanel title="STORAGE" delay={0.2}>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-hud text-[9px] text-white/40">CLOUD STORAGE</span>
                    <span className="font-hud text-[9px] text-cyan">2.4 / 5 GB</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '48%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-cyan to-saffron rounded-full"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-white/30">Auto-backup: ON</span>
                  <span className="text-green-400/60">Encrypted</span>
                </div>
              </div>
            </HUDPanel>
          </div>
        </div>
      </div>
    </section>
  )
}
