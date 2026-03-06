
import React, {useState, useEffect} from 'react'
import {useAuth} from '../../../../app/modules/auth'
import {toAbsoluteUrl, KTIcon} from '../../../../_metronic/helpers'
import { isSuperAdmin as checkSuperAdmin } from '../../../../app/utils/permissionHelper'
import {SuccessModal} from '../../../../app/components/SuccessModal'
import API from '../../../../api'

export function Overview() {
  const {currentUser} = useAuth()
  const isSuperAdmin = checkSuperAdmin(currentUser)
  // Logic: Admin (not superadmin) can only view. SuperAdmin can edit.
  const canEdit = isSuperAdmin

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [permissions, setPermissions] = useState([
    {id: 1, name: 'Edit Detail Barang', checked: false},
    {id: 2, name: 'Edit Detail Barang', checked: false},
    {id: 3, name: 'Edit Detail Barang', checked: false},
    {id: 4, name: 'Edit Detail Barang', checked: false},
    {id: 5, name: 'Edit Detail Barang', checked: false},
    {id: 6, name: 'Edit Detail Barang', checked: false},
    {id: 7, name: 'Edit Detail Barang', checked: false},
    {id: 8, name: 'Edit Detail Barang', checked: false},
    {id: 9, name: 'Edit Detail Barang', checked: false},
    {id: 10, name: 'Edit Detail Barang', checked: false},
    {id: 11, name: 'Edit Detail Barang', checked: false},
    {id: 12, name: 'Edit Detail Barang', checked: false},
  ])

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.first_name || currentUser.username || '',
        email: currentUser.email || ''
      }))
    }
  }, [currentUser])

  const handlePermissionChange = (id: number) => {
    if (!canEdit) return
    setPermissions(permissions.map(p => 
      p.id === id ? {...p, checked: !p.checked} : p
    ))
  }

  const handleSaveChanges = async () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Mohon isi fieldnya!'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Mohon isi fieldnya!'
    }
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }
    setFormErrors({})
    try {
      setSaveLoading(true)
      await API.put('/profile', {name: formData.name, email: formData.email})
      setShowSaveSuccess(true)
    } catch (error: any) {
      setFormErrors({name: error?.response?.data?.message || 'Gagal menyimpan perubahan. Coba lagi.'})
    } finally {
      setSaveLoading(false)
    }
  }

  const handleResetPassword = async () => {
    const newErrors: Record<string, string> = {}
    if (!formData.password.trim()) {
      newErrors.password = 'Mohon isi fieldnya!'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok!'
    }
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }
    setFormErrors({})
    try {
      setSaveLoading(true)
      await API.put('/profile/password', {password: formData.password, password_confirmation: formData.confirmPassword})
      setFormData(prev => ({...prev, password: '', confirmPassword: ''}))
      setShowPasswordSuccess(true)
    } catch (error: any) {
      setFormErrors({password: error?.response?.data?.message || 'Gagal mereset password. Coba lagi.'})
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <>
      {/* Success Modals */}
      {showSaveSuccess && (
        <SuccessModal
          message='Data profil berhasil disimpan'
          onClose={() => setShowSaveSuccess(false)}
        />
      )}
      {showPasswordSuccess && (
        <SuccessModal
          message='Password berhasil diperbarui'
          onClose={() => setShowPasswordSuccess(false)}
        />
      )}

      {/* Card 1: Edit Detail Admin */}
      <div className='card mb-5 mb-xl-10'>
        <div className='card-header border-0 cursor-pointer'>
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>Edit Detail Admin</h3>
          </div>
        </div>

        <div className='card-body p-9'>
          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-bold fs-6'>Photo</label>
            <div className='col-lg-8'>
              <div className='d-flex align-items-center'>
                <div className='symbol symbol-100px me-5'>
                  <div
                    className='symbol-label'
                    style={{
                      backgroundImage: `url(${toAbsoluteUrl('media/avatars/300-1.jpg')})`,
                    }}
                  ></div>
                </div>
                <div className='text-muted fs-7'>
                  150x150px JPEG, PNG Image
                </div>
              </div>
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-bold fs-6'>Nama</label>
            <div className='col-lg-8 fv-row'>
              <input
                type='text'
                className='form-control form-control-lg form-control-solid'
                placeholder='Nama'
                value={formData.name}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-bold fs-6'>Email</label>
            <div className='col-lg-8 fv-row'>
              <input
                type='email'
                className='form-control form-control-lg form-control-solid'
                placeholder='Email'
                value={formData.email}
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Save Changes button dinonaktifkan sementara */}
        </div>
      </div>

      {/* Card 2: Password */}
      <div className='card mb-5 mb-xl-10'>
        <div className='card-header border-0 cursor-pointer'>
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>Password</h3>
          </div>
        </div>

        <div className='card-body p-9'>
          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-bold fs-6'>Password baru</label>
            <div className='col-lg-8 fv-row'>
              <input
                type='password'
                className={`form-control form-control-lg form-control-solid ${formErrors.password ? 'is-invalid' : ''}`}
                placeholder='New password'
                value={formData.password}
                disabled={!canEdit}
                onChange={e => {
                  setFormData({...formData, password: e.target.value})
                  if (formErrors.password) setFormErrors(prev => ({...prev, password: ''}))
                }}
              />
              {formErrors.password && <div className='invalid-feedback fw-semibold'>{formErrors.password}</div>}
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-bold fs-6'>Konfirmasi password</label>
            <div className='col-lg-8 fv-row'>
              <input
                type='password'
                className={`form-control form-control-lg form-control-solid ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder='Confirm new password'
                value={formData.confirmPassword}
                disabled={!canEdit}
                onChange={e => {
                  setFormData({...formData, confirmPassword: e.target.value})
                  if (formErrors.confirmPassword) setFormErrors(prev => ({...prev, confirmPassword: ''}))
                }}
              />
              {formErrors.confirmPassword && <div className='invalid-feedback fw-semibold'>{formErrors.confirmPassword}</div>}
            </div>
          </div>

          {canEdit && (
            <div className='card-footer d-flex justify-content-end py-6 px-9'>
              <button type='button' className='btn btn-primary' onClick={handleResetPassword} disabled={saveLoading}>
                {saveLoading ? <span className='spinner-border spinner-border-sm me-2' /> : null}
                Reset Password
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Permission */}
      <div className='card mb-5 mb-xl-10'>
        <div className='card-header border-0 cursor-pointer'>
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>Permission</h3>
          </div>
        </div>

        <div className='card-body p-9'>
          <div className='row'>
            {permissions.map((perm) => (
              <div className='col-md-4 mb-5' key={perm.id}>
                <div className='d-flex align-items-center'>
                  <div className='form-check form-check-custom form-check-solid me-3'>
                    <input
                      className='form-check-input'
                      type='checkbox'
                      checked={perm.checked}
                      disabled={!canEdit}
                      onChange={() => handlePermissionChange(perm.id)}
                    />
                  </div>
                  <span className='fw-bold text-gray-600'>{perm.name}</span>
                </div>
              </div>
            ))}
          </div>

          {canEdit && (
            <div className='card-footer d-flex justify-content-end py-6 px-9'>
              <button type='button' className='btn btn-primary'>
                Reset Password
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card 4: Hapus Akun */}
      <div className='card mb-5 mb-xl-10'>
        <div className='card-header border-0 cursor-pointer'>
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>Hapus Akun</h3>
          </div>
        </div>

        <div className='card-body p-9'>
          <div className='notice d-flex bg-light-warning rounded border-warning border border-dashed p-6 mb-10'>
            <KTIcon iconName='information-5' className='fs-2tx text-warning me-4' />
            <div className='d-flex flex-stack flex-grow-1'>
              <div className='fw-bold'>
                <h4 className='text-gray-900 fw-bolder'>Peringatan</h4>
                <div className='fs-6 text-gray-700'>
                  Sorry, but we cannot delete this Superadmin account.
                </div>
              </div>
            </div>
          </div>

          {canEdit && (
            <>
              <div className='form-check form-check-solid fv-row'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  checked={confirmDelete}
                  onChange={e => setConfirmDelete(e.target.checked)}
                  id='confirmDelete'
                />
                <label className='form-check-label fw-bold ps-2 fs-6' htmlFor='confirmDelete'>
                  Konfirmasi penghapusan akun
                </label>
              </div>

              <div className='d-flex justify-content-end mt-10'>
                <button type='button' className='btn btn-light me-3'>
                  Deactivate Instead
                </button>
                <button
                  type='button'
                  className='btn btn-danger'
                  disabled={!confirmDelete}
                >
                  Delete Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
