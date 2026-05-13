import { Suspense, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Loader from '../components/Loader'
import IslandModel from '../models/Island'

// ── Typewriter ────────────────────────────────────────────────────────────────
const useTypewriter = (text, speed = 80, pauseAt = '', pauseDuration = 1000) => {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0, cancelled = false
    const tick = () => {
      if (cancelled) return
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) return
      setTimeout(tick, (pauseAt && text.slice(0, i).endsWith(pauseAt)) ? pauseDuration : speed)
    }
    setTimeout(tick, speed)
    return () => { cancelled = true }
  }, [text])
  return displayed
}

// ── Camera positions per section ──────────────────────────────────────────────
const CAM = {
  home:     { pos: [0, 2.8, 7],      look: [0, 0, 0] },
  about:    { pos: [-0.5, 1.8, 2.5], look: [0, 0.5, -3] },
  projects: { pos: [3.5, 2.5, 5],    look: [1.5, 0, 2] },
  contact:  { pos: [3, 2.5, -0.5],   look: [2.5, 0.5, -1.5] },
}

// ── Camera rig with spin ──────────────────────────────────────────────────────
const CameraRig = ({ section, spinning, onSpinDone, blurEl, scrollY }) => {
  const { camera } = useThree()
  const spin = useRef({ progress: 0, startAngle: 0 })

  useEffect(() => {
    if (spinning) {
      spin.current.startAngle = Math.atan2(camera.position.x, camera.position.z)
      spin.current.progress = 0
    }
  }, [spinning])

  useFrame((_, delta) => {
    if (spinning) {
      spin.current.progress = Math.min(1, spin.current.progress + delta / 1.0)
      const t = spin.current.progress
      // fast in middle, ease in/out
      const eased = t < 0.12 ? (t / 0.12) * 0.08 : t > 0.88 ? 0.92 + ((t - 0.88) / 0.12) * 0.08 : 0.08 + ((t - 0.12) / 0.76) * 0.84
      const angle = spin.current.startAngle + eased * Math.PI * 2 * 1.5 // 1.5 rotations
      const r = 7
      camera.position.set(Math.sin(angle) * r, 2.8, Math.cos(angle) * r)
      camera.lookAt(0, 0, 0)
      // blur ramps up fast, holds, ramps down
      const blur = t < 0.15 ? (t / 0.15) * 22 : t > 0.82 ? ((1 - t) / 0.18) * 22 : 22
      if (blurEl.current) blurEl.current.style.filter = `blur(${blur}px)`
      if (t >= 1) {
        if (blurEl.current) blurEl.current.style.filter = 'none'
        onSpinDone()
      }
      return
    }

    const c = CAM[section] || CAM.home
    const ty = section === 'home' ? c.pos[1] - scrollY * 0.002 : c.pos[1]
    const tz = section === 'home' ? c.pos[2] - scrollY * 0.001 : c.pos[2]
    camera.position.x += (c.pos[0] - camera.position.x) * 0.04
    camera.position.y += (ty - camera.position.y) * 0.04
    camera.position.z += (tz - camera.position.z) * 0.04
    camera.lookAt(...c.look)
  })

  return null
}

// ── Section overlays ──────────────────────────────────────────────────────────
const win = (color, glow) => ({
  border: `1px solid ${color}`,
  boxShadow: `0 0 40px ${glow}, inset 0 0 20px rgba(0,0,0,0.5)`,
  background: 'rgba(0,0,0,0.92)',
})

const AboutOverlay = ({ onClose }) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center">
    <div className="font-mono text-green-400 p-8 max-w-lg w-full mx-8 animate-pulse-once"
         style={win('#00ff88', 'rgba(0,255,136,0.25)')}>
      <div className="flex justify-between items-center mb-5 border-b border-green-900 pb-3">
        <span className="text-xs text-gray-600 tracking-widest">PLAYER_PROFILE.dat</span>
        <button onClick={onClose} className="text-gray-600 hover:text-green-400 text-xs transition-colors">[ ESC ]</button>
      </div>
      <p className="text-lg mb-1">NAME: <span className="text-white">Neelabja Mukhopadhyay</span></p>
      <p className="text-xs text-gray-500 mb-6 tracking-widest">CLASS: Full Stack Developer & Creator</p>
      {[['React',8],['Node.js',6],['Three.js',7],['Python',5],['UI / UX',7]].map(([s,l]) => (
        <div key={s} className="flex items-center gap-4 mb-3 text-sm">
          <span className="w-20 text-gray-500 text-xs">{s}</span>
          <span className="text-green-400 tracking-widest">{'█'.repeat(l)}{'░'.repeat(10-l)}</span>
          <span className="text-gray-700 text-xs">LVL {l}</span>
        </div>
      ))}
      <div className="mt-6 pt-4 border-t border-gray-900 text-xs text-gray-600 space-y-1">
        <p>EXP ▸ 2+ YEARS</p>
        <p className="text-green-400 animate-pulse">▶ STATUS: OPEN TO OPPORTUNITIES</p>
      </div>
    </div>
  </div>
)

