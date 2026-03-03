import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'
import {User, CreateUserRequest, ROLE_OPTIONS, PERMISSION_GROUPS, PERMISSION_LABELS} from '../core/_models'
import {createUser, updateUser, resetPassword} from '../core/_requests'

interface UserModalProps {
  user: User | null
  onClose: () => void
  onSave: () => void
}

const UserModal: FC<UserModalProps> = ({user, onClose, onSave}) => {
  const [loading, setLoading] = useState(false)
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
    
    // Validation
    if (!formData.username.trim()) {
      alert('Username tidak boleh kosong!')
      return
    }

    if (!formData.email.trim()) {
      alert('Email tidak boleh kosong!')
      return
    }

    if (!user && !formData.password.trim()) {
      alert('Password tidak boleh kosong untuk user baru!')
      return
    }

    if (!user && formData.password !== formData.password_confirmation) {
      alert('Password dan konfirmasi password tidak cocok!')
      return
    }
    
    try {
      setLoading(true)
      
      if (user) {
        // Update existing user
        await updateUser(user.id, {
          username: formData.username,
          email: formData.email,
          password: formData.password || undefined
        })

        alert('User berhasil diupdate!')
      } else {
        // Create new user
        const newUserData: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        }

        await createUser(newUserData)
        alert('User berhasil ditambahkan!')
      }
      
      onSave()
    } catch (error: any) {
      console.error('Error saving user:', error)
      alert(error.message || 'Gagal menyimpan data user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
                      className='form-control'
                      placeholder='username'
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className='col-12'>
                    <label className='form-label required'>Email</label>
                    <input
                      type='email'
                      className='form-control'
                      placeholder='email@example.com'
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className='col-12'>
                    <label className='form-label'>
                      Password {!user && <span className='text-danger'>*</span>}
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      placeholder={user ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!user}
                    />
                  </div>

                  {/* Password Confirmation */}
                  {!user && (
                    <div className='col-12'>
                      <label className='form-label required'>
                        Konfirmasi Password
                      </label>
                      <input
                        type='password'
                        className='form-control'
                        placeholder='Masukkan ulang password'
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-light'
                  onClick={onClose}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type='submit'
                  className='btn btn-primary'
                  style={{backgroundColor: '#007bff', borderColor: '#007bff'}}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' />
                      Menyimpan...
                    </>
                  ) : (
                    <>Tambah</>
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
