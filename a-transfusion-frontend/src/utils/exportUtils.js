import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export const exportToExcel = (data, filename, columns) => {
  const worksheetData = data.map(item => {
    const row = {}
    columns.forEach(col => {
      if (col.render) {
        row[col.header] = col.render(item)
      } else {
        row[col.header] = item[col.key]
      }
    })
    return row
  })
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `${filename}.xlsx`)
}

export const exportToCSV = (data, filename, columns) => {
  const worksheetData = data.map(item => {
    const row = {}
    columns.forEach(col => {
      if (col.render) {
        row[col.header] = col.render(item)
      } else {
        row[col.header] = item[col.key]
      }
    })
    return row
  })
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${filename}.csv`)
}