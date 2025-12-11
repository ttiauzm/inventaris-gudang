import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../_metronic/helpers'
import { getHistory } from './core/_requests'
import { HistoryItem } from './core/_model'

const HistoryPage: FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await getHistory()
      setHistory(data)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter(item =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredHistory.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div style={{borderRadius: '9px',margin: '10px' ,padding: '10px', backgroundColor: '#B7ADA6', minHeight: 'calc(5vh - 40px)'}}>
      <div className='card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title'>
            <h3 className='fw-bold mb-0'>Histori Pengambilan</h3>
          </div>
          
          <div className='card-toolbar'>
            <div className='d-flex align-items-center position-relative'>
              <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-5' />
              <input
                type='text'
                className='form-control form-control-solid w-250px ps-13'
                placeholder='Cari Barang'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </div>

        <div className='card-body py-4'>
          {loading ? (
            <div className='text-center py-10'>
              <span className='spinner-border spinner-border-lg'></span>
            </div>
          ) : (
            <>
              <div className='table-responsive'>
                <table className='table align-middle table-row-dashed fs-6 gy-5'>
                  <thead>
                    <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                      <th className='min-w-50px'>No</th>
                      <th className='min-w-100px'>ID</th>
                      <th className='min-w-200px'>Nama Barang</th>
                      <th className='min-w-100px'>Jumlah</th>
                      <th className='min-w-150px'>Tanggal</th>
                      <th className='min-w-125px'>Admin</th>
                    </tr>
                  </thead>
                  <tbody className='text-gray-600 fw-semibold'>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => (
                        <tr key={item.id}>
                          <td>{startIndex + index + 1}</td>
                          <td>{item.transaction_id}</td>
                          <td>
                            <div className='d-flex flex-column'>
                              <span className='text-gray-800 fw-bold mb-1'>
                                {item.item_name}
                              </span>
                              <span className='text-muted fs-7'>
                                {item.description}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className='badge badge-light-primary'>
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td>{new Date(item.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</td>
                          <td>{item.admin_name}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className='text-center py-10'>
                          <KTIcon iconName='file-deleted' className='fs-3x text-muted mb-3' />
                          <p className='text-muted'>Tidak ada data</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredHistory.length > 0 && (
                <div className='d-flex justify-content-between align-items-center flex-wrap pt-5'>
                  <div className='text-muted'>
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
                  </div>

                  <div className='d-flex gap-2'>
                    <button
                      className='btn btn-sm btn-light-primary'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      <KTIcon iconName='arrow-left' className='fs-3' />
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        className={`btn btn-sm ${currentPage === index + 1 ? 'btn-primary' : 'btn-light'}`}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      className='btn btn-sm btn-light-primary'
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      <KTIcon iconName='arrow-right' className='fs-3' />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export {HistoryPage}