'use client'

import { diligenceCards } from '../data/diligence.js'

export default function DiligenceSection() {
  return (
    <section id="diligence" className="animate-in">
      <div className="section-header">
        <span className="section-number">08</span>
        <h2 className="section-title">Anticipated Diligence Hurdles</h2>
      </div>
      <div className="grid-2">
        {diligenceCards.map((c) => (
          <div key={c.label} className="card">
            <div className="card-label">{c.label}</div>
            <p className="card-note" style={{ lineHeight: 1.7, marginTop: '8px' }}>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
