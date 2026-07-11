import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CyberButton } from '../components/ui/Forms'

export default function UnauthorizedPage() {
  const { getDefaultRoute } = useAuth()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-lg">
      <div className="glass-panel p-xl rounded-xl text-center max-w-md">
        <span className="material-symbols-outlined text-error text-6xl mb-md">gpp_bad</span>
        <h1 className="font-display-lg text-primary mb-sm">Access Denied</h1>
        <p className="text-on-surface-variant mb-lg">You do not have permission to access this sector.</p>
        <Link to={getDefaultRoute()}>
          <CyberButton>Return to Dashboard</CyberButton>
        </Link>
      </div>
    </div>
  )
}
