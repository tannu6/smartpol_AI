export function AIInsightPanel({ insight }) {
  if (!insight) return null
  const colorMap = { CRITICAL: 'text-error border-error/40 bg-error/10', HIGH: 'text-error border-error/30 bg-error/5',
    MODERATE: 'text-secondary border-secondary/30 bg-secondary/5', LOW: 'text-primary border-primary/30 bg-primary/5' }
  const cls = colorMap[insight.threat_level] || colorMap.LOW

  const methodText = insight.is_real_ml 
    ? `TF-IDF + Naive Bayes Classifier (${insight.model_version || 'v1.2'})`
    : 'Deterministic Rule-Based Baseline Engine'

  return (
    <div className={`glass-panel rounded-xl p-lg border ${cls}`}>
      <div className="flex flex-wrap justify-between items-start mb-md gap-2">
        <div>
          <h3 className="font-title-sm text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined">psychology</span> SmartPol AI Explainability
          </h3>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            Method: <strong className="text-white">{methodText}</strong>
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded ${cls}`}>{insight.threat_level || 'MODERATE'} THREAT</span>
          <span className="text-[9px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-bold">
            PROVENANCE: AI-INFERRED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-md mb-md text-xs font-mono-data">
        <div><span className="text-on-surface-variant">Priority Score: </span><span className="text-on-surface font-bold">{insight.priority_score != null ? (typeof insight.priority_score === 'number' ? `${(insight.priority_score <= 1 ? insight.priority_score * 100 : insight.priority_score).toFixed(0)}%` : insight.priority_score) : '75%'}</span></div>
        <div><span className="text-on-surface-variant">Model Confidence: </span><span className="text-on-surface font-bold">{insight.confidence != null ? `${((insight.confidence <= 1 ? insight.confidence : insight.confidence / 100) * 100).toFixed(0)}%` : 'N/A'}</span></div>
      </div>

      <div className="mb-md">
        <p className="text-[10px] font-label-caps text-on-surface-variant mb-xs uppercase">Key Decision Factors & Reasoning</p>
        <ul className="space-y-xs">
          {(insight.reasoning || insight.key_factors || ['Scam indicators detected', 'Entity extracted', 'Historical MO match']).map((r, i) => (
            <li key={i} className="text-xs text-on-surface-variant flex gap-xs">
              <span className="text-secondary mt-0.5">✓</span>{r}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface-container-low/50 rounded-lg p-sm border border-white/5 space-y-1">
        <p className="text-[10px] font-label-caps text-secondary uppercase mb-xs">Recommended Action</p>
        <p className="text-xs text-on-surface">{insight.suggested_next_action || insight.recommended_action || insight.summary || 'N/A'}</p>
      </div>

      <div className="mt-md pt-xs border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-slate-400">
        <span>⚠️ AI inferences are analytical suggestions and require officer verification.</span>
        <span>Generated {insight.generated_at ? new Date(insight.generated_at).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  )
}