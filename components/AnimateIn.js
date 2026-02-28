'use client'

import { useIntersection } from '../hooks/useIntersection.js'

export default function AnimateIn({ children, className = '' }) {
  const [ref, visible] = useIntersection()

  return (
    <div ref={ref} className={`animate-in${visible ? ' visible' : ''} ${className}`}>
      {children}
    </div>
  )
}
