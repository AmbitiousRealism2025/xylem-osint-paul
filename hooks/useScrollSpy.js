'use client'

import { useEffect, useState } from 'react'

export function useScrollSpy(ids, options = {}) {
  const [activeId, setActiveId] = useState(ids[0] ?? '')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        threshold: options.threshold ?? 0.3,
        rootMargin: options.rootMargin ?? '-120px 0px -60% 0px',
      }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids, options.threshold, options.rootMargin])

  return activeId
}
