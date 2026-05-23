import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GridPlane({ emergency = false }) {
  const gridRef = useRef()
  const materialRef = useRef()

  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = 'transparent'
    ctx.clearRect(0, 0, 512, 512)

    ctx.strokeStyle = 'rgba(0, 217, 255, 0.15)'
    ctx.lineWidth = 1

    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 512)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(512, i)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(8, 8)
    return texture
  }, [])

  useFrame((state) => {
    if (!materialRef.current) return
    const t = state.clock.elapsedTime
    materialRef.current.opacity = 0.3 + Math.sin(t * 0.5) * 0.1
    gridTexture.offset.y = t * 0.02
  })

  return (
    <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        ref={materialRef}
        map={gridTexture}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
        color={emergency ? '#FF2E2E' : '#00D9FF'}
      />
    </mesh>
  )
}
