'use client'

import { stats, tableRows } from '../data/financials.js'

export default function FinancialSection() {
  return (
    <section id="financials" className="animate-in">
      <div className="section-header">
        <span className="section-number">01</span>
        <h2 className="section-title">Financial Profile &amp; Capacity</h2>
      </div>
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="card-label">{s.label}</div>
            <div className="card-value">{s.value}</div>
            <div className="card-note">{s.note}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Implication for HydroCav</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.metric}>
                <td>{row.metric}</td>
                <td className="val">{row.value}</td>
                <td>{row.implication}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
