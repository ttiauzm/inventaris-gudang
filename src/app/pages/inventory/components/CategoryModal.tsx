import {FC, useState} from 'react'

interface CategoryModalProps {
  onClose: () => void
  onSave: (category: {name: string, description: string, unit: string}) => void
}

export const CategoryModal: FC<CategoryModalProps> = ({onClose, onSave}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <>
      <div className='modal-backdrop fade show' onClick={onClose} />
      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Tambah Kategori Barang</h5>
              <button type='button' className='btn-close' onClick={onClose} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className='modal-body'>
                <div className='mb-5'>
                  <label className='form-label required'>Nama Kategori</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Kain Sutra Emas'
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                {/* Tambahan Input Unit */}
                <div className='mb-5'>
                  <label className='form-label required'>Satuan (Unit)</label>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Contoh: pcs, meter, kg'
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    required
                  />
                </div>
                <div className='mb-5'>
                  <label className='form-label'>Deskripsi</label>
                  <input
                    type='text'
                    className='form-control'
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
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}