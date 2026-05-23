import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Globe({ emergency = false }) {
  const globeRef = useRef()
  const ringsRef = useRef()
  const pointsRef = useRef()

  const dotPositions = useMemo(() => {
    const positions = []
    const radius = 3
    for (let i = 0; i < 2000; i++) {
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )
    }
    return new Float32Array(positions)
  }, [])

  const arcLines = useMemo(() => {
    const arcs = []
    const pairs = [
      [{ lat: 19.07, lng: 72.87 }, { lat: 28.61, lng: 77.23 }],
      [{ lat: 19.07, lng: 72.87 }, { lat: 13.08, lng: 80.27 }],
      [{ lat: 19.07, lng: 72.87 }, { lat: 22.57, lng: 88.36 }],
      [{ lat: 19.07, lng: 72.87 }, { lat: 12.97, lng: 77.59 }],
      [{ lat: 28.61, lng: 77.23 }, { lat: 26.91, lng: 75.78 }],
    ]

    pairs.forEach(([start, end]) => {
      const points = []
      const r = 3
      for (let t = 0; t <= 1; t += 0.05) {
        const lat = start.lat + (end.lat - start.lat) * t
        const lng = start.lng + (end.lng - start.lng) * t
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lng + 180) * (Math.PI / 180)
        const elevation = r + Math.sin(t * Math.PI) * 0.8
        points.push(new THREE.Vector3(
          -elevation * Math.sin(phi) * Math.cos(theta),
          elevation * Math.cos(phi),
          elevation * Math.sin(phi) * Math.sin(theta)
        ))
      }
      arcs.push(points)
    })
    return arcs
  }, [])

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.08
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.15
      ringsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  const mainColor = emergency ? '#FF2E2E' : '#00D9FF'
  const accentColor = emergency ? '#FF6B00' : '#FF8A00'

  return (
    <group ref={globeRef}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color={mainColor} wireframe transparent opacity={0.15} />
      </mesh>

      {/* Dot cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dotPositions.length / 3}
            array={dotPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={mainColor} size={0.02} transparent opacity={0.5} sizeAttenuation />
      </points>

      {/* Connection arcs */}
      {arcLines.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={accentColor} transparent opacity={0.6} />
        </line>
      ))}

      {/* Outer ring */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4, 0.02, 8, 64]} />
          <meshBasicMaterial color={mainColor} transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
          <torusGeometry args={[4.3, 0.015, 8, 64]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.2} />
        </mesh>
      </group>

      {/* India marker glow */}
      <mesh position={[-2.2, 1.2, 1.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
      </mesh>
      <mesh position={[-2.2, 1.2, 1.8]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.2} />
      </mesh>
    </group>
  )
}
