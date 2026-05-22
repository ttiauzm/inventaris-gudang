import {FC, useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {KTIcon} from '../../../_metronic/helpers'
import {InventoryItem} from './core/_model'
import {getInventory, updateInventoryDetails, deleteInventory, takeInventoryItem} from './core/_requests'
import {useAuth} from '../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'
import API from '../../../api'
import {SuccessModal} from '../../components/SuccessModal'
import {InventoryModal} from './components/InventoryModal'
import { ConfirmModal } from '../../components/ConfirmModal'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ItemDetail {
  id: string
  name: string
  category?: string
  unit?: string
  type?: string
  price?: number
  quantity?: number
  supplier?: string
  description?: string
  image?: string
}

interface ChildItem {
  id: string
  description?: string
  quantity: number
  unit?: string
  used_at?: string
  status?: string
}

// ── ItemDetailPage ─────────────────────────────────────────────────────────────
const ItemDetailPage: FC = () => {
  const {id} = useParams<{id: string}>()
  const navigate = useNavigate()
  const {currentUser} = useAuth()
  const isSuperAdmin = checkSuperAdmin(currentUser)

  const [item, setItem] = useState<ItemDetail | null>(null)
  const [childItems, setChildItems] = useState<ChildItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchChild, setSearchChild] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  // Tambah state ini:
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showTakeModal, setShowTakeModal] = useState(false)
  const [showDeleteSection, setShowDeleteSection] = useState(false)

  const pageUrl = `${window.location.origin}/apps/inventory/${id}`

  useEffect(() => {
    if (!id) return
    fetchItem()
    generateQR()
  }, [id])

  const fetchItem = async () => {
    try {
      setLoading(true)
      const data = await getInventory()
      const found = data.find((i: InventoryItem) => String(i.id) === String(id))
      if (found) {
        setItem({
          id: String(found.id),
          name: found.name,
          category: found.category,
          unit: found.unit,
          type: found.category,
          price: found.price,
          quantity: found.quantity,
          supplier: found.supplier,
          description: found.description,
          image: found.image,
        })
      } else {
        console.error('Barang tidak ditemukan di daftar inventory')
      }
      try {
        const childRes = await API.get('/items/history/child')
        const allChildren = childRes.data?.data || []
        const itemChildren = allChildren.filter((child: any) => String(child.parent_item_id) === String(id))
        setChildItems(itemChildren.map((child: any) => ({
          id: child.item_id,
          description: child.item_name,
          quantity: child.quantity,
          unit: child.unit,
          used_at: child.created_at,
          status: child.is_deleted ? 'Terpakai' : 'Tersedia'
        })))
      } catch (err: any) {
        console.error('Failed to fetch child items', err)
        setChildItems([])
      }
    } catch (err) {
      console.error('Failed to fetch item details:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateQR = async () => {
    try {
      const qrResponse = await API.get(`/items/${id}/qrcode`, { responseType: 'blob' })
      if (qrResponse.data) {
        const svgBlob = new Blob([qrResponse.data], { type: 'image/svg+xml' })
        setQrDataUrl(URL.createObjectURL(svgBlob))
      }
    } catch (err) {
      console.error('QR generation failed:', err)
    }
  }

  const handlePrintQR = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Cetak QR - ${item?.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff; }
            .label { text-align: center; padding: 24px; }
            .label img { width: 200px; height: 200px; }
            .label p { margin: 8px 0 0; font-size: 14px; color: #3a3a3a; font-weight: 600; }
            .label small { font-size: 11px; color: #888; }
          </style>
        </head>
        <body>
          <div class="label">
            <img src="${qrDataUrl}" alt="QR Code" />
            <p>${item?.name}</p>
            <small>${pageUrl}</small>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const handleExportQR = (format: 'png' | 'jpg') => {
    try {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 600
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          const padding = 40
          ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2)
          const a = document.createElement('a')
          a.download = `QR-${item?.name || 'Barang'}.${format}`
          a.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 1.0)
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      }
      img.src = qrDataUrl
    } catch (err) {
      console.error('Failed to export image:', err)
    }
  }

  const filteredChildren = childItems.filter(
    (c) =>
      c.description?.toLowerCase().includes(searchChild.toLowerCase()) ||
      c.id.toLowerCase().includes(searchChild.toLowerCase()) ||
      c.status?.toLowerCase().includes(searchChild.toLowerCase())
  )

  const formatPrice = (p?: number) =>
    p != null ? `Rp${p.toLocaleString('id-ID', {minimumFractionDigits: 2})}` : '-'

  const formatDate = (d?: string) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'})
  }

  const StatusBadge: FC<{status?: string}> = ({status}) => {
    const available = status?.toLowerCase() === 'tersedia' || !status
    return (
      <span style={{ fontSize: '12px', fontWeight: 500, color: available ? '#3a3a3a' : '#3a3a3a' }}>
        {status || 'Tersedia'}
      </span>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#B7ADA6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className='spinner-border' style={{ color: '#fff', width: '2.5rem', height: '2.5rem' }} />
      </div>
    )
  }

  if (!item) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#B7ADA6', padding: '24px' }}>
        <p style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>Item tidak ditemukan.</p>
      </div>
    )
  }

  // ── Shared card shell styles ──
  const outerShell: React.CSSProperties = {
    backgroundColor: '#F3EFE6',
    borderRadius: '16px',
    padding: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
  }

  const innerWhite: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '24px 28px',
    width: '100%',
    height: '100%',
  }

  return (
    <div style={{ minHeight: '20vh', backgroundColor: '#B7ADA6', padding: '20px' }}>

      {/* ── Back button ── */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '16px',
          padding: '2px 10px',
          opacity: 0.9,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.9')}
      >
        ←
      </button>

      {/* ── Top row: Info card + QR card ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '16px', marginBottom: '16px' }}
        className='detail-top-grid'
      >

        {/* ── Info card ── */}
        <div style={outerShell}>
          <div style={innerWhite}>

            {/* Image placeholder — shows item image if available */}
            {item.image && (
              <div style={{ width: '100%', height: '72px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', backgroundColor: '#f5f2ee' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            {/* Title */}
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
              {item.name}
            </h2>
            <p style={{ fontSize: '13px', color: '#9e9992', marginBottom: '20px' }}>
              {item.category || '—'}
            </p>

            {/* Info rows */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  { label: 'Unit/Satuan', value: item.unit || '—' },
                  { label: 'Jenis',       value: item.type || '—' },
                  { label: 'Harga',       value: formatPrice(item.price) },
                  { label: 'Kuantitas',   value: item.quantity?.toLocaleString('id-ID') || '—' },
                ].map(({ label, value }) => (
                  <tr key={label}>
                    <td style={{ padding: '7px 0', fontSize: '14px', color: '#5a5a5a', fontWeight: 500, width: '130px', verticalAlign: 'top' }}>
                      {label}
                    </td>
                    <td style={{ padding: '7px 0', fontSize: '14px', color: '#5a5a5a', verticalAlign: 'top', width: '16px' }}>
                      :
                    </td>
                    <td style={{ padding: '7px 0 7px 8px', fontSize: '14px', fontWeight: 600, color: '#1a1a2e', verticalAlign: 'top' }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Edit button — SuperAdmin only */}
            {isSuperAdmin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px', position: 'relative' }}>
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className='btn btn-product'
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 20px', borderRadius: '8px' }}
                >
                  <KTIcon iconName='setting-2' className='fs-5' />
                  Kelola Barang
                </button>

                {showActionMenu && (
                  <>
                    {/* overlay tipis untuk close saat klik luar */}
                    <div
                      onClick={() => setShowActionMenu(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                    />
                    <div style={{
                      position: 'absolute', bottom: '110%', right: 0,
                      backgroundColor: '#fff', borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      border: '1px solid #f0ebe6',
                      padding: '8px', minWidth: '180px', zIndex: 101,
                    }}>
                      <button
                        onClick={() => { setShowActionMenu(false); setShowEditModal(true) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          width: '100%', padding: '10px 14px', border: 'none',
                          backgroundColor: 'transparent', borderRadius: '8px',
                          fontSize: '13px', fontWeight: 600, color: '#3a3a3a',
                          cursor: 'pointer', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f2ee')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <KTIcon iconName='pencil' className='fs-5' />
                        Edit Detail
                      </button>

                      <button
                        onClick={() => { setShowActionMenu(false); setShowTakeModal(true) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          width: '100%', padding: '10px 14px', border: 'none',
                          backgroundColor: 'transparent', borderRadius: '8px',
                          fontSize: '13px', fontWeight: 600, color: '#3a3a3a',
                          cursor: 'pointer', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f2ee')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <KTIcon iconName='minus-circle' className='fs-5' />
                        Potong Stok
                      </button>

                      <div style={{ borderTop: '1px solid #f0ebe6', margin: '4px 0' }} />

                      <button
                        onClick={() => { setShowActionMenu(false); setShowDeleteSection(true) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          width: '100%', padding: '10px 14px', border: 'none',
                          backgroundColor: 'transparent', borderRadius: '8px',
                          fontSize: '13px', fontWeight: 600, color: '#dc3545',
                          cursor: 'pointer', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff5f5')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <KTIcon iconName='trash' className='fs-5' />
                        Hapus Barang
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── QR card ── */}
        <div style={outerShell}>
          <div style={{ ...innerWhite, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px 42px', padding: '24px 20px' }}>

            {/* QR image */}
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt='QR Code'
                style={{ width: '160px', height: '160px', borderRadius: '8px', border: '1px solid #e8e4e0', padding: '6px' }}
              />
            ) : (
              <div style={{ width: '160px', height: '160px', backgroundColor: '#f5f2ee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className='spinner-border spinner-border-sm' style={{ color: '#9e9992' }} />
              </div>
            )}

            {/* Cetak QR dropdown */}
            <div style={{ display: 'flex', width: '100%' }}>
              <div className='dropdown w-100'>
                <button
                  className='btn btn-product dropdown-toggle w-100 d-flex align-items-center justify-content-center gap-2'
                  type='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                  style={{ fontSize: '13px', padding: '10px 16px', borderRadius: '8px' }}
                >
                  <KTIcon iconName='printer' className='fs-4' />
                  Cetak QR
                </button>
                <ul className='dropdown-menu w-100 text-center py-2 shadow-sm' style={{ border: '1px solid #eee', borderRadius: '12px' }}>
                  <li>
                    <button className='dropdown-item py-2 fw-semibold text-dark' onClick={handlePrintQR} style={{ fontSize: '12px' }}>
                      <i className='bi bi-file-earmark-pdf me-2 text-danger'></i>Cetak & PDF
                    </button>
                  </li>
                  <li><hr className='dropdown-divider opacity-25' /></li>
                  <li>
                    <button className='dropdown-item py-2 fw-semibold text-dark' onClick={() => handleExportQR('png')} style={{ fontSize: '12px' }}>
                      <i className='bi bi-image-fill me-2 text-success'></i>Format PNG
                    </button>
                  </li>
                  <li>
                    <button className='dropdown-item py-2 fw-semibold text-dark' onClick={() => handleExportQR('jpg')} style={{ fontSize: '12px' }}>
                      <i className='bi bi-image-fill me-2 text-info'></i>Format JPG/JPEG
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Responsive ── */}
      <style>{`
        @media (max-width: 768px) {
          .detail-top-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Barang Turunan ── */}
      <div style={outerShell}>
        <div style={{ ...innerWhite, padding: '24px 28px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
              Barang Turunan
            </h3>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#b0a89f', pointerEvents: 'none' }}>
                <KTIcon iconName='magnifier' className='fs-5' />
              </div>
              <input
                type='text'
                placeholder='Cari barang turunan...'
                value={searchChild}
                onChange={(e) => setSearchChild(e.target.value)}
                style={{
                  border: '1.5px solid #e0dbd5', borderRadius: '10px',
                  padding: '9px 14px 9px 38px', fontSize: '13px', color: '#3a3a3a',
                  outline: 'none', width: '240px', backgroundColor: '#fafaf9', transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#897870')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e0dbd5')}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  {['ID', 'Deskripsi', 'Kuantitas', 'Tanggal Pakai', 'Status'].map((col, i) => (
                    <th
                      key={col}
                      style={{
                        padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#6c6c6c',
                        textAlign: i === 0 ? 'center' : i >= 2 ? 'center' : 'left',
                        borderBottom: '1px solid #f0ebe6', whiteSpace: 'nowrap',
                        width: col === 'Kuantitas' ? '100px' : 'auto',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredChildren.length > 0 ? (
                  filteredChildren.map((child) => (
                    <tr
                      key={child.id}
                      style={{ borderBottom: '1px solid #f5f2ef' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#fafaf8')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', backgroundColor: '#edeaf7', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#6c6c6c' }}>
                          {child.id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', color: '#3a3a3a' }}>
                        {child.description || '-'}
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#3a3a3a', width: '100px' }}>
                        {child.quantity.toLocaleString('id-ID')} {child.unit || ''}
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: '13px', color: '#3a3a3a' }}>
                        {formatDate(child.used_at)}
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <StatusBadge status={child.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', fontSize: '13px', color: '#b0a89f' }}>
                      {searchChild ? 'Tidak ada barang yang cocok dengan pencarian.' : 'Belum ada barang turunan.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ── Edit Detail Modal ── */}
      {showEditModal && isSuperAdmin && (
        <EditDetailInlineModal
          item={item}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            setItem((prev) => prev ? { ...prev, ...updated } : prev)
            setShowEditModal(false)
          }}
        />
      )}

      {/* ── Potong Stok Modal ── */}
      {showTakeModal && (
        <TakeStockModal
          item={item}
          onClose={() => setShowTakeModal(false)}
          onSuccess={() => {
            setShowTakeModal(false)
            fetchItem()
          }}
        />
      )}

      {/* ── Hapus Barang Modal ── */}
      {showDeleteSection && (
        <DeleteItemModal
          item={item}
          onClose={() => setShowDeleteSection(false)}
          onSuccess={() => navigate(-1)}
        />
      )}

    </div>
  )
}

// ── Edit Detail Inline Modal ──────────────────────────────────────────────────
interface EditDetailInlineModalProps {
  item: ItemDetail
  onClose: () => void
  onSave: (updated: Partial<ItemDetail>) => void
}

const EditDetailInlineModal: FC<EditDetailInlineModalProps> = ({item, onClose, onSave}) => {
  const [form, setForm] = useState({
    name: item.name || '',
    unit: item.unit || '',
    price: String(item.price || ''),
  })
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Nama wajib diisi'
    if (!form.unit.trim()) newErrors.unit = 'Unit wajib diisi'
    if (!String(form.price).trim()) newErrors.price = 'Harga wajib diisi'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setSaving(true)
    try {
      await updateInventoryDetails(item.id, { item_name: form.name, unit: form.unit, price: parseFloat(form.price) })
      setShowSuccess(true)
    } catch (err) {
      console.error('Gagal simpan:', err)
      alert('Gagal menyimpan perubahan. Silakan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (showSuccess) {
    return (
      <SuccessModal
        message='Informasi barang berhasil diubah!'
        onClose={() => {
          setShowSuccess(false)
          onSave({ name: form.name, unit: form.unit, price: parseFloat(form.price) || undefined })
        }}
      />
    )
  }

  const inputRowStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '130px 1fr',
    border: '1px solid #e0dbd5', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px',
  }
  const labelCellStyle: React.CSSProperties = {
    backgroundColor: '#897870', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 14px', fontSize: '13px', fontWeight: 600, textAlign: 'center',
  }
  const inputCellStyle: React.CSSProperties = {
    border: 'none', outline: 'none', padding: '12px 14px',
    fontSize: '13px', color: '#3a3a3a', backgroundColor: '#fff', width: '100%', fontFamily: 'inherit',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 1040 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050, backgroundColor: '#fff', borderRadius: '20px', width: '92%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.20)', padding: '28px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Edit Detail Barang</h3>
            <p style={{ fontSize: '12px', color: '#9e9992', marginTop: '3px', marginBottom: 0 }}>{item.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0a89f', fontSize: '20px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        <div style={inputRowStyle}>
          <div style={labelCellStyle}>Nama</div>
          <input type='text' value={form.name} onChange={(e) => { setForm((f) => ({...f, name: e.target.value})); if (errors.name) setErrors((p) => ({...p, name: ''})) }} style={{...inputCellStyle, borderBottom: errors.name ? '2px solid #dc3545' : 'none'}} placeholder='Nama barang' />
        </div>
        {errors.name && <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px' }}>{errors.name}</p>}

        <div style={inputRowStyle}>
          <div style={labelCellStyle}>Unit</div>
          <input type='text' value={form.unit} onChange={(e) => { setForm((f) => ({...f, unit: e.target.value})); if (errors.unit) setErrors((p) => ({...p, unit: ''})) }} style={{...inputCellStyle, borderBottom: errors.unit ? '2px solid #dc3545' : 'none'}} placeholder='pcs, meter, kg...' />
        </div>
        {errors.unit && <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px' }}>{errors.unit}</p>}

        <div style={{...inputRowStyle, marginBottom: errors.price ? '10px' : '20px'}}>
          <div style={labelCellStyle}>Harga</div>
          <input type='number' value={form.price} onChange={(e) => { setForm((f) => ({...f, price: e.target.value})); if (errors.price) setErrors((p) => ({...p, price: ''})) }} style={{...inputCellStyle, borderBottom: errors.price ? '2px solid #dc3545' : 'none'}} placeholder='0' />
        </div>
        {errors.price && <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '20px', paddingLeft: '4px' }}>{errors.price}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e0dbd5', backgroundColor: '#fff', color: '#6c6c6c', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSave} disabled={saving} className='btn btn-product' style={{ flex: 2, padding: '12px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
            {saving ? <><span className='spinner-border spinner-border-sm' /> Menyimpan...</> : <><KTIcon iconName='save-2' className='fs-5' /> Simpan Perubahan</>}
          </button>
        </div>

      </div>
    </>
  )
}

// ── Take Stock Modal ──────────────────────────────────────────────────────────
interface TakeStockModalProps {
  item: ItemDetail
  onClose: () => void
  onSuccess: () => void
}

const TakeStockModal: FC<TakeStockModalProps> = ({item, onClose, onSuccess}) => {
  const {currentUser} = useAuth()
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}
    const qty = parseInt(quantity, 10)
    if (!quantity.trim() || isNaN(qty) || qty <= 0) newErrors.quantity = 'Jumlah wajib diisi dan harus lebih dari 0'
    else if (qty > (item.quantity || 0)) newErrors.quantity = `Jumlah tidak boleh melebihi stok (${item.quantity})`
    if (!description.trim()) newErrors.description = 'Deskripsi wajib diisi'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setSaving(true)
    try {
      await takeInventoryItem(
        item.id,
        qty,
        description || `Pengambilan barang oleh ${currentUser?.fullname || currentUser?.username}`,
        undefined
      )
      setShowSuccess(true)
    } catch (err) {
      console.error('Gagal potong stok:', err)
      setErrors({quantity: 'Gagal memotong stok. Coba lagi.'})
    } finally {
      setSaving(false)
    }
  }

  if (showSuccess) {
    return (
      <SuccessModal
        message={`Berhasil memotong ${parseInt(quantity, 10)} ${item.unit || ''} dari ${item.name}`}
        onClose={onSuccess}
      />
    )
  }

  const inputRowStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '130px 1fr',
    border: '1px solid #e0dbd5', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px',
  }
  const labelCellStyle: React.CSSProperties = {
    backgroundColor: '#897870', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 14px', fontSize: '13px', fontWeight: 600, textAlign: 'center',
  }
  const inputCellStyle: React.CSSProperties = {
    border: 'none', outline: 'none', padding: '12px 14px',
    fontSize: '13px', color: '#3a3a3a', backgroundColor: '#fff', width: '100%', fontFamily: 'inherit',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 1040 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050, backgroundColor: '#fff', borderRadius: '20px', width: '92%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.20)', padding: '28px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Potong Stok</h3>
            <p style={{ fontSize: '12px', color: '#9e9992', marginTop: '3px', marginBottom: 0 }}>{item.name} — stok saat ini: {item.quantity} {item.unit}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0a89f', fontSize: '20px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        <div style={inputRowStyle}>
          <div style={labelCellStyle}>Jumlah</div>
          <input
            type='number' min={1} max={item.quantity || 0}
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); if (errors.quantity) setErrors(p => ({...p, quantity: ''})) }}
            style={{...inputCellStyle, borderBottom: errors.quantity ? '2px solid #dc3545' : 'none'}}
            placeholder='0'
          />
        </div>
        {errors.quantity && <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px' }}>{errors.quantity}</p>}

        <div style={{...inputRowStyle, alignItems: 'stretch'}}>
          <div style={{...labelCellStyle, lineHeight: 1.4}}>Deskripsi<br/>Pengambilan</div>
          <textarea
            rows={3} value={description}
            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p => ({...p, description: ''})) }}
            style={{...inputCellStyle, resize: 'vertical', borderLeft: errors.description ? '2px solid #dc3545' : 'none'}}
            placeholder='Deskripsi pengambilan barang...'
          />
        </div>
        {errors.description && <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px' }}>{errors.description}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e0dbd5', backgroundColor: '#fff', color: '#6c6c6c', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
          <button onClick={handleSave} disabled={saving} className='btn btn-product' style={{ flex: 2, padding: '12px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
            {saving ? <><span className='spinner-border spinner-border-sm' /> Memproses...</> : <><KTIcon iconName='minus-circle' className='fs-5' /> Potong Stok</>}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Delete Item Modal ─────────────────────────────────────────────────────────
interface DeleteItemModalProps {
  item: ItemDetail
  onClose: () => void
  onSuccess: () => void
}

const DeleteItemModal: FC<DeleteItemModalProps> = ({item, onClose, onSuccess}) => {
  const [confirmed, setConfirmed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleDelete = () => {
    if (!confirmed) return
    setShowConfirm(true)
  }

  const confirmDeleteAction = async () => {
    setShowConfirm(false)
    setSaving(true)
    try {
      await deleteInventory(item.id)
      setShowSuccess(true)
    } catch (err) {
      console.error('Gagal hapus:', err)
      alert('Gagal menghapus barang. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (showSuccess) {
    return <SuccessModal message='Barang berhasil dihapus!' onClose={onSuccess} />
  }

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          message={`Apakah Anda yakin ingin menghapus "${item.name}"? Data yang dihapus tidak dapat dikembalikan.`}
          confirmText='Hapus Barang'
          cancelText='Batal'
          confirmClass='btn-danger'
          onConfirm={confirmDeleteAction}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 1040 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050, backgroundColor: '#fff', borderRadius: '20px', width: '92%', maxWidth: '460px', boxShadow: '0 32px 80px rgba(0,0,0,0.20)', padding: '28px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#dc3545', margin: 0 }}>Hapus Barang</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b0a89f', fontSize: '20px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        <p style={{ fontSize: '14px', color: '#5a5a5a', marginBottom: '20px' }}>
          Apakah kamu yakin ingin menghapus <strong>{item.name}</strong>? Data yang dihapus tidak dapat dikembalikan.
        </p>

        <div style={{ backgroundColor: '#fff5f5', border: '1px solid #f5c6cb', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#842029' }}>
            <input
              type='checkbox'
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Saya memahami bahwa tindakan ini tidak dapat dibatalkan
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e0dbd5', backgroundColor: '#fff', color: '#6c6c6c', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || saving}
            style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: confirmed ? '#dc3545' : '#e0a0a8', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: confirmed ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            {saving ? <><span className='spinner-border spinner-border-sm' /> Menghapus...</> : <><KTIcon iconName='trash' className='fs-5' /> Hapus Barang</>}
          </button>
        </div>
      </div>
    </>
  )
}

export {ItemDetailPage}