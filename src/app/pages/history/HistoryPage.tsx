import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../_metronic/helpers'
import EmptyState404 from '../../components/EmptyState404'
import { getHistory } from './core/_requests'
import { HistoryItem } from './core/_model'
import {exportHistoryToExcel, exportHistoryToPDF} from '../../utils/exportUtils'
import {useAuth} from '../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'

const HistoryPage: FC = () => {
  const {currentUser} = useAuth()
  const isSuperAdmin = checkSuperAdmin(currentUser)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showExportMenu, setShowExportMenu] = useState(false)
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

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      exportHistoryToExcel(filteredHistory)
    } else {
      await exportHistoryToPDF(filteredHistory)
    }
    setShowExportMenu(false)
  }

  return (
    <div style={{borderRadius: '9px',margin: '10px' ,padding: '10px', backgroundColor: '#B7ADA6', minHeight: 'calc(5vh - 40px)'}}>
      <div className='card'>
        <div className='card-header border-0 pt-6'>
          <div className='card-title'>
            <h3 className='fw-bold mb-0'>Histori Pengambilan</h3>
          </div>
          
          <div className='card-toolbar gap-3'>
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

            {/* Export Dropdown */}
            {isSuperAdmin && (
            <div className='position-relative'>
              <button
                className='btn btn-sm btn-light-success'
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <KTIcon iconName='file-down' className='fs-3' />
                Export
              </button>
              {showExportMenu && (
                <div className='menu menu-sub menu-sub-dropdown show position-absolute' style={{top: '100%', right: 0, zIndex: 105}}>
                  <div className='menu-item px-3'>
                    <button className='menu-link px-3' onClick={() => handleExport('excel')}>
                      <KTIcon iconName='file-sheet' className='fs-3 me-2' />
                      Export Excel
                    </button>
                  </div>
                  <div className='menu-item px-3'>
                    <button className='menu-link px-3' onClick={() => handleExport('pdf')}>
                      <KTIcon iconName='file' className='fs-3 me-2' />
                      Export PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
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
                        <td colSpan={6}>
                          <EmptyState404
                            title='Histori pengambilan tidak ada'
                            subtitle='Pastikan kata kunci pencarian Anda benar.'
                          />
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