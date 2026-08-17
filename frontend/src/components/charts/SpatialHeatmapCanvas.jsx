import { useEffect, useRef, useState } from 'react'

export default function SpatialHeatmapCanvas({ points = [], height = 520 }) {
  const canvasRef = useRef(null)
  const [selectedHotspot, setSelectedHotspot] = useState(null)
  const [densityFilter, setDensityFilter] = useState('all')

  const defaultHotspots = [
    { name: 'Navrangpura Cyber Cluster', x: 0.45, y: 0.38, intensity: 0.94, count: 18, category: 'UPI & Sextortion Scam', station: 'Navrangpura Cyber Cell' },
    { name: 'SG Highway Tech Corridor', x: 0.72, y: 0.52, intensity: 0.88, count: 14, category: 'Investment Fraud', station: 'Vastrapur PS' },
    { name: 'Satellite Financial Sector', x: 0.35, y: 0.65, intensity: 0.81, count: 11, category: 'Phishing Scams', station: 'Satellite PS' },
    { name: 'C.G. Road Commercial Hub', x: 0.52, y: 0.45, intensity: 0.76, count: 9, category: 'OTP Extraction', station: 'Ellisbridge PS' },
    { name: 'Science City IT Belt', x: 0.80, y: 0.28, intensity: 0.69, count: 7, category: 'APK Malware', station: 'Sola Cyber Cell' },
    { name: 'Maninagar South Grid', x: 0.28, y: 0.82, intensity: 0.62, count: 5, category: 'Job Scam', station: 'Maninagar PS' },
  ]

  const activePoints = points.length > 0 ? points.map((p, i) => ({
    name: p.locality || p.location || `Sector ${i+1}`,
    x: 0.2 + (i * 0.12) % 0.6,
    y: 0.25 + (i * 0.15) % 0.55,
    intensity: p.intensity || 0.65,
    count: Math.round((p.intensity || 0.6) * 15),
    category: p.category || 'Cyber Crime',
    station: p.station_name || 'Jurisdiction Cell'
  })) : defaultHotspots

  const filteredPoints = activePoints.filter(p => {
    if (densityFilter === 'critical') return p.intensity >= 0.75
    if (densityFilter === 'high') return p.intensity >= 0.60
    return true
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const render = () => {
      const w = canvas.width = canvas.offsetWidth
      const h = canvas.height = height

      // Background Grid
      ctx.fillStyle = '#060a12'
      ctx.fillRect(0, 0, w, h)

      // Tactical Grid Lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)'
      ctx.lineWidth = 1
      const gridSize = 40
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Draw Thermal Heat Gradient Circles
      const time = Date.now() * 0.002
      filteredPoints.forEach((p) => {
        const px = p.x * w
        const py = p.y * h
        const radius = 60 + p.intensity * 70

        // Radial Thermal Gradient
        const grad = ctx.createRadialGradient(px, py, 0, px, py, radius)
        if (p.intensity >= 0.8) {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)')
          grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.5)')
          grad.addColorStop(0.7, 'rgba(234, 179, 8, 0.2)')
          grad.addColorStop(1, 'rgba(239, 68, 68, 0)')
        } else if (p.intensity >= 0.65) {
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.75)')
          grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)')
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)')
        } else {
          grad.addColorStop(0, 'rgba(59, 130, 246, 0.7)')
          grad.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)')
          grad.addColorStop(1, 'rgba(59, 130, 246, 0)')
        }

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fill()

        // Animated Pulse Waves
        const pulse = (Math.sin(time + px) + 1) * 0.5 * 15
        ctx.strokeStyle = p.intensity >= 0.8 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.5)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(px, py, 15 + pulse, 0, Math.PI * 2)
        ctx.stroke()

        // Center Point Icon
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fill()

        // Sector Name Label
        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 11px Space Mono, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(p.name, px, py - 18)
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animationFrameId)
  }, [filteredPoints, height])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-slate-950 shadow-2xl flex flex-col" style={{ height }}>
      {/* Thermal Controls Header */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider">THERMAL CRIME DENSITY RADAR</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => setDensityFilter('all')}
            className={`px-3 py-1 rounded transition-all ${densityFilter === 'all' ? 'bg-primary text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            All Hotspots ({activePoints.length})
          </button>
          <button
            onClick={() => setDensityFilter('critical')}
            className={`px-3 py-1 rounded transition-all ${densityFilter === 'critical' ? 'bg-red-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            Critical Density (&gt;75%)
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

      {/* Thermal Legend Footer */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-[10px]">DENSITY GRADIENT:</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-red-400 font-bold text-[10px]">CRITICAL (80%+)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-amber-400 font-bold text-[10px]">HIGH (65%-79%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-blue-400 font-bold text-[10px]">MODERATE (&lt;65%)</span>
          </div>
        </div>

        <span className="text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          ● SPATIAL CANVAS ACTIVE
        </span>
      </div>
    </div>
  )
}
