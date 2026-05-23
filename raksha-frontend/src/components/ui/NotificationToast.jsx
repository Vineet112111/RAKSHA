import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const alertTypes = [
  { id: 1, type: 'success', icon: '✓', title: 'Guardian Active', message: 'AI protection mode enabled', color: 'green-400' },
  { id: 2, type: 'warning', icon: '⚠', title: 'Route Alert', message: 'Unfamiliar route detected', color: 'saffron' },
  { id: 3, type: 'info', icon: '◆', title: 'Safe Zone Nearby', message: 'Police station — 300m north', color: 'cyan' },
  { id: 4, type: 'success', icon: '✓', title: 'Contact Synced', message: 'Emergency contacts verified', color: 'green-400' },
  { id: 5, type: 'info', icon: '◆', title: 'System Update', message: 'Threat model updated v3.2.1', color: 'cyan' },
]

export default function NotificationToast() {
  const [notifications, setNotifications] = useState([])
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => {
        const idx = prev % alertTypes.length
        const alert = { ...alertTypes[idx], uid: Date.now() }
        setNotifications(n => [...n.slice(-2), alert])
        
        setTimeout(() => {
          setNotifications(n => n.filter(x => x.uid !== alert.uid))
        }, 4000)
        
        return prev + 1
      })
    }, 6000)

    // Show first notification after 5 seconds
    const initial = setTimeout(() => {
      const alert = { ...alertTypes[0], uid: Date.now() }
      setNotifications([alert])
      setTimeout(() => setNotifications(n => n.filter(x => x.uid !== alert.uid)), 4000)
    }, 5000)

    return () => { clearInterval(interval); clearTimeout(initial) }
  }, [])

  return (
    <div className="fixed top-20 right-4 z-[90] flex flex-col gap-2 max-w-[320px]">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.uid}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="glass rounded-lg p-4 border border-white/10 cursor-pointer hover:border-cyan/30 transition-colors"
            onClick={() => setNotifications(n => n.filter(x => x.uid !== notif.uid))}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border border-${notif.color}/30 bg-${notif.color}/10`}>
                <span className={`text-${notif.color}`}>{notif.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-hud text-[10px] tracking-wider text-white/80">{notif.title}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{notif.message}</p>
              </div>
              <span className="font-hud text-[8px] text-white/20">NOW</span>
            </div>
            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className={`h-[1px] bg-${notif.color}/40 mt-3 rounded-full`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
