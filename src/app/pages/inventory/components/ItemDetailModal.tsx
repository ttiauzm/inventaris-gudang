import {FC, useState} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'
import { InventoryItem } from '../core/_model'
import {useAuth} from '../../../modules/auth'

interface ItemDetailModalProps {
  item: InventoryItem
  onClose: () => void
  onEdit: (item: InventoryItem) => void
  onTakeItem: (quantity: number, description: string) => void
}

const ItemDetailModal: FC<ItemDetailModalProps> = ({item, onClose, onEdit, onTakeItem}) => {
  const {currentUser} = useAuth()
  const isSuperAdmin = currentUser?.roles?.includes(999)
  const [takeQuantity, setTakeQuantity] = useState(0)
  const [takeDescription, setTakeDescription] = useState('')
  const [showTakeForm, setShowTakeForm] = useState(false)

  const handleTake = async () => {
    if (takeQuantity > 0 && takeQuantity <= item.quantity) {
      try {
        onTakeItem(takeQuantity, takeDescription)
        alert(`Berhasil mengambil ${takeQuantity} ${item.unit} ${item.name}`)
        onClose()
      } catch (error) {
        alert('Gagal mengambil barang')
      }
    } else {
      alert('Jumlah tidak valid')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className='modal-backdrop fade show' 
        style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
        onClick={onClose}
      />

      {/* Modal */}
      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered' style={{maxWidth: '1200px'}}>
          <div className='modal-content' style={{borderRadius: '12px'}}>
            {/* Header */}
            <div className='modal-header border-0 pb-0'>
              <h2 className='modal-title fw-bold'>{item.name}</h2>
              <button
                type='button'
                className='btn-close'
                onClick={onClose}
              />
            </div>

            {/* Body */}
            <div className='modal-body pt-3'>
              {!showTakeForm ? (
                <div className='row g-5'>
                  {/* Left Side - Image */}
                  <div className='col-md-6'>
                    <img
                      src={item.image || 'https://via.placeholder.com/600x800'}
                      alt={item.name}
                      className='w-100 rounded'
                      style={{
                        height: '600px',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                  </div>

                  {/* Right Side - Details */}
                  <div className='col-md-6'>
                    {/* Supplier */}
                    <div className='mb-6'>
                      <label className='text-muted fs-7 mb-2'>Supplier</label>
                      <h4 className='fw-bold mb-0'>{item.supplier}</h4>
                    </div>

                    {/* Deskripsi */}
                    <div className='mb-6'>
                      <label className='text-muted fs-7 mb-2'>Deskripsi</label>
                      <p className='mb-0'>{item.description || '-'}</p>
                    </div>

                    {/* Stock & Harga */}
                    <div className='row mb-6'>
                      <div className='col-6'>
                        <label className='text-muted fs-7 mb-2'>Stock Tersedia</label>
                        <h3 className='fw-bold mb-0'>{item.quantity} {item.unit}</h3>
                      </div>
                      {item.price && (
                        <div className='col-6'>
                          <label className='text-muted fs-7 mb-2'>Harga</label>
                          <h3 className='fw-bold text-success mb-0'>
                            Rp {item.price.toLocaleString('id-ID')}
                          </h3>
                        </div>
                      )}
                    </div>

                    {/* Kategori */}
                    <div className='mb-8'>
                      <label className='text-muted fs-7 mb-2'>Kategori</label>
                      <div>
                        <span 
                          className='badge px-4 py-2'
                          style={{
                            backgroundColor: '#E8E3FF',
                            color: '#7239EA',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}
                        >
                          {item.category || 'Uncategorized'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='d-flex flex-column gap-3'>
                      <button
                        className='btn btn-lg w-100'
                        style={{
                          backgroundColor: '#8B7B6E',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '14px'
                        }}
                        onClick={() => setShowTakeForm(true)}
                      >
                        Ambil barang
                      </button>

                      {isSuperAdmin && (
                        <button
                          className='btn btn-lg btn-light w-100'
                          style={{
                            borderRadius: '8px',
                            padding: '14px'
                          }}
                          onClick={() => onEdit(item)}
                        >
                          Edit Barang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Take Form */
                <div className='row g-5'>
                  {/* Left Side - Image (smaller) */}
                  <div className='col-md-5'>
                    <img
                      src={item.image || 'https://via.placeholder.com/600x800'}
                      alt={item.name}
                      className='w-100 rounded'
                      style={{
                        height: '500px',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                  </div>

                  {/* Right Side - Form */}
                  <div className='col-md-7'>
                    <h3 className='fw-bold mb-6'>Ambil barang</h3>

                    {/* Masukkan jumlah */}
                    <div className='mb-6'>
                      <label className='form-label fw-semibold mb-3'>
                        Masukkan jumlah:
                      </label>
                      <div className='d-flex align-items-center gap-3'>
                        <button
                          className='btn btn-icon btn-light-primary'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px'
                          }}
                          onClick={() => setTakeQuantity(Math.max(0, takeQuantity - 1))}
                        >
                          <KTIcon iconName='minus' className='fs-2' />
                        </button>
                        
                        <input
                          type='number'
                          className='form-control form-control-lg text-center'
                          style={{
                            height: '48px',
                            borderRadius: '8px',
                            fontSize: '1.2rem',
                            fontWeight: '600'
                          }}
                          value={takeQuantity}
                          onChange={(e) => setTakeQuantity(parseInt(e.target.value) || 0)}
                          max={item.quantity}
                          min={0}
                        />
                        
                        <button
                          className='btn btn-icon btn-light-primary'
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px'
                          }}
                          onClick={() => setTakeQuantity(Math.min(item.quantity, takeQuantity + 1))}
                        >
                          <KTIcon iconName='plus' className='fs-2' />
                        </button>
                      </div>
                    </div>

                    {/* Masukkan deskripsi */}
                    <div className='mb-8'>
                      <label className='form-label fw-semibold mb-3'>
                        Masukkan deskripsi:
                      </label>
                      <textarea
                        className='form-control form-control-lg'
                        rows={4}
                        placeholder='Masukkan deskripsi pengambilan barang...'
                        value={takeDescription}
                        onChange={(e) => setTakeDescription(e.target.value)}
                        style={{
                          borderRadius: '8px',
                          resize: 'none'
                        }}
                      />
                    </div>

                    {/* Buttons */}
                    <div className='d-flex gap-3'>
                      <button
                        className='btn btn-lg flex-grow-1'
                        style={{
                          backgroundColor: '#5C8AE6',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '14px'
                        }}
                        onClick={handleTake}
                        disabled={takeQuantity === 0 || takeDescription.trim() === ''}
                      >
                        Oke
                      </button>
                      <button
                        className='btn btn-lg btn-light'
                        style={{
                          borderRadius: '8px',
                          padding: '14px',
                          minWidth: '120px'
                        }}
                        onClick={() => {
                          setShowTakeForm(false)
                          setTakeQuantity(0)
                          setTakeDescription('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export {ItemDetailModal}