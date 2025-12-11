import API from '../../../../api'
import {LogItem} from './_model'

const LOG_URL = '/logs'

export const getLogs = async (params?: {
  page?: number
  per_page?: number
  search?: string
  action?: string
}): Promise<LogItem[]> => {
  const response = await API.get<{data: LogItem[]}>(LOG_URL, {params})
  return response.data.data
}