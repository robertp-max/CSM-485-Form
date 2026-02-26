/* ── CursorPreview — Mini canvas preview for cursor prize effects ──
 *  Renders a self-contained animated preview inside a small box.
 *  Used in SystemsCalibration prize selection step.
 * ──────────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react'

interface CursorPreviewProps {
  type: 'blob' | 'splash'
  width?: number
  height?: number
  /** palette-aware background so it blends with the card */
  bgColor?: string
}

export default function CursorPreview({
  type,
  width = 140,
  height = 80,
  bgColor = 'transparent',
}: CursorPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Retina support
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    let time = 0

    if (type === 'blob') {
      // ── Blob cursor preview ─────────────────────────────────
      const blobSize = 14
      const numPoints = 8
      const points = Array.from({ length: numPoints }, (_, i) => {
        const angle = (i / numPoints) * Math.PI * 2
        return {
          originX: Math.cos(angle) * blobSize,
          originY: Math.sin(angle) * blobSize,
          noiseX: Math.random() * 1000,
          noiseY: Math.random() * 1000,
        }
      })

      const render = () => {
        ctx.clearRect(0, 0, width, height)
        time += 0.02

        // Smooth figure-8 path
        const cx = width / 2 + Math.sin(time * 0.7) * (width * 0.22)
        const cy = height / 2 + Math.sin(time * 1.4) * (height * 0.18)

        // Faint trail dots
        for (let t = 1; t <= 3; t++) {
          const trailT = time - t * 0.06
          const tx = width / 2 + Math.sin(trailT * 0.7) * (width * 0.22)
          const ty = height / 2 + Math.sin(trailT * 1.4) * (height * 0.18)
          ctx.beginPath()
          ctx.arc(tx, ty, blobSize * (0.18 - t * 0.04), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0, 121, 112, ${0.12 - t * 0.03})`
          ctx.fill()
        }

        // Draw morphing blob
        const pts = points.map((p) => {
          const n =
            Math.sin(p.noiseX + time * 1.2) *
              Math.cos(p.noiseY + time * 1.2) *
              0.5 +
            0.5
          const wobble = 0.7 + n * 0.6
          return {
            x: cx + p.originX * wobble,
            y: cy + p.originY * wobble,
          }
        })

        ctx.beginPath()
        ctx.fillStyle = 'rgba(0, 121, 112, 0.32)'
        const last = pts[pts.length - 1]
        const first = pts[0]
        ctx.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2)
        for (let i = 0; i < pts.length; i++) {
          const curr = pts[i]
          const next = pts[(i + 1) % pts.length]
          ctx.quadraticCurveTo(
            curr.x,
            curr.y,
            (curr.x + next.x) / 2,
            (curr.y + next.y) / 2,
          )
        }
        ctx.closePath()
        ctx.fill()

        // Inner bright dot
        ctx.beginPath()
        ctx.arc(cx, cy, blobSize * 0.15, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 121, 112, 0.55)'
        ctx.fill()

        animRef.current = requestAnimationFrame(render)
      }

      animRef.current = requestAnimationFrame(render)
    } else {
      // ── Splash cursor preview ───────────────────────────────
      const colors = [
        'rgba(0, 121, 112, 0.5)',
        'rgba(100, 244, 245, 0.4)',
        'rgba(199, 70, 1, 0.3)',
      ]
      type Particle = {
        x: number
        y: number
        r: number
        a: number
        dx: number
        dy: number
        color: string
      }
      const particles: Particle[] = []
      let lastSpawn = 0

      const render = () => {
        ctx.clearRect(0, 0, width, height)
        time += 0.02

        // Spawn particles along a looping path
        if (time - lastSpawn > 0.12) {
          const cx = width / 2 + Math.sin(time * 0.8) * (width * 0.26)
          const cy = height / 2 + Math.cos(time * 1.2) * (height * 0.2)
          for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 0.3 + Math.random() * 0.8
            particles.push({
              x: cx,
              y: cy,
              r: 1.5 + Math.random() * 5,
              a: 0.5 + Math.random() * 0.3,
              dx: Math.cos(angle) * speed,
              dy: Math.sin(angle) * speed,
              color: colors[Math.floor(Math.random() * colors.length)],
            })
          }
          lastSpawn = time
        }

        // Update and draw
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.dx
          p.y += p.dy
          p.a -= 0.01
          p.r *= 0.99
          if (p.a <= 0 || p.r < 0.3) {
            particles.splice(i, 1)
            continue
          }
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.a})`)
          ctx.fill()
        }

        animRef.current = requestAnimationFrame(render)
      }

      animRef.current = requestAnimationFrame(render)
    }

    return () => cancelAnimationFrame(animRef.current)
  }, [type, width, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, background: bgColor }}
      className="rounded-lg"
      aria-hidden="true"
    />
  )
}
