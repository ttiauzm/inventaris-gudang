import {FC, useState} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'
import {InventoryItem} from '../core/_model'
import {useAuth} from '../../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../../utils/permissionHelper'
import {SuccessModal} from '../../../components/SuccessModal'
import {useNavigate} from 'react-router-dom'
import {FaultyItemModal} from './FaultyItemModal'  // ← tambahan

interface ItemDetailModalProps {
  item: InventoryItem
  onClose: () => void
  onEdit: (item: InventoryItem) => void
  onTakeItem: (quantity: number, description: string) => Promise<void>
}

const ItemDetailModal: FC<ItemDetailModalProps> = ({item, onClose, onEdit, onTakeItem}) => {
  const {currentUser} = useAuth()
  const isSuperAdmin = checkSuperAdmin(currentUser)
  const navigate = useNavigate()

  const [view, setView] = useState<'detail' | 'options' | 'pakai'>('detail')

  // Pakai form state
  const [jumlah, setJumlah] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [takeLoading, setTakeLoading] = useState(false)
  const [takeStatus, setTakeStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [takeErrorMsg, setTakeErrorMsg] = useState('')

  // ← tambahan: state untuk FaultyItemModal
  const [showFaultyModal, setShowFaultyModal] = useState(false)

  const defaultImage = '/media/svg/material/material-dummy.svg'

  const handlePakaiSubmit = async () => {
    const newErrors: Record<string, string> = {}
    const qty = parseInt(String(jumlah).trim(), 10)

    if (!jumlah.trim() || isNaN(qty) || qty <= 0) {
      newErrors.jumlah = 'Jumlah wajib diisi dan harus lebih dari 0'
    } else if (qty > item.quantity) {
      newErrors.jumlah = `Jumlah tidak boleh melebihi stok tersedia (${item.quantity})`
    }
    if (!deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi pengambilan wajib diisi'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setTakeLoading(true)
    setTakeStatus('idle')
    setTakeErrorMsg('')

    try {
      await onTakeItem(qty, deskripsi)
      setTakeStatus('success')
    } catch (err: any) {
      setTakeStatus('error')
      setTakeErrorMsg(
        err?.response?.data?.message || err?.message || 'Gagal mengambil barang. Coba lagi.'
      )
    } finally {
      setTakeLoading(false)
    }
  }

  const handleGoToDetail = () => {
    onClose()
    navigate(`/apps/inventory/${item.id}`)
  }

  // Shared styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.50)',
    backdropFilter: 'blur(3px)',
    zIndex: 1040,
  }

  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1050,
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    width: '92%',
    maxWidth: '500px',
    maxHeight: '92vh',
    overflowY: 'auto',
    boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
    padding: '28px 28px 24px',
  }

  const closeBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#b0a89f',
    fontSize: '22px',
    lineHeight: 1,
    padding: '2px 6px',
    borderRadius: '6px',
    marginTop: '-4px',
    transition: 'color 0.15s',
  }

  const inputRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '130px 1fr',
    border: '1px solid #e0dbd5',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '10px',
  }

  const labelCellStyle: React.CSSProperties = {
    backgroundColor: '#897870',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.4,
  }

  const inputCellStyle: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#3a3a3a',
    backgroundColor: '#fff',
    width: '100%',
    fontFamily: 'inherit',
  }

  const primaryBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#5b8de8',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.18s',
    marginBottom: '10px',
  }

  const warmBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#897870',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.18s',
  }


  if (takeStatus === 'success') {
    return (
      <SuccessModal
        message={`Berhasil mengambil ${parseInt(jumlah, 10)} ${item.unit} dari ${item.name}`}
        onClose={onClose}
      />
    )
  }

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={onClose} />

      {/* Card */}
      <div style={cardStyle}>
        {/* ── Header ── */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px'}}>
          <div>
            <h2 style={{fontSize: '19px', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.2}}>
              {view === 'pakai' ? `Pakai ${item.name}` : item.name}
            </h2>
            {item.supplier && (
              <p style={{fontSize: '13px', color: '#9e9992', marginTop: '5px', marginBottom: 0}}>
                {item.supplier}
              </p>
            )}
          </div>

          {/* Icon actions di kanan header */}
          <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginTop: '-2px'}}>

            {/* Lapor Kerusakan — icon only */}
            <button
              onClick={() => setShowFaultyModal(true)}
              aria-label='Lapor Kerusakan'
              title='Lapor Kerusakan'
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff0f0')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent')}
            >
              <img
                src='/media/icons/custom/delova_information-warn.svg'
                alt='lapor rusak'
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain',
                  filter: 'invert(27%) sepia(85%) saturate(2000%) hue-rotate(335deg) brightness(90%)',
                }}
                onError={(e) => {
                  // fallback ke KTIcon jika svg tidak ditemukan
                  const btn = (e.currentTarget as HTMLImageElement).parentElement
                  if (btn) btn.innerHTML = '<span style="color:#dc3545;font-size:18px;font-weight:700;line-height:1">⚠</span>'
                }}
              />
            </button>

            {/* Close (×) */}
            <button
              style={closeBtnStyle}
              onClick={onClose}
              aria-label='Tutup'
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#5a4038')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#b0a89f')}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Foto Barang ── */}
        <div style={{width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f5f2ee', marginBottom: '20px'}}>
          <img
            src={item.image || defaultImage}
            alt={item.name}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
        </div>

        {/* ── VIEW: Detail Barang ── */}
        {view === 'detail' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>

            {/* Detail Barang */}
            <button
              style={primaryBtnStyle}
              onClick={handleGoToDetail}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            >
              Detail Barang
            </button>

            {/* Pakai Barang */}
            <button
              style={warmBtnStyle}
              onClick={() => setView('pakai')}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            >
              Pakai Barang
            </button>



          </div>
        )}

        {/* ── VIEW: Pakai Barang (form) ── */}
        {view === 'pakai' && (
          <>
            {/* Row: Jumlah */}
            <div style={inputRowStyle}>
              <div style={labelCellStyle}>Jumlah</div>
              <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                <input
                  type='number'
                  min={1}
                  max={item.quantity}
                  placeholder='Masukkan Jumlah'
                  value={jumlah}
                  onChange={(e) => {
                    setJumlah(e.target.value)
                    if (errors.jumlah) setErrors((p) => ({...p, jumlah: ''}))
                  }}
                  style={{...inputCellStyle, borderBottom: errors.jumlah ? '2px solid #dc3545' : 'none'}}
                />
              </div>
            </div>
            {errors.jumlah && (
              <p style={{color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px'}}>
                {errors.jumlah}
              </p>
            )}

            {/* Row: Deskripsi */}
            <div style={{...inputRowStyle, alignItems: 'stretch'}}>
              <div style={labelCellStyle}>
                Deskripsi
                <br />
                Pengambilan
              </div>
              <textarea
                rows={3}
                placeholder='Masukkan Deskripsi Pengambilan'
                value={deskripsi}
                onChange={(e) => {
                  setDeskripsi(e.target.value)
                  if (errors.deskripsi) setErrors((p) => ({...p, deskripsi: ''}))
                }}
                style={{...inputCellStyle, resize: 'vertical', borderLeft: errors.deskripsi ? '2px solid #dc3545' : 'none'}}
              />
            </div>
            {errors.deskripsi && (
              <p style={{color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px'}}>
                {errors.deskripsi}
              </p>
            )}

            {/* Error banner */}
            {takeStatus === 'error' && (
              <div style={{backgroundColor: '#fff5f5', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#842029'}}>
                <KTIcon iconName='cross-circle' className='fs-5' />
                {takeErrorMsg}
              </div>
            )}

            {/* Ambil Barang button */}
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '4px'}}>
              <button
                onClick={handlePakaiSubmit}
                disabled={takeLoading}
                style={{...warmBtnStyle, width: 'auto', padding: '12px 36px', display: 'flex', alignItems: 'center', gap: '8px', opacity: takeLoading ? 0.65 : 1, cursor: takeLoading ? 'not-allowed' : 'pointer'}}
              >
                {takeLoading ? (
                  <><span className='spinner-border spinner-border-sm' /> Memproses...</>
                ) : (
                  <><KTIcon iconName='save-2' className='fs-5' /> Ambil Barang</>
                )}
              </button>
            </div>

            {/* Back link */}
            <button
              onClick={() => { setView('detail'); setErrors({}); setTakeStatus('idle') }}
              style={{background: 'none', border: 'none', color: '#9e9992', fontSize: '12px', cursor: 'pointer', marginTop: '10px', display: 'block', width: '100%', textAlign: 'center'}}
            >
              ← Kembali ke detail
            </button>
          </>
        )}
      </div>

      {/* ── FaultyItemModal — z-index di atas ItemDetailModal ── */}
      {showFaultyModal && (
        <FaultyItemModal
          item={{
            id:       String(item.id),
            name:     item.name,
            quantity: item.quantity,
            unit:     item.unit,
          }}
          onClose={() => setShowFaultyModal(false)}
          onSuccess={() => {
            setShowFaultyModal(false)
            onClose() // tutup ItemDetailModal setelah berhasil lapor
          }}
        />
      )}
    </>
  )
}

export {ItemDetailModal}