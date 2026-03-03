import {FC, useState, useEffect} from 'react'
import {Navigate} from 'react-router-dom'
import {KTIcon} from '../../../_metronic/helpers'
import {useAuth} from '../../modules/auth'
import {UserModal} from './components/UserModal'
import {EditUserPage} from './EditUserPage'
import {User} from './core/_models'
import {getUsers} from './core/_requests'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'

const UserManagementPage: FC = () => {
  const {currentUser} = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Check if SuperAdmin - akan otomatis bypass di dev mode
  const isSuperAdmin = checkSuperAdmin(currentUser)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Redirect if not SuperAdmin
  if (!isSuperAdmin) {
    return <Navigate to='/dashboard' replace />
  }

  if (isEditing && selectedUser) {
    return <EditUserPage user={selectedUser} onBack={() => {
      setIsEditing(false)
      setSelectedUser(null)
      fetchUsers()
    }} />
  }

  const totalPages = Math.ceil(users.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = users.slice(startIndex, startIndex + itemsPerPage)

  const handleAdd = () => {
    setSelectedUser(null)
    setShowModal(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditing(true)
  }

  const handleSave = () => {
    setShowModal(false)
    fetchUsers()
  }

  return (
    <>
      {/* Padding Container */}
      <div style={{borderRadius: '9px',margin: '10px' ,paddingTop: '2vh',padding: '10px', backgroundColor: '#B7ADA6', minHeight: 'calc(5vh - 40px)'}}>
        <div className='card' style={{backgroundColor: '#FFFFFF'}}>
          <div className='card-header border-0 pt-6'>
            <div className='card-title'>
              <h3 className='fw-bold mb-0'>Manajemen Akun</h3>
            </div>
            
            <div className='card-toolbar gap-3'>
              <button 
                className='btn btn-sm btn-primary' 
                onClick={handleAdd}
                style={{backgroundColor: '#5C8AE6'}}
              >
                <KTIcon iconName='plus' className='fs-3' />
                Tambah Akun
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
                  <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
                    <thead>
                      <tr className='fw-bold text-muted'>
                        <th className='min-w-100px'>ID</th>
                        <th className='min-w-150px'>Nama</th>
                        <th className='min-w-100px'>Role</th>
                        <th className='min-w-150px'>Tanggal Dibuat</th>
                        <th className='min-w-150px'>Terakhir Login</th>
                        <th className='text-end min-w-100px'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className='text-dark fw-bold'>{user.id}</div>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div className='symbol symbol-circle symbol-40px me-3'>
                                <div className='symbol-label' style={{backgroundColor: '#E8F5E9'}}>
                                  <KTIcon iconName='user' className='fs-3 text-success' />
                                </div>
                              </div>
                              <div className='d-flex flex-column'>
                                <span className='text-dark fw-bold'>{user.username}</span>
                                <span className='text-muted fs-7'>{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className='text-dark fw-semibold'>{user.role}</span>
                          </td>
                          <td>
                            <span className='text-muted'>
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : '-'}
                            </span>
                          </td>
                          <td>
                            <span className='text-muted'>
                              {user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : '-'}
                            </span>
                          </td>
                          <td className='text-end'>
                            <button
                              className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                              onClick={() => handleEdit(user)}
                            >
                              <KTIcon iconName='pencil' className='fs-3' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className='d-flex justify-content-between align-items-center mt-4'>
                  <div className='d-flex align-items-center gap-2'>
                    <span className='text-muted'>Show</span>
                    <select className='form-select form-select-sm w-auto'>
                      <option value='10'>10</option>
                      <option value='25'>25</option>
                      <option value='50'>50</option>
                    </select>
                    <span className='text-muted'>per page</span>
                  </div>
                  <div className='d-flex align-items-center gap-2'>
                    <span className='text-muted'>
                      {startIndex + 1}-{Math.min(startIndex + itemsPerPage, users.length)} of {users.length}
                    </span>
                    <button 
                      className='btn btn-sm btn-icon btn-light'
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <KTIcon iconName='arrow-left' className='fs-3' />
                    </button>
                    {Array.from({length: Math.min(5, totalPages)}, (_, i) => i + 1).map(page => (
                      <button 
                        key={page} 
                        className={`btn btn-sm btn-icon ${page === currentPage ? 'btn-primary' : 'btn-light'}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      className='btn btn-sm btn-icon btn-light'
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <KTIcon iconName='arrow-right' className='fs-3' />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  )
}

export {UserManagementPage}
