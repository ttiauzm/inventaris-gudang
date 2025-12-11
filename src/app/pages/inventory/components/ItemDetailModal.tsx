import {FC, useState} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'
import {InventoryItem} from '../core/_model'
import {useAuth} from '../../../modules/auth'

interface ItemDetailModalProps {
  item: InventoryItem
  onClose: () => void
  onEdit: (item: InventoryItem) => void
  onTakeItem: (quantity: number) => void
}

const ItemDetailModal: FC<ItemDetailModalProps> = ({item, onClose, onEdit, onTakeItem}) => {
  const {currentUser} = useAuth()
  const isSuperAdmin = currentUser?.roles?.includes(999) // SuperAdmin role ID
  const [takeQuantity, setTakeQuantity] = useState(0)
  const [showTakeForm, setShowTakeForm] = useState(false)

  const handleTake = () => {
    if (takeQuantity > 0 && takeQuantity <= item.quantity) {
      onTakeItem(takeQuantity)
      onClose()
    } else {
      alert('Jumlah tidak valid')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className='modal-backdrop fade show' 
        style={{backgroundColor: 'rgba(0,0,0,0.7)'}}
        onClick={onClose}
      />

      {/* Modal */}
      <div className='modal fade show d-block' tabIndex={-1}>
        <div className='modal-dialog modal-dialog-centered modal-lg'>
          <div className='modal-content'>
            {/* Header */}
            <div className='modal-header'>
              <h3 className='modal-title fw-bold'>{item.name}</h3>
              <button
                type='button'
                className='btn-close'
                onClick={onClose}
              />
            </div>

            {/* Body */}
            <div className='modal-body'>
              <div className='row g-5'>
                {/* Image */}
                <div className='col-md-6'>
                  <img
                    src={item.image || 'https://via.placeholder.com/400'}
                    alt={item.name}
                    className='w-100 rounded'
                    style={{maxHeight: '400px', objectFit: 'cover'}}
                  />
                </div>

                {/* Details */}
                <div className='col-md-6'>
                  <div className='mb-5'>
                    <label className='form-label text-muted fs-7'>Supplier</label>
                    <p className='fw-bold fs-5'>{item.supplier}</p>
                  </div>

                  <div className='mb-5'>
                    <label className='form-label text-muted fs-7'>Deskripsi</label>
                    <p>{item.description || '-'}</p>
                  </div>

                  <div className='row mb-5'>
                    <div className='col-6'>
                      <label className='form-label text-muted fs-7'>Stock Tersedia</label>
                      <p className='fw-bold fs-4 text-primary'>
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    {item.price && (
                      <div className='col-6'>
                        <label className='form-label text-muted fs-7'>Harga</label>
                        <p className='fw-bold fs-4 text-success'>
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className='mb-5'>
                    <label className='form-label text-muted fs-7'>Kategori</label>
                    <p>
                      <span className='badge badge-light-info'>
                        {item.category || 'Uncategorized'}
                      </span>
                    </p>
                  </div>

                  {/* Take Item Form */}
                  {!showTakeForm ? (
                    <button
                      className='btn btn-primary w-100 mb-3'
                      onClick={() => setShowTakeForm(true)}
                    >
                      <KTIcon iconName='basket' className='fs-3' />
                      Ambil Barang
                    </button>
                  ) : (
                    <div className='border border-primary rounded p-4 mb-3'>
                      <h6 className='mb-3'>Ambil barang</h6>
                      <label className='form-label'>Masukkan jumlah</label>
                      <div className='d-flex gap-2 mb-3'>
                        <button
                          className='btn btn-icon btn-light-primary'
                          onClick={() => setTakeQuantity(Math.max(0, takeQuantity - 1))}
                        >
                          <KTIcon iconName='minus' className='fs-3' />
                        </button>
                        <input
                          type='number'
                          className='form-control text-center'
                          value={takeQuantity}
                          onChange={(e) => setTakeQuantity(parseInt(e.target.value) || 0)}
                          max={item.quantity}
                          min={0}
                        />
                        <button
                          className='btn btn-icon btn-light-primary'
                          onClick={() => setTakeQuantity(Math.min(item.quantity, takeQuantity + 1))}
                        >
                          <KTIcon iconName='plus' className='fs-3' />
                        </button>
                      </div>
                      <div className='d-flex gap-2'>
                        <button
                          className='btn btn-primary flex-grow-1'
                          onClick={handleTake}
                        >
                          Oke
                        </button>
                        <button
                          className='btn btn-light'
                          onClick={() => {
                            setShowTakeForm(false)
                            setTakeQuantity(0)
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit Button - Only for SuperAdmin */}
                  {isSuperAdmin && (
                    <button
                      className='btn btn-light-primary w-100'
                      onClick={() => onEdit(item)}
                    >
                      <KTIcon iconName='pencil' className='fs-3' />
                      Edit Barang
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export {ItemDetailModal}