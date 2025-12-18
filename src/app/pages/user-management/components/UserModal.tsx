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
    first_name: '',
    last_name: '',
    phone: '',
    role_ids: [1] as number[], // Default to ADMIN
    permission_ids: [] as number[],
    is_active: true
  })

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        role_ids: user.roles,
        permission_ids: user.permissions,
        is_active: user.is_active
      })
    }
  }, [user])

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(p => p !== permissionId)
        : [...prev.permission_ids, permissionId]
    }))
  }

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

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      alert('Nama lengkap tidak boleh kosong!')
      return
    }

    if (!user && !formData.password.trim()) {
      alert('Password tidak boleh kosong untuk user baru!')
      return
    }
    
    try {
      setLoading(true)
      
      if (user) {
        // Update existing user
        await updateUser(user.id, {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role_ids: formData.role_ids,
          permission_ids: formData.permission_ids,
          is_active: formData.is_active
        })

        // Update password if provided
        if (formData.password.trim()) {
          await resetPassword(user.id, formData.password)
        }

        alert('User berhasil diupdate!')
      } else {
        // Create new user
        const newUserData: CreateUserRequest = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role_ids: formData.role_ids,
          permission_ids: formData.permission_ids,
          is_active: formData.is_active
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
                  {/* Nama */}
                  <div className='col-12'>
                    <label className='form-label required'>Nama</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Jason Tatum'
                      value={`${formData.first_name} ${formData.last_name}`.trim()}
                      onChange={(e) => {
                        const parts = e.target.value.split(' ')
                        setFormData({
                          ...formData, 
                          first_name: parts[0] || '',
                          last_name: parts.slice(1).join(' ') || ''
                        })
                      }}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className='col-12'>
                    <label className='form-label required'>Email</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='0812389018'
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                      placeholder={user ? 'Kosongkan jika tidak ingin mengubah' : 'Jl. in aja dulu'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!user}
                    />
                  </div>

                  {/* Permissions - Simplified */}
                  <div className='col-12'>
                    <div className='d-flex flex-column gap-3'>
                      {['Edit Detail Barang', 'Edit Detail Barang', 'Edit Detail Barang'].map((label, idx) => (
                        <div key={idx} className='d-flex justify-content-between align-items-center'>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id={`perm-${idx}`}
                              checked={formData.permission_ids.includes(idx + 1)}
                              onChange={() => handlePermissionToggle(idx + 1)}
                            />
                            <label className='form-check-label fw-semibold' htmlFor={`perm-${idx}`}>
                              {label}
                            </label>
                          </div>
                          <div className='d-flex gap-5'>
                            <span className='text-muted'>{label}</span>
                            <span className='text-muted'>{label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
