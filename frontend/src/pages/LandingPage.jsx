import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../components/ui/LanguageSelector'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { t } = useTranslation()
  const { isAuthenticated, getDefaultRoute } = useAuth()
  const navigate = useNavigate()
  
  // Active Tab for Roles Section
  const [activeRoleTab, setActiveRoleTab] = useState(0)

  // Canvas Particles
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    
    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const particles = []
    const particleCount = 70
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(76, 215, 246, 0.4)'
      
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha})`
        ctx.shadowBlur = 8
        ctx.shadowColor = '#2563eb'
        ctx.fill()
        
        p.x += p.vx
        p.y += p.vy
        
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
      })
      
      animationFrameId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const capabilities = [
    { icon: 'psychology', title: 'AI Fraud Detection', desc: 'Real-time neural networks identifying complex scam patterns.', colSpan: 'md:col-span-2' },
    { icon: 'speed', title: 'Real-Time Risk Scoring', desc: 'Dynamic threat level assignment for incoming reports.', colSpan: 'md:col-span-1' },
    { icon: 'smart_toy', title: 'Complaint Intelligence', desc: 'Automated entity extraction and NLP-driven categorization.', colSpan: 'md:col-span-1' },
    { icon: 'lock', title: 'Evidence Management', desc: 'Immutable, cryptographically hashed secure data vaults.', colSpan: 'md:col-span-2' },
    { icon: 'share', title: 'Scam Pattern Analysis', desc: 'Cross-referencing databases to map vast criminal networks.', colSpan: 'md:col-span-1' },
    { icon: 'gavel', title: 'Police Investigation Tools', desc: 'Tactical grids prioritizing actionable intelligence.', colSpan: 'md:col-span-1' },
    { icon: 'online_prediction', title: 'Predictive Analytics', desc: 'Forecasting emerging threat zones before they escalate.', colSpan: 'md:col-span-1' },
  ]

  const workflowSteps = [
    { num: '01', title: 'Report', desc: 'Citizens easily submit detailed digital complaints.' },
    { num: '02', title: 'Analyze', desc: 'AI engine scans input, extracts entities, and correlates data.' },
    { num: '03', title: 'Detect', desc: 'Threats and scam patterns are flagged instantaneously.' },
    { num: '04', title: 'Investigate', desc: 'Officers access enriched intelligence in the tactical dashboard.' },
    { num: '05', title: 'Act', desc: 'Swift resolution, unit dispatch, and evidence preservation.' },
  ]

  const roles = [
    { name: 'Citizens', icon: 'person', desc: 'Secure complaint portal, real-time status tracking, and direct evidence uploads.' },
    { name: 'Police Officers', icon: 'local_police', desc: 'Live incident feeds, priority queues, and AI-enriched investigation dossiers.' },
    { name: 'Supervisors', icon: 'monitoring', desc: 'Strategic command grids, predictive crime heatmaps, and intelligence fusion.' },
    { name: 'Intelligence Agents', icon: 'security', desc: 'Encrypted communication, covert mission timelines, and urgent alerts.' },
    { name: 'Administrators', icon: 'admin_panel_settings', desc: 'Complete system oversight, strict access controls, and comprehensive audit logs.' },
  ]

  const navLinks = [
    { label: t('landing.nav.capabilities', 'Capabilities'), href: '#capabilities' },
    { label: t('landing.nav.howItWorks', 'How It Works'), href: '#workflow' },
    { label: t('landing.nav.intelligence', 'Intelligence'), href: '#intelligence' },
    { label: t('landing.nav.roles', 'Platform Roles'), href: '#roles' },
  ]

  return (
    <div style={{ background: '#040e21', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />
      
      {/* Grid Overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      {/* HEADER */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 72, background: 'rgba(4, 14, 33, 0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(180, 197, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: 'rgba(37,99,235,0.15)', border: '1.5px solid rgba(37,99,235,0.4)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#b4c5ff', fontVariationSettings: "'FILL' 1" }}>shield</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #b4c5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SMARTPOL AI</span>
        </div>

        <div style={{ display: 'none', gap: 28 }} className="lg:flex">
          {navLinks.map((link, i) => (
            <a key={i} href={link.href} style={{ color: '#8d90a0', textDecoration: 'none', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#8d90a0'}>{link.label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LanguageSelector />
          {isAuthenticated ? (
            <button onClick={() => navigate(getDefaultRoute())} style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 16px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}>
              {t('landing.nav.console', 'Command Center')}
            </button>
          ) : (
            <Link to="/login" style={{ background: 'rgba(37, 99, 235, 0.1)', border: '1.5px solid rgba(37, 99, 235, 0.35)', color: '#fff', textDecoration: 'none', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(37,99,235,0.2)'} onMouseLeave={e => e.target.style.background = 'rgba(37,99,235,0.1)'}>
              {t('landing.nav.login', 'LOGIN')}
            </Link>
          )}
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '140px 24px 80px', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 65%)', pointerEvents: 'none', filter: 'blur(40px)' }} />

        {/* Abstract Radar Visual */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(76,215,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '1px dashed rgba(37,99,235,0.2)', animation: 'spin 20s linear infinite' }} />
          <div style={{ position: 'absolute', inset: -40, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.1)', animation: 'spin 30s linear infinite reverse' }} />
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#4cd7f6', filter: 'drop-shadow(0 0 10px rgba(76,215,246,0.5))' }}>troubleshoot</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px', textTransform: 'uppercase', background: 'linear-gradient(to right, #fff, #b4c5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', maxWidth: 900 }}>
          {t('landing.hero.title', 'AI-POWERED CYBER FRAUD DETECTION AND SMART POLICING')}
        </motion.h1>
        
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#8d90a0', fontWeight: 500, maxWidth: 640, margin: '0 0 40px', lineHeight: 1.5 }}>
          {t('landing.hero.subtitle', 'The unified tactical platform bridging citizens, law enforcement, and cognitive AI to dismantle digital fraud networks in real-time.')}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <Link to="/citizen/complaint" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', padding: '16px 36px', borderRadius: 8, fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 0 24px rgba(37,99,235,0.4)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>report</span>
            {t('landing.hero.ctaPrimary', 'Report Cyber Fraud')}
          </Link>
          <Link to="/anonymous-tip" style={{ textDecoration: 'none', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(10px)', color: '#10b981', padding: '16px 36px', borderRadius: 8, fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)' }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>security</span>
            Anonymous Tip
          </Link>
          <Link to="/login" style={{ textDecoration: 'none', background: 'rgba(16,26,46,0.6)', border: '1px solid rgba(180,197,255,0.15)', backdropFilter: 'blur(10px)', color: '#b4c5ff', padding: '16px 36px', borderRadius: 8, fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180,197,255,0.3)'; e.currentTarget.style.color = '#fff' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(180,197,255,0.15)'; e.currentTarget.style.color = '#b4c5ff' }}>
            {t('landing.hero.ctaSecondary', 'Explore Platform / Login')}
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </Link>
        </motion.div>
      </section>

      {/* 2. PLATFORM CAPABILITIES */}
      <section id="capabilities" style={{ padding: '100px 24px', position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', borderTop: '1px solid rgba(180,197,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{t('landing.capabilities.title', 'Platform Capabilities')}</h2>
          <div style={{ width: 60, height: 4, background: '#2563eb', margin: '16px auto 0', borderRadius: 2 }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} className={`${cap.colSpan}`} style={{ background: 'rgba(16,26,46,0.5)', border: '1px solid rgba(180,197,255,0.08)', borderRadius: 16, padding: 32, backdropFilter: 'blur(10px)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <span className="material-symbols-outlined" style={{ color: '#4cd7f6', fontSize: 24 }}>{cap.icon}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px', color: '#fff' }}>{t(`landing.capabilities.${i}.title`, cap.title)}</h3>
              <p style={{ color: '#8d90a0', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{t(`landing.capabilities.${i}.desc`, cap.desc)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="workflow" style={{ padding: '100px 24px', background: 'rgba(16,26,46,0.3)', borderTop: '1px solid rgba(180,197,255,0.06)', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{t('landing.workflow.title', 'How It Works')}</h2>
            <div style={{ width: 60, height: 4, background: '#2563eb', margin: '16px auto 0', borderRadius: 2 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {workflowSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(4,14,33,0.6)', border: '1px solid rgba(180,197,255,0.06)', padding: '24px 32px', borderRadius: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: 'rgba(37,99,235,0.3)', fontFamily: "'Space Mono', monospace", width: 80, flexShrink: 0 }}>
                  {step.num}
                </div>
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>{t(`landing.workflow.${i}.title`, step.title)}</h3>
                  <p style={{ color: '#8d90a0', fontSize: 15, margin: 0, lineHeight: 1.5 }}>{t(`landing.workflow.${i}.desc`, step.desc)}</p>
                </div>
                {i !== workflowSteps.length - 1 && (
                  <div className="hidden md:block material-symbols-outlined" style={{ fontSize: 32, color: 'rgba(180,197,255,0.1)' }}>arrow_downward</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI INTELLIGENCE SECTION */}
      <section id="intelligence" style={{ padding: '100px 24px', position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', borderTop: '1px solid rgba(180,197,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60 }} className="lg:grid-cols-2">
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2 }}>{t('landing.intelligence.title', 'AI Intelligence Engine')}</h2>
            <p style={{ color: '#8d90a0', fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>
              {t('landing.intelligence.desc', 'Our proprietary cognitive engine analyzes incoming data in milliseconds. It instantly calculates risk scores, maps suspicious patterns, uncovers hidden entity relationships, and provides actionable predictive insights.')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Risk Score Analysis', 'Suspicious Pattern Detection', 'Entity Relationship Graphing', 'Predictive Crime Insights'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 20 }}>check_circle</span>
                  <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{t(`landing.intelligence.features.${idx}`, item)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Mock UI */}
          <div style={{ background: 'rgba(4,14,33,0.8)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 0 40px rgba(37,99,235,0.1)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(180,197,255,0.1)', paddingBottom: 16, marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4cd7f6', letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>SCAM_DNA_ANALYSIS</span>
              <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>CRITICAL RISK</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: 'rgba(16,26,46,0.6)', padding: 16, borderRadius: 8, border: '1px solid rgba(180,197,255,0.05)' }}>
                <div style={{ color: '#8d90a0', fontSize: 11, marginBottom: 8 }}>THREAT SCORE</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  96.4<span style={{ fontSize: 14, color: '#8d90a0' }}>/100</span>
                </div>
              </div>
              <div style={{ background: 'rgba(16,26,46,0.6)', padding: 16, borderRadius: 8, border: '1px solid rgba(180,197,255,0.05)' }}>
                <div style={{ color: '#8d90a0', fontSize: 11, marginBottom: 8 }}>SCAM CLUSTER</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>Financial Phishing</div>
                <div style={{ fontSize: 12, color: '#8d90a0', marginTop: 4 }}>Pattern Match: HIGH</div>
              </div>
            </div>

            <div style={{ background: 'rgba(16,26,46,0.6)', padding: 16, borderRadius: 8, border: '1px solid rgba(180,197,255,0.05)' }}>
              <div style={{ color: '#8d90a0', fontSize: 11, marginBottom: 12 }}>ENTITY RELATIONSHIPS (MOCK)</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(37,99,235,0.2)', border: '2px solid #2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 20, color: '#b4c5ff' }}>person</span></div>
                <div style={{ flex: 1, height: 2, background: 'rgba(180,197,255,0.2)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: '#8d90a0' }}>Transferred</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fca5a5' }}>account_balance</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECURITY SECTION */}
      <section style={{ padding: '100px 24px', background: 'rgba(16,26,46,0.3)', borderTop: '1px solid rgba(180,197,255,0.06)', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{t('landing.security.title', 'Military-Grade Security')}</h2>
          <div style={{ width: 60, height: 4, background: '#10b981', margin: '16px auto 40px', borderRadius: 2 }} />
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: 'shield_lock', label: 'Secure Evidence Vault' },
              { icon: 'admin_panel_settings', label: 'Role-Based Access' },
              { icon: 'receipt_long', label: 'Immutable Audit Logs' },
              { icon: 'enhanced_encryption', label: 'Encrypted Comms' },
              { icon: 'fingerprint', label: 'Secure Auth (JWT)' }
            ].map((sec, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#10b981' }}>{sec.icon}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{t(`landing.security.${i}`, sec.label)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ROLE-BASED PLATFORM SECTION */}
      <section id="roles" style={{ padding: '100px 24px', position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', borderTop: '1px solid rgba(180,197,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{t('landing.roles.title', 'One Platform, Distinct Roles')}</h2>
          <p style={{ color: '#8d90a0', fontSize: 16, marginTop: 12 }}>{t('landing.roles.subtitle', 'Tailored tactical interfaces for every level of the law enforcement chain.')}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
          {roles.map((r, i) => (
            <button 
              key={i} 
              onClick={() => setActiveRoleTab(i)}
              style={{ background: activeRoleTab === i ? 'rgba(37,99,235,0.2)' : 'rgba(16,26,46,0.6)', border: `1px solid ${activeRoleTab === i ? 'rgba(37,99,235,0.6)' : 'rgba(180,197,255,0.1)'}`, padding: '12px 24px', borderRadius: 30, color: activeRoleTab === i ? '#fff' : '#8d90a0', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{r.icon}</span>
              {t(`landing.roles.tabs.${i}`, r.name)}
            </button>
          ))}
        </div>

        <motion.div 
          key={activeRoleTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ background: 'rgba(16,26,46,0.5)', border: '1px solid rgba(180,197,255,0.08)', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 800, margin: '0 auto' }}
        >
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#4cd7f6' }}>{roles[activeRoleTab].icon}</span>
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>{t(`landing.roles.tabs.${activeRoleTab}`, roles[activeRoleTab].name)} Interface</h3>
          <p style={{ fontSize: 16, color: '#8d90a0', lineHeight: 1.6, margin: 0 }}>
            {t(`landing.roles.desc.${activeRoleTab}`, roles[activeRoleTab].desc)}
          </p>
        </motion.div>
      </section>

      {/* 7. FINAL CTA */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(180deg, transparent, rgba(37,99,235,0.1))', borderTop: '1px solid rgba(180,197,255,0.06)', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.02em' }}>{t('landing.cta.title', 'Ready to Secure the Grid?')}</h2>
          <p style={{ color: '#8d90a0', fontSize: 18, margin: '0 0 40px' }}>{t('landing.cta.subtitle', 'Join the next generation of smart policing and cyber fraud prevention.')}</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <Link to="/citizen/complaint" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff', padding: '18px 40px', borderRadius: 8, fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 0 30px rgba(37,99,235,0.4)', transition: 'transform 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.03)'} onMouseLeave={e => e.target.style.transform = 'none'}>
              {t('landing.cta.primary', 'Report Fraud Now')}
            </Link>
            <Link to="/anonymous-tip" style={{ textDecoration: 'none', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '18px 40px', borderRadius: 8, fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(16,185,129,0.2)'} onMouseLeave={e => e.target.style.background = 'rgba(16,185,129,0.1)'}>
              Submit Anonymous Tip
            </Link>
            <Link to="/register" style={{ textDecoration: 'none', background: 'rgba(16,26,46,0.8)', border: '1px solid rgba(180,197,255,0.2)', color: '#fff', padding: '18px 40px', borderRadius: 8, fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(37,99,235,0.1)'} onMouseLeave={e => e.target.style.background = 'rgba(16,26,46,0.8)'}>
              {t('landing.cta.secondary', 'Register Operative')}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(180, 197, 255, 0.08)', padding: '60px 24px 30px', background: 'rgba(4,14,33,0.95)', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.4)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#b4c5ff', fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>SMARTPOL AI</span>
          </div>
          <p style={{ color: '#8d90a0', fontSize: 14, maxWidth: 400, marginBottom: 40, lineHeight: 1.6 }}>
            {t('landing.footer.desc', 'Advanced AI-powered cyber fraud detection and smart policing ecosystem.')}
          </p>
          
          <div style={{ width: '100%', height: 1, background: 'rgba(180,197,255,0.05)', marginBottom: 30 }} />
          
          <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', color: '#8d90a0', fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
            <span>© 2026 SMARTPOL AI.</span>
            <span>SYSTEM_STATUS: SECURE</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
