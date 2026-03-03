import API from '../../../../api'
import {LogItem} from './_model'

const LOG_URL = '/logs'

export const getLogs = async (params?: {
  page?: number
  per_page?: number
  search?: string
  action?: string
}): Promise<LogItem[]> => {
  const response = await API.get<{data: {data: any[]}}>(LOG_URL, {params})
  return response.data.data.data.map((item: any) => ({
    id: item.log_id,
    transaction_id: item.log_id,
    user_id: item.user_id || '',
    item_name: item.user?.username || item.user_id || '-',
    description: '-',
    quantity: 0,
    table_name: item.table_name,
    row_id: item.row_id,
    date: item.created_at,
    admin_name: item.user?.username || '-',
    action: item.action.toLowerCase()
  }))
}

export const exportLogs = () => {
  return `${import.meta.env.VITE_API_URL}/export/logs`
}

// Dummy data for development
// const getDummyLogs = (): LogItem[] => [
//   {
//     id: 1,
//     transaction_id: 'TRX-001',
//     item_name: 'Kain Katun Premium',
//     quantity: 50,
//     table_name: 'inventory',
//     row_id: 10,
//     action: 'create',
//     description: 'Menambahkan stok kain katun',
//     created_at: new Date().toISOString()
//   },
//   {
//     id: 2,
//     transaction_id: 'TRX-002',
//     item_name: 'Benang Polyester',
//     quantity: 100,
//     table_name: 'inventory',
//     row_id: 15,
//     action: 'update',
//     description: 'Update stok benang',
//     created_at: new Date().toISOString()
//   },
//   {
//     id: 3,
//     transaction_id: 'TRX-003',
//     item_name: 'Kancing Plastik',
//     quantity: 500,
//     table_name: 'inventory',
//     row_id: 20,
//     action: 'delete',
//     description: 'Menghapus item kancing rusak',
//     created_at: new Date().toISOString()
//   }
// ]