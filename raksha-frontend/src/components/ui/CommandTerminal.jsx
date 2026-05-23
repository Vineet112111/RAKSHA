import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const commandHistory = [
  { type: 'system', text: '▸ RAKSHA COMMAND INTERFACE v3.0.0' },
  { type: 'system', text: '▸ Neural Engine: ACTIVE | Uptime: 99.97%' },
  { type: 'system', text: '▸ Connected nodes: 2,847 guardians online' },
  { type: 'divider' },
]

const aiResponses = {
  'help': [
    '▸ Available commands:',
    '  sos          — Trigger emergency SOS alert',
    '  status       — Show system status',
    '  scan         — Scan surroundings for threats',
    '  safezone     — Find nearest safe zones',
    '  contacts     — List emergency contacts',
    '  guardian on  — Enable AI guardian mode',
    '  fakecall     — Trigger decoy call',
    '  report       — Generate safety report',
    '  clear        — Clear terminal',
  ],
  'status': [
    '▸ ═══ SYSTEM STATUS ═══',
    '  CPU:        ███████████░░░ 78%',
    '  Memory:     █████████░░░░░ 64%',
    '  Network:    ████████████░░ 92%',
    '  AI Engine:  █████████████░ 99%',
    '  GPS Lock:   ████████████░░ 94%',
    '▸ All subsystems nominal.',
  ],
  'scan': [
    '▸ Initiating 360° threat scan...',
    '▸ Scanning radio frequencies...',
    '▸ Analyzing CCTV feeds in 500m radius...',
    '▸ Processing pedestrian patterns...',
    '▸ ═══ SCAN COMPLETE ═══',
    '  Threat Level: LOW (12%)',
    '  Nearby People: 47',
    '  Safe Zones: 3 within 500m',
    '  Police Units: 2 within 1km',
    '  Street Lighting: ADEQUATE',
    '▸ Area classified as SAFE.',
  ],
  'safezone': [
    '▸ ═══ NEAREST SAFE ZONES ═══',
    '  1. Police Station — 0.3km NW ●',
    '  2. Metro Station — 0.5km E ●',
    '  3. 24/7 Store — 0.2km S ●',
    '  4. Hospital — 1.2km NE ●',
    '  5. Fire Station — 0.8km W ●',
    '▸ Plotting safest route to nearest zone...',
  ],
  'contacts': [
    '▸ ═══ EMERGENCY CONTACTS ═══',
    '  [1] आई (Mom)      +91 98XXX XXXXX  ✓ READY',
    '  [2] Police Control  112             ✓ READY',
    '  [3] Women Helpline  181             ✓ READY',
    '  [4] Ambulance       108             ✓ READY',
    '▸ All contacts verified and reachable.',
  ],
  'guardian on': [
    '▸ ═══ AI GUARDIAN ACTIVATION ═══',
    '▸ Initializing neural threat model...',
    '▸ Calibrating behavioral analysis...',
    '▸ Loading route prediction engine...',
    '▸ ████████████████████████ 100%',
    '▸ AI Guardian is now ACTIVE.',
    '▸ Monitoring: ambient audio, GPS, accelerometer',
    '▸ Mode: STEALTH — no visible indicators',
  ],
  'report': [
    '▸ ═══ SAFETY REPORT — TODAY ═══',
    '  Alerts Processed:     47',
    '  SOS Triggered:        3',
    '  Fake Calls Made:      12',
    '  Safe Walks Completed: 89',
    '  Routes Flagged:       7',
    '  Avg Response Time:    7.2s',
    '  Guardians Online:     2,847',
    '  Safety Index:         94.3 / 100',
    '▸ Report generated at 23:07 IST.',
  ],
}

export default function CommandTerminal() {
  const [history, setHistory] = useState(commandHistory)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const processCommand = async (cmd) => {
    const trimmed = cmd.trim().toLowerCase()
    setHistory(prev => [...prev, { type: 'input', text: `raksha@cmd:~$ ${cmd}` }])
    setInput('')

    if (trimmed === 'clear') {
      setTimeout(() => setHistory(commandHistory), 300)
      return
    }

    if (trimmed === 'sos') {
      setHistory(prev => [...prev, 
        { type: 'emergency', text: '▸ ⚠ EMERGENCY SOS ACTIVATED ⚠' },
        { type: 'emergency', text: '▸ Broadcasting location to emergency contacts...' },
        { type: 'emergency', text: '▸ Alerting nearest police station...' },
        { type: 'emergency', text: '▸ Recording ambient audio...' },
        { type: 'success', text: '▸ ALL ALERTS TRANSMITTED SUCCESSFULLY.' },
      ])
      return
    }

    if (trimmed === 'fakecall') {
      setIsTyping(true)
      const responses = [
        '▸ Initiating decoy call protocol...',
        '▸ Generating caller identity: आई (Mom)',
        '▸ Simulating incoming call...',
        '▸ 📞 INCOMING CALL — आई',
        '▸ Decoy call is ready. Accept on your device.',
      ]
      for (let i = 0; i < responses.length; i++) {
        await new Promise(r => setTimeout(r, 400))
        setHistory(prev => [...prev, { type: 'system', text: responses[i] }])
      }
      setIsTyping(false)
      return
    }

    const response = aiResponses[trimmed]
    if (response) {
      setIsTyping(true)
      for (let i = 0; i < response.length; i++) {
        await new Promise(r => setTimeout(r, 120))
        setHistory(prev => [...prev, { type: 'system', text: response[i] }])
      }
      setIsTyping(false)
    } else {
      setHistory(prev => [...prev, 
        { type: 'error', text: `▸ Unknown command: "${trimmed}". Type "help" for commands.` }
      ])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim() && !isTyping) {
      processCommand(input)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-lg overflow-hidden border border-cyan/20"
      style={{ background: 'rgba(6, 15, 26, 0.9)' }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-emergency/60" />
          <div className="w-3 h-3 rounded-full bg-saffron/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="font-hud text-[10px] tracking-widest text-white/30 flex-1 text-center">
          RAKSHA COMMAND TERMINAL — ENCRYPTED SESSION
        </span>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
      </div>

      {/* Terminal body */}
      <div
        ref={scrollRef}
        className="h-[400px] overflow-y-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {history.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={`mb-1 ${
                line.type === 'divider' ? 'border-b border-white/5 my-3' :
                line.type === 'input' ? 'text-cyan' :
                line.type === 'error' ? 'text-emergency/80' :
                line.type === 'emergency' ? 'text-emergency font-bold animate-pulse' :
                line.type === 'success' ? 'text-green-400' :
                'text-white/60'
              }`}
            >
              {line.type !== 'divider' && (
                <span style={{ whiteSpace: 'pre' }}>{line.text}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Input line */}
        {!isTyping && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-cyan font-mono text-sm">raksha@cmd:~$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm caret-cyan"
              placeholder="Type a command..."
              autoFocus
            />
          </div>
        )}

        {isTyping && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-cyan"
                />
              ))}
            </div>
            <span className="text-white/30 font-mono text-xs">Processing...</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
