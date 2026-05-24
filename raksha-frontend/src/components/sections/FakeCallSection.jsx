import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const callers = [
  { id: 'mom', name: 'आई (Mom)', label: 'Family Contact', avatar: '👩' },
  { id: 'boss', name: 'Office Manager', label: 'Work Presets', avatar: '👔' },
  { id: 'police', name: 'Police Helpline', label: 'National SOS', avatar: '👮' },
  { id: 'office', name: 'Office Desk', label: 'Decoy Presets', avatar: '🏢' },
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
    <section className="py-24 relative" id="fake-call-section">
      <div className="relative z-10 max-w-4xl mx-auto w-full px-6">
        
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-bold text-saffron uppercase tracking-widest bg-saffron/10 px-3 py-1 rounded-full">
            Decoy Helper
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-2">Fake Call System</h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Schedule a decoy incoming phone call to safely excuse yourself from uncomfortable situations.
          </p>
        </motion.div>

        {/* Caller selection */}
        {callState === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {callers.map(c => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startCall(c)}
                className="safety-card rounded-2xl p-6 text-center cursor-pointer hover:border-saffron/30 transition-all group"
              >
                <span className="text-4.5xl mb-3 block group-hover:scale-105 transition-transform">{c.avatar}</span>
                <p className="text-base font-bold text-white/90">{c.name}</p>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-1.5">{c.label}</p>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Call simulation */}
        <AnimatePresence>
          {activeCaller && callState !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-auto max-w-xs"
            >
              <div className="bg-navy-dark rounded-[2.25rem] overflow-hidden border border-white/10 shadow-2xl relative">
                {/* Status bar */}
                <div className="flex justify-between items-center px-6 py-3 text-[10px] text-white/30 font-medium">
                  <span>10:42</span>
                  <div className="flex gap-1.5">
                    <span>📶</span><span>🔋</span>
                  </div>
                </div>

                <div className="p-8 text-center">
                  {/* Caller avatar */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    {callState === 'ringing' && (
                      <div className="absolute inset-0 rounded-full bg-saffron/10 animate-ping" />
                    )}
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-saffron/20 to-emergency/10 border border-white/5 flex items-center justify-center">
                      <span className="text-5xl">{activeCaller.avatar}</span>
                    </div>
                  </div>

                  <p className="text-xl font-bold text-white mb-1">{activeCaller.name}</p>
                  <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-8">
                    {callState === 'ringing' ? 'Incoming Call...' : callState === 'connected' ? '● Connected' : 'Call Ended'}
                  </p>

                  {/* Sound Waveform */}
                  {callState === 'connected' && (
                    <div className="flex items-center justify-center gap-1 mb-8 h-8">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, Math.random() * 24 + 4, 4] }}
                          transition={{ duration: 0.4 + Math.random() * 0.4, repeat: Infinity, repeatType: 'reverse' }}
                          className="w-1 bg-saffron/50 rounded-full"
                        />
                      ))}
                    </div>
                  )}

                  {/* Dial Actions */}
                  <div className="flex justify-center gap-6 mt-4">
                    {callState === 'ringing' && (
                      <>
                        <button 
                          onClick={endCall} 
                          className="w-14 h-14 rounded-full bg-emergency hover:bg-emergency-dark flex items-center justify-center cursor-pointer transition-colors shadow-lg shadow-emergency/20"
                        >
                          <span className="text-xl">📵</span>
                        </button>
                        <button 
                          onClick={() => setCallState('connected')} 
                          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center cursor-pointer transition-colors shadow-lg shadow-green-500/20"
                        >
                          <span className="text-xl">📞</span>
                        </button>
                      </>
                    )}
                    {callState === 'connected' && (
                      <button 
                        onClick={endCall} 
                        className="w-14 h-14 rounded-full bg-emergency hover:bg-emergency-dark flex items-center justify-center cursor-pointer transition-colors shadow-lg shadow-emergency/20"
                      >
                        <span className="text-xl">📵</span>
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
