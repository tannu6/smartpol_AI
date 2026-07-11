import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function CrimeHeatmap({ points = [] }) {
  const defaultPoints = points.length ? points : [
    { lat: 28.6139, lng: 77.2090, intensity: 0.9 },
    { lat: 28.6200, lng: 77.2150, intensity: 0.7 },
    { lat: 28.6080, lng: 77.2000, intensity: 0.5 },
    { lat: 28.6250, lng: 77.2200, intensity: 0.85 },
    { lat: 28.6050, lng: 77.1950, intensity: 0.6 },
    { lat: 28.6300, lng: 77.2300, intensity: 0.4 },
    { lat: 28.6000, lng: 77.1900, intensity: 0.95 },
    { lat: 28.6180, lng: 77.2050, intensity: 0.55 },
  ]

  const getColor = (intensity) => {
    if (intensity > 0.8) return '#ffb4ab'
    if (intensity > 0.5) return '#4cd7f6'
    return '#2563eb'
  }

  return (
    <div className="h-[400px] rounded-xl overflow-hidden border border-primary/15">
      <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />
        {defaultPoints.map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.lat, p.lng]}
            radius={8 + p.intensity * 15}
            pathOptions={{ color: getColor(p.intensity), fillColor: getColor(p.intensity), fillOpacity: 0.5 + p.intensity * 0.3 }}
          >
            <Popup>
              <span className="font-mono-data text-xs">Risk: {(p.intensity * 100).toFixed(0)}%</span>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
