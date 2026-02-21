import { useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'

type StarPoint = {
  x: number
  y: number
  r: number
  opacity: number
  delay: number
  duration: number
}

const makeLayer = (seed: number, count: number, radiusRange: [number, number], opacityRange: [number, number], durationRange: [number, number]) => {
  let value = seed
  const rand = () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }

  const stars: StarPoint[] = []
  for (let index = 0; index < count; index += 1) {
    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      r: radiusRange[0] + rand() * (radiusRange[1] - radiusRange[0]),
      opacity: opacityRange[0] + rand() * (opacityRange[1] - opacityRange[0]),
      delay: rand() * 6,
      duration: durationRange[0] + rand() * (durationRange[1] - durationRange[0]),
    })
  }

  return stars
}

export default function NightSky() {
  const layerOneRef = useRef<SVGSVGElement | null>(null)
  const layerTwoRef = useRef<SVGSVGElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const reducedMotionRef = useRef(false)

  const layerOneStars = useMemo(() => makeLayer(17, 22, [1, 1.5], [0.05, 0.09], [12, 14]), [])
  const layerTwoStars = useMemo(() => makeLayer(83, 36, [1, 2], [0.06, 0.12], [8, 11]), [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = media.matches

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches
      if (event.matches) {
        targetRef.current = { x: 0, y: 0 }
      }
    }

    media.addEventListener('change', onReducedMotionChange)

    const onMouseMove = (event: MouseEvent) => {
      if (reducedMotionRef.current) {
        return
      }

      const normalizedX = event.clientX / window.innerWidth - 0.5
      const normalizedY = event.clientY / window.innerHeight - 0.5
      targetRef.current = { x: normalizedX, y: normalizedY }
    }

    const tick = () => {
      const current = currentRef.current
      const target = targetRef.current
      current.x += (target.x - current.x) * 0.08
      current.y += (target.y - current.y) * 0.08

      if (layerOneRef.current) {
        layerOneRef.current.style.transform = `translate3d(${current.x * 6}px, ${current.y * 6}px, 0)`
      }

      if (layerTwoRef.current) {
        layerTwoRef.current.style.transform = `translate3d(${current.x * 10}px, ${current.y * 10}px, 0)`
      }

      frameRef.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    frameRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      media.removeEventListener('change', onReducedMotionChange)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return (
    <div className="night-sky" aria-hidden="true">
      <svg ref={layerOneRef} className="night-sky-layer night-sky-layer-one" viewBox="0 0 100 100" preserveAspectRatio="none">
        {layerOneStars.map((star, index) => (
          <circle
            key={`layer1-${index}`}
            className="night-sky-star"
            cx={star.x}
            cy={star.y}
            r={star.r}
            style={{
              '--star-opacity': `${star.opacity}`,
              '--twinkle-delay': `${star.delay}s`,
              '--twinkle-duration': `${star.duration}s`,
            } as CSSProperties}
          />
        ))}
      </svg>

      <svg ref={layerTwoRef} className="night-sky-layer night-sky-layer-two" viewBox="0 0 100 100" preserveAspectRatio="none">
        {layerTwoStars.map((star, index) => (
          <circle
            key={`layer2-${index}`}
            className="night-sky-star"
            cx={star.x}
            cy={star.y}
            r={star.r}
            style={{
              '--star-opacity': `${star.opacity}`,
              '--twinkle-delay': `${star.delay}s`,
              '--twinkle-duration': `${star.duration}s`,
            } as CSSProperties}
          />
        ))}
      </svg>

      <div className="night-sky-vignette" />
    </div>
  )
}
