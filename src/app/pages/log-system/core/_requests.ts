import API from '../../../../api'
import {LogItem} from './_model'

const LOG_URL = '/logs'

export const getLogs = async (params?: {
  page?: number
  per_page?: number
  search?: string
  action?: string
}): Promise<LogItem[]> => {
  try {
    const response = await API.get<{data: LogItem[]}>(LOG_URL, {params})
    return response.data.data
  } catch (error) {
    console.error('Error fetching logs:', error)
    return getDummyLogs()
  }
}

// Dummy data for development
const getDummyLogs = (): LogItem[] => [
  {
    id: 1,
    transaction_id: 'TRX-001',
    item_name: 'Kain Katun Premium',
    quantity: 50,
    table_name: 'inventory',
    row_id: 10,
    action: 'create',
    description: 'Menambahkan stok kain katun',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    transaction_id: 'TRX-002',
    item_name: 'Benang Polyester',
    quantity: 100,
    table_name: 'inventory',
    row_id: 15,
    action: 'update',
    description: 'Update stok benang',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    transaction_id: 'TRX-003',
    item_name: 'Kancing Plastik',
    quantity: 500,
    table_name: 'inventory',
    row_id: 20,
    action: 'delete',
    description: 'Menghapus item kancing rusak',
    created_at: new Date().toISOString()
  }
]