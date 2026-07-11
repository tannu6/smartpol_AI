import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#2563eb', '#4cd7f6', '#b4c5ff', '#161f34', '#8343f4', '#ffb4ab']

export function CrimeTrendChart({ data }) {
  const chartData = data || [
    { time: '00:00', crimes: 12 }, { time: '04:00', crimes: 19 },
    { time: '08:00', crimes: 3 }, { time: '12:00', crimes: 5 },
    { time: '16:00', crimes: 2 }, { time: '20:00', crimes: 20 },
    { time: '23:59', crimes: 15 },
  ]
  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="crimeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4cd7f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#4cd7f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,197,255,0.05)" />
        <XAxis dataKey="time" tick={{ fill: '#8d90a0', fontSize: 10, fontFamily: 'Space Mono' }} />
        <YAxis tick={{ fill: '#8d90a0', fontSize: 10, fontFamily: 'Space Mono' }} />
        <Tooltip contentStyle={{ background: '#161f34', border: '1px solid rgba(180,197,255,0.15)', borderRadius: 4 }} />
        <Area type="monotone" dataKey="crimes" stroke="#4cd7f6" strokeWidth={3} fill="url(#crimeGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CategoryPieChart({ data }) {
  const chartData = data || [
    { name: 'Theft', value: 45 }, { name: 'Assault', value: 25 },
    { name: 'Cyber', value: 20 }, { name: 'Other', value: 10 },
  ]
  return (
    <ResponsiveContainer width="100%" height={256}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={2}>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#161f34', border: '1px solid rgba(180,197,255,0.15)' }} />
        <Legend wrapperStyle={{ color: '#d9e2fe', fontSize: 10 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function OfficerPerformanceChart({ data }) {
  const chartData = data || []
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,197,255,0.05)" />
        <XAxis dataKey="name" tick={{ fill: '#8d90a0', fontSize: 10 }} />
        <YAxis tick={{ fill: '#8d90a0', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#161f34', border: '1px solid rgba(180,197,255,0.15)' }} />
        <Bar dataKey="cases" fill="#2563eb" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RiskGauge({ value = 75, label = 'Risk Level' }) {
  const color = value > 80 ? '#ffb4ab' : value > 50 ? '#4cd7f6' : '#b4c5ff'
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#161f34" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${value * 2.51} 251`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-on-surface">{value}%</span>
        </div>
      </div>
      <p className="font-label-caps text-label-caps text-on-surface-variant mt-2">{label}</p>
    </div>
  )
}

export function DailyTrendChart({ data }) {
  const chartData = (data || []).map(d => ({ date: d.date?.slice(5) || d.date, crimes: d.crimes, resolved: d.resolved }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(180,197,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: '#8d90a0', fontSize: 10 }} />
        <YAxis tick={{ fill: '#8d90a0', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#161f34', border: '1px solid rgba(180,197,255,0.15)' }} />
        <Line type="monotone" dataKey="crimes" stroke="#ffb4ab" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="resolved" stroke="#4cd7f6" strokeWidth={2} dot={false} />
        <Legend wrapperStyle={{ color: '#d9e2fe', fontSize: 10 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
