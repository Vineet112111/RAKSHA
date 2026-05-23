import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SOSSphere({ emergency = false }) {
  const groupRef = useRef()
  const innerRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.2
    }
    if (innerRef.current) {
      const pulse = emergency ? 1.2 + Math.sin(t * 4) * 0.3 : 1 + Math.sin(t * 1.5) * 0.08
      innerRef.current.scale.setScalar(pulse)
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.5
      ring1Ref.current.rotation.z = t * 0.3
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 0.4
      ring2Ref.current.rotation.x = t * -0.2
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.6
      ring3Ref.current.rotation.y = t * -0.3
    }
  })

  const coreColor = emergency ? '#FF2E2E' : '#00D9FF'
  const glowColor = emergency ? '#FF6B00' : '#FF8A00'

  return (
    <group ref={groupRef}>
      {/* Core sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.4} />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.1} />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.05} wireframe />
      </mesh>

      {/* Energy rings */}
      <group ref={ring1Ref}>
        <mesh>
          <torusGeometry args={[1.8, 0.02, 8, 64]} />
          <meshBasicMaterial color={coreColor} transparent opacity={0.5} />
        </mesh>
      </group>
      <group ref={ring2Ref}>
        <mesh>
          <torusGeometry args={[2.2, 0.015, 8, 64]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.3} />
        </mesh>
      </group>
      <group ref={ring3Ref}>
        <mesh>
          <torusGeometry args={[2.6, 0.01, 8, 64]} />
          <meshBasicMaterial color={coreColor} transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  )
}
