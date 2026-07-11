export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return

  const keys = Object.keys(rows[0])
  const csvContent = [
    keys.join(','),
    ...rows.map((row) =>
      keys.map((k) => {
        const val = row[k] ?? ''
        const escaped = String(val).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
