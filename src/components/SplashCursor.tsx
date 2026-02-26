/* ── SplashCursor — Canvas-based cursor splash animation ──────
 *  Creates subtle ripple effects at cursor position.
 *  Designed to be unobtrusive — fades quickly with brand colors.
 * ─────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useCallback } from 'react'

type Particle = {
  x: number
  y: number
  radius: number
  alpha: number
  dx: number
  dy: number
  color: string
}

type SplashCursorProps = {
  colors?: string[]
  particleCount?: number
  maxRadius?: number
  fadeSpeed?: number
}

export default function SplashCursor({
  colors = ['rgba(0, 121, 112, 0.3)', 'rgba(100, 244, 245, 0.25)', 'rgba(199, 70, 1, 0.2)'],
  particleCount = 6,
  maxRadius = 18,
  fadeSpeed = 0.025,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const lastMoveRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 })

  const spawnParticles = useCallback(
    (x: number, y: number) => {
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.5 + Math.random() * 1.5
        particlesRef.current.push({
          x,
          y,
          radius: 2 + Math.random() * maxRadius,
          alpha: 0.4 + Math.random() * 0.3,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    },
    [colors, particleCount, maxRadius],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      const last = lastMoveRef.current
      // Throttle: only spawn every ~60ms and when moved enough distance
      const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y)
      if (now - last.time > 60 && dist > 20) {
        spawnParticles(e.clientX, e.clientY)
        lastMoveRef.current = { x: e.clientX, y: e.clientY, time: now }
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.dx
        p.y += p.dy
        p.alpha -= fadeSpeed
        p.radius *= 0.98

        if (p.alpha <= 0 || p.radius < 0.5) {
          particles.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.alpha})`)
        ctx.fill()
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [spawnParticles, fadeSpeed])

  // Respect reduced motion
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998]"
      aria-hidden="true"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
