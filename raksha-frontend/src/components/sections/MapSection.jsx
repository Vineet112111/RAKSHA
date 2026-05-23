import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HUDPanel from '../ui/HUDPanel'
import { useSOS } from '../../context/SOSContext'

const safeZones = [
  { name: 'Mumbai Central', lat: 19.0760, lng: 72.8777, type: 'safe' },
  { name: 'Pune Station', lat: 18.5204, lng: 73.8567, type: 'safe' },
  { name: 'Nashik HQ', lat: 19.9975, lng: 73.7898, type: 'safe' },
  { name: 'Nagpur Center', lat: 21.1458, lng: 79.0882, type: 'safe' },
  { name: 'Thane Sector', lat: 19.2183, lng: 72.9781, type: 'danger' },
  { name: 'Aurangabad', lat: 19.8762, lng: 75.3433, type: 'danger' },
]

export default function MapSection() {
  const canvasRef = useRef(null)
  const { liveLocation, trackingCoordinates, joinTrackingRoom, disconnectSocket } = useSOS()
  const [sosIdToTrack, setSosIdToTrack] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [trackingStatus, setTrackingStatus] = useState('IDLE')

  // Projection helper: maps lat/lng into Maharashtra bounding box coordinates on the canvas
  const getCanvasCoords = useCallback((lat, lng, w, h) => {
    // Bounding coordinates of Maharashtra
    const minLat = 15.0
    const maxLat = 22.5
    const minLng = 72.0
    const maxLng = 81.5

    const pctX = (lng - minLng) / (maxLng - minLng)
    const pctY = 1 - (lat - minLat) / (maxLat - minLat) // Flip Y

    const x = (0.1 + pctX * 0.8) * w
    const y = (0.1 + pctY * 0.8) * h
    return { x, y }
  }, [])

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth * 2
    const h = canvas.height = canvas.offsetHeight * 2
    let t = 0

    const animate = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)

      // Grid Lines
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
      for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

      // Maharashtra border outline (projected)
      ctx.beginPath()
      ctx.strokeStyle = isTracking ? 'rgba(255, 46, 46, 0.25)' : 'rgba(0, 217, 255, 0.3)'
      ctx.lineWidth = 2
      const borderPoints = [
        [22.0, 72.6], [21.5, 74.5], [22.2, 76.0], [21.8, 78.5], [22.4, 80.5],
        [20.5, 80.9], [19.2, 80.2], [18.8, 77.8], [17.5, 77.5], [17.8, 76.0],
        [16.0, 74.5], [15.6, 73.8], [17.0, 73.2], [18.5, 72.8], [20.0, 72.6]
      ]
      borderPoints.forEach(([plat, plng], i) => {
        const { x, y } = getCanvasCoords(plat, plng, w, h)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.stroke()
      ctx.fillStyle = isTracking ? 'rgba(255, 46, 46, 0.015)' : 'rgba(0, 217, 255, 0.015)'
      ctx.fill()

      // Radar sweep
      const cx = w * 0.5, cy = h * 0.5
      const angle = t * 0.8
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, Math.min(w, h) * 0.45, angle, angle + 0.5)
      ctx.closePath()
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.45)
      grad.addColorStop(0, isTracking ? 'rgba(255, 46, 46, 0.08)' : 'rgba(0, 217, 255, 0.08)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fill()

      // Plot static safe zones
      safeZones.forEach(zone => {
        const { x, y } = getCanvasCoords(zone.lat, zone.lng, w, h)
        const color = zone.type === 'safe' ? [0, 217, 255] : [255, 107, 0]
        const pulse = Math.sin(t * 3 + x) * 0.5 + 0.5
        
        ctx.beginPath()
        ctx.arc(x, y, 6 + pulse * 8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.join(',')}, ${0.1 * pulse})`
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color.join(',')}, 0.8)`
        ctx.fill()
      })

      // Plot REAL-TIME Telemetry coordinate path (Victim's movement)
      if (isTracking && trackingCoordinates.length > 0) {
        // Draw path lines
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(255, 46, 46, 0.6)'
        ctx.lineWidth = 3
        ctx.setLineDash([5, 5])
        trackingCoordinates.forEach((coord, idx) => {
          const { x, y } = getCanvasCoords(coord.latitude, coord.longitude, w, h)
          idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.stroke()
        ctx.setLineDash([]) // Reset dash

        // Draw last tracked coordinates (Blinking Target)
        if (liveLocation) {
          const { x, y } = getCanvasCoords(liveLocation.latitude, liveLocation.longitude, w, h)
          const pulse = Math.abs(Math.sin(t * 5))
          
          // Outer sweeping radar target rings
          ctx.beginPath()
          ctx.arc(x, y, 15 + pulse * 25, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 46, 46, ${0.8 - pulse * 0.6})`
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Target crosshairs
          ctx.beginPath()
          ctx.moveTo(x - 20, y); ctx.lineTo(x + 20, y)
          ctx.moveTo(x, y - 20); ctx.lineTo(x, y + 20)
          ctx.strokeStyle = 'rgba(255, 46, 46, 0.5)'
          ctx.lineWidth = 1
          ctx.stroke()

          // Target Core
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 46, 46, 0.9)'
          ctx.fill()

          // Text overlay on node
          ctx.font = 'bold 16px monospace'
          ctx.fillStyle = '#ff2e2e'
          ctx.fillText('TARGET ACTIVE', x + 15, y - 5)
        }
      }

      requestAnimationFrame(animate)
    }
    const animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [isTracking, liveLocation, trackingCoordinates, getCanvasCoords])

  useEffect(() => {
    const cleanAnim = drawMap()
    return cleanAnim
  }, [drawMap])

  const handleStartTracking = (e) => {
    e.preventDefault()
    if (!sosIdToTrack.trim()) {
      alert('Please enter a valid SOS ID');
      return
    }
    setIsTracking(true)
    setTrackingStatus('CONNECTING...')
    
    // Connect to specific room
    joinTrackingRoom(sosIdToTrack.trim().toUpperCase(), (endStatus) => {
      setTrackingStatus(`ENDED (${endStatus.toUpperCase()})`)
      setIsTracking(false)
      alert(`[TRACKING RESOLVED] The SOS Beacon was closed: User is ${endStatus.toUpperCase()}.`);
    })

    setTrackingStatus('STREAMING TELEMETRY')
  };

  const handleStopTracking = () => {
    disconnectSocket()
    setIsTracking(false)
    setTrackingStatus('IDLE')
  };

  return (
    <section className="section-container min-h-screen relative" id="map-section">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ HOLOGRAPHIC SURVEILLANCE</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow">LIVE LOCATION GRID</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map display */}
          <div className="lg:col-span-2">
            <HUDPanel title={`MAHARASHTRA — REAL-TIME FEED [STATUS: ${trackingStatus}]`}>
              <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-black/45 border border-white/5">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>
            </HUDPanel>
          </div>
          
          {/* Controls and tracking info */}
          <div className="space-y-4">
            <HUDPanel title="TELEMETRY CONTROLLER">
              <div className="space-y-4">
                {!isTracking ? (
                  <form onSubmit={handleStartTracking} className="space-y-3">
                    <p className="text-xs text-white/40">Enter a victim's active SOS ID code to sync with their live location feed.</p>
                    <input
                      type="text"
                      value={sosIdToTrack}
                      onChange={(e) => setSosIdToTrack(e.target.value)}
                      placeholder="e.g. SOS-7E93B2"
                      className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20"
                    />
                    <button
                      type="submit"
                      className="w-full bg-cyan/15 border border-cyan/40 hover:border-cyan hover:bg-cyan/35 text-cyan hover:text-white font-hud text-xs tracking-wider p-3 rounded-sm transition-all duration-300 cursor-pointer"
                    >
                      ESTABLISH TELEMETRY LINK
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 border border-emergency/30 bg-emergency/10 rounded-sm animate-pulse-glow">
                      <p className="font-hud text-[10px] text-emergency tracking-widest">[STREAMING LIVE BEACON]</p>
                    </div>
                    <button
                      onClick={handleStopTracking}
                      className="w-full bg-black/50 border border-white/10 hover:border-emergency text-white/50 hover:text-emergency font-hud text-xs tracking-wider p-3 rounded-sm transition-all duration-300 cursor-pointer"
                    >
                      DISCONNECT LINK
                    </button>
                  </div>
                )}
              </div>
            </HUDPanel>

            <HUDPanel title="GPS DATA">
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="font-hud text-[9px] text-white/40">LATITUDE</span>
                  <span className={`font-hud text-[9px] ${isTracking && liveLocation ? 'text-emergency text-glow-emergency' : 'text-cyan'}`}>
                    {isTracking && liveLocation ? `${liveLocation.latitude.toFixed(6)}°N` : '19.076000°N'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-hud text-[9px] text-white/40">LONGITUDE</span>
                  <span className={`font-hud text-[9px] ${isTracking && liveLocation ? 'text-emergency text-glow-emergency' : 'text-cyan'}`}>
                    {isTracking && liveLocation ? `${liveLocation.longitude.toFixed(6)}°E` : '72.877700°E'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-hud text-[9px] text-white/40">ACCURACY</span>
                  <span className="font-hud text-[9px] text-cyan">
                    {isTracking && liveLocation && liveLocation.accuracy ? `±${liveLocation.accuracy.toFixed(1)}m` : '±3.2m'}
                  </span>
                </div>
                {isTracking && (
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="font-hud text-[9px] text-white/40">SAMPLES RECEIVED</span>
                    <span className="font-hud text-[9px] text-cyan">{trackingCoordinates.length}</span>
                  </div>
                )}
              </div>
            </HUDPanel>

            <HUDPanel title="SAFE HOUSES AVAILABLE">
              <div className="space-y-3">
                {safeZones.filter(z => z.type === 'safe').slice(0, 3).map(z => (
                  <div key={z.name} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan animate-pulse-glow" />
                    <span className="text-xs text-white/70">{z.name}</span>
                    <span className="ml-auto font-hud text-[9px] text-cyan/60">SECURE</span>
                  </div>
                ))}
              </div>
            </HUDPanel>
          </div>
        </div>
      </div>
    </section>
  )
}
