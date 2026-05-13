import React from 'react'

const Contact = () => (
  <section className="min-h-screen bg-black font-mono text-pink-400 flex items-center justify-center p-8">
    <div className="max-w-lg w-full" style={{ border: '1px solid #ff44aa', boxShadow: '0 0 40px rgba(255,68,170,0.2)' }}>
      <div className="px-4 py-2 border-b border-pink-900 flex justify-between">
        <span className="text-xs text-gray-600 tracking-widest">SIGNAL_TRANSMIT.exe</span>
        <span className="text-xs animate-pulse text-pink-800">● LIVE</span>
      </div>
      <div className="p-8">
        <p className="text-xs text-gray-500 mb-6 animate-pulse tracking-widest">▸ ANTENNA SIGNAL DETECTED — READY TO TRANSMIT</p>
        <div className="space-y-3">
          <input placeholder="YOUR_NAME______"
            className="w-full bg-transparent border border-gray-800 text-white p-3 text-sm font-mono focus:border-pink-400 outline-none transition-colors" />
          <input placeholder="YOUR_EMAIL_____"
            className="w-full bg-transparent border border-gray-800 text-white p-3 text-sm font-mono focus:border-pink-400 outline-none transition-colors" />
          <textarea placeholder="MESSAGE_BODY___" rows={4}
            className="w-full bg-transparent border border-gray-800 text-white p-3 text-sm font-mono focus:border-pink-400 outline-none resize-none transition-colors" />
          <button className="w-full border border-pink-400 text-pink-400 py-3 text-sm tracking-widest hover:bg-pink-400 hover:text-black transition-all duration-200">
            [ TRANSMIT SIGNAL ]
          </button>
        </div>
      </div>
    </div>
  </section>
)

export default Contact