import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation } from 'lucide-react'

// Custom DivIcon for user selected pin
const pinIcon = L.divIcon({
  className: 'custom-location-pin',
  html: `<div style="background-color: #ef4444; color: white; padding: 6px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.8); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 14px;">📍</span>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

// Ahmedabad Locality Presets
const AHMEDABAD_PRESETS = [
  { name: 'Navrangpura / CG Road', lat: 23.0372, lng: 72.5609 },
  { name: 'Satellite / Jodhpur', lat: 23.0298, lng: 72.5180 },
  { name: 'Vastrapur / IIM Road', lat: 23.0375, lng: 72.5284 },
  { name: 'Mithakhali / Law Garden', lat: 23.0280, lng: 72.5630 },
  { name: 'SG Highway / Thaltej', lat: 23.0500, lng: 72.5050 },
  { name: 'Maninagar / Kankaria', lat: 22.9985, lng: 72.6025 },
  { name: 'Bodakdev / Sindhu Bhavan', lat: 23.0410, lng: 72.5110 },
  { name: 'Shahibaug / Camp Rd', lat: 23.0560, lng: 72.5890 },
]

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapRecenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 14)
    }
  }, [center, map])
  return null
}

export default function LocationPickerMap({
  initialLat = 23.0225,
  initialLng = 72.5714,
  onLocationChange,
}) {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng })
  const [selectedLocality, setSelectedLocality] = useState('Ahmedabad Center')
  const [geoLocating, setGeoLocating] = useState(false)

  const handleSelectPos = (lat, lng, localityName = null) => {
    const roundLat = parseFloat(lat.toFixed(6))
    const roundLng = parseFloat(lng.toFixed(6))
    setPosition({ lat: roundLat, lng: roundLng })

    const loc = localityName || `Lat: ${roundLat}, Lng: ${roundLng}`
    setSelectedLocality(loc)

    if (onLocationChange) {
      onLocationChange({
        latitude: roundLat,
        longitude: roundLng,
        locality: localityName || 'Ahmedabad',
        address: `${loc}, Ahmedabad, Gujarat`,
        location_source: localityName ? 'preset' : 'map_click',
      })
    }
  }

  const handleBrowserGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setGeoLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false)
        handleSelectPos(pos.coords.latitude, pos.coords.longitude, 'Browser Geolocation')
      },
      (err) => {
        setGeoLocating(false)
        alert('Could not retrieve current location. Defaulting to Ahmedabad center.')
      },
      { timeout: 8000 }
    )
  }

  return (
    <div className="space-y-3">
      {/* Locality Quick Selector & Geolocation Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>Incident Geolocation (Ahmedabad)</span>
        </div>

        <button
          type="button"
          onClick={handleBrowserGeolocation}
          disabled={geoLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all text-xs font-medium"
        >
          <Navigation className={`w-3.5 h-3.5 ${geoLocating ? 'animate-spin' : ''}`} />
          <span>{geoLocating ? 'Detecting...' : 'Use Current Location'}</span>
        </button>
      </div>

      {/* Preset Quick Badges */}
      <div className="flex flex-wrap gap-1.5">
        {AHMEDABAD_PRESETS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelectPos(p.lat, p.lng, p.name)}
            className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800/80 hover:bg-primary/20 text-slate-300 hover:text-primary border border-white/5 hover:border-primary/40 transition-all"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Map Canvas */}
      <div className="h-[280px] rounded-xl overflow-hidden border border-primary/20 relative shadow-inner">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
        >
          <MapRecenter center={[position.lat, position.lng]} />
          <MapClickHandler onSelectLocation={(lat, lng) => handleSelectPos(lat, lng)} />
          
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap'
          />

          <Marker position={[position.lat, position.lng]} icon={pinIcon} />
        </MapContainer>

        {/* Selected Coordinates Overlay */}
        <div className="absolute bottom-2 left-2 right-2 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
          <span className="font-mono text-primary font-bold">{selectedLocality}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {position.lat.toFixed(4)}° N, {position.lng.toFixed(4)}° E
          </span>
        </div>
      </div>
    </div>
  )
}
