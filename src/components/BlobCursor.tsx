/* ── BlobCursor — Canvas-based blob cursor animation ───────────
 *  Creates a smooth, morphing blob that follows the cursor.
 *  Inspired by https://reactbits.dev/animations/blob-cursor
 *  Uses CareIndeed brand teal for the blob color.
 * ─────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useCallback } from 'react'

interface BlobCursorProps {
  blobColor?: string
  blobSize?: number
  smoothing?: number
}

export default function BlobCursor({
  blobColor = 'rgba(0, 121, 112, 0.35)',
  blobSize = 36,
  smoothing = 0.15,
}: BlobCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -100, y: -100 })
  const blobRef = useRef({ x: -100, y: -100 })
  const animFrameRef = useRef<number>(0)
  const pointsRef = useRef<{ x: number; y: number; originX: number; originY: number; noiseOffsetX: number; noiseOffsetY: number }[]>([])

  // Simple noise using sine for organic feel
  const noise = useCallback((x: number, y: number) => {
    return Math.sin(x * 1.3) * Math.cos(y * 0.7) * 0.5 + 0.5
  }, [])

  // Init blob points around a circle
  const initPoints = useCallback((cx: number, cy: number) => {
    const numPoints = 8
    const pts: typeof pointsRef.current = []
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2
      const x = cx + Math.cos(angle) * blobSize
      const y = cy + Math.sin(angle) * blobSize
      pts.push({
        x,
        y,
        originX: Math.cos(angle) * blobSize,
        originY: Math.sin(angle) * blobSize,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
      })
    }
    pointsRef.current = pts
  }, [blobSize])

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

    const handleMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', handleMove)

    initPoints(0, 0)
    let time = 0

    const render = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smooth follow
      blobRef.current.x += (mouseRef.current.x - blobRef.current.x) * smoothing
      blobRef.current.y += (mouseRef.current.y - blobRef.current.y) * smoothing

      const cx = blobRef.current.x
      const cy = blobRef.current.y
      time += 0.015

      // Update blob points with noise
      const pts = pointsRef.current
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        const n = noise(p.noiseOffsetX + time, p.noiseOffsetY + time)
        const wobble = 0.7 + n * 0.6
        p.x = cx + p.originX * wobble
        p.y = cy + p.originY * wobble
      }

      // Draw smooth blob using Catmull-Rom to Bezier conversion
      if (pts.length < 3) {
        animFrameRef.current = requestAnimationFrame(render)
        return
      }

      ctx.beginPath()
      ctx.fillStyle = blobColor

      // Draw smooth closed curve
      const len = pts.length
      const first = pts[0]
      const last = pts[len - 1]
      const secondLast = pts[len - 2]

      // Start
      const startX = (last.x + first.x) / 2
      const startY = (last.y + first.y) / 2
      ctx.moveTo(startX, startY)

      for (let i = 0; i < len; i++) {
        const curr = pts[i]
        const next = pts[(i + 1) % len]
        const cpx = (curr.x + next.x) / 2
        const cpy = (curr.y + next.y) / 2
        ctx.quadraticCurveTo(curr.x, curr.y, cpx, cpy)
      }

      ctx.closePath()
      ctx.fill()

      // Inner bright dot
      ctx.beginPath()
      ctx.arc(cx, cy, blobSize * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = blobColor.replace(/[\d.]+\)$/, '0.6)')
      ctx.fill()

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handleMove)
    }
  }, [blobColor, blobSize, smoothing, noise, initPoints])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{ mixBlendMode: 'multiply' }}
    />
  )
}
