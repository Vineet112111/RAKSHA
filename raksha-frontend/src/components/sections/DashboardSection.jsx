import { useRef, useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
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
      t += 0.015
      ctx.clearRect(0, 0, w, h)

      // Radial chart representing safety indicators
      const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.35
      const segments = [
        { value: 0.94, color: 'rgba(255, 107, 0, 0.85)', label: 'Response Rate' },
        { value: 0.88, color: 'rgba(27, 38, 59, 0.9)', label: 'Coverage Area' },
        { value: 0.97, color: 'rgba(0, 180, 216, 0.8)', label: 'System Uptime' },
        { value: 0.76, color: 'rgba(217, 4, 41, 0.7)', label: 'Alert Resolution' },
      ]

      segments.forEach((seg, i) => {
        const startAngle = (i / segments.length) * Math.PI * 2 - Math.PI / 2
        const endAngle = startAngle + (seg.value * (Math.PI * 2 / segments.length))
        const segR = r * (0.65 + i * 0.1)

        // Draw track
        ctx.beginPath()
        ctx.arc(cx, cy, segR, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
        ctx.lineWidth = 6
        ctx.stroke()

        // Draw progress
        ctx.beginPath()
        ctx.arc(cx, cy, segR, startAngle, endAngle)
        ctx.strokeStyle = seg.color
        ctx.lineWidth = 8
        ctx.lineCap = 'round'
        ctx.stroke()
      })

      // Clean, low-frequency wave indicator
      const waveY = h * 0.9
      ctx.beginPath()
      ctx.moveTo(0, waveY)
      for (let x = 0; x < w; x++) {
        const y = waveY + Math.sin(x * 0.015 + t) * 10
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(255, 107, 0, 0.25)'
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
    <section className="py-24 relative" id="dashboard-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-xs font-bold text-saffron uppercase tracking-widest bg-saffron/10 px-3 py-1 rounded-full">
            Command Shield
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-2">Security Dashboard</h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Manage your trusted circle of emergency contacts and track local security metrics.
          </p>
        </motion.div>

        {/* Stats & System Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 safety-card p-6">
            <h3 className="text-sm font-semibold tracking-wider text-white/40 uppercase mb-4">Safety Shield Performance</h3>
            <div className="relative aspect-[16/9] w-full flex items-center justify-center">
              <canvas ref={chartRef} className="w-full h-full max-h-[260px]" />
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Active SOS Responders', value: '24/7 Live', change: 'Online', color: 'text-saffron' },
              { label: 'Avg Emergency Response', value: '8.4 sec', change: 'Optimized', color: 'text-green-400' },
              { label: 'Coverage Verification', value: '98.6%', change: 'Stable', color: 'text-saffron' },
              { label: 'Active Safety Guards', value: '1,482', change: 'Active', color: 'text-green-400' },
            ].map((stat, i) => (
              <div key={stat.label} className="safety-card p-5">
                <p className="text-xs text-white/40 font-medium tracking-wide">{stat.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/55">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline & Contacts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Timeline */}
          <div className="safety-card p-6">
            <h3 className="text-sm font-semibold tracking-wider text-white/40 uppercase mb-4">Security Log Trail</h3>
            <div className="space-y-4">
              {incidents.map((inc, i) => (
                <div key={i} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0 last:pb-0">
                  <span className="text-xs text-white/30 font-medium w-12">{inc.time}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    inc.status === 'resolved' ? 'bg-green-400' :
                    inc.status === 'completed' ? 'bg-cyan-400' :
                    'bg-saffron'
                  }`} />
                  <span className="text-xs text-white/70 flex-1 font-medium">{inc.type}</span>
                  <span className="text-[10px] text-white/35 bg-white/5 px-2 py-1 rounded-sm">{inc.location}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts Manager */}
          <div className="safety-card p-6">
            <h3 className="text-sm font-semibold tracking-wider text-white/40 uppercase mb-4">
              Emergency Contacts (Max 5)
            </h3>
            
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] px-4">
                <span className="text-saffron text-sm font-bold tracking-widest">[SHIELD DISABLED]</span>
                <p className="text-xs text-white/40 max-w-xs mt-2">
                  Please log in or create a profile via "Secure Access" in the navbar to configure emergency contacts.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 border border-emergency/30 bg-emergency/10 rounded-lg">
                    <p className="text-xs text-emergency font-medium">[SYSTEM ERROR]: {error}</p>
                  </div>
                )}

                {/* Contacts List */}
                {loading ? (
                  <p className="text-xs text-saffron animate-pulse font-medium">UPLINKING DATABASE...</p>
                ) : contacts.length === 0 ? (
                  <p className="text-xs text-white/35 italic">No emergency contacts configured yet. Add some below.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {contacts.map((contact) => (
                      <div key={contact._id} className="p-3.5 border border-white/5 bg-white/[0.01] flex items-center justify-between rounded-xl">
                        {editingId === contact._id ? (
                          <div className="flex flex-col gap-2.5 w-full pr-2">
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                              placeholder="Name"
                              className="bg-navy border border-white/10 text-xs text-white p-2.5 rounded-lg outline-none focus:border-saffron"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                placeholder="Phone"
                                className="bg-navy border border-white/10 text-xs text-white p-2.5 rounded-lg outline-none focus:border-saffron"
                              />
                              <input
                                type="text"
                                value={editFormData.relation}
                                onChange={(e) => setEditFormData({ ...editFormData, relation: e.target.value })}
                                placeholder="Relation"
                                className="bg-navy border border-white/10 text-xs text-white p-2.5 rounded-lg outline-none focus:border-saffron"
                              />
                            </div>
                            <div className="flex gap-3 justify-end mt-1 text-[10px]">
                              <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white cursor-pointer">CANCEL</button>
                              <button onClick={() => handleSaveEdit(contact._id)} className="text-saffron hover:text-saffron-light font-bold cursor-pointer">SAVE</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white/95">{contact.name}</span>
                                <span className="text-[9px] font-bold bg-saffron/10 border border-saffron/20 text-saffron px-2 py-0.5 rounded-full">
                                  {contact.relation.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-white/40 font-medium">{contact.phone}</p>
                            </div>
                            <div className="flex gap-4 text-xs font-semibold">
                              <button
                                onClick={() => startEdit(contact)}
                                className="text-saffron/75 hover:text-saffron transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteContact(contact._id)}
                                className="text-emergency/75 hover:text-emergency transition-colors cursor-pointer"
                              >
                                Delete
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
                    <p className="text-xs font-semibold text-white/50 tracking-wider">Register Responder Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        placeholder="Name"
                        className="bg-navy border border-white/10 text-xs text-white p-2.5 rounded-lg outline-none focus:border-saffron placeholder:text-white/20"
                      />
                      <input
                        type="text"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        placeholder="Phone Number"
                        className="bg-navy border border-white/10 text-xs text-white p-2.5 rounded-lg outline-none focus:border-saffron placeholder:text-white/20"
                      />
                      <input
                        type="text"
                        value={newContact.relation}
                        onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                        placeholder="Relation (e.g. Mom)"
                        className="bg-navy border border-white/10 text-xs text-white p-2.5 rounded-lg outline-none focus:border-saffron placeholder:text-white/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-saffron hover:bg-saffron-dark text-white font-semibold text-xs tracking-wider py-3 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
                    >
                      Save Emergency Responder
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
