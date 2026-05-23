import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmergencyStore } from '../../stores/emergencyStore'

export default function FloatingSOSButton() {
  const activateSOS = useEmergencyStore(s => s.activateSOS)
  const isEmergency = useEmergencyStore(s => s.isEmergency)
  const [expanded, setExpanded] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [holding, setHolding] = useState(false)

  useEffect(() => {
    if (!holding) {
      setHoldProgress(0)
      return
    }

    const interval = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setHolding(false)
          setExpanded(false)
          activateSOS()
          return 0
        }
        return prev + 4
      })
    }, 50)

    return () => clearInterval(interval)
  }, [holding, activateSOS])

  if (isEmergency) return null

  return (
    <div className="fixed bottom-6 right-6 z-[95]" id="floating-sos">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-20 right-0 w-56 glass rounded-lg p-4 border border-white/10"
          >
            <p className="font-hud text-[9px] tracking-wider text-emergency/80 mb-3">EMERGENCY ACTIONS</p>
            
            {/* Hold to SOS */}
            <div className="mb-3">
              <button
                onMouseDown={() => setHolding(true)}
                onMouseUp={() => setHolding(false)}
                onMouseLeave={() => setHolding(false)}
                onTouchStart={() => setHolding(true)}
                onTouchEnd={() => setHolding(false)}
                className="w-full relative overflow-hidden rounded-sm bg-emergency/10 border border-emergency/30 p-3 cursor-pointer hover:bg-emergency/20 transition-colors text-left"
              >
                <div
                  className="absolute inset-0 bg-emergency/20"
                  style={{ width: `${holdProgress}%`, transition: 'width 50ms linear' }}
                />
                <div className="relative z-10">
                  <p className="font-hud text-[10px] text-emergency tracking-wider">HOLD FOR SOS</p>
                  <p className="text-[9px] text-white/30 mt-0.5">Hold 2.5s to trigger alert</p>
                </div>
              </button>
            </div>

            {/* Quick actions */}
            {[
              { label: 'Fake Call', icon: '📞', action: () => {} },
              { label: 'Share Location', icon: '📍', action: () => {} },
              { label: 'Record Audio', icon: '🎙', action: () => {} },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 p-2.5 rounded-sm hover:bg-white/5 transition-colors cursor-pointer text-left"
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-hud text-[9px] tracking-wider text-white/50">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setExpanded(!expanded)}
        className={`relative w-14 h-14 rounded-full cursor-pointer transition-all duration-500 ${
          expanded 
            ? 'bg-white/10 border-2 border-white/20' 
            : 'bg-emergency/20 border-2 border-emergency/40 shadow-[0_0_20px_rgba(255,46,46,0.3)] hover:shadow-[0_0_40px_rgba(255,46,46,0.5)]'
        }`}
      >
        {!expanded && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping bg-emergency/10" />
            <div className="absolute -inset-1 rounded-full border border-emergency/20 animate-pulse" />
          </>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-hud text-sm font-bold transition-all ${expanded ? 'text-white/40' : 'text-emergency'}`}>
            {expanded ? '✕' : 'SOS'}
          </span>
        </div>
      </motion.button>
    </div>
  )
}
