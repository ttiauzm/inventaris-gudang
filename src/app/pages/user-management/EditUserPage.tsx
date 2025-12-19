import {FC, useState, useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {KTIcon} from '../../../_metronic/helpers'
import {useAuth} from '../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'

interface UserData {
  id: number
  photo?: string
  name: string
  email: string
  role: string
}

const EditUserPage: FC = () => {
  const navigate = useNavigate()
  const {userId} = useParams<{userId: string}>()
  const {currentUser} = useAuth()
  
  const [userData, setUserData] = useState<UserData>({
    id: 0,
    photo: '',
    name: 'Jason Tatum',
    email: 'jason@delova.co',
    role: 'Admin'
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const [permissions, setPermissions] = useState<string[]>([
    'edit_detail_barang_1',
    'edit_detail_barang_2',
    'edit_detail_barang_3',
    'edit_detail_barang_4',
    'edit_detail_barang_5',
    'edit_detail_barang_6',
    'edit_detail_barang_7',
    'edit_detail_barang_8'
  ])

  const isSuperAdmin = checkSuperAdmin(currentUser)
  const isEditingSuperAdmin = userData.role === 'SuperAdmin'

  useEffect(() => {
    // Load user data based on userId
    // For demo purposes, using static data
  }, [userId])

  const handleSaveChanges = () => {
    console.log('Saving user changes:', userData)
    // Implement save logic
  }

  const handleResetPassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password tidak cocok!')
      return
    }
    console.log('Resetting password')
    // Implement password reset logic
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserData(prev => ({...prev, photo: reader.result as string}))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeactivate = () => {
    console.log('Deactivating account')
    // Implement deactivate logic
  }

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      console.log('Deleting account')
      // Implement delete logic
      navigate('/apps/users')
    }
  }

  return (
    <div className='container-fluid'>
      <div className='row g-5'>
        {/* Edit Detail Admin Card */}
        <div className='col-12'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Edit Detail Admin</span>
              </h3>
            </div>

            <div className='card-body py-4'>
              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label fw-semibold fs-6'>Photo</label>
                <div className='col-lg-8'>
                  <div className='d-flex align-items-center gap-3'>
                    <div 
                      className='symbol symbol-100px symbol-circle'
                      style={{
                        backgroundColor: '#f1f1f1',
                        overflow: 'hidden'
                      }}
                    >
                      {userData.photo ? (
                        <img src={userData.photo} alt='User' />
                      ) : (
                        <div className='symbol-label fs-2 fw-bold text-muted'>
                          {userData.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type='file'
                        accept='image/*'
                        className='d-none'
                        id='photoUpload'
                        onChange={handlePhotoChange}
                      />
                      <label
                        htmlFor='photoUpload'
                        className='btn btn-sm btn-light-primary me-2'
                        style={{cursor: 'pointer'}}
                      >
                        Choose Image
                      </label>
                      <div className='form-text'>
                        Max file size is 1MB and max resolution is 500x500.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Name</label>
                <div className='col-lg-8'>
                  <input
                    type='text'
                    className='form-control form-control-solid'
                    placeholder='Jason Tatum'
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
              </div>

              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Email</label>
                <div className='col-lg-8'>
                  <input
                    type='email'
                    className='form-control form-control-solid'
                    placeholder='jason@delova.co'
                    value={userData.email}
                    onChange={(e) => setUserData(prev => ({...prev, email: e.target.value}))}
                  />
                </div>
              </div>

              <div className='d-flex justify-content-end'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className='col-12'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Password</span>
              </h3>
            </div>

            <div className='card-body py-4'>
              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Password baru</label>
                <div className='col-lg-8'>
                  <input
                    type='password'
                    className='form-control form-control-solid'
                    placeholder='New password'
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                  />
                </div>
              </div>

              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Konfirmasi password</label>
                <div className='col-lg-8'>
                  <input
                    type='password'
                    className='form-control form-control-solid'
                    placeholder='Confirm new password'
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                  />
                </div>
              </div>

              <div className='d-flex justify-content-end'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleResetPassword}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Card */}
        <div className='col-12'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Permission</span>
              </h3>
            </div>

            <div className='card-body py-4'>
              <div className='row g-4'>
                {Array.from({length: 8}).map((_, index) => (
                  <div className='col-lg-4' key={index}>
                    <div className='form-check form-check-custom form-check-solid'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id={`permission_${index}`}
                        checked={permissions.includes(`edit_detail_barang_${index + 1}`)}
                        onChange={(e) => {
                          const permId = `edit_detail_barang_${index + 1}`
                          if (e.target.checked) {
                            setPermissions(prev => [...prev, permId])
                          } else {
                            setPermissions(prev => prev.filter(p => p !== permId))
                          }
                        }}
                      />
                      <label className='form-check-label' htmlFor={`permission_${index}`}>
                        Edit Detail Barang
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className='d-flex justify-content-end mt-6'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => console.log('Saving permissions:', permissions)}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hapus Akun Card */}
        <div className='col-12'>
          <div className='card'>
            <div className='card-header border-0 pt-6'>
              <h3 className='card-title align-items-start flex-column'>
                <span className='card-label fw-bold fs-3 mb-1'>Hapus Akun</span>
              </h3>
            </div>

            <div className='card-body py-4'>
              {isEditingSuperAdmin ? (
                <div className='alert alert-warning d-flex align-items-center mb-5'>
                  <KTIcon iconName='information-5' className='fs-2 me-4' />
                  <div className='d-flex flex-column'>
                    <h5 className='mb-1'>Sorry, but we cannot delete the Superadmin account.</h5>
                    <span>Konfirmasi penghapusan akun</span>
                  </div>
                </div>
              ) : (
                <div className='alert alert-danger d-flex align-items-center mb-5'>
                  <KTIcon iconName='information-5' className='fs-2 me-4' />
                  <div className='d-flex flex-column'>
                    <h5 className='mb-1'>Anda yakin ingin menghapus akun ini?</h5>
                    <span>Akun yang dihapus tidak dapat dikembalikan</span>
                  </div>
                </div>
              )}

              <div className='d-flex justify-content-end gap-3'>
                {!isEditingSuperAdmin && (
                  <>
                    <button
                      type='button'
                      className='btn btn-light'
                      onClick={handleDeactivate}
                    >
                      Deactivate Instead
                    </button>
                    <button
                      type='button'
                      className='btn btn-danger'
                      onClick={handleDelete}
                    >
                      Delete Account
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export {EditUserPage}
