import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const callers = [
  { id: 'mom', name: 'आई', label: 'Mom', avatar: '👩' },
  { id: 'boss', name: 'Manager', label: 'Boss', avatar: '👔' },
  { id: 'police', name: 'Police Control', label: 'Police', avatar: '👮' },
  { id: 'office', name: 'Emergency Office', label: 'Office', avatar: '🏢' },
]

export default function FakeCallSection() {
  const [activeCaller, setActiveCaller] = useState(null)
  const [callState, setCallState] = useState('idle') // idle | ringing | connected | ended

  const startCall = (caller) => {
    setActiveCaller(caller)
    setCallState('ringing')
    setTimeout(() => setCallState('connected'), 3000)
  }

  const endCall = () => {
    setCallState('ended')
    setTimeout(() => { setCallState('idle'); setActiveCaller(null) }, 1000)
  }

  return (
    <section className="section-container min-h-screen relative" id="fake-call-section">
      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ DECOY SYSTEM</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">FAKE CALL</h2>
          <p className="text-white/40 text-sm">Realistic emergency call simulation. Escape any situation instantly.</p>
        </motion.div>

        {/* Caller selection */}
        {callState === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {callers.map(c => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startCall(c)}
                className="glass rounded-lg p-6 text-center cursor-pointer hover:border-cyan/30 transition-all group"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{c.avatar}</span>
                <p className="font-display text-lg text-white">{c.name}</p>
                <p className="font-hud text-[9px] text-white/40 tracking-wider mt-1">{c.label}</p>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Call simulation */}
        <AnimatePresence>
          {activeCaller && callState !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mx-auto max-w-sm"
            >
              <div className="glass rounded-3xl overflow-hidden border border-white/10">
                {/* Status bar */}
                <div className="flex justify-between items-center px-6 py-2 text-[10px] text-white/40">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <span>📶</span><span>🔋</span>
                  </div>
                </div>

                <div className="p-8 text-center">
                  {/* Caller */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className={`absolute inset-0 rounded-full ${callState === 'ringing' ? 'animate-[ring-expand_1.5s_ease-out_infinite]' : ''} bg-cyan/10`} />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan/20 to-saffron/20 border border-white/10 flex items-center justify-center">
                      <span className="text-5xl">{activeCaller.avatar}</span>
                    </div>
                  </div>

                  <p className="font-display text-2xl text-white mb-1">{activeCaller.name}</p>
                  <p className="font-hud text-[10px] text-white/40 tracking-widest mb-8">
                    {callState === 'ringing' ? 'INCOMING CALL...' : callState === 'connected' ? '● CONNECTED' : 'CALL ENDED'}
                  </p>

                  {/* Waveform */}
                  {callState === 'connected' && (
                    <div className="flex items-center justify-center gap-1 mb-8 h-8">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, Math.random() * 28 + 4, 4] }}
                          transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, repeatType: 'reverse' }}
                          className="w-1 bg-cyan/40 rounded-full"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-center gap-6">
                    {callState === 'ringing' && (
                      <>
                        <button onClick={endCall} className="w-16 h-16 rounded-full bg-emergency/20 border border-emergency/40 flex items-center justify-center cursor-pointer hover:bg-emergency/30 transition-colors">
                          <span className="text-2xl">📵</span>
                        </button>
                        <button onClick={() => setCallState('connected')} className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center cursor-pointer hover:bg-green-500/30 transition-colors">
                          <span className="text-2xl">📞</span>
                        </button>
                      </>
                    )}
                    {callState === 'connected' && (
                      <button onClick={endCall} className="w-16 h-16 rounded-full bg-emergency/20 border border-emergency/40 flex items-center justify-center cursor-pointer hover:bg-emergency/30 transition-colors">
                        <span className="text-2xl">📵</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
