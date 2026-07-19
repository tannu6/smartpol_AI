import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { CyberTextarea, CyberButton } from '../../components/ui/Forms'
import { aiService } from '../../services/api'
import { AIInsightPanel } from '../../components/ui/AIInsightPanel'
import { useTranslation } from 'react-i18next'
export default function InvestigationPage() {
  const { t } = useTranslation()
  const [report, setReport] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

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

  return (
    <AppLayout title={t('investigation.appTitle')} subtitle={t('investigation.appSubtitle')}>
      <div className="p-lg space-y-lg max-w-4xl mx-auto">
        <h2 className="font-display-lg-mobile text-primary">{t('investigation.title')}</h2>
        <p className="text-on-surface-variant">{t('investigation.description')}</p>
        <div className="glass-panel p-lg rounded-xl space-y-md">
          <CyberTextarea label={t('investigation.form.caseNotes.label')} value={report} onChange={(e) => setReport(e.target.value)} rows={8} placeholder={t('investigation.form.caseNotes.placeholder')} />
          {errorMsg && <div className="text-error font-mono-data text-sm p-sm bg-error/10 border border-error/30 rounded">{errorMsg}</div>}
          <CyberButton onClick={generateReport} loading={loading} disabled={!report.trim()}>{t('investigation.form.generateBtn')}</CyberButton>
        </div>
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="glass-panel p-md rounded-xl">
              <h3 className="font-title-sm text-secondary mb-md">{t('investigation.results.entityExtraction.title')}</h3>
              <div className="space-y-sm font-mono-data text-sm">
                <p>{t('investigation.results.entityExtraction.phones')} {analysis.entities?.phones?.join(', ') || t('investigation.results.entityExtraction.none')}</p>
                <p>{t('investigation.results.entityExtraction.emails')} {analysis.entities?.emails?.join(', ') || t('investigation.results.entityExtraction.none')}</p>
                <p>{t('investigation.results.entityExtraction.amounts')} {analysis.entities?.amounts?.join(', ') || t('investigation.results.entityExtraction.none')}</p>
              </div>
            </div>
            <div className="glass-panel p-md rounded-xl">
              <h3 className="font-title-sm text-secondary mb-md">{t('investigation.results.aiScores.title')}</h3>
              <div className="space-y-sm font-mono-data text-sm">
                <p>{t('investigation.results.aiScores.urgency')} {(analysis.urgency * 100).toFixed(0)}%</p>
                <p>{t('investigation.results.aiScores.fraudClass')} {analysis.fraud?.classification}</p>
                <p>{t('investigation.results.aiScores.readiness')} {t('investigation.results.aiScores.readinessHigh')}</p>
                <p>{t('investigation.results.aiScores.goldenHour')} {analysis.urgency > 0.7 ? t('investigation.results.aiScores.yes') : t('investigation.results.aiScores.no')}</p>
              </div>
            </div>
          <div>
            {analysis?.ai_insight && <AIInsightPanel insight={analysis.ai_insight} />}
            </div>
          </div>
          
            
            
        )}
      </div>
    </AppLayout>
  )
}
