import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import API from '../../api'

// Helper: download PDF dari backend (blob response)
const downloadPDFFromAPI = async (endpoint: string, filename: string): Promise<boolean> => {
  try {
    const response = await API.get(endpoint, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error(`Error downloading PDF from ${endpoint}:`, error)
    return false
  }
}

// Export to Excel
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Auto-size column widths based on content
    if (data.length > 0) {
      const headers = Object.keys(data[0])
      ws['!cols'] = headers.map(header => {
        const maxLen = Math.max(
          header.length,
          ...data.map(row => String(row[header] ?? '').length)
        )
        return { wch: Math.min(maxLen + 2, 50) }
      })
    }

    // Freeze header row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 }

    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `${filename}.xlsx`)
    return true
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return false
  }
}

// Export to PDF
export const exportToPDF = (
  data: any[], 
  columns: {header: string, dataKey: string}[],
  filename: string,
  title: string = 'Report'
) => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text(title, 14, 20)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 14, 28)
    
    // Add table
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.dataKey])),
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [139, 123, 110], // #8B7B6E
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [244, 239, 230] // #F4EFE6
      }
    })
    
    // Save PDF
    doc.save(`${filename}.pdf`)
    
    return true
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    return false
  }
}

// Export Inventory to Excel
export const exportInventoryToExcel = (inventory: any[]) => {
  const exportData = inventory.map(item => ({
    'Nama Barang': item.name,
    'Supplier': item.supplier,
    'Kategori': item.category || '-',
    'Stok': item.quantity,
    'Satuan': item.unit,
    'Harga': item.price || 0,
    'Deskripsi': item.description || '-'
  }))
  
  return exportToExcel(exportData, `Inventory_${new Date().toISOString().split('T')[0]}`, 'Inventory')
}

// Export Inventory to PDF (via backend)
export const exportInventoryToPDF = async (_inventory: any[]): Promise<boolean> => {
  return downloadPDFFromAPI('/export/items/pdf', `Inventory_${new Date().toISOString().split('T')[0]}.pdf`)
}

// Export Logs to Excel
export const exportLogsToExcel = (logs: any[]) => {
  const exportData = logs.map((item, index) => ({
    'No': index + 1,
    'Log ID': item.transaction_id,
    'Admin': item.admin_name,
    'User ID': item.user_id,
    'Tabel': item.table_name,
    'Row ID': item.row_id,
    'Aksi': item.action,
    'Tanggal': item.date ? new Date(item.date).toLocaleString('id-ID') : '-',
  }))
  
  return exportToExcel(exportData, `SystemLogs_${new Date().toISOString().split('T')[0]}`, 'Logs')
}

// Export Logs to PDF (via backend)
export const exportLogsToPDF = async (_logs: any[]): Promise<boolean> => {
  return downloadPDFFromAPI('/export/logs/pdf', `SystemLog_${new Date().toISOString().split('T')[0]}.pdf`)
}

// Export History to Excel
export const exportHistoryToExcel = (history: any[]) => {
  const exportData = history.map((item, index) => ({
    'No': index + 1,
    'ID Transaksi': item.transaction_id,
    'Nama Barang': item.item_name,
    'Jumlah': `${item.quantity} ${item.unit}`,
    'Admin': item.admin_name,
    'Tanggal': (item.date || item.created_at) ? new Date(item.date || item.created_at).toLocaleString('id-ID') : '-',
    'Deskripsi': item.description
  }))
  
  return exportToExcel(exportData, `History_${new Date().toISOString().split('T')[0]}`, 'History')
}

// Export History to PDF (via backend)
export const exportHistoryToPDF = async (_history: any[]): Promise<boolean> => {
  return downloadPDFFromAPI('/export/transactions/pdf', `History_${new Date().toISOString().split('T')[0]}.pdf`)
}

// Export Master Data (Categories/Materials) to Excel
export const exportMasterDataToExcel = (data: any[], type: 'Category' | 'Material') => {
  const exportData = data.map((item, index) => ({
    'No': index + 1,
    'Nama': item.name,
    'Deskripsi': item.description || '-'
  }))
  
  return exportToExcel(exportData, `${type}_${new Date().toISOString().split('T')[0]}`, type)
}

// Export Master Data (Categories/Materials) to PDF (via backend - combined)
export const exportMasterDataToPDF = async (_data: any[], _type: 'Category' | 'Material'): Promise<boolean> => {
  return downloadPDFFromAPI('/export/master-data/pdf', `MasterData_${new Date().toISOString().split('T')[0]}.pdf`)
}