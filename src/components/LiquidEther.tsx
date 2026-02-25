/* ── LiquidEther — Subtle flowing background animation ────────
 *  Creates organic, slowly morphing gradient blobs using canvas.
 *  Uses brand colors at very low opacity. No mouse interaction.
 * ─────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react'

type Blob = {
  x: number
  y: number
  radius: number
  speedX: number
  speedY: number
  phase: number
  phaseSpeed: number
  color: string
}

type LiquidEtherProps = {
  colors?: string[]
  blobCount?: number
  opacity?: number
  speed?: number
}

export function LiquidEther({
  colors = [
    'rgba(0, 121, 112, 0.08)',   // teal
    'rgba(100, 244, 245, 0.05)', // cyan
    'rgba(199, 70, 1, 0.04)',    // orange
    'rgba(0, 65, 66, 0.06)',     // dark teal
  ],
  blobCount = 5,
  opacity = 1,
  speed = 0.3,
}: LiquidEtherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize blobs
    const blobs: Blob[] = Array.from({ length: blobCount }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 150 + Math.random() * 250,
      speedX: (Math.random() - 0.5) * speed,
      speedY: (Math.random() - 0.5) * speed,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.003 + Math.random() * 0.005,
      color: colors[i % colors.length],
    }))

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      for (const blob of blobs) {
        blob.phase += blob.phaseSpeed
        blob.x += blob.speedX + Math.sin(blob.phase) * 0.3
        blob.y += blob.speedY + Math.cos(blob.phase * 0.7) * 0.2

        // Soft bounce at edges
        if (blob.x < -blob.radius) blob.x = w + blob.radius
        if (blob.x > w + blob.radius) blob.x = -blob.radius
        if (blob.y < -blob.radius) blob.y = h + blob.radius
        if (blob.y > h + blob.radius) blob.y = -blob.radius

        const pulseRadius = blob.radius + Math.sin(blob.phase * 1.3) * 30

        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, pulseRadius,
        )
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.arc(blob.x, blob.y, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [colors, blobCount, speed])

  // Respect reduced motion
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
      style={{ opacity }}
    />
  )
}
