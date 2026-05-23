import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HUDPanel from '../ui/HUDPanel'
import API from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const incidents = [
  { time: '09:45', type: 'Alert Resolved', location: 'Andheri West', status: 'resolved' },
  { time: '08:12', type: 'Safe Walk Complete', location: 'Bandra Station', status: 'completed' },
  { time: '07:30', type: 'Guardian Activated', location: 'Dadar East', status: 'active' },
  { time: '06:55', type: 'Route Flagged', location: 'Kurla Complex', status: 'warning' },
]

export default function DashboardSection() {
  const chartRef = useRef(null)
  const { isAuthenticated } = useAuth()
  
  // Contacts states
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' })
  const [editingId, setEditingId] = useState(null)
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', relation: '' })

  const drawCharts = useCallback(() => {
    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth * 2
    const h = canvas.height = canvas.offsetHeight * 2
    let t = 0

    const animate = () => {
      t += 0.02
      ctx.clearRect(0, 0, w, h)

      // Radial chart
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.35
      const segments = [
        { value: 0.85, color: 'rgba(0, 217, 255, 0.6)', label: 'Safety' },
        { value: 0.72, color: 'rgba(255, 107, 0, 0.6)', label: 'Response' },
        { value: 0.91, color: 'rgba(0, 217, 255, 0.3)', label: 'Coverage' },
        { value: 0.68, color: 'rgba(255, 138, 0, 0.4)', label: 'AI Score' },
      ]

      segments.forEach((seg, i) => {
        const startAngle = (i / segments.length) * Math.PI * 2 - Math.PI / 2
        const endAngle = startAngle + (seg.value * (Math.PI * 2 / segments.length))
        const segR = r * (0.6 + i * 0.1)

        ctx.beginPath()
        ctx.arc(cx, cy, segR, startAngle, endAngle)
        ctx.strokeStyle = seg.color
        ctx.lineWidth = 8
        ctx.lineCap = 'round'
        ctx.stroke()

        // Background track
        ctx.beginPath()
        ctx.arc(cx, cy, segR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 8
        ctx.stroke()
      })

      // Pulse wave
      const waveY = h * 0.85
      ctx.beginPath()
      ctx.moveTo(0, waveY)
      for (let x = 0; x < w; x++) {
        const y = waveY + Math.sin(x * 0.02 + t * 2) * 15 + Math.sin(x * 0.005 + t) * 8
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.stroke()

      requestAnimationFrame(animate)
    }
    const reqId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(reqId)
  }, [])

  // Load contacts
  const fetchContacts = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError('')
    try {
      const res = await API.get('/contacts')
      if (res.data.success) {
        setContacts(res.data.data)
      }
    } catch (err) {
      setError('Failed to fetch emergency contacts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const cleanAnim = drawCharts()
    fetchContacts()
    return cleanAnim
  }, [drawCharts, fetchContacts])

  // Add Contact
  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!newContact.name || !newContact.phone || !newContact.relation) {
      setError('Please fill in all contact fields')
      return
    }
    setError('')
    try {
      const res = await API.post('/contacts', newContact)
      if (res.data.success) {
        setContacts((prev) => [...prev, res.data.data])
        setNewContact({ name: '', phone: '', relation: '' })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contact')
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id) => {
    setError('')
    try {
      const res = await API.delete(`/contacts/${id}`)
      if (res.data.success) {
        setContacts((prev) => prev.filter((c) => c._id !== id))
      }
    } catch (err) {
      setError('Failed to delete contact')
    }
  };

  // Start Edit
  const startEdit = (contact) => {
    setEditingId(contact._id)
    setEditFormData({ name: contact.name, phone: contact.phone, relation: contact.relation })
  };

  // Save Edit
  const handleSaveEdit = async (id) => {
    setError('')
    try {
      const res = await API.put(`/contacts/${id}`, editFormData)
      if (res.data.success) {
        setContacts((prev) => prev.map((c) => (c._id === id ? res.data.data : c)))
        setEditingId(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update contact')
    }
  };

  return (
    <section className="section-container min-h-screen relative" id="dashboard-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ COMMAND ANALYTICS</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">LIVE DASHBOARD</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radial chart */}
          <div className="lg:col-span-2">
            <HUDPanel title="SYSTEM PERFORMANCE">
              <div className="relative aspect-[4/3]">
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            </HUDPanel>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {[
              { label: 'TOTAL ALERTS TODAY', value: '47', change: '+12%', color: 'cyan' },
              { label: 'ACTIVE GUARDIANS', value: '2,847', change: '+5%', color: 'saffron' },
              { label: 'AVG RESPONSE', value: '7.2s', change: '-18%', color: 'cyan' },
              { label: 'SAFETY INDEX', value: '94.3', change: '+3%', color: 'saffron' },
            ].map((stat, i) => (
              <HUDPanel key={stat.label} delay={i * 0.1}>
                <p className="font-hud text-[9px] text-white/30 tracking-wider">{stat.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <p className={`font-hud text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
                  <span className="font-hud text-[10px] text-green-400">{stat.change}</span>
                </div>
              </HUDPanel>
            ))}
          </div>
        </div>

        {/* Timeline & Contacts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Timeline */}
          <HUDPanel title="INCIDENT TIMELINE">
            <div className="space-y-3">
              {incidents.map((inc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0"
                >
                  <span className="font-hud text-[10px] text-white/30 w-12">{inc.time}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    inc.status === 'resolved' ? 'bg-green-400' :
                    inc.status === 'completed' ? 'bg-cyan' :
                    inc.status === 'active' ? 'bg-saffron animate-pulse-glow' :
                    'bg-orange'
                  }`} />
                  <span className="text-xs text-white/60 flex-1">{inc.type}</span>
                  <span className="font-hud text-[9px] text-white/30">{inc.location}</span>
                </motion.div>
              ))}
            </div>
          </HUDPanel>

          {/* Contacts Manager */}
          <HUDPanel title="EMERGENCY CONTACTS (MAX 5)">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-sm bg-black/20">
                <span className="font-hud text-[10px] text-saffron tracking-widest text-glow-saffron mb-3">[SHIELD DISABLED]</span>
                <p className="text-xs text-white/40 max-w-xs">Please login or create a profile via "SECURE ACCESS" in the navbar to configure emergency contacts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="p-2 border border-emergency/30 bg-emergency/10 rounded-sm">
                    <p className="font-hud text-[9px] text-emergency">[SYSTEM ERROR]: {error}</p>
                  </div>
                )}

                {/* Contacts List */}
                {loading ? (
                  <p className="font-hud text-[10px] text-cyan animate-pulse">UPLINKING DATABASE...</p>
                ) : contacts.length === 0 ? (
                  <p className="text-xs text-white/30 italic">No emergency contacts configured yet. Add some below.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {contacts.map((contact) => (
                      <div key={contact._id} className="p-3 border border-white/5 bg-white/[0.02] flex items-center justify-between rounded-sm">
                        {editingId === contact._id ? (
                          <div className="flex flex-col gap-2 w-full pr-2">
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              placeholder="Name"
                              className="bg-black border border-white/15 text-xs text-white p-1 rounded-sm outline-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                placeholder="Phone"
                                className="bg-black border border-white/15 text-[10px] text-white p-1 rounded-sm outline-none"
                              />
                              <input
                                type="text"
                                value={editFormData.relation}
                                onChange={(e) => setEditFormData({ ...editFormData, relation: e.target.value })}
                                placeholder="Relation"
                                className="bg-black border border-white/15 text-[10px] text-white p-1 rounded-sm outline-none"
                              />
                            </div>
                            <div className="flex gap-2 justify-end mt-1">
                              <button onClick={() => setEditingId(null)} className="font-hud text-[8px] text-white/50 hover:text-white">[CANCEL]</button>
                              <button onClick={() => handleSaveEdit(contact._id)} className="font-hud text-[8px] text-cyan hover:text-white">[SAVE]</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-hud text-[11px] text-white/80">{contact.name}</span>
                                <span className="font-hud text-[8px] bg-cyan/10 border border-cyan/20 text-cyan px-1 rounded-sm">{contact.relation.toUpperCase()}</span>
                              </div>
                              <p className="font-hud text-[10px] text-white/40">{contact.phone}</p>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => startEdit(contact)}
                                className="font-hud text-[8px] text-cyan/70 hover:text-cyan tracking-wider transition-colors"
                              >
                                [EDIT]
                              </button>
                              <button
                                onClick={() => handleDeleteContact(contact._id)}
                                className="font-hud text-[8px] text-emergency/70 hover:text-emergency tracking-wider transition-colors"
                              >
                                [DELETE]
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Contact Form (if < 5) */}
                {contacts.length < 5 && (
                  <form onSubmit={handleAddContact} className="pt-4 border-t border-white/5 space-y-3">
                    <p className="font-hud text-[9px] text-white/30 tracking-widest">◆ ADD EMERGENCY RESPONDER</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="Name"
                        className="bg-black/50 border border-white/10 focus:border-cyan/50 text-xs text-white p-2 rounded-sm outline-none transition-all placeholder:text-white/20"
                      />
                      <input
                        type="text"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="Phone Number"
                        className="bg-black/50 border border-white/10 focus:border-cyan/50 text-xs text-white p-2 rounded-sm outline-none transition-all placeholder:text-white/20"
                      />
                      <input
                        type="text"
                        value={newContact.relation}
                        onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                        placeholder="Relation (e.g. Mom)"
                        className="bg-black/50 border border-white/10 focus:border-cyan/50 text-xs text-white p-2 rounded-sm outline-none transition-all placeholder:text-white/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-cyan/10 border border-cyan/30 hover:border-cyan hover:bg-cyan/20 text-cyan hover:text-white font-hud text-[9px] tracking-widest p-2.5 rounded-sm transition-all duration-300 cursor-pointer"
                    >
                      REGISTER RESPONDER
                    </button>
                  </form>
                )}
              </div>
            )}
          </HUDPanel>
        </div>
      </div>
    </section>
  )
}
