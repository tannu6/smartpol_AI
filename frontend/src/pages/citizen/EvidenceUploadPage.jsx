import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { complaintService, uploadService } from '../../services/api'
import { CyberSelect, CyberButton } from '../../components/ui/Forms'

export default function EvidenceUploadPage() {
  const [complaints, setComplaints] = useState([])
  const [complaintId, setComplaintId] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    complaintService.list().then(({ data }) => {
      const list = Array.isArray(data) ? data : data.results || []
      setComplaints(list)
      if (list[0]) setComplaintId(list[0].id)
    })
  }, [])

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
    <AppLayout title="SmartPol AI" subtitle="Evidence Upload">
      <div className="p-lg space-y-lg max-w-2xl mx-auto">
        <h2 className="font-display-lg-mobile text-primary">Upload Evidence</h2>
        <div className="glass-panel p-lg rounded-xl space-y-md">
          <CyberSelect label="Select Complaint" value={complaintId} onChange={(e) => setComplaintId(e.target.value)}
            options={complaints.map(c => ({ value: c.id, label: `${c.complaint_id} — ${c.title}` }))}
          />
          <div className="border-2 border-dashed border-primary/30 rounded-xl p-xl text-center hover:border-primary/60 transition-colors">
            <span className="material-symbols-outlined text-primary text-5xl mb-md block">cloud_upload</span>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-on-surface-variant text-sm" />
            {file && <p className="font-mono-data text-secondary mt-sm">{file.name}</p>}
          </div>
          <CyberButton onClick={handleUpload} loading={uploading} disabled={!file}>Upload to Evidence Vault</CyberButton>
          {success && (
            <div className="bg-secondary/10 border border-secondary/30 p-md rounded-lg">
              <p className="text-secondary font-mono-data">Uploaded: {success.file_name}</p>
              <p className="text-xs text-on-surface-variant">Hash: {success.hash_value}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
