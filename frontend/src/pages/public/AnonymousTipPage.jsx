import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '../../services/api'
import axios from 'axios'
import LanguageSelector from '../../components/ui/LanguageSelector'

const INPUT_STYLE = {
  width: '100%',
  boxSizing: 'border-box',
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 14,
  paddingRight: 14,
  background: 'rgba(4,14,33,0.8)',
  border: '1px solid rgba(180,197,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  resize: 'vertical',
  minHeight: '120px'
}

export default function AnonymousTipPage() {
  const { t } = useTranslation()
  const [tip, setTip] = useState('')
  const [loading, setLoading] = useState(false)
  const [trackingId, setTrackingId] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tip.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await axios.post('/api/v1/anonymous-tips/', { body: tip })
      setTrackingId(response.data.tracking_id)
      setTip('')
    } catch (err) {
      setError(t('errors.generic', 'An error occurred. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#040e21', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 50 }}>
        <LanguageSelector />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>
        
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(37,99,235,0.15)',
            border: '1.5px solid rgba(37,99,235,0.35)',
            marginBottom: 12,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#b4c5ff', fontVariationSettings: "'FILL' 1" }}>security</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Secure Anonymous Tip</h1>
          <p style={{ fontSize: 12, color: '#4cd7f6', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '4px 0 0', fontFamily: "'Space Mono', monospace" }}>
            Confidential Reporting
          </p>
        </div>

        <div style={{
          background: 'rgba(16,26,46,0.75)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(180,197,255,0.12)',
          borderRadius: 16,
          padding: '32px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #2563eb, #4cd7f6, transparent)' }} />

          {trackingId ? (
            <div style={{ textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#10b981', marginBottom: 16 }}>check_circle</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Tip Submitted Securely</h2>
              <p style={{ fontSize: 13, color: '#8d90a0', marginBottom: 24 }}>
                Your information has been encrypted and sent to authorities. Please save your tracking ID:
              </p>
              <div style={{ background: '#091327', padding: '16px', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.3)', marginBottom: 24 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 24, color: '#4cd7f6', fontWeight: 'bold' }}>{trackingId}</span>
              </div>
              <button 
                onClick={() => setTrackingId(null)}
                style={{ background: 'none', border: 'none', color: '#b4c5ff', cursor: 'pointer', textDecoration: 'underline' }}>
                Submit another tip
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: '#8d90a0', margin: '0 0 16px' }}>
                Submit information securely. Your tip will be encrypted with military-grade AES encryption before being saved. No personal identifiers are logged.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#8d90a0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Information / Tip Details
                </label>
                <textarea
                  value={tip}
                  onChange={(e) => setTip(e.target.value)}
                  placeholder="Describe the incident, suspect, or information..."
                  style={INPUT_STYLE}
                  required
                />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.3)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffb4ab' }}>error</span>
                  <p style={{ margin: 0, fontSize: 13, color: '#ffb4ab' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !tip.trim()}
                style={{
                  width: '100%', padding: 14, borderRadius: 8, border: 'none',
                  cursor: loading || !tip.trim() ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: loading || !tip.trim() ? 0.7 : 1, marginTop: 8
                }}
              >
                {loading ? 'ENCRYPTING & SENDING...' : 'SUBMIT SECURE TIP'}
              </button>
            </form>
          )}
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/" style={{ color: '#8d90a0', fontSize: 13, textDecoration: 'none' }}>&larr; Back to Home</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
