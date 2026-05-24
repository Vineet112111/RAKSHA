import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmergencyStore } from '../../stores/emergencyStore'
import { useSOS } from '../../context/SOSContext'
import { useAuth } from '../../context/AuthContext'

export default function SOSSection() {
  const { isEmergency, sosCountdown, alertPhase, activateSOS, resetSOS } = useEmergencyStore()
  const { triggerSOS, cancelSOS, imSafe, activeSOS } = useSOS()
  const { isAuthenticated } = useAuth()

  // Listen to visual state change and trigger backend API
  useEffect(() => {
    const uplinkSOS = async () => {
      if (alertPhase === 'transmitting') {
        console.log('[SOS UPLINK] Fetching GPS coordinates...');
        
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
              console.warn('[SOS GEOLOCATION] Access denied. Falling back to Mumbai demo coordinates.');
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

  const handleSOSClick = () => {
    if (!isAuthenticated) {
      alert('[ACCESS REQUIRED] Please register or sign in via the "Secure Access" button in the navbar to connect with real-time emergency contacts.');
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
    <section className="section-container relative overflow-hidden py-24" id="sos-section">
      <div className="relative z-10 max-w-2xl mx-auto w-full text-center px-4">
        
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <span className="text-xs font-bold text-saffron uppercase tracking-widest bg-saffron/10 px-3 py-1 rounded-full">
            Emergency Dispatch Console
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-2">SOS Alert Trigger</h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Press and hold or tap to send an immediate alert with your live GPS location to all registered contacts.
          </p>
        </motion.div>

        {/* SOS Button Panel */}
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            
            {alertPhase === 'idle' && (
              <motion.div 
                key="idle" 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative"
              >
                {/* Pulsing circles behind button */}
                <div className="absolute inset-0 rounded-full bg-emergency/20 sos-pulse-ring" />
                <div className="absolute inset-0 rounded-full bg-emergency/15 sos-pulse-ring" style={{ animationDelay: '0.6s' }} />
                
                <button
                  onClick={handleSOSClick}
                  id="sos-trigger-btn"
                  className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-emergency hover:bg-emergency-dark flex flex-col items-center justify-center shadow-[0_15px_45px_rgba(217,4,41,0.4)] cursor-pointer transition-all duration-300 transform active:scale-95 group border-4 border-white/10"
                >
                  <span className="text-white text-4xl md:text-5xl font-black tracking-wider uppercase">SOS</span>
                  <span className="text-white/70 text-[10px] font-bold tracking-widest uppercase mt-2 group-hover:text-white transition-colors">
                    Press to Trigger
                  </span>
                </button>
              </motion.div>
            )}

            {alertPhase === 'countdown' && (
              <motion.div 
                key="countdown" 
                initial={{ scale: 1.2, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center"
              >
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-saffron bg-navy-light flex items-center justify-center shadow-2xl mx-auto">
                  <span className="text-7xl font-bold text-saffron">{sosCountdown}</span>
                </div>
                <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mt-6">
                  Transmitting alert in...
                </p>
                <button
                  onClick={handleCancelSOS}
                  className="mt-4 text-xs font-bold text-emergency hover:underline cursor-pointer"
                >
                  Cancel Immediately
                </button>
              </motion.div>
            )}

            {alertPhase === 'transmitting' && (
              <motion.div 
                key="transmitting" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto border-4 border-saffron/20 border-t-saffron rounded-full animate-spin mb-6" />
                <p className="text-saffron text-sm font-semibold tracking-widest uppercase animate-pulse">
                  Establishing Encrypted Uplink...
                </p>
                <p className="text-white/40 text-xs mt-2">Retrieving coordinates & broadcasting...</p>
              </motion.div>
            )}

            {alertPhase === 'transmitted' && (
              <motion.div 
                key="transmitted" 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md mx-auto"
              >
                {/* Active alert details panel */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl mb-6 backdrop-blur-md">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/40 flex items-center justify-center mb-4">
                    <span className="text-green-500 text-2xl font-bold">✓</span>
                  </div>
                  <h3 className="text-lg font-bold text-green-400">Alert Transmitted</h3>
                  <p className="text-white/40 text-xs mt-1">
                    SOS Room ID: <span className="font-semibold text-saffron">{activeSOS?.sosId}</span>
                  </p>
                  
                  <div className="mt-6 border-t border-white/5 pt-4 space-y-3">
                    <div className="flex items-center gap-3 bg-white/[0.02] px-4 py-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-saffron font-semibold">●</span>
                      <span className="text-xs text-white/60 text-left">Real-time GPS tracking stream established.</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/[0.02] px-4 py-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-saffron font-semibold">●</span>
                      <span className="text-xs text-white/60 text-left">WhatsApp emergency dispatches sent to contacts.</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleImSafe}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold text-xs tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    I'M SAFE NOW
                  </button>
                  <button
                    onClick={handleCancelSOS}
                    className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-emergency hover:bg-emergency/10 text-white/80 hover:text-white font-semibold text-xs tracking-wider px-6 py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    CANCEL BEACON
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </section>
  )
}
