'use client'

import * as React from 'react'

interface HeroBackgroundWavesProps {
  className?: string
  opacity?: number
}

/**
 * "The Gentleman" Directional Spotlight & Horizon Canvas (Subtle & Elegant Edition).
 * - Focused lighthouse / spotlight cone: Only 2-4 subtle rays illuminate in the direction of the light
 * - Rays elsewhere remain dormant (zero screen clutter, ultra-refined whisper aesthetic)
 * - Soft, elegant light levels perfectly calibrated for both Dark & Light modes
 * - Autonomous breathing beacon when idle; smooth interactive follow when moving
 */
export function HeroBackgroundWaves({
  className = '',
  opacity = 0.85,
}: HeroBackgroundWavesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const mouseRef = React.useRef<{
    x: number
    y: number
    targetX: number
    targetY: number
    isActive: boolean
    lastMoveTime: number
  }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isActive: false,
    lastMoveTime: 0,
  })

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let dpr = 1
    let time = 0

    const handleResize = () => {
      if (!canvas) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.parentElement?.clientWidth || window.innerWidth
      height = canvas.parentElement?.clientHeight || 950

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.targetX = e.clientX - rect.left
      mouseRef.current.targetY = e.clientY - rect.top
      mouseRef.current.isActive = true
      mouseRef.current.lastMoveTime = Date.now()
    }

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    handleResize()

    const render = () => {
      time += 0.01

      // Check current theme state
      const isDark = document.documentElement.classList.contains('dark')

      // Color channels:
      // Dark Mode: Pure White / Silver (255, 255, 255)
      // Light Mode: Pure Black / Obsidian (0, 0, 0)
      const r = isDark ? 255 : 0
      const g = isDark ? 255 : 0
      const b = isDark ? 255 : 0

      const now = Date.now()
      const isMoving =
        mouseRef.current.isActive && now - mouseRef.current.lastMoveTime < 1600

      // Smooth mouse interpolation
      if (isMoving) {
        mouseRef.current.x +=
          (mouseRef.current.targetX - mouseRef.current.x) * 0.07
        mouseRef.current.y +=
          (mouseRef.current.targetY - mouseRef.current.y) * 0.07
      } else {
        // Autonomous gentle breathing beacon
        const autoX = width * 0.5 + Math.sin(time * 0.6) * (width * 0.25)
        const autoY = height * 0.38 + Math.cos(time * 0.45) * 45
        mouseRef.current.x += (autoX - mouseRef.current.x) * 0.025
        mouseRef.current.y += (autoY - mouseRef.current.y) * 0.025
      }

      ctx.clearRect(0, 0, width, height)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const originX = width * 0.5
      const originY = -80

      // 1. Soft Top Ambient Light Ray (Whisper Subtle)
      const topSpotlight = ctx.createRadialGradient(
        originX,
        originY,
        0,
        originX,
        height * 0.42,
        width * 0.6,
      )
      const topAlpha = (isDark ? 0.08 : 0.06) * opacity
      topSpotlight.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${topAlpha})`)
      topSpotlight.addColorStop(
        0.5,
        `rgba(${r}, ${g}, ${b}, ${topAlpha * 0.2})`,
      )
      topSpotlight.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

      ctx.fillStyle = topSpotlight
      ctx.fillRect(0, 0, width, height)

      // 2. Focused Spotlight Halo at Current Beacon/Cursor Position
      const beaconRadius = isMoving ? 380 : 320
      const beaconIntensity =
        (isMoving ? (isDark ? 0.12 : 0.09) : isDark ? 0.08 : 0.06) * opacity
      const beaconGlow = ctx.createRadialGradient(
        mx,
        my,
        0,
        mx,
        my,
        beaconRadius,
      )
      beaconGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${beaconIntensity})`)
      beaconGlow.addColorStop(
        0.45,
        `rgba(${r}, ${g}, ${b}, ${beaconIntensity * 0.3})`,
      )
      beaconGlow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

      ctx.fillStyle = beaconGlow
      ctx.beginPath()
      ctx.arc(mx, my, beaconRadius, 0, Math.PI * 2)
      ctx.fill()

      // 3. Directional Focused Rays (Only illuminate in a narrow angle toward the active beacon!)
      const rayCount = 36
      const beaconAngle = Math.atan2(mx - originX, my - originY)
      const spotAngleWidth = 0.28 // Narrow focused cone angle (~16 degrees)

      ctx.lineWidth = isDark ? 0.6 : 0.75

      for (let i = 0; i < rayCount; i++) {
        const angle = -Math.PI * 0.45 + (Math.PI * 0.9 * i) / (rayCount - 1)
        const angleDiff = Math.abs(angle - beaconAngle)

        // Only illuminate rays within the narrow directional cone of the light!
        if (angleDiff > spotAngleWidth) continue

        const angularProximity = Math.max(0, 1 - angleDiff / spotAngleWidth)
        const rayPower = Math.pow(angularProximity, 2.2)

        const rayAlpha = (isDark ? 0.22 : 0.16) * rayPower * opacity

        const rayLength = height * 1.35
        const endX = originX + Math.sin(angle) * rayLength
        const endY = originY + Math.cos(angle) * rayLength

        const rayGradient = ctx.createLinearGradient(
          originX,
          originY,
          endX,
          endY,
        )
        rayGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
        rayGradient.addColorStop(
          0.2,
          `rgba(${r}, ${g}, ${b}, ${rayAlpha * 1.3})`,
        )
        rayGradient.addColorStop(
          0.7,
          `rgba(${r}, ${g}, ${b}, ${rayAlpha * 0.7})`,
        )
        rayGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

        ctx.strokeStyle = rayGradient
        ctx.beginPath()
        ctx.moveTo(originX, originY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }

      // 4. Subtle Base Horizon Lines (Gentle framing at bottom)
      const horizonY = height * 0.64
      const lineCount = 6
      ctx.lineWidth = isDark ? 0.5 : 0.6

      for (let j = 0; j < lineCount; j++) {
        const progress = j / (lineCount - 1)
        const y = horizonY + Math.pow(progress, 1.8) * (height - horizonY)
        const lineAlpha =
          (isDark ? 0.02 + progress * 0.03 : 0.02 + progress * 0.04) * opacity

        const hGrad = ctx.createLinearGradient(0, y, width, y)
        hGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`)
        hGrad.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, ${lineAlpha})`)
        hGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${lineAlpha * 1.4})`)
        hGrad.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${lineAlpha})`)
        hGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

        ctx.strokeStyle = hGrad
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [opacity])

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* 1. Base */}
      <div className="bg-background absolute inset-0" />

      {/* 2. Top-Center Subtle Ambient Glow */}
      <div className="from-foreground/8 via-foreground/2 pointer-events-none absolute -top-36 left-1/2 h-[450px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent blur-[120px]" />

      {/* 3. 60fps Directional Spotlight Canvas */}
      <canvas
        ref={canvasRef}
        className="relative h-full w-full opacity-95 transition-opacity duration-700"
      />

      {/* 4. Fine Atmospheric Vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_45%,var(--background)_92%]" />
      <div className="from-background absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t to-transparent" />
    </div>
  )
}
