import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-4 z-50"
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>

      {/* Logo */}
      <NavLink to="/" className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-bold shadow-md hover:scale-110 transition-transform">
        <p className="blue-text-gradient font-mono text-sm">NM</p>
      </NavLink>

      {/* Nav links — retro pixel style */}
      <nav className="flex text-sm gap-7 font-mono tracking-widest uppercase">
        {[
          { to: '/about', label: 'About' },
          { to: '/projects', label: 'Projects' },
          { to: '/contact', label: 'Contact' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? 'text-green-400 drop-shadow-[0_0_6px_#00ff88]'
                : 'text-gray-400 hover:text-white hover:drop-shadow-[0_0_6px_#ffffff] transition-all duration-200'
            }
          >
            {({ isActive }) => (
              <span>{isActive ? '> ' : ''}{label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Navbar