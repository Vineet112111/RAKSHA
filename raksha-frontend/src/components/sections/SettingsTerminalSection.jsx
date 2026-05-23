import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HUDPanel from '../ui/HUDPanel'
import CommandTerminal from '../ui/CommandTerminal'

const settingsCategories = [
  {
    id: 'emergency',
    label: 'EMERGENCY',
    icon: '🆘',
    settings: [
      { id: 'auto-sos', label: 'Auto SOS on Fall Detection', desc: 'Triggers SOS when accelerometer detects sudden fall', type: 'toggle', value: true },
      { id: 'shake-sos', label: 'Shake to SOS', desc: 'Shake phone 5 times rapidly to trigger silent SOS', type: 'toggle', value: true },
      { id: 'countdown', label: 'SOS Countdown', desc: 'Seconds before SOS is transmitted', type: 'slider', value: 3, min: 1, max: 10 },
      { id: 'loud-siren', label: 'Loud Siren on SOS', desc: 'Play 120dB siren when SOS is activated', type: 'toggle', value: false },
    ]
  },
  {
    id: 'guardian',
    label: 'AI GUARDIAN',
    icon: '🛡',
    settings: [
      { id: 'auto-guardian', label: 'Auto Guardian After Dark', desc: 'Automatically enables protection after sunset', type: 'toggle', value: true },
      { id: 'voice-detect', label: 'Distress Voice Detection', desc: 'AI listens for screams and distress signals', type: 'toggle', value: true },
      { id: 'route-alert', label: 'Route Deviation Alert', desc: 'Alerts when deviating from usual routes', type: 'toggle', value: true },
      { id: 'sensitivity', label: 'AI Sensitivity', desc: 'How aggressively AI flags potential threats', type: 'slider', value: 7, min: 1, max: 10 },
    ]
  },
  {
    id: 'privacy',
    label: 'PRIVACY',
    icon: '🔒',
    settings: [
      { id: 'stealth', label: 'Stealth Mode', desc: 'Hide RAKSHA icon from home screen', type: 'toggle', value: false },
      { id: 'encrypt', label: 'End-to-End Encryption', desc: 'All communications are encrypted', type: 'toggle', value: true },
      { id: 'anon-report', label: 'Anonymous Reporting', desc: 'Report incidents without revealing identity', type: 'toggle', value: true },
      { id: 'data-local', label: 'Local Data Only', desc: 'Keep evidence only on device', type: 'toggle', value: false },
    ]
  },
]

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange?.(!value)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${
        value ? 'bg-cyan/30 border border-cyan/50' : 'bg-white/10 border border-white/10'
      }`}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-4 h-4 rounded-full transition-colors ${
          value ? 'bg-cyan shadow-[0_0_8px_rgba(0,217,255,0.5)]' : 'bg-white/40'
        }`}
      />
    </button>
  )
}

function Slider({ value, min, max, onChange }) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-1.5 bg-white/10 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan to-saffron rounded-full"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange?.(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan border border-cyan/60 shadow-[0_0_8px_rgba(0,217,255,0.4)]"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      </div>
      <span className="font-hud text-xs text-cyan w-6 text-right">{value}</span>
    </div>
  )
}

export default function SettingsTerminalSection() {
  const [activeCategory, setActiveCategory] = useState('emergency')
  const [settingsState, setSettingsState] = useState(() => {
    const state = {}
    settingsCategories.forEach(cat => {
      cat.settings.forEach(s => { state[s.id] = s.value })
    })
    return state
  })

  const updateSetting = (id, value) => {
    setSettingsState(prev => ({ ...prev, [id]: value }))
  }

  const currentCategory = settingsCategories.find(c => c.id === activeCategory)

  return (
    <section className="section-container min-h-screen relative" id="settings-terminal-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ SYSTEM CONFIGURATION</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">COMMAND CENTER</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            Full system control. Configure every aspect of your protection — from AI sensitivity to stealth mode.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings panel */}
          <div>
            {/* Category tabs */}
            <div className="flex gap-2 mb-4">
              {settingsCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 font-hud text-[9px] tracking-wider py-2.5 px-4 rounded-sm border transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'border-cyan/40 bg-cyan/10 text-cyan'
                      : 'border-white/5 text-white/30 hover:border-white/10 hover:text-white/50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden md:inline">{cat.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HUDPanel title={`${currentCategory?.icon} ${currentCategory?.label} SETTINGS`}>
                  <div className="space-y-4">
                    {currentCategory?.settings.map((setting, i) => (
                      <motion.div
                        key={setting.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-hud text-[10px] tracking-wider text-white/70">{setting.label}</p>
                          <p className="text-[10px] text-white/25 mt-0.5">{setting.desc}</p>
                        </div>
                        {setting.type === 'toggle' ? (
                          <Toggle
                            value={settingsState[setting.id]}
                            onChange={(v) => updateSetting(setting.id, v)}
                          />
                        ) : (
                          <div className="w-32">
                            <Slider
                              value={settingsState[setting.id]}
                              min={setting.min}
                              max={setting.max}
                              onChange={(v) => updateSetting(setting.id, v)}
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </HUDPanel>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Command Terminal */}
          <div>
            <CommandTerminal />
          </div>
        </div>
      </div>
    </section>
  )
}
