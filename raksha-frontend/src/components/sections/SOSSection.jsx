import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmergencyStore } from '../../stores/emergencyStore'
import { useSOS } from '../../context/SOSContext'
import { useAuth } from '../../context/AuthContext'

export default function SOSSection() {
  const { isEmergency, sosCountdown, alertPhase, activateSOS, resetSOS } = useEmergencyStore()
  const { triggerSOS, cancelSOS, imSafe, activeSOS } = useSOS()
  const { isAuthenticated } = useAuth()
  const canvasRef = useRef(null)

  // Listen to visual state change and trigger backend API
  useEffect(() => {
    const uplinkSOS = async () => {
      if (alertPhase === 'transmitting') {
        console.log('[SOS UPLINK] Fetching coordinates...');
        
        const transmit = async (lat, lng, isSimulated = false) => {
          const notes = isSimulated 
            ? 'Emergency alert triggered (simulated coordinates).' 
            : 'Emergency alert triggered via RAKSHA SOS console.';
            
          const res = await triggerSOS(lat, lng, notes);
          if (res && res.success) {
            console.log('[SOS UPLINK] Real-time tracking room opened:', res.data.sosId);
            // Move Zustand store to transmitted state
            useEmergencyStore.setState({ alertPhase: 'transmitted' });
          } else {
            alert(`[ERROR] Transmission failed: ${res.message || 'Server connection timed out'}`);
            resetSOS();
          }
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              transmit(pos.coords.latitude, pos.coords.longitude, false);
            },
            (err) => {
              console.warn('[SOS GEOLOCATION] Access denied or timed out. Falling back to simulated coordinates.');
              transmit(19.0760, 72.8777, true); // Fallback Mumbai coordinates
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          console.error('[SOS GEOLOCATION] Geolocation not supported. Using simulation.');
          transmit(19.0760, 72.8777, true);
        }
      }
    };

    uplinkSOS();
  }, [alertPhase, triggerSOS, resetSOS]);

  const drawEmergencyRings = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth * 2
    const h = canvas.height = canvas.offsetHeight * 2
    let t = 0

    const animate = () => {
      t += 0.02
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2, cy = h / 2

      // Emergency rings
      for (let i = 0; i < 8; i++) {
        const radius = ((t * 100 + i * 50) % 400)
        const alpha = (1 - radius / 400) * (isEmergency ? 0.5 : 0.15)
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = isEmergency ? `rgba(255, 46, 46, ${alpha})` : `rgba(0, 217, 255, ${alpha})`
        ctx.lineWidth = isEmergency ? 3 : 1
        ctx.stroke()
      }

      // Center pulse
      const pulseR = 40 + Math.sin(t * 4) * 10
      ctx.beginPath()
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
      ctx.fillStyle = isEmergency ? 'rgba(255, 46, 46, 0.15)' : 'rgba(0, 217, 255, 0.08)'
      ctx.fill()

      requestAnimationFrame(animate)
    }
    const animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [isEmergency])

  useEffect(() => {
    const cleanAnim = drawEmergencyRings()
    return cleanAnim
  }, [drawEmergencyRings])

  const handleSOSClick = () => {
    if (!isAuthenticated) {
      alert('[SECURE ACCESS REQUIRED] Please register or sign in via the "SECURE ACCESS" option in the navbar to connect with real-time dispatch and contacts.');
      return;
    }
    activateSOS()
  };

  const handleCancelSOS = async () => {
    if (activeSOS) {
      const res = await cancelSOS(activeSOS.sosId)
      if (res.success) {
        resetSOS()
      } else {
        alert('Failed to cancel SOS: ' + res.message)
      }
    } else {
      resetSOS()
    }
  };

  const handleImSafe = async () => {
    if (activeSOS) {
      const res = await imSafe(activeSOS.sosId)
      if (res.success) {
        resetSOS()
      } else {
        alert('Failed to mark safe: ' + res.message)
      }
    } else {
      resetSOS()
    }
  };

  return (
    <section className="section-container min-h-screen relative overflow-hidden" id="sos-section">
      {/* Emergency overlay */}
      <AnimatePresence>
        {isEmergency && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <div className="emergency-vignette" />
            {/* Siren sweep */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-emergency/10 to-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      <div className="relative z-10 max-w-3xl mx-auto w-full text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="font-hud text-[10px] tracking-[0.4em] text-emergency/60 mb-4">◆ EMERGENCY PROTOCOL</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow-emergency mb-4">SOS COMMAND</h2>
          <p className="text-white/40 text-sm mb-12">One touch. Instant protection. Every second counts.</p>
        </motion.div>

        {/* SOS Button */}
        <AnimatePresence mode="wait">
          {alertPhase === 'idle' && (
            <motion.div key="idle" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              <button
                onClick={handleSOSClick}
                id="sos-trigger-btn"
                className="relative w-40 h-40 md:w-52 md:h-52 rounded-full cursor-pointer group"
              >
                <div className="absolute inset-0 rounded-full bg-emergency/10 border-2 border-emergency/30 group-hover:border-emergency/60 group-hover:bg-emergency/20 transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(255,46,46,0.4)]" />
                <div className="absolute inset-4 rounded-full bg-emergency/5 border border-emergency/20 animate-pulse-glow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-hud text-3xl md:text-4xl font-bold text-emergency">SOS</span>
                </div>
              </button>
            </motion.div>
          )}

          {alertPhase === 'countdown' && (
            <motion.div key="countdown" initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="animate-glitch">
              <p className="font-hud text-[120px] md:text-[200px] font-black text-emergency text-glow-emergency">{sosCountdown}</p>
              <p className="font-hud text-xs tracking-[0.3em] text-emergency/60 mt-4">TRANSMITTING IN...</p>
            </motion.div>
          )}

          {alertPhase === 'transmitting' && (
            <motion.div key="transmitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="w-20 h-20 mx-auto border-4 border-emergency/30 border-t-emergency rounded-full animate-spin" />
              <p className="font-hud text-lg text-emergency mt-6 animate-pulse-glow">ESTABLISHING ENCRYPTED UPLINK...</p>
            </motion.div>
          )}

          {alertPhase === 'transmitted' && (
            <motion.div key="transmitted" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 border-2 border-green-500/60 flex items-center justify-center mb-6 animate-pulse-glow">
                <span className="text-4xl">✓</span>
              </div>
              <p className="font-hud text-2xl text-green-400 text-glow mb-2">BEACON ACTIVE</p>
              <p className="text-white/40 text-xs mb-1">Room ID: <span className="text-cyan font-bold font-hud">{activeSOS?.sosId || 'SOS-ACTIVE'}</span></p>
              <p className="text-white/40 text-xs mb-8">Transmitting GPS coordinates every 5 seconds...</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                <button
                  onClick={handleCancelSOS}
                  className="bg-black/40 border border-emergency/50 hover:border-emergency text-emergency hover:bg-emergency/15 font-hud text-[10px] tracking-widest p-3 rounded-sm transition-all duration-300 cursor-pointer"
                >
                  CANCEL ALERT
                </button>
                <button
                  onClick={handleImSafe}
                  className="bg-black/40 border border-green-500/50 hover:border-green-500 text-green-400 hover:bg-green-500/15 font-hud text-[10px] tracking-widest p-3 rounded-sm transition-all duration-300 cursor-pointer"
                >
                  I'M SAFE
                </button>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                {['Emergency GPS Broadcast — ACTIVE', 'Alert Uplink to Responders — DISPATCHED', 'Holographic Map Track — ESTABLISHED'].map((c, i) => (
                  <motion.div key={c} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.3 }} className="glass px-4 py-2 rounded-sm font-hud text-[9px] text-cyan/70">{c}</motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
