'use client'

import { useIntersection } from '../hooks/useIntersection.js'
import { signals } from '../data/signals.js'

export default function AlignmentSection() {
  const [ref, visible] = useIntersection({ threshold: 0.3 })

  return (
    <section id="alignment" className="animate-in" ref={ref}>
      <div className="section-header">
        <span className="section-number">05</span>
        <h2 className="section-title">HydroCav Value-Driver Alignment</h2>
      </div>
      <div className="card">
        {signals.map((s) => (
          <div key={s.label} className="signal-row">
            <div className="signal-label">{s.label}</div>
            <div className="signal-bar-track">
              <div
                className="signal-bar-fill"
                style={{
                  width: visible ? `${s.width}%` : '0%',
                  background: s.gradient,
                }}
              />
            </div>
            <div className="signal-rating" style={{ color: s.ratingColor }}>{s.rating}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
