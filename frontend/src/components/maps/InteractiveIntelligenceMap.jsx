import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Shield, AlertTriangle, Building2, MapPin, Zap } from 'lucide-react'

// Custom Leaflet DivIcon for Police Stations
const createPoliceIcon = (isCyber) => L.divIcon({
  className: 'custom-station-icon',
  html: `<div style="background-color: ${isCyber ? '#3b82f6' : '#6366f1'}; color: white; padding: 6px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.6); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <span style="font-size: 14px; font-weight: bold;">${isCyber ? '🛡️' : '👮'}</span>
        </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

// Custom Leaflet DivIcon for Incidents
const createIncidentIcon = (urgency) => {
  const color = urgency >= 0.7 ? '#ef4444' : urgency >= 0.4 ? '#f59e0b' : '#10b981'
  return L.divIcon({
    className: 'custom-incident-icon',
    html: `<div style="background-color: ${color}; color: white; padding: 4px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px ${color}; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

function MapRecenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

export default function InteractiveIntelligenceMap({
  center = [23.0225, 72.5714], // Default Ahmedabad Center
  zoom = 12,
  stations = [],
  incidents = [],
  showHeatmap = true,
  height = '500px',
  onSelectIncident,
}) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredIncidents = incidents.filter(inc => {
    if (activeTab === 'cyber') {
      const cat = (inc.category || '').toLowerCase()
      return ['upi', 'otp', 'phish', 'scam', 'cyber', 'fraud', 'hack', 'card', 'crypto'].some(k => cat.includes(k))
    }
    if (activeTab === 'high_risk') return (inc.urgency_score || inc.intensity || 0) >= 0.7
    return true
  })

  return (
    <div className="relative z-0 isolation-isolate rounded-2xl overflow-hidden border border-primary/20 bg-slate-900/90 shadow-2xl flex flex-col" style={{ height }}>
      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wide">AHMEDABAD POLICE INTELLIGENCE GRID</span>
            <span className="ml-2 text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Demo Intelligence Data
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            All Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('cyber')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${activeTab === 'cyber' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Cyber Crimes
          </button>
          <button
            onClick={() => setActiveTab('high_risk')}
            className={`px-3 py-1 rounded-md transition-all font-medium ${activeTab === 'high_risk' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            High Risk (Golden Hour)
          </button>
        </div>
      </div>

      {/* Main Leaflet Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#090d16' }}
        zoomControl={true}
      >
        <MapRecenter center={center} />
        
        {/* Dark Mode Basemap Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        {/* Police Station Markers */}
        {stations.map((st) => (
          <Marker
            key={`st-${st.id}`}
            position={[st.latitude, st.longitude]}
            icon={createPoliceIcon(st.is_cyber_specialized)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 space-y-2 text-slate-100 min-w-[220px]">
                <div className="flex items-center gap-2 font-bold text-sm border-b border-white/10 pb-1 text-primary">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{st.name}</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-slate-400">Jurisdiction:</strong> {st.jurisdiction}</p>
                  <p><strong className="text-slate-400">District:</strong> {st.district}</p>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.is_cyber_specialized ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-300'}`}>
                    {st.is_cyber_specialized ? 'Cyber Crime Cell' : 'General PS'}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Active: <strong className="text-emerald-400">{st.active_cases || 0}</strong></span>
                </div>
                {st.contact_number && (
                  <p className="text-[11px] text-slate-400 font-mono pt-1">📞 {st.contact_number}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Cyber Crime Hotspot Circles */}
        {showHeatmap && filteredIncidents.map((inc, i) => {
          const lat = inc.latitude || inc.lat || (23.0225 + (i * 0.007))
          const lng = inc.longitude || inc.lng || (72.5714 + (i * 0.007))
          const intensity = inc.urgency_score || inc.intensity || 0.5
          const color = intensity >= 0.7 ? '#ef4444' : intensity >= 0.4 ? '#f59e0b' : '#3b82f6'

          return (
            <CircleMarker
              key={`heat-${inc.id || i}`}
              center={[lat, lng]}
              radius={12 + intensity * 18}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.35 + intensity * 0.3,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="p-2 space-y-1 text-slate-900 text-xs">
                  <span className="font-bold text-sm block">{inc.title || inc.category || 'Incident Alert'}</span>
                  <span className="text-slate-600 block">Location: {inc.locality || inc.location || 'Ahmedabad Area'}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold">
                      Risk Score: {(intensity * 100).toFixed(0)}%
                    </span>
                    <span className="text-slate-500">{inc.status || 'Pending'}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        {/* Specific Incident Markers */}
        {filteredIncidents.map((inc) => {
          const lat = inc.latitude || inc.lat
          const lng = inc.longitude || inc.lng
          if (!lat || !lng) return null
          const urgency = inc.urgency_score || inc.intensity || 0.5

          return (
            <Marker
              key={`inc-${inc.id}`}
              position={[lat, lng]}
              icon={createIncidentIcon(urgency)}
              eventHandlers={{
                click: () => onSelectIncident && onSelectIncident(inc)
              }}
            >
              <Popup>
                <div className="p-2 max-w-xs space-y-1.5 text-slate-900 text-xs">
                  <div className="flex items-center justify-between border-b pb-1 font-bold">
                    <span>{inc.complaint_id || `CASE-#${inc.id}`}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] text-white ${urgency >= 0.7 ? 'bg-red-600' : 'bg-amber-600'}`}>
                      {urgency >= 0.7 ? 'CRITICAL' : 'HIGH'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800">{inc.title}</p>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{inc.description || inc.category}</p>
                  {inc.assignment_explanation && (
                    <div className="mt-1 p-1.5 rounded bg-blue-50 border border-blue-200 text-[10px] text-blue-900 space-y-0.5">
                      <span className="font-bold block">Assigned Station: {inc.station_name || 'Cyber Cell'}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 border border-white inline-block"></span>
          <span>Cyber Crime Cell</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500 border border-white inline-block"></span>
          <span>Police Station</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white inline-block"></span>
          <span>Golden Hour Hotspot</span>
        </div>
      </div>
    </div>
  )
}
