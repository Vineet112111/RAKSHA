import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'

export default function TrackingPage({ sosId }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sosDetails, setSosDetails] = useState(null)
  const [pathPoints, setPathPoints] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)

  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const polylineRef = useRef(null)
  const socketRef = useRef(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

  // 1. Fetch initial public SOS status & coordinates
  useEffect(() => {
    const fetchSOSData = async () => {
      try {
        const res = await axios.get(`${API_URL}/sos/public-track/${sosId}`)
        if (res.data.success && res.data.data) {
          const data = res.data.data
          setSosDetails(data)
          setPathPoints([[data.latitude, data.longitude]])
          setLastUpdated(new Date(data.updatedAt).toLocaleTimeString())
          setLoading(false)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch emergency tracking details')
        setLoading(false)
      }
    };
    fetchSOSData()
  }, [sosId])

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (loading || error || !sosDetails || !window.L) return

    const initialLat = sosDetails.latitude
    const initialLng = sosDetails.longitude

    // Clean up previous instance if double-mounting
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // Initialize Map centered on the location
    const map = window.L.map('leaflet-tracking-map').setView([initialLat, initialLng], 16)
    
    // Add standard OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Custom CSS DivIcon for pulsing indicator
    const customIcon = window.L.divIcon({
      className: 'custom-tracking-marker',
      html: `<div class="relative w-8 h-8 flex items-center justify-center">
               <div class="absolute w-8 h-8 rounded-full ${sosDetails.status === 'safe' ? 'bg-green-500/30' : 'bg-red-500/40 animate-ping'}"></div>
               <div class="w-4.5 h-4.5 rounded-full ${sosDetails.status === 'safe' ? 'bg-green-500' : 'bg-red-600'} border-2 border-white shadow-lg"></div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })

    // Add Marker
    const marker = window.L.marker([initialLat, initialLng], { icon: customIcon }).addTo(map)
    
    // Add Polyline track trail
    const polyline = window.L.polyline([[initialLat, initialLng]], {
      color: sosDetails.status === 'safe' ? '#22C55E' : '#D90429',
      weight: 4,
      opacity: 0.7,
      dashArray: '4, 8'
    }).addTo(map)

    mapRef.current = map
    markerRef.current = marker
    polylineRef.current = polyline

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [loading, error, sosDetails])

  // 3. Connect WebSockets to stream locations in real-time
  useEffect(() => {
    if (loading || error || !sosDetails || sosDetails.status !== 'active') return

    // Connect socket client
    socketRef.current = io(SOCKET_URL)
    const socket = socketRef.current

    // Join room for this SOS incident
    socket.emit('join-sos-room', { sosId })
    console.log(`[SOCKET TRACKING] Connected and joined room: sos-${sosId}`)

    // Listen for live location coordinates streamed from sender
    socket.on('receive-location', (coords) => {
      const { latitude, longitude, timestamp } = coords
      console.log('[SOCKET TRACKING] Location update received:', latitude, longitude)

      setLastUpdated(new Date(timestamp).toLocaleTimeString())
      setPathPoints((prev) => {
        const nextPoints = [...prev, [latitude, longitude]]
        
        // Update Leaflet map state dynamically
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude])
        }
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(nextPoints)
        }
        if (mapRef.current) {
          mapRef.current.panTo([latitude, longitude])
        }
        
        return nextPoints
      })
    })

    // Listen for safety status updates
    socket.on('sos-ended', (data) => {
      console.log('[SOCKET TRACKING] SOS ended event received:', data)
      setSosDetails((prev) => ({
        ...prev,
        status: data.status // 'safe' or 'cancelled'
      }))
      
      // Update Marker Visuals to Safe Green
      if (markerRef.current) {
        const safeIcon = window.L.divIcon({
          className: 'custom-tracking-marker',
          html: `<div class="relative w-8 h-8 flex items-center justify-center">
                   <div class="absolute w-8 h-8 rounded-full bg-green-500/30"></div>
                   <div class="w-4.5 h-4.5 rounded-full bg-green-500 border-2 border-white shadow-lg"></div>
                 </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
        markerRef.current.setIcon(safeIcon)
      }
      
      if (polylineRef.current) {
        polylineRef.current.setStyle({ color: '#22C55E' })
      }
      
      socket.disconnect()
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        console.log('[SOCKET TRACKING] Socket connection disconnected')
      }
    }
  }, [loading, error, sosDetails?.status, sosId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className="w-12 h-12 border-4 border-saffron/20 border-t-saffron rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-saffron uppercase animate-pulse">
          Establishing Secure Telemetry Link...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className="w-16 h-16 rounded-full bg-emergency/10 border border-emergency/30 flex items-center justify-center mb-4">
          <span className="text-emergency text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Tracking Failed</h2>
        <p className="text-xs text-white/50 max-w-sm mb-6">{error}</p>
        <a 
          href="/" 
          className="text-xs font-semibold bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg border border-white/15"
        >
          Return to Dashboard
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative z-10">
      {/* Sidebar Details Card */}
      <div className="w-full lg:w-96 bg-navy-dark border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col justify-between z-20 shadow-2xl">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold text-saffron uppercase tracking-widest bg-saffron/10 px-2.5 py-1 rounded-full">
              Live Location Feed
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-3">RAKSHA Active Shield</h2>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div>
              <p className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">User in Distress</p>
              <p className="text-sm font-bold text-white mt-1">{sosDetails.userName}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">Incident Code</p>
              <p className="text-xs font-mono text-saffron font-bold mt-1">{sosDetails.sosId}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">Status Badge</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`relative flex h-2.5 w-2.5`}>
                  {sosDetails.status === 'active' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    sosDetails.status === 'active' ? 'bg-emergency' : 'bg-green-500'
                  }`}></span>
                </span>
                <span className={`text-xs font-bold uppercase ${
                  sosDetails.status === 'active' ? 'text-emergency' : 'text-green-400'
                }`}>
                  {sosDetails.status === 'active' ? 'SOS Active Tracking' : 'Distress Resolved (SAFE)'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 text-xs text-white/50">
            <div className="flex justify-between">
              <span>Last Telemetry Update</span>
              <span className="text-white/80 font-bold">{lastUpdated}</span>
            </div>
            <div className="flex justify-between">
              <span>Points Tracked</span>
              <span className="text-white/80 font-bold">{pathPoints.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Latest Coordinates</span>
              <span className="text-white/80 font-bold font-mono">
                {pathPoints[pathPoints.length - 1] ? `${pathPoints[pathPoints.length - 1][0].toFixed(5)}, ${pathPoints[pathPoints.length - 1][1].toFixed(5)}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-[10px] text-white/30 space-y-2 leading-relaxed">
          <p>
            🚨 <strong>Incident Note:</strong> This telemetry map tracks emergency GPS signals dispatched from the RAKSHA application. Information provided is immutable and synced via WebSockets.
          </p>
          <a 
            href="/" 
            className="block text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/70 hover:text-white py-2.5 rounded-lg border border-white/10 mt-4 transition-colors"
          >
            Go to Console
          </a>
        </div>
      </div>

      {/* Map display */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 relative z-10">
        <div id="leaflet-tracking-map" className="w-full h-full min-h-[500px] lg:min-h-0" />
      </div>
    </div>
  )
}
