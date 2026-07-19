import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { complaintService, uploadService } from '../../services/api'
import { CyberSelect, CyberButton } from '../../components/ui/Forms'
import { useTranslation } from 'react-i18next'

export default function EvidenceUploadPage() {
  const { t } = useTranslation()
  const [complaints, setComplaints] = useState([])
  const [complaintId, setComplaintId] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    complaintService.list()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.results || []
        setComplaints(list)
        if (list[0]) setComplaintId(list[0].id)
      })
      .catch(err => {
        console.error(err)
        setError(t('errors.generic'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [t])

  const handleUpload = async () => {
    if (!file || !complaintId) return
    setUploading(true)
    try {
      const { data } = await uploadService.upload(complaintId, file)
      setSuccess(data)
    } finally {
      setUploading(false)
    }
  }

  return (
    <AppLayout title="SmartPol AI" subtitle={t('evidence.subtitle')}>
      <div className="p-lg space-y-lg max-w-2xl mx-auto">
        <h2 className="font-display-lg-mobile text-primary">{t('evidence.title')}</h2>
        
        {loading ? (
          <div className="glass-panel rounded-xl p-xl flex justify-center">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
          </div>
        ) : error ? (
          <div className="glass-panel rounded-xl p-xl flex flex-col items-center text-center gap-md border border-error/20 bg-error/5">
            <span className="material-symbols-outlined text-6xl text-error/40">error</span>
            <p className="text-error">{error}</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass-panel rounded-xl p-xl flex flex-col items-center justify-center text-center gap-md border border-error/20 bg-error/5">
            <span className="material-symbols-outlined text-6xl text-error/40">warning</span>
            <h3 className="font-headline-md text-error">{t('evidence.no_complaints_title', 'No Active Complaints')}</h3>
            <p className="text-on-surface-variant max-w-md">{t('evidence.no_complaints_desc', 'You must file a cybercrime complaint before uploading digital evidence. Please submit a report first.')}</p>
          </div>
        ) : (
          <div className="glass-panel p-lg rounded-xl space-y-md">
            <CyberSelect label={t('evidence.select_complaint')} value={complaintId} onChange={(e) => setComplaintId(e.target.value)}
              options={complaints.map(c => ({ value: c.id, label: `${c.complaint_id} — ${c.title}` }))}
            />
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-xl text-center hover:border-primary/60 transition-colors">
              <span className="material-symbols-outlined text-primary text-5xl mb-md block">cloud_upload</span>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-on-surface-variant text-sm" />
              {file && <p className="font-mono-data text-secondary mt-sm">{file.name}</p>}
            </div>
            <CyberButton onClick={handleUpload} loading={uploading} disabled={!file}>{t('evidence.upload_button')}</CyberButton>
            {success && (
              <div className="bg-secondary/10 border border-secondary/30 p-md rounded-lg">
                <p className="text-secondary font-mono-data">{t('evidence.uploaded')} {success.file_name}</p>
                <p className="text-xs text-on-surface-variant">{t('evidence.hash')} {success.hash_value}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
