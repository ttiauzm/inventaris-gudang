import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'
import {User, CreateUserRequest, ROLE_OPTIONS, PERMISSION_GROUPS, PERMISSION_LABELS} from '../core/_models'
import {createUser, updateUser, resetPassword} from '../core/_requests'
import {SuccessModal} from '../../../components/SuccessModal'

interface UserModalProps {
  user: User | null
  onClose: () => void
  onSave: () => void
}

const UserModal: FC<UserModalProps> = ({user, onClose, onSave}) => {
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [verificationNotice, setVerificationNotice] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        password_confirmation: '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Inline validation
    const newErrors: Record<string, string> = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Username tidak boleh kosong!'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email tidak boleh kosong!'
    }
    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password tidak boleh kosong untuk user baru!'
    }
    if (!user && formData.password && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Password dan konfirmasi password tidak cocok!'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    
    try {
      setLoading(true)
      
      if (user) {
        // Update existing user
        const updatedUser = await updateUser(user.id, {
          username: formData.username,
          email: formData.email,
          password: formData.password || undefined
        })
        if (updatedUser.email_pending) {
          setSuccessMessage(`User berhasil diupdate. Email lama tetap aktif sampai ${updatedUser.email_pending} diverifikasi.`)
          setVerificationNotice(true)
        } else {
          setSuccessMessage('User berhasil diupdate!')
          setVerificationNotice(false)
        }
        setShowSuccess(true)
      } else {
        // Create new user
        const newUserData: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        }
        await createUser(newUserData)
        setSuccessMessage('Admin berhasil dibuat!')
        setVerificationNotice(true)
        setShowSuccess(true)
      }
    } catch (error: any) {
      console.error('Error saving user:', error)
      const fieldErrors = error?.response?.data?.errors || {}
      const serverMsg: string = error?.response?.data?.message || error?.message || ''
      const msgLower = serverMsg.toLowerCase()
      if (fieldErrors.email?.[0]) {
        setErrors({email: fieldErrors.email[0]})
      } else if (fieldErrors.username?.[0]) {
        setErrors({username: fieldErrors.username[0]})
      } else if (msgLower.includes('email') && (msgLower.includes('taken') || msgLower.includes('unique') || msgLower.includes('sudah') || msgLower.includes('already'))) {
        setErrors({email: 'Email sudah digunakan oleh akun lain.'})
      } else if (msgLower.includes('username') || msgLower.includes('duplicate') || msgLower.includes('already')) {
        setErrors({username: 'Username sudah digunakan.'})
      } else {
        setErrors({username: serverMsg || 'Gagal menyimpan data user'})
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Modal sukses */}
      {showSuccess && (
        <SuccessModal
          message={
            verificationNotice
              ? `${successMessage}\n\nLink verifikasi telah dikirim ke ${formData.email}. Status akun akan tetap Pending sampai link tersebut dibuka.`
              : successMessage
          }
          onClose={() => {
            setShowSuccess(false)
            onSave()
          }}
        />
      )}

      <div className='modal-backdrop fade show' onClick={onClose} />

      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered modal-lg'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>
                {user ? 'Edit Admin' : 'Tambah Admin'}
              </h5>
              <button type='button' className='btn-close' onClick={onClose} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                <div className='row g-4'>
                  {/* Username */}
                  <div className='col-12'>
                    <label className='form-label required'>Username</label>
                    <input
                      type='text'
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      placeholder='username'
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({...formData, username: e.target.value})
                        if (errors.username) setErrors(prev => ({...prev, username: ''}))
                      }}
                    />
                    {errors.username && <div className='invalid-feedback fw-semibold'>{errors.username}</div>}
                  </div>

                  {/* Email */}
                  <div className='col-12'>
                    <label className='form-label required'>Email</label>
                    <input
                      type='email'
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder='email@example.com'
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({...formData, email: e.target.value})
                        if (errors.email) setErrors(prev => ({...prev, email: ''}))
                      }}
                    />
                    {errors.email && <div className='invalid-feedback fw-semibold'>{errors.email}</div>}
                  </div>

                  {/* Password */}
                  <div className='col-12'>
                    <label className='form-label'>
                      Password {!user && <span className='text-danger'>*</span>}
                    </label>
                    <input
                      type='password'
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder={user ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({...formData, password: e.target.value})
                        if (errors.password) setErrors(prev => ({...prev, password: ''}))
                      }}
                    />
                    {errors.password && <div className='invalid-feedback fw-semibold'>{errors.password}</div>}
                  </div>

                  {/* Password Confirmation */}
                  {!user && (
                    <div className='col-12'>
                      <label className='form-label required'>
                        Konfirmasi Password
                      </label>
                      <input
                        type='password'
                        className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
                        placeholder='Masukkan ulang password'
                        value={formData.password_confirmation}
                        onChange={(e) => {
                          setFormData({...formData, password_confirmation: e.target.value})
                          if (errors.password_confirmation) setErrors(prev => ({...prev, password_confirmation: ''}))
                        }}
                      />
                      {errors.password_confirmation && <div className='invalid-feedback fw-semibold'>{errors.password_confirmation}</div>}
                    </div>
                  )}
                </div>
              </div>

              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-danger'
                  onClick={onClose}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type='submit'
                  className='btn btn-inventory-blue'
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' />
                      Menyimpan...
                    </>
                  ) : (
                    <>{user ? 'Simpan' : 'Tambah'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export {UserModal}
