'use client'

import { gaps } from '../data/gaps.js'

export default function GapSection() {
  return (
    <section id="gaps" className="animate-in">
      <div className="section-header">
        <span className="section-number">03</span>
        <h2 className="section-title">Portfolio Gap Analysis — Where HydroCav Fits</h2>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="gap-row" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-accent)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Capability</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Severity</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Assessment</div>
        </div>
        {gaps.map((gap) => (
          <div key={gap.name} className="gap-row">
            <div className="gap-name">{gap.name}</div>
            <div><span className={`severity ${gap.severity}`}>{gap.severity}</span></div>
            <div className="gap-note">{gap.note}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
