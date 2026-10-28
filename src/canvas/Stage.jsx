import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, Sparkles, useProgress } from '@react-three/drei'
import { goTo, setHovered } from '../director'
import ExhibitLoader from '../components/ExhibitLoader'
import CameraRig from './CameraRig'
import ConsoleModel from './ConsoleModel'
import Plinth from './Plinth'
import { focus } from './targets'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A warm gallery spot on whatever the camera is studying. It hangs above and behind the
// camera, like a photographer's key light, so its reflection in the lacquer falls away from view.
const FollowSpot = () => {
  const light = useRef()
  useFrame(({ camera }) => {
    const l = light.current
    if (!l) return
    const dx = camera.position.x - focus.x
    const dz = camera.position.z - focus.z
    const len = Math.hypot(dx, dz) || 1
    l.position.set(focus.x + (dx / len) * 5, focus.y + 8, focus.z + (dz / len) * 5)
    l.target.position.set(focus.x, focus.y, focus.z)
    l.target.updateMatrixWorld()
  })
  return <spotLight ref={light} angle={0.3} penumbra={1} intensity={22} decay={1.6} distance={40} color="#ffd9a6" />
}

// The plinth and everything on it, drifting gently like it's floating.
const Island = () => {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current && !reducedMotion) ref.current.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.08
  })
  return (
    <group ref={ref}>
      <Plinth />
      {/* Model origin sits at its back floor; slide it forward so the island centres on the origin. */}
      <group position={[0, 0, 1.15]}>
        <ConsoleModel onSelect={goTo} />
      </group>
      <ContactShadows position={[0, 0.006, 0]} opacity={0.7} scale={11} blur={2.4} far={3.2} resolution={512} frames={1} />
    </group>
  )
}

const Ready = ({ onReady }) => {
  useEffect(() => { onReady() }, [onReady])
  return null
}

const Progress = () => {
  const { progress, active } = useProgress()
  return <ExhibitLoader progress={progress} done={!active && progress >= 100} />
}

const Stage = () => {
  const [ready, setReady] = useState(false)
  const [dpr, setDpr] = useState(() => Math.min(1.5, window.devicePixelRatio || 1))
  const onReady = useCallback(() => setReady(true), [])

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-0 transition-opacity duration-[1800ms] ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        <Canvas
          dpr={dpr}
          camera={{ fov: 35, near: 0.1, far: 140, position: [24, 16, 30] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onPointerMissed={() => setHovered(null)}
        >
          <PerformanceMonitor onDecline={() => setDpr(1)} />
          <Suspense fallback={null}>
            <CameraRig />
            <ambientLight intensity={0.3} color="#f4e4c8" />
            <directionalLight position={[-6, 10, 8]} intensity={1.5} color="#ffe6c2" />
            <directionalLight position={[6, 12, -7]} intensity={1.5} color="#e2b066" />
            <pointLight position={[-8, 3, -6]} intensity={10} color="#9a3040" />
            <FollowSpot />
            <Island />
            <Sparkles count={36} scale={[13, 6, 13]} position={[0, 4, 0]} size={2.2} speed={0.18} opacity={0.45} color="#e3c78e" />
            <Environment resolution={128} frames={1}>
              <Lightformer form="rect" intensity={1.6} color="#fff1dc" position={[0, 6, 4]} rotation-x={-Math.PI / 3} scale={[10, 3, 1]} />
              <Lightformer form="rect" intensity={1.4} color="#e0b46c" position={[-7, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
              <Lightformer form="rect" intensity={0.7} color="#8d2a39" position={[7, 2, -2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
            </Environment>
            <Ready onReady={onReady} />
          </Suspense>
        </Canvas>
      </div>
      <Progress />
    </>
  )
}

export default Stage
