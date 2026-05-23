import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import ParticleField from './ParticleField'
import GridPlane from './GridPlane'
import Globe from './Globe'
import SOSSphere from './SOSSphere'
import { useEmergencyStore } from '../../stores/emergencyStore'

function CameraRig() {
  const { camera } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // Gentle camera breathing
    camera.position.x = Math.sin(t * 0.1) * 0.3 + mouseRef.current.x * 0.5
    camera.position.y = Math.cos(t * 0.15) * 0.2 + mouseRef.current.y * 0.3 + 1
    camera.lookAt(0, 0, 0)
  })

  return null
}

function SceneContent() {
  const isEmergency = useEmergencyStore(s => s.isEmergency)
  const globeRef = useRef()

  useFrame((state) => {
    if (globeRef.current) {
      const scrollY = window.scrollY || 0
      const maxScroll = document.body.scrollHeight - window.innerHeight
      const progress = Math.min(scrollY / Math.max(maxScroll, 1), 1)
      globeRef.current.position.z = -5 + progress * -10
      globeRef.current.position.y = progress * -3
    }
  })

  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color={isEmergency ? '#FF2E2E' : '#00D9FF'} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FF8A00" />
      
      <fog attach="fog" args={[isEmergency ? '#1a0505' : '#060F1A', 10, 50]} />

      <ParticleField count={400} emergency={isEmergency} />
      <GridPlane emergency={isEmergency} />
      
      <group ref={globeRef} position={[0, 0, -5]}>
        <Globe emergency={isEmergency} />
      </group>

      <group position={[0, 0, 3]}>
        <SOSSphere emergency={isEmergency} />
      </group>

      <EffectComposer>
        <Bloom
          intensity={isEmergency ? 2.5 : 1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(isEmergency ? 0.003 : 0.0008, isEmergency ? 0.003 : 0.0008)}
        />
        <Vignette darkness={0.7} offset={0.3} />
      </EffectComposer>
    </>
  )
}

export default function MainScene() {
  return (
    <div className="fixed inset-0 z-0" id="main-3d-scene">
      <Canvas
        camera={{ position: [0, 1, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <CameraRig />
        <SceneContent />
      </Canvas>
    </div>
  )
}
