'use client'

import { entryPoints, questions } from '../data/pathways.js'

export default function PathwaysSection() {
  return (
    <section id="pathways" className="animate-in">
      <div className="section-header">
        <span className="section-number">09</span>
        <h2 className="section-title">Strategic Pathways &amp; Recommendations</h2>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '16px', color: 'var(--accent-cyan)' }}>
          Best Entry Points Into Xylem
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entryPoints.map((ep) => (
            <div key={ep.num} className="pathway-card">
              <div className="pathway-num">{ep.num}</div>
              <div>
                <h4>{ep.title}</h4>
                <p>{ep.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '16px', color: 'var(--accent-amber)' }}>
          Three Questions to Resolve First
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q) => (
            <div key={q.num} className="pathway-card">
              <div className="pathway-num" style={{ color: q.color }}>{q.num}</div>
              <div>
                <h4>{q.title}</h4>
                <p>{q.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
