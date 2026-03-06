import {FC} from 'react'

interface SuccessModalProps {
  message: string
  onClose: () => void
}

/**
 * Modal sukses dengan ilustrasi key-success.svg.
 * Digunakan setelah operasi berhasil (tambah, edit, hapus, ambil barang, dll).
 */
export const SuccessModal: FC<SuccessModalProps> = ({message, onClose}) => {
  return (
    <>
      <div
        className='modal-backdrop fade show'
        style={{zIndex: 1060}}
        onClick={onClose}
      />
      <div className='modal fade show d-block' tabIndex={-1} style={{zIndex: 1061}}>
        <div className='modal-dialog modal-dialog-centered' style={{maxWidth: '380px'}}>
          <div className='modal-content' style={{borderRadius: '16px'}}>
            {/* Header - hanya close button */}
            <div className='modal-header border-0 pb-0'>
              <div />
              <button type='button' className='btn-close' onClick={onClose} />
            </div>

            {/* Body */}
            <div className='modal-body text-center px-8 pb-10 pt-2'>
              <img
                src='/media/svg/splash-screens/key-success.svg'
                alt='Success'
                style={{width: '130px', height: '130px', objectFit: 'contain'}}
                className='mb-6'
              />
              <p className='fs-5 fw-semibold text-gray-700 mb-8 px-4'>{message}</p>
              <button
                type='button'
                className='btn btn-primary px-12'
                style={{borderRadius: '8px'}}
                onClick={onClose}
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
