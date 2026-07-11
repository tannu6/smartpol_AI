export function DataTable({ columns, data, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left font-body-sm">
        <thead className="bg-surface-container-high/50 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-lg py-md">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/5">
          {data.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-primary/5 transition-colors group">
              {columns.map((col) => (
                <td key={col.key} className="px-lg py-md">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TableSection({ title, badge, children, accent = 'error' }) {
  return (
    <div className="bg-surface-container-low/40 backdrop-blur-xl border border-primary/15 rounded-sm overflow-hidden flex flex-col">
      <div className="p-lg border-b border-primary/10 flex justify-between items-center">
        <h3 className="font-title-sm text-on-surface flex items-center gap-sm">
          <span className={`w-1 h-4 bg-${accent}`} /> {title}
        </h3>
        {badge && <span className="font-mono-data text-[10px] text-primary px-2 py-1 bg-primary/10 border border-primary/20">{badge}</span>}
      </div>
      {children}
    </div>
  )
}
