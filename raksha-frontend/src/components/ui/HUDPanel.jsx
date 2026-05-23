import { motion } from 'framer-motion'

export default function HUDPanel({ children, title, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay, ease: [0.23, 1, 0.32, 1] }}
      className={`relative glass rounded-sm p-6 hud-bracket ${className}`}
    >
      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden rounded-sm pointer-events-none">
        <div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/40 to-transparent animate-scan"
        />
      </div>

      {/* Title bar */}
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse-glow" />
          <span className="font-hud text-[10px] tracking-[0.2em] text-cyan/80">{title}</span>
          <div className="flex-1" />
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-saffron/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      )}

      {children}
    </motion.div>
  )
}
