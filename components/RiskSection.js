'use client'

import { riskSignals } from '../data/riskSignals.js'

export default function RiskSection() {
  return (
    <section id="risk" className="animate-in">
      <div className="section-header">
        <span className="section-number">06</span>
        <h2 className="section-title">The 80/20 Problem</h2>
      </div>
      <div className="risk-banner">
        <h3>Is Neptune Benson in the &ldquo;80&rdquo; (core) or the &ldquo;20&rdquo; (prune)?</h3>
        <p>
          CEO Matthew Pine&apos;s aggressive simplification program is evaluating up to 10% of revenue for divestiture,
          already exiting ~$250M in businesses, and creating a deliberate 2% revenue headwind in 2026. If commercial
          aquatics is classified as non-core, Xylem may be looking to <strong>divest</strong> rather than expand its
          pool/spa presence.
        </p>
        <div className="risk-signals">
          {riskSignals.map((signal) => (
            <div key={signal} className="risk-signal">{signal}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
