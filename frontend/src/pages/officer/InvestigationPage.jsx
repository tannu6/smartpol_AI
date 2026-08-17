import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { CyberTextarea, CyberButton } from '../../components/ui/Forms'
import { aiService, complaintService } from '../../services/api'
import { AIInsightPanel } from '../../components/ui/AIInsightPanel'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function InvestigationPage() {
  const { t } = useTranslation()
  const [report, setReport] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [complaints, setComplaints] = useState([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [attaching, setAttaching] = useState(false)

  useEffect(() => {
    complaintService.list()
      .then(({ data }) => {
        const list = data.results ? data.results : (Array.isArray(data) ? data : [])
        setComplaints(list)
      })
      .catch(() => {})
  }, [])

  const generateReport = async () => {
    if (!report.trim()) return;
    setLoading(true)
    setErrorMsg('')
    setAnalysis(null)
    try {
      const { data } = await aiService.analyze({ text: report, category: 'investigation' })
      setAnalysis(data)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || t('common.error_occurred', 'Failed to generate AI analysis.'))
    } finally {
      setLoading(false)
    }
  }

  const handleAttachToCase = async () => {
    if (!selectedCaseId || !report.trim()) return
    setAttaching(true)
    try {
      await complaintService.update(selectedCaseId, {
        note: report
      })
      toast.success('Investigation case notes attached successfully.')
    } catch (err) {
      toast.error('Failed to attach notes to case.')
    } finally {
      setAttaching(false)
    }
  }

  const hasEntities = (analysis?.entities?.phones?.length > 0) || 
                      (analysis?.entities?.emails?.length > 0) || 
                      (analysis?.entities?.amounts?.length > 0) ||
                      (analysis?.entities?.urls?.length > 0)

  return (
    <AppLayout title={t('investigation.appTitle')} subtitle={t('investigation.appSubtitle')}>
      <div className="p-lg space-y-lg max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display-lg-mobile text-primary">{t('investigation.title')}</h2>
            <p className="text-on-surface-variant text-sm">{t('investigation.description')}</p>
          </div>
        </div>

        <div className="glass-panel p-lg rounded-xl space-y-md border border-primary/20">
          <CyberTextarea 
            label={t('investigation.form.caseNotes.label')} 
            value={report} 
            onChange={(e) => setReport(e.target.value)} 
            rows={6} 
            placeholder={t('investigation.form.caseNotes.placeholder')} 
          />

          {complaints.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-md">
              <select
                value={selectedCaseId}
                onChange={e => setSelectedCaseId(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded p-2 text-xs font-mono text-on-surface flex-1"
              >
                <option value="">-- Link Notes to Active Case File --</option>
                {complaints.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.complaint_id} — {c.title}
                  </option>
                ))}
              </select>
              {selectedCaseId && (
                <button
                  onClick={handleAttachToCase}
                  disabled={attaching || !report.trim()}
                  className="px-md py-2 bg-secondary text-on-secondary font-bold text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {attaching ? 'Attaching...' : 'Save Notes to Case'}
                </button>
              )}
            </div>
          )}

          {errorMsg && <div className="text-error font-mono-data text-sm p-sm bg-error/10 border border-error/30 rounded">{errorMsg}</div>}
          <CyberButton onClick={generateReport} loading={loading} disabled={!report.trim()}>{t('investigation.form.generateBtn')}</CyberButton>
        </div>

        {analysis && (
          <div className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Entity Extraction Section - Cleaned up display */}
              <div className="glass-panel p-md rounded-xl space-y-md border border-primary/15">
                <h3 className="font-title-sm text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined">dataset</span>
                  {t('investigation.results.entityExtraction.title')}
                </h3>
                
                {hasEntities ? (
                  <div className="space-y-sm font-mono-data text-xs">
                    {analysis.entities?.phones?.length > 0 && (
                      <div>
                        <span className="text-on-surface-variant block text-[10px] uppercase font-bold">{t('investigation.results.entityExtraction.phones')}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.entities.phones.map((p, i) => (
                            <span key={i} className="px-2 py-0.5 bg-secondary/15 text-secondary border border-secondary/30 rounded font-bold">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.entities?.emails?.length > 0 && (
                      <div>
                        <span className="text-on-surface-variant block text-[10px] uppercase font-bold">{t('investigation.results.entityExtraction.emails')}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.entities.emails.map((e, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/15 text-primary border border-primary/30 rounded font-bold">{e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.entities?.amounts?.length > 0 && (
                      <div>
                        <span className="text-on-surface-variant block text-[10px] uppercase font-bold">{t('investigation.results.entityExtraction.amounts')}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.entities.amounts.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded font-bold">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-md bg-surface-container-low/40 rounded-lg text-xs text-on-surface-variant font-mono">
                    ✓ Clean Case Notes: No explicit phone, email, or financial entity patterns detected in this text.
                  </div>
                )}
              </div>

              {/* AI Scores Section */}
              <div className="glass-panel p-md rounded-xl space-y-md border border-primary/15">
                <h3 className="font-title-sm text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined">analytics</span>
                  {t('investigation.results.aiScores.title')}
                </h3>
                <div className="space-y-sm font-mono-data text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-surface-container-high">
                    <span>{t('investigation.results.aiScores.urgency')}</span>
                    <span className="font-bold text-emerald-400">{((analysis.urgency || 0.25) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-surface-container-high">
                    <span>{t('investigation.results.aiScores.fraudClass')}</span>
                    <span className="font-bold text-secondary uppercase">{analysis.fraud?.classification || 'General'}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-surface-container-high">
                    <span>{t('investigation.results.aiScores.goldenHour')}</span>
                    <span className={`font-bold ${(analysis.urgency || 0) > 0.7 ? 'text-red-400 animate-pulse' : 'text-on-surface-variant'}`}>
                      {(analysis.urgency || 0) > 0.7 ? t('investigation.results.aiScores.yes') : t('investigation.results.aiScores.no')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {analysis?.ai_insight && <AIInsightPanel insight={analysis.ai_insight} />}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
