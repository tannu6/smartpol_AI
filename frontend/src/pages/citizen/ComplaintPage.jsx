import { useState, useEffect, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { QRScannerModal } from '../../components/ui/QRScannerModal'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import { CyberInput, CyberButton, CyberSelect, CyberTextarea } from '../../components/ui/Forms'
import { complaintService, aiService } from '../../services/api'
import { KpiCard } from '../../components/ui/Card'
import { AIInsightPanel } from '../../components/ui/AIInsightPanel'

import toast from 'react-hot-toast'
import LocationPickerMap from '../../components/maps/LocationPickerMap'

export default function ComplaintPage() {
  const { t } = useTranslation()
  const [aiResult, setAiResult] = useState(null)
  const [submitted, setSubmitted] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const recognitionRef = useRef(null)
  const { register, handleSubmit, watch, setValue, getValues } = useForm()
  const description = watch('description', '')

  // ── DRAFT RESTORE: runs once on mount ──────────────────────────────
  useEffect(() => {
    const draft = localStorage.getItem('complaint_draft')
    if (draft) {
      try {
        const d = JSON.parse(draft)
        Object.entries(d).forEach(([k, v]) => setValue(k, v))
      } catch { /* corrupted draft, ignore */ }
    }
  }, [setValue])

// ── DRAFT AUTOSAVE: runs whenever any form field changes ───────────
useEffect(() => {
  const sub = watch((values) => {
    localStorage.setItem('complaint_draft', JSON.stringify(values));
  });
  return () => sub.unsubscribe();
}, [watch]);

  // ── SPEECH RECOGNITION INIT ────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        const currentDesc = getValues('description') || '';
        setValue('description', currentDesc + finalTranscript, { shouldValidate: true, shouldDirty: true });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Please allow microphone access in your browser.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [setValue, getValues]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Mic start error", e);
      }
    } else {
      alert(t('errors.micNotSupported', 'Speech recognition is not supported in this browser.'));
    }
  };

  // ── AI live preview as the citizen types the description ───────────
  useEffect(() => {
    if (description.length > 20) {
      const timer = setTimeout(async () => {
        try {
          const { data } = await aiService.analyze({ text: description, category: watch('category') })
          setAiResult(data)
        } catch { /* offline or API unavailable — fail silently */ }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [description, watch])

  const onSubmit = async (data) => {
    if (!data.title || data.title.trim().length < 5) {
      toast.error('Please enter a title of at least 5 characters.')
      return
    }
    if (!data.description || data.description.trim().length < 20) {
      toast.error('Please provide at least 20 characters of description.')
      return
    }

    setLoading(true)
    try {
      const { data: complaint } = await complaintService.create(data)
      setSubmitted(complaint)
      localStorage.removeItem('complaint_draft')
      toast.success('Complaint filed & assigned to Ahmedabad Cyber Cell!')
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.title?.[0] || err.response?.data?.description?.[0] || err.response?.data?.detail || 'Failed to submit complaint. Check required fields.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleMapLocationChange = (geo) => {
    setValue('location', geo.address)
    setValue('latitude', geo.latitude)
    setValue('longitude', geo.longitude)
    setValue('locality', geo.locality)
    setValue('location_source', geo.location_source)
  }

  return (
    <AppLayout title="SmartPol AI" subtitle={t('nav.dashboard')}>
      <div className="p-lg space-y-lg max-w-4xl mx-auto">
        <div>
          <h2 className="font-display-lg-mobile text-primary">{t('complaint.title')}</h2>
          <p className="text-on-surface-variant">{t('complaint.subtitle')}</p>
        </div>

        {submitted ? (
          <div className="glass-panel p-lg rounded-xl space-y-md">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-secondary text-4xl">check_circle</span>
              <div>
                <h3 className="font-headline-md text-primary">{t('complaint.success')}</h3>
                <p className="font-mono-data text-secondary">ID: {submitted.complaint_id}</p>
                {submitted.station_name && (
                  <div className="mt-2 p-3 rounded-lg bg-blue-950/60 border border-blue-500/30 text-xs text-blue-200">
                    <p className="font-bold text-blue-400">🚓 Routed & Assigned Police Station:</p>
                    <p className="font-semibold text-sm">{submitted.station_name}</p>
                    {submitted.assignment_explanation && (
                      <pre className="mt-1 font-mono text-[11px] text-slate-300 whitespace-pre-wrap">{submitted.assignment_explanation}</pre>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md items-stretch">
              <KpiCard label={t('ai.urgency')} value={`${(submitted.urgency_score * 100).toFixed(0)}%`} icon="speed" accent="error" />
              <KpiCard label={t('ai.readiness')} value={`${(submitted.readiness_score * 100).toFixed(0)}%`} icon="fact_check" accent="secondary" />
              <KpiCard label={t('complaint.classification')} value={submitted.fraud_classification?.replace(/_/g, ' ')} icon="psychology" accent="primary" />
              <div className="glass-panel p-sm rounded-xl flex flex-col items-center justify-center gap-xs overflow-hidden border border-primary/20 bg-surface-container-low/60">
                <QRCodeCanvas 
                  value={JSON.stringify({ id: submitted.complaint_id, type: 'complaint', citizen: submitted.citizen_name })} 
                  size={100} 
                  bgColor={"#ffffff"}
                  fgColor={"#040e21"}
                  level={"M"}
                  className="rounded bg-white p-1 shadow-sm"
                />
                <div className="text-center">
                  <p className="text-[10px] font-label-caps text-secondary uppercase font-bold tracking-wider">{t('complaint.qr_code', 'QR Code')}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setSubmitted(null)} className="text-primary hover:text-secondary">
              {t('complaint.file_another')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-lg rounded-xl space-y-md accent-bar">
            <CyberInput
              label={t('complaint.field_title')}
              icon="title"
              register={register('title', { required: true })}
              placeholder={t('complaint.summary_placeholder')}
            />
            <CyberSelect
              label={t('complaint.field_category')}
              register={register('category')}
              options={[
                { value: 'General', label: t('complaint.categories.general') },
                { value: 'Digital Arrest Scam', label: 'Digital Arrest Scam (CBI / ED Impersonation)' },
                { value: 'Sextortion', label: 'Sextortion & Photo Leak Threat' },
                { value: 'APK Malware', label: 'APK Malware (Fake Utility Bill Hijack)' },
                { value: 'Deepfake Scam', label: 'AI Deepfake Video / Voice Impersonation' },
                { value: 'SIM Swap', label: 'SIM Swap & NetBanking Takeover' },
                { value: 'UPI Fraud', label: 'UPI & OTP Refund Fraud' },
                { value: 'Financial Fraud', label: t('complaint.categories.financial_fraud') },
                { value: 'Phishing Scam', label: 'Phishing & Malicious Link Scam' },
                { value: 'Investment Scam', label: 'Telegram / Part-Time Job Scam' },
                { value: 'Crypto Crime', label: 'Crypto Wallet Mule Laundering' },
                { value: 'Cybercrime', label: t('complaint.categories.cybercrime') },
                { value: 'Assault', label: t('complaint.categories.assault') },
                { value: 'Emergency', label: t('complaint.categories.emergency') },
              ]}
            />

            {/* Ahmedabad Geolocation Map Picker */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-primary/20 space-y-2">
              <LocationPickerMap onLocationChange={handleMapLocationChange} />
              <CyberInput
                label={t('complaint.field_location')}
                icon="location_on"
                register={register('location')}
                placeholder={t('complaint.location_placeholder')}
              />
            </div>
            <CyberInput
              label="NCRP Acknowledgement Number (Optional)"
              icon="receipt_long"
              register={register('ncrp_id')}
              placeholder="e.g. 2023120412345"
            />
            <CyberTextarea
              label={t('complaint.field_description')}
              register={register('description', { required: true })}
              placeholder={t('complaint.description_placeholder')}
              rows={5}
            />
            <div className="flex gap-md">
              <button 
                onClick={toggleListening}
                type="button" 
                className={`flex items-center gap-sm px-lg py-sm border text-xs font-bold uppercase transition-colors ${
                  isListening 
                    ? 'border-error/50 text-error bg-error/10 animate-pulse' 
                    : 'border-secondary/30 text-secondary hover:bg-secondary/10'
                }`}>
                <span className="material-symbols-outlined">{isListening ? 'mic_off' : 'mic'}</span> 
                {isListening ? t('complaint.voiceStop', 'Listening...') : t('complaint.voice')}
              </button>
              <button 
                onClick={() => setShowQRScanner(true)}
                type="button" 
                className="flex items-center gap-sm px-lg py-sm border border-primary/30 text-primary text-xs font-bold uppercase hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined">qr_code_scanner</span> {t('complaint.qr_scan')}
              </button>
            </div>

            {aiResult && (
              <div className="bg-surface-container/50 p-md rounded-lg border border-primary/20">
                <p className="font-label-caps text-primary mb-sm">{t('ai.analysis_preview')}</p>
                <div className="grid grid-cols-2 gap-sm text-xs font-mono-data">
                  <span>{t('ai.urgency')}: {(aiResult.urgency * 100).toFixed(0)}%</span>
                  <span>{t('ai.fraud_label')}: {aiResult.fraud?.classification}</span>
                  <span>{t('ai.entities_label')}: {aiResult.entities?.phones?.length || 0} {t('ai.phones_found')}</span>
                  <span>{t('ai.dna_match')}: {aiResult.scam_dna?.confidence ? (aiResult.scam_dna.confidence * 100).toFixed(0) + '%' : 'N/A'}</span>
                </div>
              </div>
            )}

            {aiResult?.ai_insight && <AIInsightPanel insight={aiResult.ai_insight} />}

            <CyberButton type="submit" loading={loading}>{t('complaint.submit')}</CyberButton>
          </form>
        )}

        {showQRScanner && (
          <QRScannerModal 
            onScan={(data) => {
              const currentDesc = watch('description') || '';
              setValue('description', currentDesc + `\n[Scanned Data: ${data}]\n`);
            }}
            onClose={() => setShowQRScanner(false)} 
          />
        )}
      </div>
    </AppLayout>
  )
}