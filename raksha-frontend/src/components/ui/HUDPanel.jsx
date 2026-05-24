import { motion } from 'framer-motion'

export default function HUDPanel({ children, title, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={`relative safety-card p-6 ${className}`}
    >
      {/* Title bar */}
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
          <div className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/60">{title}</span>
          <div className="flex-1" />
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-saffron/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          </div>
        </div>
      )}

      {children}
    </motion.div>
  )
}
