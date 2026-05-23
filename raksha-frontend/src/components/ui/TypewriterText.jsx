import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function TypewriterText({ text, speed = 40, delay = 0, className = '', onComplete, cursor = true }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!started) return
    indexRef.current = 0
    setDisplayed('')
    setDone(false)

    const interval = setInterval(() => {
      indexRef.current++
      if (indexRef.current >= text.length) {
        clearInterval(interval)
        setDisplayed(text)
        setDone(true)
        onComplete?.()
      } else {
        setDisplayed(text.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, started, onComplete])

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
        />
      )}
    </span>
  )
}
