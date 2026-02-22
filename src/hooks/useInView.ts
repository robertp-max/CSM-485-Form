import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

export const useInView = <T extends HTMLElement>(ref: RefObject<T | null>) => {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  return inView
}
