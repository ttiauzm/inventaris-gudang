import {FC, useState, useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {KTIcon} from '../../../_metronic/helpers'
import {useAuth} from '../../modules/auth'
import {UserModal} from './components/UserModal'

interface Admin {
  id: number
  name: string
  email: string
  role: string
  created_at: string
  last_login: string
}

const UserManagementPage: FC = () => {
  const {currentUser} = useAuth()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Check if SuperAdmin
  const isSuperAdmin = currentUser?.roles?.includes(999)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      // Dummy data - replace with API call
      const dummyData: Admin[] = [
        {id: 177013, name: 'Agus Kopling', email: 'agus@delova.com', role: 'SuperAdmin', created_at: '2025-10-05', last_login: '2025-10-05'},
        {id: 177014, name: 'Bernadya', email: 'bernadya@delova.com', role: 'Admin', created_at: '2025-10-05', last_login: '2025-10-05'},
        {id: 177015, name: 'Mac', email: 'mac@delova.com', role: 'Admin', created_at: '2025-10-05', last_login: '2025-10-05'},
      ]
      setAdmins(dummyData)
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  // Redirect if not SuperAdmin
  if (!isSuperAdmin) {
    return <Navigate to='/dashboard' replace />
  }

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredAdmins.slice(startIndex, startIndex + itemsPerPage)

  const handleAdd = () => {
    setSelectedAdmin(null)
    setShowModal(true)
  }

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin)
    setShowModal(true)
  }

  const handleSave = () => {
    setShowModal(false)
    fetchAdmins()
  }

  return (
    <>
      {/* Padding Container */}
      <div style={{padding: '20px', backgroundColor: '#B7ADA6', minHeight: 'calc(100vh - 80px)'}}>
        <div className='card' style={{backgroundColor: '#FFFFFF'}}>
          <div className='card-header border-0 pt-6'>
            <div className='card-title'>
              <h3 className='fw-bold mb-0'>Manajemen Akun</h3>
            </div>
            
            <div className='card-toolbar gap-3'>
              <div className='d-flex align-items-center position-relative'>
                <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-5' />
                <input
                  type='text'
                  className='form-control form-control-solid w-250px ps-13'
                  placeholder='Cari Admin'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>

              <button 
                className='btn btn-sm btn-primary' 
                onClick={handleAdd}
                style={{backgroundColor: '#5C8AE6'}}
              >
                <KTIcon iconName='plus' className='fs-3' />
                Add Device
              </button>
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
                        <th className='min-w-100px'>ID</th>
                        <th className='min-w-200px'>Nama</th>
                        <th className='min-w-150px'>Tanggal Dibuat</th>
                        <th className='min-w-150px'>Terakhir Login</th>
                        <th className='text-end min-w-100px'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='text-gray-600 fw-semibold'>
                      {paginatedData.map((admin) => (
                        <tr key={admin.id}>
                          <td>{admin.id}</td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div className='symbol symbol-circle symbol-40px me-3'>
                                <div className='symbol-label bg-light-primary'>
                                  <KTIcon iconName='user' className='fs-2 text-primary' />
                                </div>
                              </div>
                              <div className='d-flex flex-column'>
                                <span className='text-gray-800 fw-bold mb-1'>{admin.name}</span>
                                <span className='text-muted fs-7'>{admin.role}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {new Date(admin.created_at).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                          <td>
                            {new Date(admin.last_login).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                          <td className='text-end'>
                            <button
                              className='btn btn-icon btn-light-primary btn-sm'
                              onClick={() => handleEdit(admin)}
                            >
                              <KTIcon iconName='pencil' className='fs-4' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredAdmins.length > 0 && (
                  <div className='d-flex justify-content-between align-items-center flex-wrap pt-5'>
                    <div className='d-flex align-items-center'>
                      <span className='text-muted me-2'>Show</span>
                      <span className='fw-bold me-2'>{itemsPerPage}</span>
                      <span className='text-muted'>per page</span>
                    </div>

                    <div className='text-muted'>
                      {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAdmins.length)} of {filteredAdmins.length}
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

      {showModal && (
        <UserModal
          admin={selectedAdmin}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  )
}

export {UserManagementPage}