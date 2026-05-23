import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function AnimatedCounter({ 
  value, 
  duration = 2000, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  className = '' 
}) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const startTime = useRef(null)
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, ''))

  useEffect(() => {
    if (!isInView || isNaN(numericValue)) return

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * numericValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
    return () => { startTime.current = null }
  }, [isInView, numericValue, duration])

  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals)
    // Add commas for thousands
    const parts = fixed.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {prefix}{isNaN(numericValue) ? value : formatNumber(count)}{suffix}
    </motion.span>
  )
}
