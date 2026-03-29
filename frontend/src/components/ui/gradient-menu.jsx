import React from 'react'

const menuItems = [
  {
    title: 'Home',
    gradientFrom: '#10b981',
    gradientTo: '#06b6d4',
    href: 'home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    title: 'Features',
    gradientFrom: '#56CCF2',
    gradientTo: '#2F80ED',
    href: 'features',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    title: 'Predict',
    gradientFrom: '#80FF72',
    gradientTo: '#10b981',
    href: 'predictor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    title: 'History',
    gradientFrom: '#FF9966',
    gradientTo: '#FF5E62',
    href: 'history',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: 'About',
    gradientFrom: '#ffa9c6',
    gradientTo: '#f434e2',
    href: 'about',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" width="19" height="19">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  },
]

export default function GradientMenu() {
  const handleClick = (href) => {
    const el = document.getElementById(href)
    if (!el) return
    const navOffset = 96
    const top = el.getBoundingClientRect().top + window.scrollY - navOffset
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <ul className="gm-list">
      {menuItems.map(({ title, icon, gradientFrom, gradientTo, href }, idx) => (
        <li
          key={idx}
          className="gm-item"
          style={{ '--gm-from': gradientFrom, '--gm-to': gradientTo }}
          onClick={() => handleClick(href)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleClick(href)}
          aria-label={title}
        >
          <span className="gm-bg" />
          <span className="gm-glow" />
          <span className="gm-icon">{icon}</span>
          <span className="gm-label">{title}</span>
        </li>
      ))}
    </ul>
  )
}
