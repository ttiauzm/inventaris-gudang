import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../_metronic/helpers'
import {FaultyItemCard, FaultyReport} from './FaultyItemCard'
import API from '../../../api'
import EmptyState404 from '../../components/EmptyState404'
import {useAuth} from '../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const FaultyListPage: FC = () => {
  const {currentUser} = useAuth()
  const isSuperAdmin = checkSuperAdmin(currentUser)

  const [reports, setReports]         = useState<FaultyReport[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchFaultyReports = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await API.get('/items/history/faulty')
      const raw: any[] = res.data?.data || res.data || []

      const normalised: FaultyReport[] = raw.map((r: any) => ({
        id:          r.transaction_id   ?? r.id              ?? String(Math.random()),
        item_id:     r.item_id          ?? r.items?.item_id  ?? '',
        item_name:   r.items?.item_name ?? r.item_name       ?? r.name ?? '—',
        quantity:    r.quantity         ?? r.faulty_quantity ?? 0,
        unit:        r.unit             ?? r.items?.unit     ?? '',
        description: r.description      ?? '',
        photo_url:   r.image_url        // sudah absolute (dari controller ->map())
                     ?? (r.image_proof
                          ? (r.image_proof.startsWith('http')
                              ? r.image_proof
                              : `${import.meta.env.VITE_APP_API_URL?.replace('/api', '') ?? ''}/storage/${r.image_proof}`)
                          : undefined),
        reported_by: r.user?.fullname   ?? r.user?.username  ?? r.reported_by ?? r.reporter_name ?? '—',
        reported_at: r.transaction_date ?? r.reported_at     ?? r.created_at  ?? new Date().toISOString(),
        status:      r.status           ?? undefined,
      }))

      setReports(normalised)
    } catch (err: any) {
      console.error('Failed to fetch faulty reports:', err)
      setError(err?.response?.data?.message || 'Gagal memuat data laporan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFaultyReports() }, [])
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  // ── Filter & paginate ─────────────────────────────────────────────────────
  const filtered = reports.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      r.item_name.toLowerCase().includes(q) ||
      r.reported_by.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // ── Export — SuperAdmin only ───────────────────────────────────────────────
  const exportToExcel = () => {
    const rows = filtered.map((r) => ({
      'Nama Barang':  r.item_name,
      'Jumlah Rusak': r.quantity,
      'Unit':         r.unit || '',
      'Deskripsi':    r.description,
      'Dilaporkan':   r.reported_by,
      'Tanggal':      r.reported_at,
    }))
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Rusak')
    XLSX.writeFile(wb, 'laporan_barang_rusak.xlsx')
    setShowExportMenu(false)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Laporan Barang Rusak', 14, 16)
    autoTable(doc, {
      startY: 22,
      head: [['Nama Barang', 'Jumlah', 'Unit', 'Deskripsi', 'Dilaporkan Oleh', 'Tanggal']],
      body: filtered.map((r) => [
        r.item_name,
        String(r.quantity),
        r.unit || '',
        r.description,
        r.reported_by,
        r.reported_at,
      ]),
      styles: {fontSize: 8},
      headStyles: {fillColor: [137, 120, 112]},
    })
    doc.save('laporan_barang_rusak.pdf')
    setShowExportMenu(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        borderRadius: '9px',
        margin: '10px',
        padding: '10px',
        backgroundColor: '#B7ADA6',
        minHeight: 'calc(5vh - 40px)',
      }}
    >
      <div className='card mb-5' style={{backgroundColor: '#FFFFFF'}}>

        {/* ── Header ── */}
        <div className='card-header border-0 pt-6'>
          <div className='card-title flex-column'>
            <h3 className='fw-bold mb-1'>Laporan Barang Rusak</h3>
            <span className='text-muted fw-semibold fs-7'>
              Daftar barang yang dilaporkan rusak beserta buktinya.
            </span>
          </div>

          <div className='card-toolbar gap-3'>
            {/* Search */}
            <div className='d-flex align-items-center position-relative'>
              <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-5' />
              <input
                type='text'
                className='form-control form-control-solid w-250px ps-13'
                placeholder='Cari laporan...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Export — hanya SuperAdmin */}
            {isSuperAdmin && (
              <div className='position-relative'>
                <button
                  className='btn btn-sm btn-light-success'
                  onClick={() => setShowExportMenu((v) => !v)}
                  disabled={filtered.length === 0}
                >
                  <KTIcon iconName='file-down' className='fs-3' />
                  Export
                </button>

                {showExportMenu && (
                  <>
                    <div
                      onClick={() => setShowExportMenu(false)}
                      style={{position: 'fixed', inset: 0, zIndex: 100}}
                    />
                    <div
                      className='menu menu-sub menu-sub-dropdown show position-absolute'
                      style={{top: '100%', right: 0, zIndex: 105, minWidth: '160px'}}
                    >
                      <div className='menu-item px-3'>
                        <button className='menu-link px-3' onClick={exportToExcel}>
                          <KTIcon iconName='file-sheet' className='fs-3 me-2' />
                          Export Excel
                        </button>
                      </div>
                      <div className='menu-item px-3'>
                        <button className='menu-link px-3' onClick={exportToPDF}>
                          <KTIcon iconName='file' className='fs-3 me-2' />
                          Export PDF
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Refresh */}
            <button
              className='btn btn-sm btn-light-primary'
              onClick={fetchFaultyReports}
              disabled={loading}
            >
              <KTIcon iconName='arrows-circle' className='fs-3' />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className='card-body py-4'>
          <div className='mb-5'>
            <h5 className='text-muted mb-0'>{filtered.length} laporan</h5>
          </div>

          {loading ? (
            <div className='text-center py-10'>
              <span className='spinner-border spinner-border-lg' />
            </div>
          ) : error ? (
            <div
              style={{
                backgroundColor: '#fff5f5',
                border: '1px solid #f5c6cb',
                borderRadius: '10px',
                padding: '16px 20px',
                color: '#842029',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <KTIcon iconName='cross-circle' className='fs-4' />
              {error}
              <button className='btn btn-sm btn-light-danger ms-auto' onClick={fetchFaultyReports}>
                Coba Lagi
              </button>
            </div>
          ) : paginated.length > 0 ? (
            <>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {paginated.map((report) => (
                  <FaultyItemCard key={report.id} report={report} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className='d-flex flex-stack flex-wrap pt-10'>
                  <div className='fs-6 fw-bold text-gray-700'>
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} hingga{' '}
                    {Math.min(currentPage * itemsPerPage, filtered.length)} dari{' '}
                    {filtered.length} laporan
                  </div>
                  <ul className='pagination'>
                    <li className={`page-item previous ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className='page-link' onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                        <i className='previous' />
                      </button>
                    </li>
                    {Array.from({length: totalPages}, (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button className='page-link' onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item next ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className='page-link' onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                        <i className='next' />
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <EmptyState404
              title='Tidak ada laporan ditemukan'
              subtitle={searchQuery ? 'Coba ubah kata kunci pencarian.' : 'Belum ada barang yang dilaporkan rusak.'}
            />
          )}
        </div>
      </div>
    </div>
  )
}