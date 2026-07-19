import { exportToCsv } from '../../utils/exportCsv'

export function TableSection({ title, badge, children, accent = 'error', exportData, exportColumns, exportFilename = 'export' }) {
  return (
    <div className="bg-surface-container-low/40 backdrop-blur-xl border border-primary/15 rounded-sm overflow-hidden flex flex-col">
      <div className="p-lg border-b border-primary/10 flex justify-between items-center">
        <h3 className="font-title-sm text-on-surface flex items-center gap-sm">
          <span className={`w-1 h-4 bg-${accent}`} /> {title}
        </h3>
        <div className="flex items-center gap-sm">
          {badge && <span className="font-mono-data text-[10px] text-primary px-2 py-1 bg-primary/10 border border-primary/20">{badge}</span>}
          {exportData && (
            <button
              className="text-[10px] font-bold text-secondary border border-secondary/40 px-2 py-1 hover:bg-secondary/10"
              onClick={() => exportToCsv(exportFilename, exportColumns, exportData)}
            >
              EXPORT CSV
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  )
}

export function DataTable({ columns, data }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-primary/20 bg-surface-container-high/50">
            {columns.map((col, i) => (
              <th key={col.key || i} className="p-sm text-xs font-mono-data text-on-surface-variant uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-primary/5 hover:bg-surface-container-high/30 transition-colors">
              {columns.map((col, j) => (
                <td key={col.key || j} className="p-sm text-sm text-on-surface">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="p-lg text-center text-on-surface-variant text-sm">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}