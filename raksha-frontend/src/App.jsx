import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import LoadingScreen from './components/sections/LoadingScreen'
import HeroSection from './components/sections/HeroSection'
import SOSSection from './components/sections/SOSSection'
import FakeCallSection from './components/sections/FakeCallSection'
import SafeWalkSection from './components/sections/SafeWalkSection'
import DashboardSection from './components/sections/DashboardSection'
import TrackingPage from './components/pages/TrackingPage'
import { useEmergencyStore } from './stores/emergencyStore'
import { useAuth } from './context/AuthContext'
import useLiveLocation from './hooks/useLiveLocation'
import AuthModal from './components/ui/AuthModal'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Home', href: '#hero-section' },
    { label: 'SOS Alert', href: '#sos-section' },
    { label: 'Safe Walk', href: '#safe-walk-section' },
    { label: 'Fake Call', href: '#fake-call-section' },
    { label: 'Contacts', href: '#dashboard-section' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-navy/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <a href="#hero-section" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
              <span className="font-semibold text-base text-white">R</span>
            </div>
            <span className="font-semibold text-lg tracking-wide text-white">RAKSHA</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <a 
                key={l.label} 
                href={l.href} 
                className="text-sm font-medium text-white/70 hover:text-saffron transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-400 tracking-wider">SECURED</span>
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-saffron hidden md:inline">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-emergency border border-emergency/30 hover:border-emergency hover:bg-emergency/5 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-xs font-semibold text-white bg-saffron hover:bg-saffron-dark px-4 py-2 rounded-lg shadow-md cursor-pointer transition-all duration-200"
              >
                Secure Access
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-navy-dark py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
          <div>
            <h3 className="text-lg font-bold text-saffron mb-3">RAKSHA रक्षा</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              India's trusted women safety operating system. Fast, reliable response tools designed for real-world scenarios.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Emergency Hotlines</h4>
            <div className="space-y-2 text-sm text-white/40">
              <p>Women Helpline: <span className="text-saffron font-semibold">181</span></p>
              <p>Police Control: <span className="text-saffron font-semibold">112</span></p>
              <p>Ambulance Service: <span className="text-saffron font-semibold">108</span></p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Safety Shield</h4>
            <div className="space-y-2 text-sm text-white/40">
              <p>Status: <span className="text-green-400 font-medium">All Systems Operational</span></p>
              <p>Region: <span className="text-saffron">National Coverage</span></p>
              <p>Version: <span className="text-white/60 font-semibold">4.0.0</span></p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-xs text-white/20">© 2026 RAKSHA SYSTEMS — DESIGNED FOR MAXIMUM RELIABILITY & SAFETY</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const isEmergency = useEmergencyStore(s => s.isEmergency)

  // Invoke global real-time GPS location tracker hook
  useLiveLocation();

  // Route path parsing for /track/:sosId
  const path = window.location.pathname;
  const trackMatch = path.match(/^\/track\/([^\/]+)/);

  if (trackMatch) {
    const sosId = trackMatch[1];
    return (
      <div className="relative min-h-screen bg-navy text-white overflow-x-hidden">
        <div className="warli-bg-watermark" />
        <TrackingPage sosId={sosId} />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen bg-navy text-white overflow-x-hidden ${isEmergency ? 'emergency-active' : ''}`}>
      {/* Subtle Warli Artwork Watermark */}
      <div className="warli-bg-watermark" />

      {/* Emergency red vignette */}
      {isEmergency && <div className="emergency-vignette" />}

      {/* Loading */}
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {/* Navbar */}
      {loaded && <Navbar />}

      {/* Main content */}
      {loaded && (
        <main className="relative z-10">
          <HeroSection />
          <SOSSection />
          <SafeWalkSection />
          <FakeCallSection />
          <DashboardSection />
          <Footer />
        </main>
      )}
    </div>
  )
}
