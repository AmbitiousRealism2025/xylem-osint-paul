'use client'

import { timelineEvents } from '../data/timeline.js'

export default function TimelineSection() {
  return (
    <section id="timeline" className="animate-in">
      <div className="section-header">
        <span className="section-number">10</span>
        <h2 className="section-title">Xylem Key Events Timeline</h2>
      </div>
      <div className="card">
        <div className="timeline">
          {timelineEvents.map((ev) => (
            <div key={ev.date + ev.title} className="tl-item">
              <div className="tl-date">{ev.date}</div>
              <div className="tl-title">{ev.title}</div>
              <div className="tl-desc">{ev.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
