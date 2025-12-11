import API from '../../../../api'
import {HistoryItem} from './_model'

const HISTORY_URL = '/history'

export const getHistory = async (params?: {
  page?: number
  per_page?: number
  search?: string
  date_from?: string
  date_to?: string
}): Promise<HistoryItem[]> => {
  const response = await API.get<{data: HistoryItem[]}>(HISTORY_URL, {params})
  return response.data.data
}

export const getHistoryById = async (id: number): Promise<HistoryItem> => {
  const response = await API.get<{data: HistoryItem}>(`${HISTORY_URL}/${id}`)
  return response.data.data
}