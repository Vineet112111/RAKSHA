import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { AnimatePresence } from 'framer-motion'
import MainScene from './components/three/MainScene'
import LoadingScreen from './components/sections/LoadingScreen'
import LandingSection from './components/sections/LandingSection'
import HeroSection from './components/sections/HeroSection'
import MapSection from './components/sections/MapSection'
import SOSSection from './components/sections/SOSSection'
import AIGuardianSection from './components/sections/AIGuardianSection'
import FakeCallSection from './components/sections/FakeCallSection'
import SafeWalkSection from './components/sections/SafeWalkSection'
import DashboardSection from './components/sections/DashboardSection'
import { useEmergencyStore } from './stores/emergencyStore'
import { useAuth } from './context/AuthContext'
import { useSOS } from './context/SOSContext'
import useLiveLocation from './hooks/useLiveLocation'
import AuthModal from './components/ui/AuthModal'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'HOME', href: '#landing-section' },
    { label: 'GUARDIAN', href: '#ai-guardian-section' },
    { label: 'SOS', href: '#sos-section' },
    { label: 'MAP', href: '#map-section' },
    { label: 'DASHBOARD', href: '#dashboard-section' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'glass py-3' : 'py-5'}`} id="main-navbar">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <a href="#landing-section" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan/30 to-saffron/20 border border-cyan/30 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,217,255,0.3)] transition-shadow">
              <span className="font-hud text-[10px] font-bold text-cyan">R</span>
            </div>
            <span className="font-hud text-sm tracking-[0.15em] text-white/80 hidden md:block">RAKSHA</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <a key={l.label} href={l.href} className="font-hud text-[10px] tracking-[0.15em] text-white/40 hover:text-cyan transition-colors duration-300">{l.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
              <span className="font-hud text-[9px] tracking-wider text-green-400/70 hidden sm:inline">ONLINE</span>
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="font-hud text-[9px] text-cyan tracking-wider text-glow hidden md:inline">[{user.name.toUpperCase()}]</span>
                <button
                  onClick={logout}
                  className="font-hud text-[8px] tracking-[0.15em] text-emergency border border-emergency/30 hover:border-emergency hover:bg-emergency/10 px-2 py-1 rounded-sm cursor-pointer transition-all duration-300"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="font-hud text-[8px] tracking-[0.15em] text-cyan border border-cyan/30 hover:border-cyan hover:bg-cyan/10 px-2.5 py-1 rounded-sm cursor-pointer transition-all duration-300"
              >
                SECURE ACCESS
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
    <footer className="relative z-10 border-t border-white/5 py-12 px-4" id="footer">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-hud text-lg text-glow mb-3">RAKSHA रक्षा</h3>
            <p className="text-xs text-white/30 leading-relaxed">India's futuristic women safety command system. AI-powered protection for a safer tomorrow.</p>
          </div>
          <div>
            <h4 className="font-hud text-[10px] tracking-widest text-cyan/60 mb-3">EMERGENCY</h4>
            <div className="space-y-2 text-xs text-white/40">
              <p>Women Helpline: <span className="text-cyan">181</span></p>
              <p>Police: <span className="text-cyan">112</span></p>
              <p>Ambulance: <span className="text-cyan">108</span></p>
            </div>
          </div>
          <div>
            <h4 className="font-hud text-[10px] tracking-widest text-cyan/60 mb-3">SYSTEM</h4>
            <div className="space-y-2 text-xs text-white/40">
              <p>Version: <span className="text-cyan">3.0.0</span></p>
              <p>Status: <span className="text-green-400">All Systems Operational</span></p>
              <p>Region: <span className="text-cyan">Maharashtra, India</span></p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 text-center">
          <p className="font-hud text-[9px] tracking-widest text-white/20">© 2026 RAKSHA COMMAND SYSTEMS — BUILT FOR HACKATHON</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  
  // Retrieve store states for emergency overlays
  const isEmergency = useEmergencyStore(s => s.isEmergency)

  // Invoke global real-time GPS location tracker hook
  useLiveLocation();

  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return (
    <div className={`relative min-h-screen ${isEmergency ? 'emergency-active' : ''}`}>
      {/* Loading */}
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {/* 3D Background */}
      <MainScene />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Scanlines */}
      <div className="scanlines" />

      {/* Emergency vignette */}
      {isEmergency && <div className="emergency-vignette" />}

      {/* Navbar */}
      {loaded && <Navbar />}

      {/* Main content */}
      {loaded && (
        <main className="relative z-10">
          <LandingSection />
          <HeroSection />
          <MapSection />
          <SOSSection />
          <AIGuardianSection />
          <FakeCallSection />
          <SafeWalkSection />
          <DashboardSection />
          <Footer />
        </main>
      )}
    </div>
  )
}