const ProjectsOverlay = ({ onClose }) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center">
    <div className="font-mono text-blue-400 p-8 max-w-lg w-full mx-8"
         style={win('#4466ff', 'rgba(68,102,255,0.25)')}>
      <div className="flex justify-between items-center mb-5 border-b border-blue-900 pb-3">
        <span className="text-xs text-gray-600 tracking-widest">SELECT_CARTRIDGE.exe</span>
        <button onClick={onClose} className="text-gray-600 hover:text-blue-400 text-xs transition-colors">[ ESC ]</button>
      </div>
      <p className="text-xs text-gray-600 mb-5 animate-pulse tracking-widest">▶ INSERT CARTRIDGE TO PLAY</p>
      {[
        { name: 'PROJECT_01', desc: 'Full Stack Web App',  stack: 'React · Node · MongoDB', color: '#4466ff' },
        { name: 'PROJECT_02', desc: '3D Interactive Portfolio', stack: 'Three.js · R3F · Tailwind', color: '#00ff88' },
        { name: 'PROJECT_03', desc: 'Coming Soon...',      stack: '[ LOCKED ]', color: '#555' },
      ].map((p, i) => (
        <div key={i} className="mb-3 p-4 border border-gray-800 hover:border-blue-500 cursor-pointer transition-all duration-200 hover:translate-x-1"
             style={{ borderLeft: `3px solid ${p.color}` }}>
          <p className="text-sm text-white mb-1">{p.name}</p>
          <p className="text-xs text-gray-400">{p.desc}</p>
          <p className="text-xs mt-1" style={{ color: p.color }}>{p.stack}</p>
        </div>
      ))}
    </div>
  </div>
)

const ContactOverlay = ({ onClose }) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center">
    <div className="font-mono text-pink-400 p-8 max-w-lg w-full mx-8"
         style={win('#ff44aa', 'rgba(255,68,170,0.25)')}>
      <div className="flex justify-between items-center mb-5 border-b border-pink-900 pb-3">
        <span className="text-xs text-gray-600 tracking-widest">SIGNAL_TRANSMIT.exe</span>
        <button onClick={onClose} className="text-gray-600 hover:text-pink-400 text-xs transition-colors">[ ESC ]</button>
      </div>
      <p className="text-xs text-gray-500 mb-5 animate-pulse tracking-widest">▸ ANTENNA SIGNAL DETECTED — READY TO TRANSMIT</p>
      <div className="space-y-3">
        {['YOUR_NAME______', 'YOUR_EMAIL_____'].map(ph => (
          <input key={ph} placeholder={ph}
            className="w-full bg-transparent border border-gray-800 text-white p-3 text-sm font-mono focus:border-pink-400 outline-none transition-colors"
          />
        ))}
        <textarea placeholder="MESSAGE_BODY___" rows={4}
          className="w-full bg-transparent border border-gray-800 text-white p-3 text-sm font-mono focus:border-pink-400 outline-none resize-none transition-colors"
        />
        <button className="w-full border border-pink-400 text-pink-400 py-3 text-sm tracking-widest hover:bg-pink-400 hover:text-black transition-all duration-200">
          [ TRANSMIT SIGNAL ]
        </button>
      </div>
    </div>
  </div>
)

