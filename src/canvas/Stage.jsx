import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { director, goTo, setHovered } from '../director'
import { linear, rgb } from '../palette'
import ExhibitLoader from '../components/ExhibitLoader'
import CameraRig from './CameraRig'
import ConsoleModel from './ConsoleModel'
import Plinth from './Plinth'
import { focus } from './targets'

const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const { damp, clamp } = THREE.MathUtils
const color = (name) => new THREE.Color().setRGB(...linear(name), THREE.LinearSRGBColorSpace)

// A key light on whatever the camera is studying. It hangs above and behind the camera,
// like a photographer's, so its reflection on the plinth falls away from view.
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
  return <spotLight ref={light} angle={0.32} penumbra={1} intensity={20} decay={1.6} distance={40} color="#ffffff" />
}

// The plinth and everything on it. It bobs gently, and leans into fast scrolls like
// something with actual mass, then settles.
const Island = () => {
  const ref = useRef()
  useFrame(({ clock }, delta) => {
    const g = ref.current
    if (!g || reducedMotion) return
    const dt = Math.min(delta, 0.1)
    const lean = clamp(director.velocity, -40, 40)
    g.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.08 - Math.abs(lean) * 0.004
    g.rotation.x = damp(g.rotation.x, lean * 0.0022, 4, dt)
    g.rotation.y = damp(g.rotation.y, lean * -0.003, 3, dt)
  })
  return (
    <group ref={ref}>
      <Plinth />
      {/* Model origin sits at its back floor; slide it forward so the island centres on the origin. */}
      <group position={[0, 0, 1.15]}>
        <ConsoleModel onSelect={goTo} />
      </group>
      <ContactShadows position={[0, 0.006, 0]} opacity={0.65} scale={11} blur={2.2} far={3.2} resolution={512} frames={1} color={rgb('text')} />
    </group>
  )
}

const Lights = () => {
  const c = useMemo(() => ({ rim: color('highlight'), pop: color('secondary') }), [])
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[-6, 10, 8]} intensity={1.6} />
      <directionalLight position={[6, 12, -7]} intensity={1.4} color={c.rim} />
      <pointLight position={[-8, 3, -6]} intensity={18} color={c.pop} />
      <FollowSpot />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.5} position={[0, 6, 4]} rotation-x={-Math.PI / 3} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color={c.rim} position={[-7, 2, 1]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={0.6} color={c.pop} position={[7, 2, -2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
      </Environment>
    </>
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
        className={`fixed inset-0 z-0 transition-opacity duration-[1600ms] ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
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
            <Lights />
            <Island />
            <Ready onReady={onReady} />
          </Suspense>
        </Canvas>
      </div>
      <Progress />
    </>
  )
}

export default Stage
