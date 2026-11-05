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
// Rendering the shadow pass every frame is fine on a desktop GPU, less so on a phone.
const shadows = typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches

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
  return <spotLight ref={light} angle={0.32} penumbra={1} intensity={7} decay={1.6} distance={40} color="#ffffff" />
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
      <ContactShadows position={[0, 0.006, 0]} opacity={0.55} scale={11} blur={2.4} far={2.4} resolution={512} frames={1} color={rgb('text')} />
    </group>
  )
}

const Lights = () => {
  const c = useMemo(() => ({ bounce: color('primary') }), [])
  return (
    <>
      <ambientLight intensity={0.16} />
      {/* Warm key from the upper left, the only light that throws a shadow. */}
      <directionalLight
        castShadow={shadows}
        position={[-7, 11, 8]}
        intensity={2.5}
        color="#fff0df"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-radius={5}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={2}
        shadow-camera-far={32}
      />
      {/* Cool kicker from behind, to pull the casing off the page. */}
      <directionalLight position={[7, 7, -9]} intensity={1.1} color="#d5f4ff" />
      <FollowSpot />
      <Environment resolution={256} frames={1} environmentIntensity={1.15}>
        {/* The casing is metallic, so its colour is mostly what it reflects: give it a whole room. */}
        <color attach="background" args={['#7d8f88']} />
        <Lightformer form="rect" intensity={2.4} position={[0, 7, 3]} rotation-x={-Math.PI / 2.4} scale={[12, 5, 1]} />
        <Lightformer form="rect" intensity={1.3} color="#ffe6cf" position={[-8, 2.5, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[8, 2.5, -1]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
        {/* The island lights the underside of everything standing on it. */}
        <Lightformer form="circle" intensity={0.7} color={c.bounce} position={[0, -3, 0]} rotation-x={Math.PI / 2} scale={14} />
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
        className={`exhibit transition-opacity duration-[1600ms] ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="exhibit__frame">
          <Canvas
            dpr={dpr}
            shadows={shadows}
            camera={{ fov: 35, near: 0.1, far: 140, position: [24, 16, 30] }}
            // Neutral tone mapping keeps the plastic's colour true; ACES would push it towards salmon.
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
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
      </div>
      <Progress />
    </>
  )
}

export default Stage
