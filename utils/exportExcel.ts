import * as XLSX from 'xlsx'

export const exportExcel = (filename: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, filename)
}
