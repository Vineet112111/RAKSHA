import { motion } from 'framer-motion'
import HolographicCard from '../ui/HolographicCard'

const techStack = [
  { name: 'TensorFlow', category: 'AI/ML', desc: 'Threat prediction neural networks', icon: '🧠' },
  { name: 'React Three Fiber', category: '3D ENGINE', desc: 'Immersive holographic interfaces', icon: '🌐' },
  { name: 'WebRTC', category: 'REAL-TIME', desc: 'Peer-to-peer emergency communication', icon: '📡' },
  { name: 'Blockchain', category: 'SECURITY', desc: 'Tamper-proof evidence verification', icon: '🔗' },
  { name: 'GPS + IMU', category: 'SENSORS', desc: 'High-precision location & motion tracking', icon: '📍' },
  { name: 'NLP Engine', category: 'VOICE', desc: 'Hindi/English voice command processing', icon: '🗣' },
  { name: 'Edge Computing', category: 'PERFORMANCE', desc: 'On-device AI for offline operation', icon: '⚡' },
  { name: 'AES-256', category: 'ENCRYPTION', desc: 'Military-grade data encryption', icon: '🔐' },
]

const architecture = [
  { layer: 'PRESENTATION', components: ['React Three Fiber', 'Framer Motion', 'GSAP', 'WebGL'], color: 'cyan' },
  { layer: 'APPLICATION', components: ['Zustand State', 'Service Workers', 'Web Workers', 'IndexedDB'], color: 'saffron' },
  { layer: 'AI ENGINE', components: ['TensorFlow.js', 'NLP Pipeline', 'Anomaly Detection', 'Route ML'], color: 'cyan' },
  { layer: 'COMMUNICATION', components: ['WebRTC', 'WebSocket', 'Push Notifications', 'SMS Gateway'], color: 'saffron' },
  { layer: 'INFRASTRUCTURE', components: ['Edge Nodes', 'CDN', 'Blockchain Ledger', 'Encrypted DB'], color: 'cyan' },
]

export default function TechStackSection() {
  return (
    <section className="section-container min-h-screen relative" id="tech-stack-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ ENGINEERING ARCHITECTURE</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">TECH STACK</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            Built with cutting-edge technology. Every layer optimized for performance, security, and reliability.
          </p>
        </motion.div>

        {/* Tech grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {techStack.map((tech, i) => (
            <HolographicCard key={tech.name}>
              <div className="p-5 text-center">
                <span className="text-3xl mb-3 block">{tech.icon}</span>
                <p className="font-hud text-[8px] tracking-widest text-cyan/50 mb-2">{tech.category}</p>
                <p className="font-hud text-xs text-white/80 mb-1">{tech.name}</p>
                <p className="text-[10px] text-white/30">{tech.desc}</p>
              </div>
            </HolographicCard>
          ))}
        </div>

        {/* Architecture layers */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-6 text-center">◆ SYSTEM ARCHITECTURE</p>
          <div className="space-y-2">
            {architecture.map((layer, i) => (
              <motion.div
                key={layer.layer}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="glass rounded-sm p-4 border border-white/5 hover:border-cyan/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`font-hud text-[9px] tracking-widest text-${layer.color}/60 w-32 shrink-0`}>
                    {layer.layer}
                  </div>
                  <div className="h-[1px] w-8 bg-white/10 shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {layer.components.map(comp => (
                      <span
                        key={comp}
                        className={`font-hud text-[9px] tracking-wider px-3 py-1 rounded-sm border border-${layer.color}/10 bg-${layer.color}/5 text-${layer.color}/60 group-hover:border-${layer.color}/30 transition-colors`}
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Connection lines between layers */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan animate-pulse-glow" />
              <span className="font-hud text-[9px] text-white/20">All layers communicate via encrypted channels</span>
              <div className="w-2 h-2 rounded-full bg-cyan animate-pulse-glow" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
