'use client'

import { useRef, useEffect, useState } from 'react'
import { verdicts } from '../data/verdicts.js'

export default function VerdictStrip() {
  const ref = useRef(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="verdict-strip" ref={ref}>
      {verdicts.map((v) => (
        <div key={v.company} className="verdict-card">
          <div className="verdict-rank">{v.rank}</div>
          <div className="verdict-company" style={{ color: v.color }}>{v.company}</div>
          <div className="verdict-score" style={{ color: v.color }}>
            {v.score}<span className="verdict-score-denom">/10</span>
          </div>
          <div className="verdict-label">{v.label}</div>
          <div
            className="verdict-bar"
            style={{
              width: animated ? v.barWidth : '0%',
              background: v.color,
            }}
          />
        </div>
      ))}
    </div>
  )
}
