'use client'

import { esgBadges, esgCards } from '../data/esg.js'

export default function EsgSection() {
  return (
    <section id="esg" className="animate-in">
      <div className="section-header">
        <span className="section-number">04</span>
        <h2 className="section-title">ESG &amp; Sustainability Alignment</h2>
      </div>
      <div className="esg-grid" style={{ marginBottom: '24px' }}>
        {esgBadges.map((b) => (
          <div key={b.value} className="esg-badge">
            <span className="esg-icon">{b.icon}</span>
            <div className="card-value">{b.value}</div>
            <div className="card-note">{b.note}</div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        {esgCards.map((c) => (
          <div key={c.label} className="card">
            <div className="card-label">{c.label}</div>
            <p className="card-note" style={{ lineHeight: 1.7 }}>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
