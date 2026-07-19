export function exportToCsv(filename, columns, data) {
  const headers = columns.map(c => c.label)
  const rows = data.map(row => columns.map(c => {
    const val = c.exportValue ? c.exportValue(row) : row[c.key]
    const s = String(val ?? '').replace(/"/g, '""')
    return `"${s}"`
  }))
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}