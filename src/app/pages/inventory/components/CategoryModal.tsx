import {FC, useState, useEffect} from 'react'

interface CategoryModalProps {
  initialData?: {name: string, description: string, unit: string} | null
  onClose: () => void
  onSave: (category: {name: string, description: string, unit: string}) => void
}

export const CategoryModal: FC<CategoryModalProps> = ({initialData, onClose, onSave}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: ''
  })
  
  const [errorMsg, setErrorMsg] = useState('')

  // Efek ini akan mengisi form otomatis kalau sedang mode Edit
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi di dalam modal sebelum dikirim ke Parent
    if (!formData.name.trim()) {
      setErrorMsg('Nama kategori tidak boleh kosong!')
      return
    }
    if (!formData.unit.trim()) {
      setErrorMsg('Satuan (Unit) tidak boleh kosong!')
      return
    }
    
    setErrorMsg('')
    onSave(formData) // Mengirim data yang sudah diketik ke MasterDataPage
  }

  return (
    <>
      <div className='modal-backdrop fade show' onClick={onClose} />
      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>
                {initialData ? 'Edit Kategori Barang' : 'Tambah Kategori Barang'}
              </h5>
              <button type='button' className='btn-close' onClick={onClose} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                
                {/* Menampilkan pesan error jika ada yang kosong */}
                {errorMsg && (
                  <div className='alert alert-danger py-3 mb-4'>{errorMsg}</div>
                )}

                <div className='mb-5'>
                  <label className='form-label required'>Nama Kategori</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Contoh: Kain, Aksesoris'
                    value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrorMsg('') }}
                  />
                </div>
                
                <div className='mb-5'>
                  <label className='form-label required'>Satuan (Unit)</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Contoh: pcs, meter, kilogram'
                    value={formData.unit}
                    onChange={(e) => { setFormData({...formData, unit: e.target.value}); setErrorMsg('') }}
                  />
                </div>
                
                <div className='mb-5'>
                  <label className='form-label'>Deskripsi</label>
                  <textarea
                    className='form-control'
                    rows={3}
                    placeholder='Deskripsi kategori (Opsional)'
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-light' onClick={onClose}>
                  Batal
                </button>
                <button type='submit' className='btn btn-primary' style={{backgroundColor: '#5C8AE6'}}>
                  {initialData ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}