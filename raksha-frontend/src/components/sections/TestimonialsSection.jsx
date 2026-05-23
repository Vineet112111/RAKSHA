import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    quote: 'RAKSHA\'s fake call feature saved me from a very uncomfortable situation. The AI detected that I was in an unfamiliar area late at night and automatically offered to connect me with nearby guardians.',
    avatar: '👩',
    rating: 5,
    feature: 'Fake Call + AI Guardian',
  },
  {
    name: 'Meera Krishnan',
    location: 'Pune, Maharashtra',
    quote: 'The voice command in Hindi is incredible. I just said "RAKSHA, mujhe darr lag raha hai" and it instantly activated stealth guardian mode. No one around me even noticed.',
    avatar: '👩‍💼',
    rating: 5,
    feature: 'Voice Command',
  },
  {
    name: 'Anjali Deshmukh',
    location: 'Nagpur, Maharashtra',
    quote: 'As a night-shift nurse, the Safe Walk mode gives me so much peace of mind. My mother gets notified when I leave work and can track my route home in real-time.',
    avatar: '👩‍⚕️',
    rating: 5,
    feature: 'Safe Walk Mode',
  },
  {
    name: 'Sneha Patil',
    location: 'Nashik, Maharashtra',
    quote: 'The community shield feature connected me with 5 verified guardians in my neighborhood. We look out for each other now. This is what technology should do.',
    avatar: '👩‍🎓',
    rating: 5,
    feature: 'Community Shield',
  },
  {
    name: 'Dr. Kavita Rao',
    location: 'Mumbai, Maharashtra',
    quote: 'The evidence locker with blockchain verification is a game-changer. Finally, technology that gives women not just safety, but the tools to seek justice.',
    avatar: '👩‍⚖️',
    rating: 5,
    feature: 'Evidence Locker',
  },
]

const impactStats = [
  { label: 'Women Protected', value: '50,000+' },
  { label: 'Incidents Prevented', value: '847' },
  { label: 'Cities Covered', value: '12' },
  { label: 'Avg Response Time', value: '7.2s' },
]

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!autoplay) return
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(intervalRef.current)
  }, [autoplay])

  const goTo = (index) => {
    setCurrent(index)
    setAutoplay(false)
    clearInterval(intervalRef.current)
    setTimeout(() => setAutoplay(true), 10000)
  }

  return (
    <section className="section-container min-h-screen relative" id="testimonials-section">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="font-hud text-[10px] tracking-[0.4em] text-cyan/60 mb-4">◆ REAL IMPACT, REAL STORIES</p>
          <h2 className="font-hud text-3xl md:text-5xl font-bold text-glow mb-4">GUARDIAN VOICES</h2>
        </motion.div>

        {/* Impact stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {impactStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-sm p-4 text-center border border-white/5"
            >
              <p className="font-hud text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan to-saffron bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="font-hud text-[8px] tracking-widest text-white/30 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial carousel */}
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="glass rounded-lg p-8 md:p-12 border border-white/5 text-center"
            >
              {/* Quote */}
              <div className="mb-8">
                <span className="text-5xl text-cyan/20 font-display leading-none">"</span>
                <p className="text-base md:text-lg text-white/60 leading-relaxed -mt-6 px-4">
                  {testimonials[current].quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl">{testimonials[current].avatar}</span>
                <div className="text-left">
                  <p className="font-hud text-sm text-white/80">{testimonials[current].name}</p>
                  <p className="text-[10px] text-white/30">{testimonials[current].location}</p>
                </div>
              </div>

              {/* Feature badge */}
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/5 border border-cyan/20">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan" />
                <span className="font-hud text-[9px] tracking-wider text-cyan/60">{testimonials[current].feature}</span>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mt-4">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <span key={i} className="text-saffron text-sm">★</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 cursor-pointer ${
                  i === current
                    ? 'w-8 h-2 rounded-full bg-cyan'
                    : 'w-2 h-2 rounded-full bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Nav arrows */}
          <button
            onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center cursor-pointer hover:border-cyan/30 transition-colors hidden lg:flex"
          >
            <span className="text-white/40">‹</span>
          </button>
          <button
            onClick={() => goTo((current + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center cursor-pointer hover:border-cyan/30 transition-colors hidden lg:flex"
          >
            <span className="text-white/40">›</span>
          </button>
        </div>
      </div>
    </section>
  )
}
