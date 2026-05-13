import React from 'react'

const projects = [
  { name: 'PROJECT_01', desc: 'Full Stack Web App',       stack: 'React · Node · MongoDB',    color: '#4466ff' },
  { name: 'PROJECT_02', desc: '3D Interactive Portfolio', stack: 'Three.js · R3F · Tailwind',  color: '#00ff88' },
  { name: 'PROJECT_03', desc: 'Coming Soon...',           stack: '[ LOCKED ]',                 color: '#555' },
]

const Projects = () => (
  <section className="min-h-screen bg-black font-mono text-blue-400 flex items-center justify-center p-8">
    <div className="max-w-lg w-full" style={{ border: '1px solid #4466ff', boxShadow: '0 0 40px rgba(68,102,255,0.2)' }}>
      <div className="px-4 py-2 border-b border-blue-900 flex justify-between">
        <span className="text-xs text-gray-600 tracking-widest">SELECT_CARTRIDGE.exe</span>
        <span className="text-xs text-gray-700">🎮</span>
      </div>
      <div className="p-8">
        <p className="text-xs text-gray-600 mb-6 animate-pulse tracking-widest">▶ INSERT CARTRIDGE TO PLAY</p>
        {projects.map((p, i) => (
          <div key={i} className="mb-4 p-4 border border-gray-800 hover:border-blue-500 cursor-pointer transition-all duration-200 hover:translate-x-1"
               style={{ borderLeft: `3px solid ${p.color}` }}>
            <p className="text-sm text-white mb-1">{p.name}</p>
            <p className="text-xs text-gray-400">{p.desc}</p>
            <p className="text-xs mt-1" style={{ color: p.color }}>{p.stack}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default Projects