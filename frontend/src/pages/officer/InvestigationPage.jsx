import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { CyberTextarea, CyberButton } from '../../components/ui/Forms'
import { aiService } from '../../services/api'

export default function InvestigationPage() {
  const [report, setReport] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const { data } = await aiService.analyze({ text: report, category: 'investigation' })
      setAnalysis(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="SmartPol AI" subtitle="Investigation Report Generator">
      <div className="p-lg space-y-lg max-w-4xl mx-auto">
        <h2 className="font-display-lg-mobile text-primary">Investigation Report Generator</h2>
        <p className="text-on-surface-variant">AI-powered investigation readiness analysis</p>
        <div className="glass-panel p-lg rounded-xl space-y-md">
          <CyberTextarea label="Case Notes" value={report} onChange={(e) => setReport(e.target.value)} rows={8} placeholder="Enter investigation details, witness statements, evidence summary..." />
          <CyberButton onClick={generateReport} loading={loading}>Generate Investigation Report</CyberButton>
        </div>
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="glass-panel p-md rounded-xl">
              <h3 className="font-title-sm text-secondary mb-md">Entity Extraction</h3>
              <div className="space-y-sm font-mono-data text-sm">
                <p>Phones: {analysis.entities?.phones?.join(', ') || 'None'}</p>
                <p>Emails: {analysis.entities?.emails?.join(', ') || 'None'}</p>
                <p>Amounts: {analysis.entities?.amounts?.join(', ') || 'None'}</p>
              </div>
            </div>
            <div className="glass-panel p-md rounded-xl">
              <h3 className="font-title-sm text-secondary mb-md">AI Scores</h3>
              <div className="space-y-sm font-mono-data text-sm">
                <p>Urgency: {(analysis.urgency * 100).toFixed(0)}%</p>
                <p>Fraud Class: {analysis.fraud?.classification}</p>
                <p>Readiness: High</p>
                <p>Golden Hour: {analysis.urgency > 0.7 ? 'YES ⚡' : 'No'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
