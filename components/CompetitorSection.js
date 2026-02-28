'use client'

import { competitors } from '../data/competitors.js'

const C = 2 * Math.PI * 33

export default function CompetitorSection() {
  return (
    <section id="competitors" className="animate-in">
      <div className="section-header">
        <span className="section-number">07</span>
        <h2 className="section-title">Competitive Acquirer Landscape</h2>
      </div>
      <div className="grid-3">
        {competitors.map((c) => (
          <div key={c.company} className="comp-card">
            <div className="accent-line" style={{ background: c.color }} />
            <div className="comp-score-ring" style={{ color: c.color }}>
              <svg width="72" height="72" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="33" fill="none" stroke={c.strokeColor} strokeWidth="3" />
                <circle
                  cx="36" cy="36" r="33"
                  fill="none"
                  stroke={c.color}
                  strokeWidth="3"
                  strokeDasharray={`${C} ${C}`}
                  strokeDashoffset={c.dashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {c.score}
            </div>
            <h3 style={{ color: c.color }}>{c.company}</h3>
            <div className="comp-desc">{c.description}</div>
            <div>
              {c.tags.map((tag) => (
                <span key={tag} className="comp-tag" style={c.tagStyle}>{tag}</span>
              ))}
            </div>
            <div className="comp-detail">{c.detail}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
