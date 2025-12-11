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

// Export History to Excel
export const exportHistoryToExcel = (history: any[]) => {
  const exportData = history.map(item => ({
    'ID Transaksi': item.transaction_id,
    'Nama Barang': item.item_name,
    'Deskripsi': item.description,
    'Jumlah': `${item.quantity} ${item.unit}`,
    'Tanggal': new Date(item.date).toLocaleDateString('id-ID'),
    'Admin': item.admin_name
  }))
  
  return exportToExcel(exportData, `History_${new Date().toISOString().split('T')[0]}`, 'History')
}

// Export History to PDF
export const exportHistoryToPDF = (history: any[]) => {
  const columns = [
    {header: 'ID', dataKey: 'transaction_id'},
    {header: 'Barang', dataKey: 'item_name'},
    {header: 'Jumlah', dataKey: 'quantity'},
    {header: 'Tanggal', dataKey: 'date'},
    {header: 'Admin', dataKey: 'admin_name'}
  ]
  
  const exportData = history.map(item => ({
    transaction_id: item.transaction_id,
    item_name: item.item_name,
    quantity: `${item.quantity} ${item.unit}`,
    date: new Date(item.date).toLocaleDateString('id-ID'),
    admin_name: item.admin_name
  }))
  
  return exportToPDF(
    exportData,
    columns,
    `History_${new Date().toISOString().split('T')[0]}`,
    'Histori Pengambilan Barang'
  )
}