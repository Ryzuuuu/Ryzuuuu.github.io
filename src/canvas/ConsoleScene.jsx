import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, Sparkles, useProgress } from '@react-three/drei'
import ConsoleModel from './ConsoleModel'
import CameraRig from './CameraRig'

const BootScreen = () => {
  const { progress, active } = useProgress()
  const done = !active && progress >= 100
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${done ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="w-48 font-mono text-xs uppercase tracking-[0.3em] text-neon-green">
        <div className="mb-2 flex justify-between">
          <span>Booting</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded bg-white/10">
          <div className="h-full origin-left bg-neon-green transition-transform duration-200" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>
    </div>
  )
}

const ConsoleScene = ({ hovered, onHover, onSelect }) => {
  const wrapRef = useRef(null)
  const [visible, setVisible] = useState(true)
  const [dpr, setDpr] = useState(() => Math.min(1.5, window.devicePixelRatio || 1))

  // Stop rendering entirely once the hero is scrolled out of view.
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(wrapRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={dpr}
        camera={{ fov: 38, near: 0.1, far: 60, position: [0, 4, 10] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => onHover(null)}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Suspense fallback={null}>
          <CameraRig />
          <ambientLight intensity={0.25} />
          <directionalLight position={[4, 8, 6]} intensity={1.8} />
          <pointLight position={[-5, 3, 2]} color="#8183ff" intensity={30} />
          <pointLight position={[5, 2, -2]} color="#ff5fb1" intensity={18} />
          <ConsoleModel hovered={hovered} onHover={onHover} onSelect={onSelect} />
          <ContactShadows position={[0, -1.32, 0]} opacity={0.55} scale={14} blur={2.4} far={4} resolution={512} frames={1} />
          <Sparkles count={40} scale={[12, 6, 10]} size={2.5} speed={0.25} opacity={0.5} color="#8183ff" />
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={2} position={[0, 5, -6]} scale={[10, 4, 1]} />
            <Lightformer form="rect" intensity={1.2} color="#8183ff" position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
            <Lightformer form="rect" intensity={0.8} color="#ff5fb1" position={[6, 2, 0]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
          </Environment>
        </Suspense>
      </Canvas>
      <BootScreen />
    </div>
  )
}

export default ConsoleScene
