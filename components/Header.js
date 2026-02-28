'use client'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-badge">OSINT Assessment</span>
          <span className="header-title">Xylem Inc. — Strategic Acquirer Analysis for HydroCav Pool &amp; Spa</span>
        </div>
        <div className="header-meta">
          <span><span className="pulse-dot" />&ensp;Compiled Report</span>
          <span>FEB 2026</span>
          <span>CONFIDENTIAL</span>
        </div>
      </div>
    </header>
  )
}
