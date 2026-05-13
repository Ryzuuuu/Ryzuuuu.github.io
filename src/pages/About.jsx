import React from 'react'

const About = () => (
  <section className="min-h-screen bg-black font-mono text-green-400 flex items-center justify-center p-8">
    <div className="max-w-lg w-full" style={{ border: '1px solid #00ff88', boxShadow: '0 0 40px rgba(0,255,136,0.2)' }}>
      <div className="px-4 py-2 border-b border-green-900 flex justify-between items-center">
        <span className="text-xs text-gray-600 tracking-widest">PLAYER_PROFILE.dat</span>
        <span className="text-xs text-gray-700">[ v1.0 ]</span>
      </div>
      <div className="p-8">
        <p className="text-lg mb-1">NAME: <span className="text-white">Neelabja Mukhopadhyay</span></p>
        <p className="text-xs text-gray-500 mb-8 tracking-widest">CLASS: Full Stack Developer &amp; Creator</p>
        {[['React',8],['Node.js',6],['Three.js',7],['Python',5],['UI / UX',7]].map(([s,l]) => (
          <div key={s} className="flex items-center gap-4 mb-4 text-sm">
            <span className="w-20 text-gray-500 text-xs">{s}</span>
            <span className="text-green-400 tracking-widest">{'█'.repeat(l)}{'░'.repeat(10-l)}</span>
            <span className="text-gray-700 text-xs">LVL {l}</span>
          </div>
        ))}
        <div className="mt-8 pt-6 border-t border-gray-900 text-xs text-gray-600 space-y-2">
          <p>EXP ▸ 2+ YEARS</p>
          <p className="text-green-400 animate-pulse">▶ STATUS: OPEN TO OPPORTUNITIES</p>
        </div>
      </div>
    </div>
  </section>
)

export default About