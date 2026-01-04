import {FC, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {KTIcon} from '../../../_metronic/helpers'
import {useAuth} from '../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'
import {User, ROLE_OPTIONS, PERMISSION_GROUPS, PERMISSION_LABELS} from './core/_models'
import {updateUser, resetPassword, deleteUser, toggleUserStatus} from './core/_requests'

interface EditUserPageProps {
  user?: User
  onBack?: () => void
}

const EditUserPage: FC<EditUserPageProps> = ({user, onBack}) => {
  const navigate = useNavigate()
  const {currentUser} = useAuth()
  const [loading, setLoading] = useState(false)
  
  const [userData, setUserData] = useState<User>(user || {
    id: 0,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'Admin',
    roles: [1],
    permissions: [],
    is_active: true,
    created_at: ''
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const isSuperAdmin = checkSuperAdmin(currentUser)
  const isEditingSuperAdmin = userData.roles.includes(999)

  useEffect(() => {
    if (user) {
      setUserData(user)
    }
  }, [user])

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      await updateUser(userData.id, {
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        role_ids: userData.roles,
        permission_ids: userData.permissions,
        is_active: userData.is_active
      })
      alert('User detail updated successfully!')
      if (onBack) onBack()
    } catch (error: any) {
      alert(error.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!passwordData.newPassword) {
      alert('Password baru tidak boleh kosong!')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password tidak cocok!')
      return
    }
    
    try {
      setLoading(true)
      await resetPassword(userData.id, passwordData.newPassword)
      alert('Password reset successfully!')
      setPasswordData({newPassword: '', confirmPassword: ''})
    } catch (error: any) {
      alert(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserData(prev => ({...prev, avatar: reader.result as string}))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeactivate = async () => {
    try {
      setLoading(true)
      await toggleUserStatus(userData.id, !userData.is_active)
      setUserData(prev => ({...prev, is_active: !prev.is_active}))
      alert(`User ${userData.is_active ? 'deactivated' : 'activated'} successfully!`)
    } catch (error: any) {
      alert(error.message || 'Failed to toggle status')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      try {
        setLoading(true)
        await deleteUser(userData.id)
        alert('User deleted successfully!')
        if (onBack) onBack()
        else navigate('/apps/users')
      } catch (error: any) {
        alert(error.message || 'Failed to delete user')
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePermissionToggle = (permissionId: number) => {
    setUserData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  return (
    <div className='container-fluid'>
      <div className='d-flex align-items-center mb-7'>
        <button className='btn btn-sm btn-icon btn-light-primary me-3' onClick={onBack || (() => navigate(-1))}>
          <KTIcon iconName='arrow-left' className='fs-2' />
        </button>
        <h1 className='text-dark fw-bold my-1 fs-3'>Edit User: {userData.first_name} {userData.last_name}</h1>
      </div>

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
                      {userData.avatar ? (
                        <img src={userData.avatar} alt='User' />
                      ) : (
                        <div className='symbol-label fs-2 fw-bold text-muted'>
                          {userData.first_name.charAt(0)}
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
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Username</label>
                <div className='col-lg-8'>
                  <input
                    type='text'
                    className='form-control form-control-solid'
                    placeholder='Username'
                    value={userData.username}
                    onChange={(e) => setUserData(prev => ({...prev, username: e.target.value}))}
                  />
                </div>
              </div>

              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>First Name</label>
                <div className='col-lg-8'>
                  <input
                    type='text'
                    className='form-control form-control-solid'
                    placeholder='First Name'
                    value={userData.first_name}
                    onChange={(e) => setUserData(prev => ({...prev, first_name: e.target.value}))}
                  />
                </div>
              </div>

              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Last Name</label>
                <div className='col-lg-8'>
                  <input
                    type='text'
                    className='form-control form-control-solid'
                    placeholder='Last Name'
                    value={userData.last_name}
                    onChange={(e) => setUserData(prev => ({...prev, last_name: e.target.value}))}
                  />
                </div>
              </div>

              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Email</label>
                <div className='col-lg-8'>
                  <input
                    type='email'
                    className='form-control form-control-solid'
                    placeholder='Email'
                    value={userData.email}
                    onChange={(e) => setUserData(prev => ({...prev, email: e.target.value}))}
                  />
                </div>
              </div>

              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label fw-semibold fs-6'>Phone</label>
                <div className='col-lg-8'>
                  <input
                    type='text'
                    className='form-control form-control-solid'
                    placeholder='Phone'
                    value={userData.phone || ''}
                    onChange={(e) => setUserData(prev => ({...prev, phone: e.target.value}))}
                  />
                </div>
              </div>

              <div className='row mb-6'>
                <label className='col-lg-4 col-form-label required fw-semibold fs-6'>Role</label>
                <div className='col-lg-8'>
                  <select
                    className='form-select form-select-solid'
                    value={userData.roles[0]}
                    onChange={(e) => setUserData(prev => ({...prev, roles: [parseInt(e.target.value)]}))}
                  >
                    {ROLE_OPTIONS.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='d-flex justify-content-end'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? <span className='spinner-border spinner-border-sm align-middle ms-2'></span> : 'Save Changes'}
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
                  disabled={loading}
                >
                  {loading ? <span className='spinner-border spinner-border-sm align-middle ms-2'></span> : 'Reset Password'}
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
                {PERMISSION_GROUPS.map((group) => (
                  <div className='col-12' key={group.label}>
                    <h5 className='fw-bold mb-3'>{group.label}</h5>
                    <div className='row g-3'>
                      {group.permissions.map((perm) => (
                        <div className='col-lg-4' key={perm.id}>
                          <div className='form-check form-check-custom form-check-solid'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id={`permission_${perm.id}`}
                              checked={userData.permissions.includes(perm.id)}
                              onChange={() => handlePermissionToggle(perm.id)}
                            />
                            <label className='form-check-label' htmlFor={`permission_${perm.id}`}>
                              {perm.name}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <hr className='my-4' />
                  </div>
                ))}
              </div>

              <div className='d-flex justify-content-end mt-6'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? <span className='spinner-border spinner-border-sm align-middle ms-2'></span> : 'Save Permissions'}
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
                      className={`btn ${userData.is_active ? 'btn-light-warning' : 'btn-light-success'}`}
                      onClick={handleDeactivate}
                      disabled={loading}
                    >
                      {userData.is_active ? 'Deactivate Account' : 'Activate Account'}
                    </button>
                    <button
                      type='button'
                      className='btn btn-danger'
                      onClick={handleDelete}
                      disabled={loading}
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
