'use client'

import { useScrollSpy } from '../hooks/useScrollSpy.js'

const navItems = [
  { href: '#verdict', label: 'Verdict' },
  { href: '#financials', label: 'Financials' },
  { href: '#aquatics', label: 'Aquatics Portfolio' },
  { href: '#gaps', label: 'Gap Analysis' },
  { href: '#esg', label: 'ESG Alignment' },
  { href: '#alignment', label: 'Value-Driver Fit' },
  { href: '#risk', label: '80/20 Risk' },
  { href: '#competitors', label: 'Competitor Fit' },
  { href: '#diligence', label: 'Diligence' },
  { href: '#pathways', label: 'Pathways' },
  { href: '#timeline', label: 'Timeline' },
]

const sectionIds = navItems.map((n) => n.href.replace('#', ''))

export default function NavBar() {
  const activeId = useScrollSpy(sectionIds)

  const handleClick = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="nav-bar">
      <div className="nav-inner">
        {navItems.map((item) => {
          const id = item.href.replace('#', '')
          return (
            <a
              key={item.href}
              href={item.href}
              className={`nav-pill${activeId === id ? ' active' : ''}`}
              onClick={(e) => handleClick(e, item.href)}
            >
              {item.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