// ── Main component ────────────────────────────────────────────────────────────
const Home = () => {
  const [scrollY,    setScrollY]    = useState(0)
  const [section,    setSection]    = useState('home')
  const [spinning,   setSpinning]   = useState(false)
  const [spinTarget, setSpinTarget] = useState('home')
  const [monitorOn,  setMonitorOn]  = useState(false)
  const blurEl = useRef()
  const title = useTypewriter(
    "Hi, I'm Neelabja Mukhopadhyay — Developer & Creator;",
    80, 'Neelabja Mukhopadhyay', 1000
  )

  const particles = useMemo(() => [...Array(20)].map(() => ({
    w: Math.random() * 3 + 1.5, l: Math.random() * 100, t: Math.random() * 100,
    delay: Math.random() * 4,   dur: Math.random() * 3 + 2,
  })), [])

  const triggerSpin = useCallback((target) => {
    if (spinning) return
    setSpinTarget(target)
    setSpinning(true)
  }, [spinning])

  const handleSpinDone = useCallback(() => {
    setSpinning(false)
    setSection(spinTarget)
  }, [spinTarget])

  // Expose global nav for Navbar
  useEffect(() => {
    window.portfolioNav = triggerSpin
    return () => { delete window.portfolioNav }
  }, [triggerSpin])

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleMonitorClick = () => {
    if (section !== 'home') return
    if (!monitorOn) setMonitorOn(true)
    triggerSpin('about')
  }

  return (
    <section className='w-full h-screen relative bg-black overflow-hidden'>

      {/* CRT scanlines */}
      <div className="pointer-events-none absolute inset-0 z-20" style={{
        background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)'
      }} />
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-20" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)'
      }} />

      {/* Hero text */}
      {section === 'home' && !spinning && (
        <div className='absolute bottom-16 left-12 z-30 flex flex-col gap-2'>
          <p className='text-green-400 font-mono text-2xl tracking-wider drop-shadow-[0_0_10px_#00ff88]'>
            {title}<span className='animate-pulse'>_</span>
          </p>
          <p className='text-gray-600 font-mono text-xs animate-pulse tracking-[0.4em]'>[ PRESS START ]</p>
        </div>
      )}
      {section === 'home' && !spinning && !monitorOn && (
        <p className='absolute bottom-16 right-12 z-30 text-gray-600 font-mono text-xs animate-pulse'>
          click monitor to power on
        </p>
      )}

      {/* Spin loading text */}
      {spinning && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <p className="font-mono text-green-400 text-sm tracking-[0.5em] drop-shadow-[0_0_20px_#00ff88]"
             style={{ animation: 'pulse 0.3s infinite' }}>
            LOADING {spinTarget.toUpperCase()}...
          </p>
        </div>
      )}

      {/* Back button when in a section */}
      {section !== 'home' && !spinning && (
        <button onClick={() => triggerSpin('home')}
          className="absolute top-20 left-12 z-50 font-mono text-xs text-gray-600 hover:text-white transition-colors tracking-widest">
          ◀ BACK
        </button>
      )}

      {/* Particles */}
      {particles.map((p, i) => (
        <div key={i} className='absolute rounded-full bg-blue-400 opacity-10 animate-pulse' style={{
          width: p.w+'px', height: p.w+'px', left: p.l+'%', top: p.t+'%',
          animationDelay: p.delay+'s', animationDuration: p.dur+'s',
          boxShadow: '0 0 4px 1px rgba(100,150,255,0.25)'
        }} />
      ))}

      {/* Section overlays */}
      {section === 'about'    && !spinning && <AboutOverlay    onClose={() => triggerSpin('home')} />}
      {section === 'projects' && !spinning && <ProjectsOverlay onClose={() => triggerSpin('home')} />}
      {section === 'contact'  && !spinning && <ContactOverlay  onClose={() => triggerSpin('home')} />}

      {/* 3D canvas — only this div gets blurred during spin */}
      <div ref={blurEl} className="absolute inset-0">
        <Canvas camera={{ near: 0.1, far: 1000, position: [0, 2.8, 7], fov: 45 }}>
          <Suspense fallback={<Loader />}>
            <CameraRig
              section={section}
              spinning={spinning}
              onSpinDone={handleSpinDone}
              blurEl={blurEl}
              scrollY={scrollY}
            />
            {section === 'home' && !spinning && (
              <OrbitControls enableZoom={false} enablePan={false}
                maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 6} rotateSpeed={0.35} />
            )}
            <directionalLight intensity={1} position={[10, 10, 5]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[-3, 3, 2]} color="#4466ff" intensity={1.2} />
            <pointLight position={[3, 1, -1]} color="#ff44aa" intensity={0.6} />
            {monitorOn && <pointLight position={[-0.025, 1.5, -3.69]} color="#00ff88" intensity={2.5} />}
            <IslandModel
              onMonitorClick={handleMonitorClick}
              onGamepadClick={() => triggerSpin('projects')}
              onAntennaClick={() => triggerSpin('contact')}
              monitorOn={monitorOn}
              section={section}
            />
          </Suspense>
        </Canvas>
      </div>
    </section>
  )
}

export default Home