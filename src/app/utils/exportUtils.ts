import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Export to Excel
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // Generate file
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

// Export Inventory to PDF
export const exportInventoryToPDF = (inventory: any[]) => {
  const columns = [
    {header: 'Nama', dataKey: 'name'},
    {header: 'Supplier', dataKey: 'supplier'},
    {header: 'Kategori', dataKey: 'category'},
    {header: 'Stok', dataKey: 'quantity'},
    {header: 'Satuan', dataKey: 'unit'},
    {header: 'Harga', dataKey: 'price'}
  ]
  
  const exportData = inventory.map(item => ({
    name: item.name,
    supplier: item.supplier,
    category: item.category || '-',
    quantity: item.quantity,
    unit: item.unit,
    price: `Rp ${(item.price || 0).toLocaleString('id-ID')}`
  }))
  
  return exportToPDF(
    exportData,
    columns,
    `Inventory_${new Date().toISOString().split('T')[0]}`,
    'Laporan Inventory'
  )
}

// Export Logs to Excel
export const exportLogsToExcel = (logs: any[]) => {
  const exportData = logs.map((item, index) => ({
    'No': index + 1,
    'ID Transaksi': item.transaction_id,
    'Nama Barang': item.item_name,
    'Jumlah': item.quantity,
    'Tabel': item.table_name,
    'Aksi': item.action,
    'Tanggal': new Date(item.created_at).toLocaleString('id-ID'),
    'Deskripsi': item.description
  }))
  
  return exportToExcel(exportData, `SystemLogs_${new Date().toISOString().split('T')[0]}`, 'Logs')
}

// Export Logs to PDF
export const exportLogsToPDF = (logs: any[]) => {
  const columns = [
    {header: 'No', dataKey: 'no'},
    {header: 'ID', dataKey: 'transaction_id'},
    {header: 'Nama Barang', dataKey: 'item_name'},
    {header: 'Jumlah', dataKey: 'quantity'},
    {header: 'Aksi', dataKey: 'action'},
    {header: 'Tanggal', dataKey: 'created_at'}
  ]
  
  const exportData = logs.map((item, index) => ({
    no: index + 1,
    transaction_id: item.transaction_id,
    item_name: item.item_name,
    quantity: item.quantity,
    action: item.action,
    created_at: new Date(item.created_at).toLocaleString('id-ID')
  }))
  
  return exportToPDF(exportData, columns, `SystemLogs_${new Date().toISOString().split('T')[0]}`, 'Laporan Log Sistem')
}

// Export History to Excel
export const exportHistoryToExcel = (history: any[]) => {
  const exportData = history.map((item, index) => ({
    'No': index + 1,
    'ID Transaksi': item.transaction_id,
    'Nama Barang': item.item_name,
    'Jumlah': `${item.quantity} ${item.unit}`,
    'Admin': item.user_name,
    'Tanggal': new Date(item.created_at).toLocaleString('id-ID'),
    'Deskripsi': item.description
  }))
  
  return exportToExcel(exportData, `History_${new Date().toISOString().split('T')[0]}`, 'History')
}

// Export History to PDF
export const exportHistoryToPDF = (history: any[]) => {
  const columns = [
    {header: 'No', dataKey: 'no'},
    {header: 'ID', dataKey: 'transaction_id'},
    {header: 'Nama Barang', dataKey: 'item_name'},
    {header: 'Jumlah', dataKey: 'quantity'},
    {header: 'Admin', dataKey: 'user_name'},
    {header: 'Tanggal', dataKey: 'created_at'}
  ]
  
  const exportData = history.map((item, index) => ({
    no: index + 1,
    transaction_id: item.transaction_id,
    item_name: item.item_name,
    quantity: `${item.quantity} ${item.unit}`,
    user_name: item.user_name,
    created_at: new Date(item.created_at).toLocaleString('id-ID')
  }))
  
  return exportToPDF(exportData, columns, `History_${new Date().toISOString().split('T')[0]}`, 'Laporan Histori Pengambilan')
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

// Export Master Data (Categories/Materials) to PDF
export const exportMasterDataToPDF = (data: any[], type: 'Category' | 'Material') => {
  const columns = [
    {header: 'No', dataKey: 'no'},
    {header: 'Nama', dataKey: 'name'},
    {header: 'Deskripsi', dataKey: 'description'}
  ]
  
  const exportData = data.map((item, index) => ({
    no: index + 1,
    name: item.name,
    description: item.description || '-'
  }))
  
  return exportToPDF(exportData, columns, `${type}_${new Date().toISOString().split('T')[0]}`, `Laporan Data ${type}`)
}