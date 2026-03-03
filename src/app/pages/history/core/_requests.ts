import API from '../../../../api'
import { HistoryItem } from './_model'

const TRANSACTIONS_URL = '/transactions'

export const getHistory = async (params?: {
  page?: number
  per_page?: number
  search?: string
  date_from?: string
  date_to?: string
}): Promise<HistoryItem[]> => {
  const response = await API.get<{data: any[]}>(TRANSACTIONS_URL, {params})
  return response.data.data.map((item: any) => ({
    id: item.transaction_id,
    transaction_id: item.transaction_id,
    item_name: item.items?.item_name || '-',
    description: item.description || '-',
    quantity: item.quantity,
    unit: item.unit,
    date: item.created_at,
    admin_name: item.users?.username || '-',
    admin_id: item.user_id,
    created_at: item.created_at
  }))
}

export const getHistoryById = async (id: number): Promise<HistoryItem> => {
  const response = await API.get<{data: HistoryItem}>(`${TRANSACTIONS_URL}/${id}`)
  return response.data.data
}

export const exportTransactions = () => {
  return `${import.meta.env.VITE_API_URL}/export/transactions`
}

// export const getHistoryById = async (id: number): Promise<HistoryItem> => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       const data = getHistoryData()
//       const item = data.find((i: any) => i.id === id)
//       if (item) {
//         resolve(item)
//       } else {
//         reject(new Error('History not found'))
//       }
//     }, 300)
//   })
// }