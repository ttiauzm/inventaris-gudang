import {FC} from 'react'

interface ConfirmModalProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  /** Kelas Bootstrap untuk tombol konfirmasi, default 'btn-danger' */
  confirmClass?: string
}

/**
 * Modal konfirmasi dengan ilustrasi key-success.svg.
 * Digunakan sebelum aksi penting: logout, hapus data, dll.
 */
export const ConfirmModal: FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ya',
  cancelText = 'Batal',
  confirmClass = 'btn-danger',
}) => {
  return (
    <>
      <div
        className='modal-backdrop fade show'
        style={{zIndex: 1060}}
        onClick={onCancel}
      />
      <div className='modal fade show d-block' tabIndex={-1} style={{zIndex: 1061}}>
        <div className='modal-dialog modal-dialog-centered' style={{maxWidth: '380px'}}>
          <div className='modal-content' style={{borderRadius: '16px'}}>
            {/* Header - hanya close button */}
            <div className='modal-header border-0 pb-0'>
              <div />
              <button type='button' className='btn-close' onClick={onCancel} />
            </div>

            {/* Body */}
            <div className='modal-body text-center px-8 pb-10 pt-2'>
              <img
                src='/media/svg/splash-screens/key-success.svg'
                alt='Konfirmasi'
                style={{width: '130px', height: '130px', objectFit: 'contain'}}
                className='mb-6'
              />
              <p className='fs-5 fw-semibold text-gray-700 mb-8 px-4'>{message}</p>
              <div className='d-flex justify-content-center gap-4'>
                <button
                  type='button'
                  className='btn btn-primary px-10'
                  style={{borderRadius: '8px'}}
                  onClick={onCancel}
                >
                  {cancelText}
                </button>
                <button
                  type='button'
                  className={`btn ${confirmClass} px-10`}
                  style={{borderRadius: '8px'}}
                  onClick={onConfirm}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
