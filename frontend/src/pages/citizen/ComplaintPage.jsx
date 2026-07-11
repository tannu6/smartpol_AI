import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import AppLayout from '../../components/layout/AppLayout'
import { CyberInput, CyberButton, CyberSelect, CyberTextarea } from '../../components/ui/Forms'
import { complaintService, aiService } from '../../services/api'
import { KpiCard } from '../../components/ui/Card'

export default function ComplaintPage() {
  const [aiResult, setAiResult] = useState(null)
  const [submitted, setSubmitted] = useState(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch } = useForm()
  const description = watch('description', '')

  useEffect(() => {
    if (description.length > 20) {
      const timer = setTimeout(async () => {
        try {
          const { data } = await aiService.analyze({ text: description, category: watch('category') })
          setAiResult(data)
        } catch { /* mock offline */ }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [description])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { data: complaint } = await complaintService.create(data)
      setSubmitted(complaint)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout title="SmartPol AI" subtitle="Citizen Portal">
      <div className="p-lg space-y-lg max-w-4xl mx-auto">
        <div>
          <h2 className="font-display-lg-mobile text-primary">File a Complaint</h2>
          <p className="text-on-surface-variant">Submit your report with AI-powered analysis</p>
        </div>

        {submitted ? (
          <div className="glass-panel p-lg rounded-xl space-y-md">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-secondary text-4xl">check_circle</span>
              <div>
                <h3 className="font-headline-md text-primary">Complaint Filed Successfully</h3>
                <p className="font-mono-data text-secondary">ID: {submitted.complaint_id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <KpiCard label="Urgency Score" value={`${(submitted.urgency_score * 100).toFixed(0)}%`} icon="speed" accent="error" />
              <KpiCard label="Readiness" value={`${(submitted.readiness_score * 100).toFixed(0)}%`} icon="fact_check" accent="secondary" />
              <KpiCard label="Classification" value={submitted.fraud_classification} icon="psychology" accent="primary" />
              <KpiCard label="QR Code" value={submitted.qr_code?.slice(0, 10)} icon="qr_code" accent="secondary" subtext="Scan to track" />
            </div>
            <button onClick={() => setSubmitted(null)} className="text-primary hover:text-secondary">File Another Complaint</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-lg rounded-xl space-y-md accent-bar">
            <CyberInput label="Title" icon="title" register={register('title', { required: true })} placeholder="Brief summary of incident" />
            <CyberSelect label="Category" register={register('category')} options={[
              { value: 'General', label: 'General' },
              { value: 'Financial Fraud', label: 'Financial Fraud' },
              { value: 'Assault', label: 'Assault' },
              { value: 'Cybercrime', label: 'Cybercrime' },
              { value: 'Theft', label: 'Theft' },
              { value: 'Emergency', label: 'Emergency / SOS' },
            ]} />
            <CyberInput label="Location" icon="location_on" register={register('location')} placeholder="Where did this occur?" />
            <CyberTextarea label="Description" register={register('description', { required: true })} placeholder="Describe the incident in detail..." rows={5} />
            <div className="flex gap-md">
              <button type="button" className="flex items-center gap-sm px-lg py-sm border border-secondary/30 text-secondary text-xs font-bold uppercase">
                <span className="material-symbols-outlined">mic</span> Voice Complaint
              </button>
              <button type="button" className="flex items-center gap-sm px-lg py-sm border border-primary/30 text-primary text-xs font-bold uppercase">
                <span className="material-symbols-outlined">qr_code_scanner</span> QR Scan
              </button>
            </div>
            {aiResult && (
              <div className="bg-surface-container/50 p-md rounded-lg border border-primary/20">
                <p className="font-label-caps text-primary mb-sm">AI Analysis Preview</p>
                <div className="grid grid-cols-2 gap-sm text-xs font-mono-data">
                  <span>Urgency: {(aiResult.urgency * 100).toFixed(0)}%</span>
                  <span>Fraud: {aiResult.fraud?.classification}</span>
                  <span>Entities: {aiResult.entities?.phones?.length || 0} phones found</span>
                  <span>DNA Match: {aiResult.scam_dna?.confidence ? (aiResult.scam_dna.confidence * 100).toFixed(0) + '%' : 'N/A'}</span>
                </div>
              </div>
            )}
            <CyberButton type="submit" loading={loading}>Submit Complaint</CyberButton>
          </form>
        )}
      </div>
    </AppLayout>
  )
}
