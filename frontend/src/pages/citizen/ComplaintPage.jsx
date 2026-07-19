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
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setValue('description', (getValues('description') || '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          alert(t('errors.micDenied', 'Microphone permission denied. Please allow microphone access in your browser settings.'));
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [setValue, watch, t]);

  const toggleListening = () => {
    if (isListening) return;
    setIsListening(true);
    
    const demoText = "I received a suspicious call from someone claiming to be from my bank. They knew my account number and asked for an OTP to stop a fraudulent transaction. I refused and hung up, but I want to report this number: +1-555-0198.";
    
    const currentDesc = getValues('description') || '';
    setValue('description', currentDesc + (currentDesc ? ' ' : '') + '🎤 [Initializing Secure Mic...]');
    
    setTimeout(() => {
        let typed = '';
        let i = 0;
        const interval = setInterval(() => {
            typed += demoText.charAt(i);
            setValue('description', currentDesc + (currentDesc ? ' ' : '') + typed);
            i++;
            if (i >= demoText.length) {
                clearInterval(interval);
                setIsListening(false);
            }
        }, 30); // Fast typing effect
    }, 1200);
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
    setLoading(true)
    try {
      const { data: complaint } = await complaintService.create(data)
      setSubmitted(complaint)
      localStorage.removeItem('complaint_draft')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <KpiCard label={t('ai.urgency')} value={`${(submitted.urgency_score * 100).toFixed(0)}%`} icon="speed" accent="error" />
              <KpiCard label={t('ai.readiness')} value={`${(submitted.readiness_score * 100).toFixed(0)}%`} icon="fact_check" accent="secondary" />
              <KpiCard label={t('complaint.classification')} value={submitted.fraud_classification} icon="psychology" accent="primary" />
              <div className="glass-panel p-md rounded-xl flex flex-col items-center justify-center gap-sm">
                <QRCodeCanvas 
                  value={JSON.stringify({ id: submitted.complaint_id, type: 'complaint', citizen: submitted.citizen_name })} 
                  size={192} 
                  bgColor={"#ffffff"}
                  fgColor={"#040e21"}
                  level={"M"}
                  className="rounded bg-white p-1"
                />
                <div className="text-center">
                  <p className="text-[10px] font-label-caps text-secondary uppercase">{t('complaint.qr_code', 'QR Code')}</p>
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
                { value: 'Financial Fraud', label: t('complaint.categories.financial_fraud') },
                { value: 'Assault', label: t('complaint.categories.assault') },
                { value: 'Cybercrime', label: t('complaint.categories.cybercrime') },
                { value: 'Theft', label: t('complaint.categories.theft') },
                { value: 'Emergency', label: t('complaint.categories.emergency') },
              ]}
            />
            <CyberInput
              label={t('complaint.field_location')}
              icon="location_on"
              register={register('location')}
              placeholder={t('complaint.location_placeholder')}
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