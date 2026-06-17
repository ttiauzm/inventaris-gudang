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
    'Pengguna': item.admin_name,
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
    'Pengguna': item.admin_name,
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

// Export Summary to Excel
export const exportSummaryToExcel = (summaryData: any) => {
  try {
    const wb = XLSX.utils.book_new()
    
    // Stats sheet
    const statsSheetData = summaryData.stats.map((s: any) => ({
      'Kriteria': s.label,
      'Total': s.value
    }))
    const wsStats = XLSX.utils.json_to_sheet(statsSheetData)
    wsStats['!cols'] = [{ wch: 30 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistik Utama')

    // Aktivitas Barang Sheet
    const activitiesSheetData = summaryData.allActivities.map((a: any, index: number) => ({
      'No': index + 1,
      'Nama Barang': a.name,
      'Kategori': a.category || '-',
      'Kuantitas': a.quantity
    }))
    const wsActivities = XLSX.utils.json_to_sheet(activitiesSheetData)
    wsActivities['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 20 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsActivities, 'Aktivitas Barang')

    // Barang Nilai Tinggi Sheet
    const highValSheetData = summaryData.valuableGoodsHigh.map((v: any, index: number) => ({
      'No': index + 1,
      'Nama Barang': v.name,
      'Total Nilai (Rp)': v.value
    }))
    const wsHigh = XLSX.utils.json_to_sheet(highValSheetData)
    wsHigh['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 25 }]
    XLSX.utils.book_append_sheet(wb, wsHigh, 'Barang Nilai Tertinggi')

    XLSX.writeFile(wb, `Ringkasan_Analisis_${new Date().toISOString().split('T')[0]}.xlsx`)
    return true
  } catch (error) {
    console.error('Error exporting summary to Excel:', error)
    return false
  }
}

// Export Summary to PDF (Frontend)
export const exportSummaryToPDF = (summaryData: any) => {
  try {
    const doc = new jsPDF()
    const title = 'Laporan Ringkasan Analisis'
    
    // Add title
    doc.setFontSize(18)
    doc.text(title, 14, 20)
    
    // Add date
    doc.setFontSize(10)
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 28)
    
    let currentY = 35

    // Section 1: Statistik Utama
    doc.setFontSize(14)
    doc.text('1. Statistik Utama', 14, currentY)
    currentY += 8

    autoTable(doc, {
      head: [['Kriteria', 'Total']],
      body: summaryData.stats.map((s: any) => [s.label, s.value]),
      startY: currentY,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [139, 123, 110], textColor: [255, 255, 255], fontStyle: 'bold' }
    })
    
    currentY = (doc as any).lastAutoTable.finalY + 15

    // Section 2: Aktivitas Barang (Top 15)
    doc.setFontSize(14)
    doc.text('2. Aktivitas Barang', 14, currentY)
    currentY += 8

    autoTable(doc, {
      head: [['No', 'Nama Barang', 'Kategori', 'Kuantitas']],
      body: summaryData.allActivities.slice(0, 15).map((a: any, i: number) => [i + 1, a.name, a.category || '-', a.quantity]),
      startY: currentY,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [139, 123, 110], textColor: [255, 255, 255], fontStyle: 'bold' }
    })

    currentY = (doc as any).lastAutoTable.finalY + 15

    // Add page if needed
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    // Section 3: Barang Nilai Tertinggi
    doc.setFontSize(14)
    doc.text('3. Barang Nilai Tertinggi', 14, currentY)
    currentY += 8

    autoTable(doc, {
      head: [['No', 'Nama Barang', 'Total Nilai (Rp)']],
      body: summaryData.valuableGoodsHigh.map((v: any, i: number) => [
        i + 1, 
        v.name, 
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(v.value)
      ]),
      startY: currentY,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [139, 123, 110], textColor: [255, 255, 255], fontStyle: 'bold' }
    })

    doc.save(`Ringkasan_Analisis_${new Date().toISOString().split('T')[0]}.pdf`)
    return true
  } catch (error) {
    console.error('Error exporting summary to PDF:', error)
    return false
  }
}
