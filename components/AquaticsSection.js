'use client'

import { aquaticsCards } from '../data/aquatics.js'

export default function AquaticsSection() {
  return (
    <section id="aquatics" className="animate-in">
      <div className="section-header">
        <span className="section-number">02</span>
        <h2 className="section-title">Aquatics Portfolio — Neptune Benson Heritage</h2>
      </div>
      <div className="grid-3">
        {aquaticsCards.map((c) => (
          <div key={c.label} className="card">
            <div className="card-label">{c.label}</div>
            <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>{c.title}</h4>
            <p className="card-note">{c.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
