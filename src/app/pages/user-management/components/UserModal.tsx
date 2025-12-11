import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'

interface Admin {
  id: number
  name: string
  email: string
  role: string
  password?: string
  permissions?: string[]
}

interface UserModalProps {
  admin: Admin | null
  onClose: () => void
  onSave: () => void
}

const UserModal: FC<UserModalProps> = ({admin, onClose, onSave}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    permissions: [] as string[]
  })

  const availablePermissions = [
    {id: 'inventory.read', label: 'Lihat Inventory'},
    {id: 'inventory.create', label: 'Tambah Barang'},
    {id: 'inventory.update', label: 'Edit Barang'},
    {id: 'inventory.delete', label: 'Hapus Barang'},
    {id: 'history.read', label: 'Lihat History'},
    {id: 'supplier.read', label: 'Lihat Supplier'},
    {id: 'supplier.manage', label: 'Kelola Supplier'},
    {id: 'user.manage', label: 'Kelola Admin'},
    {id: 'logs.read', label: 'Lihat Log System'},
  ]

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role,
        permissions: admin.permissions || []
      })
    }
  }, [admin])

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      // API call here
      // if (admin) {
      //   await updateAdmin(admin.id, formData)
      // } else {
      //   await createAdmin(formData)
      // }
      
      console.log('Saving admin:', formData)
      
      setTimeout(() => {
        onSave()
      }, 1000)
    } catch (error) {
      console.error('Error saving admin:', error)
      alert('Gagal menyimpan data admin')
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
                {admin ? 'Edit Admin' : 'Tambah Admin'}
              </h5>
              <button type='button' className='btn-close' onClick={onClose} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                <div className='row g-5'>
                  {/* Nama */}
                  <div className='col-12'>
                    <label className='form-label required'>Nama</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Jason Tatum'
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className='col-md-6'>
                    <label className='form-label required'>Email</label>
                    <input
                      type='email'
                      className='form-control'
                      placeholder='0812389018'
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className='col-md-6'>
                    <label className='form-label'>
                      Password {!admin && <span className='text-danger'>*</span>}
                    </label>
                    <input
                      type='password'
                      className='form-control'
                      placeholder={admin ? 'Kosongkan jika tidak ingin mengubah' : 'Jl. in aja dulu'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!admin}
                    />
                  </div>

                  {/* Role */}
                  <div className='col-12'>
                    <label className='form-label required'>Role</label>
                    <select
                      className='form-select'
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value='Admin'>Admin</option>
                      <option value='SuperAdmin'>SuperAdmin</option>
                    </select>
                  </div>

                  {/* Permissions */}
                  <div className='col-12'>
                    <label className='form-label mb-3'>Permissions</label>
                    <div className='row g-3'>
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className='col-md-4'>
                          <div className='form-check'>
                            <input
                              className='form-check-input'
                              type='checkbox'
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                            />
                            <label className='form-check-label' htmlFor={permission.id}>
                              {permission.label}
                            </label>
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
                  style={{backgroundColor: '#5C8AE6'}}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <KTIcon iconName='check' className='fs-3' />
                      Tambah
                    </>
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