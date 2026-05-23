import { useRef, useCallback } from 'react'

export function useMagnetic(strength = 0.3) {
  const ref = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'translate(0px, 0px)'
    ref.current.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
    setTimeout(() => {
      if (ref.current) ref.current.style.transition = ''
    }, 500)
  }, [])

  return { ref, handleMouseMove, handleMouseLeave }
}

export function useParallax(strength = 0.02) {
  const ref = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const x = (e.clientX - window.innerWidth / 2) * strength
    const y = (e.clientY - window.innerHeight / 2) * strength
    ref.current.style.transform = `translate(${x}px, ${y}px)`
  }, [strength])

  return { ref, handleMouseMove }
}
