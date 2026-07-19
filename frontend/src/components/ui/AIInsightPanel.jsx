export function AIInsightPanel({ insight }) {
  if (!insight) return null
  const colorMap = { CRITICAL: 'text-error border-error/40 bg-error/10', HIGH: 'text-error border-error/30 bg-error/5',
    MODERATE: 'text-secondary border-secondary/30 bg-secondary/5', LOW: 'text-primary border-primary/30 bg-primary/5' }
  const cls = colorMap[insight.threat_level] || colorMap.LOW

  return (
    <div className={`glass-panel rounded-xl p-lg border ${cls}`}>
      <div className="flex justify-between items-start mb-md">
        <h3 className="font-title-sm text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined">psychology</span> AI Explainability
          {insight.is_real_ml ? (
            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full ml-2">ML Pipeline {insight.model_version}</span>
          ) : (
            <span className="text-[10px] bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full ml-2">Rule-Based Fallback</span>
          )}
        </h3>
        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${cls}`}>{insight.threat_level || 'MODERATE'}</span>
      </div>
      <div className="grid grid-cols-2 gap-md mb-md text-xs font-mono-data">
        <div><span className="text-on-surface-variant">Priority Score: </span><span className="text-on-surface font-bold">{insight.priority_score || 'N/A'}</span></div>
        <div><span className="text-on-surface-variant">Confidence: </span><span className="text-on-surface font-bold">{( (insight.confidence || 0.8) * 100).toFixed(0)}%</span></div>
      </div>
      <div className="mb-md">
        <p className="text-[10px] font-label-caps text-on-surface-variant mb-xs uppercase">Reasoning</p>
        <ul className="space-y-xs">
          {(insight.reasoning || insight.key_factors || []).map((r, i) => (
            <li key={i} className="text-xs text-on-surface-variant flex gap-xs">
              <span className="text-secondary mt-0.5">●</span>{r}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-surface-container-low/50 rounded-lg p-sm">
        <p className="text-[10px] font-label-caps text-secondary uppercase mb-xs">Suggested Next Action</p>
        <p className="text-xs text-on-surface">{insight.suggested_next_action || insight.recommended_action || insight.summary || 'N/A'}</p>
      </div>
      <p className="text-[9px] text-on-surface-variant/50 mt-sm font-mono-data">
        Generated {insight.generated_at ? new Date(insight.generated_at).toLocaleTimeString() : new Date().toLocaleTimeString()}
      </p>
    </div>
  )
}