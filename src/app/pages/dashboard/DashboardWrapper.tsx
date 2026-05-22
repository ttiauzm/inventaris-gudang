import {FC, useState, useEffect, useRef} from 'react'
import {useAuth} from '../../modules/auth'
import {KTIcon, toAbsoluteUrl} from '../../../_metronic/helpers'
import {getInventory} from '../inventory/core/_requests'
import {getSuppliers} from '../supplier/core/_requests'
import {getCategories} from '../category/core/_requests'
import {useNavigate} from 'react-router-dom'
import API from '../../../api'
import {exportSummaryToExcel, exportSummaryToPDF} from '../../utils/exportUtils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatCard {
  label: string
  value: number
  linkLabel: string
  href?: string
}

interface ItemActivity {
  id: string
  name: string
  quantity: number
  category?: string
  updated_at?: string
}

interface ValuableGood {
  id: string
  name: string
  value: number
  color: string
  percentage?: number
}

interface CategoryOption {
  id: string
  label: string
  children?: CategoryOption[]
}

// ─── Pie Chart ────────────────────────────────────────────────────────────────

interface PieChartProps {
  data: ValuableGood[]
}

const PieChart: FC<PieChartProps> = ({data}) => {
  const total = data.reduce((s, d) => s + d.value, 0)
  const cx = 110
  const cy = 110
  const r = 98

  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180

  const arc = (startDeg: number, endDeg: number) => {
    const s = {x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg))}
    const e = {x: cx + r * Math.cos(toRad(endDeg)), y: cy + r * Math.sin(toRad(endDeg))}
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`
  }

  const labelPos = (startDeg: number, endDeg: number, radius: number) => {
    const mid = (startDeg + endDeg) / 2
    return {
      x: cx + radius * Math.cos(toRad(mid)),
      y: cy + radius * Math.sin(toRad(mid)),
    }
  }

  const formatK = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} Jt`
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
    return String(v)
  }

  let cursor = 0
  const slices = data.map((item) => {
    const deg = (item.value / total) * 360
    const start = cursor
    cursor += deg
    return {...item, start, end: cursor}
  })

  return (
    <svg viewBox='0 0 220 220' width={220} height={220} style={{filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))'}}>
      <defs>
        {/* Gradient definitions for more vibrant colors */}
        {slices.map((s, idx) => (
          <radialGradient key={`grad-${s.id}`} id={`gradient-${s.id}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={s.color} stopOpacity="1" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0.85" />
          </radialGradient>
        ))}
      </defs>
      
      {/* Pie slices */}
      {slices.map((s) => (
        <g key={s.id}>
          <path
            d={arc(s.start, s.end)}
            fill={`url(#gradient-${s.id})`}
            stroke='#fff'
            strokeWidth={3}
            style={{
              transition: 'all 0.3s ease',
            }}
          />
        </g>
      ))}
      
      {/* Labels */}
      {slices.map((s) => {
        const span = s.end - s.start
        if (span < 15) return null
        const pos = labelPos(s.start, s.end, r * 0.65)
        return (
          <text
            key={`lbl-${s.id}`}
            x={pos.x}
            y={pos.y}
            textAnchor='middle'
            dominantBaseline='middle'
            fill='#fff'
            fontSize={span > 80 ? 16 : span > 40 ? 13 : 11}
            fontWeight='700'
            style={{
              pointerEvents: 'none',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            {formatK(s.value)}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Category Dropdown ────────────────────────────────────────────────────────

interface CategoryDropdownProps {
  categories: CategoryOption[]
  selected: string
  onSelect: (id: string) => void
}

const CategoryDropdown: FC<CategoryDropdownProps> = ({categories, selected, onSelect}) => {
  const [open, setOpen] = useState(false)
  const [expandedParent, setExpandedParent] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedLabel =
    categories.flatMap((c) => [c, ...(c.children ?? [])]).find((c) => c.id === selected)?.label ??
    'Pilih Kategori'

  return (
    <div ref={ref} style={{position: 'relative'}}>
      <button
        onClick={() => setOpen((o) => !o)}
        className='btn btn-light btn-sm d-flex align-items-center gap-2'
        style={{border: '1px solid #d9d4cf', borderRadius: '8px', minWidth: '140px'}}
      >
        <span style={{flex: 1, textAlign: 'left'}}>{selectedLabel}</span>
        <KTIcon iconName='down' className='fs-7' />
      </button>

      {open && (
        <div
          className='bg-white shadow rounded'
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 200,
            minWidth: '180px',
            border: '1px solid #ece8e4',
            padding: '6px 0',
          }}
        >
          {categories.map((cat) => (
            <div key={cat.id}>
              {cat.children ? (
                <>
                  <div
                    className='d-flex align-items-center justify-content-between px-3 py-2'
                    style={{
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#6c757d',
                      fontWeight: 600,
                      backgroundColor: selected === cat.id ? '#f5f2ee' : 'transparent',
                    }}
                    onClick={() => setExpandedParent((p) => (p === cat.id ? null : cat.id))}
                  >
                    <span>{cat.label}</span>
                    <KTIcon
                      iconName={expandedParent === cat.id ? 'up' : 'right'}
                      className='fs-8'
                    />
                  </div>
                  {expandedParent === cat.id &&
                    cat.children.map((child) => (
                      <div
                        key={child.id}
                        className='px-5 py-1'
                        style={{
                          cursor: 'pointer',
                          fontSize: '13px',
                          backgroundColor: selected === child.id ? '#ede9e4' : 'transparent',
                        }}
                        onClick={() => {
                          onSelect(child.id)
                          setOpen(false)
                        }}
                      >
                        {child.label}
                      </div>
                    ))}
                </>
              ) : (
                <div
                  className='px-3 py-2'
                  style={{
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#6c757d',
                    backgroundColor: selected === cat.id ? '#f5f2ee' : 'transparent',
                  }}
                  onClick={() => {
                    onSelect(cat.id)
                    setOpen(false)
                  }}
                >
                  {cat.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DashboardWrapper: FC = () => {
  const {currentUser} = useAuth()
  const navigate = useNavigate()

  // Check if user is Superadmin
  const isSuperadmin = currentUser?.role?.toLowerCase() === 'superadmin'

  // ── State ──
  const [activeTab, setActiveTab] = useState<'tercepat' | 'terlama'>('tercepat')
  const [activeValueTab, setActiveValueTab] = useState<'tertinggi' | 'terendah'>('tertinggi')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const itemsPerPage = 5
  
  // Data states
  const [stats, setStats] = useState<StatCard[]>([
    {label: 'Total Barang', value: 0, linkLabel: 'Lihat Barang', href: '/apps/inventory'},
    {label: 'Total Supplier', value: 0, linkLabel: 'Lihat Supplier', href: '/apps/supplier'},
    {label: 'Supplier Aktif Bulan Ini', value: 0, linkLabel: 'Lihat Supplier', href: '/apps/supplier'},
  ])
  const [allActivities, setAllActivities] = useState<ItemActivity[]>([])
  const [valuableGoodsHigh, setValuableGoodsHigh] = useState<ValuableGood[]>([])
  const [valuableGoodsLow, setValuableGoodsLow] = useState<ValuableGood[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([
    {id: 'all', label: 'Semua Kategori'},
  ])
  const [loading, setLoading] = useState(true)

  // ── Fetch Data on Mount ──
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // ── Fetch when tab or category changes ──
  useEffect(() => {
    fetchItemsActivity()
  }, [activeTab, selectedCategory])

  useEffect(() => {
    fetchValuableGoods()
  }, [activeValueTab])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchStats(),
        fetchCategories(),
        fetchItemsActivity(),
        fetchValuableGoods()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch all data in parallel
      const [inventoryData, suppliersData] = await Promise.all([
        getInventory(),
        getSuppliers()
      ])

      // Get unique suppliers from this month
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const activeSuppliers = inventoryData.filter(item => {
        if (!item.created_at) return false
        const itemDate = new Date(item.created_at)
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
      })
      const uniqueSupplierIds = new Set(activeSuppliers.map(item => item.supplier_id).filter(Boolean))

      setStats([
        {label: 'Total Barang', value: inventoryData.length, linkLabel: 'Lihat Barang', href: '/apps/inventory'},
        {label: 'Total Supplier', value: suppliersData.length, linkLabel: 'Lihat Supplier', href: '/apps/supplier'},
        {label: 'Supplier Aktif Bulan Ini', value: uniqueSupplierIds.size, linkLabel: 'Lihat Supplier', href: '/apps/supplier'},
      ])
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories()
      const categoryOptions: CategoryOption[] = [
        {id: 'all', label: 'Semua Kategori'},
        ...categoriesData.map(cat => ({
          id: cat.id,
          label: cat.name
        }))
      ]
      setCategories(categoryOptions)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchItemsActivity = async () => {
    try {
      const params: any = {per_page: 1000}  // Increase to get more items
      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory  // Use category_id instead of category
        console.log('🔍 Filtering by category_id:', selectedCategory)
      } else {
        console.log('📊 Fetching all items (no category filter)')
      }

      console.log('📤 Request params:', params)
      const items = await getInventory(params)
      console.log('📥 Received items:', items.length, 'items')
      
      if (selectedCategory !== 'all') {
        console.log('🎯 First item category_id:', items[0]?.category_id)
        console.log('🎯 Items with matching category:', items.filter(i => i.category_id === selectedCategory).length)
      }
      
      // Sort based on active tab
      let sortedItems = [...items]
      if (activeTab === 'tercepat') {
        // Sort by highest quantity (fastest moving stock)
        sortedItems.sort((a, b) => b.quantity - a.quantity)
      } else {
        // Sort by most recent (newest first)
        sortedItems.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA
        })
      }

      const activities: ItemActivity[] = sortedItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        updated_at: item.updated_at
      }))

      console.log('✅ Final activities:', activities.length, 'items')
      setAllActivities(activities)
      setCurrentPage(1) // Reset to first page
    } catch (error) {
      console.error('❌ Error fetching items activity:', error)
    }
  }

  const fetchValuableGoods = async () => {
    try {
      const items = await getInventory({per_page: 1000}) // Get all items
      
      // Calculate total value for each item (quantity × price)
      const itemsWithValue = items
        .map(item => ({
          id: item.id,
          name: item.name,
          value: item.quantity * (item.price || 0)
        }))
        .filter(item => item.value > 0) // Only items with value

      if (itemsWithValue.length === 0) {
        // If no items with value, set empty arrays
        setValuableGoodsHigh([])
        setValuableGoodsLow([])
        return
      }

      // Calculate total value of ALL items for percentage calculation
      const totalValue = itemsWithValue.reduce((sum, item) => sum + item.value, 0)

      // Sort by value (highest to lowest)
      const sortedByValue = [...itemsWithValue].sort((a, b) => b.value - a.value)
      
      // Get top 5 highest
      const top5Highest = sortedByValue.slice(0, 5)
      const colorsHigh = ['#7D6E63', '#A89A91', '#C0B4AE', '#D4CBC6', '#E8E2DF']
      
      // Calculate percentage for each item relative to total
      const highestWithPercentage = top5Highest.map((item, idx) => ({
        ...item,
        color: colorsHigh[idx] || '#E8E2DF',
        percentage: (item.value / totalValue) * 100
      }))

      setValuableGoodsHigh(highestWithPercentage)

      // Get top 5 lowest (items with smallest value but > 0)
      const top5Lowest = [...sortedByValue].reverse().slice(0, 5).reverse() // Reverse twice to maintain ascending order
      // Vibrant colors - dari terang ke gelap (untuk terendah)
      const colorsLow = ['#E8E2DF', '#D4CBC6', '#C0B4AE', '#A89A91', '#7D6E63']
      
      const lowestWithPercentage = top5Lowest.map((item, idx) => ({
        ...item,
        color: colorsLow[idx] || '#7D6E63',
        percentage: (item.value / totalValue) * 100
      }))

      setValuableGoodsLow(lowestWithPercentage)
    } catch (error) {
      console.error('Error fetching valuable goods:', error)
    }
  }

  const handleExport = (type: 'excel' | 'pdf') => {
    setShowExportMenu(false)
    const summaryData = {
      stats,
      allActivities,
      valuableGoodsHigh,
      valuableGoodsLow
    }
    if (type === 'excel') {
      exportSummaryToExcel(summaryData)
    } else {
      exportSummaryToPDF(summaryData)
    }
  }

  // ── Derived ──
  const filteredActivities = allActivities
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const valuableGoods = activeValueTab === 'tertinggi' ? valuableGoodsHigh : valuableGoodsLow

  const getCurrentDate = () => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ]
    const now = new Date()
    return `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`
  }

  // ── Render ──
  return (
    <>
      <div
        style={{
          borderRadius: '9px',
          margin: '10px',
          padding: '20px 10px',
          backgroundColor: '#B7ADA6',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.23)',
          // minHeight: 'calc(100vh - 80px)',
        }}
      >
        {/* ── Hero ── */}
      <div style={{margin: '10px 10px 0', borderRadius: '12px', overflow: 'hidden'}}>
        <div
          className='d-flex flex-column align-items-center justify-content-center'
          style={{
            minHeight: '200px',
            backgroundColor: '#F4EFE6',
            padding: '32px',
            backgroundImage: `url(${toAbsoluteUrl('media/svg/background/item-background.svg')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <img
            src={toAbsoluteUrl('media/logos/delova.svg')}
            alt='Delova Logo'
            style={{maxWidth: '300px', height: 'auto', marginBottom: '20px'}}
          />
          <h2 className='fw-bold mb-1' style={{color: '#2C3E50', fontSize: '1.6rem'}}>
            Selamat Datang, {currentUser?.first_name || 'User'}
          </h2>
          <p className='text-muted mb-0' style={{fontSize: '0.9rem'}}>
            {getCurrentDate()}
          </p>
        </div>
      </div>

      {/* ── Ringkasan Analisis ── */}
      <div style={{margin: '10px', borderRadius: '12px', backgroundColor: '#fff', overflow: 'hidden'}}>
        {/* Header */}
        <div
          className='d-flex align-items-center justify-content-between'
          style={{padding: '20px 24px 12px'}}
        >
          <h3 className='fw-bold mb-0' style={{fontSize: '1.1rem'}}>
            Ringkasan Analisis
          </h3>
          <div className='d-flex align-items-center gap-3'>
            {/* Export Dropdown */}
            {isSuperadmin && (
              <div className='position-relative'>
                <button
                  className='btn btn-sm btn-light-success d-flex align-items-center gap-2'
                  style={{ border: '0px solid currentColor', borderRadius: '8px', minWidth: '110px', height: '36px', justifyContent: 'center' }}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <KTIcon iconName='file-down' className='fs-3' />
                  Export
                </button>
                {showExportMenu && (
                  <div className='menu menu-sub menu-sub-dropdown show position-absolute' style={{top: '100%', right: 0, zIndex: 105, minWidth: '150px', backgroundColor: '#fff', border: '1px solid #eae5e0', borderRadius: '6px', padding: '8px 0', marginTop: '4px'}}>
                    <div className='menu-item px-3'>
                      <button className='menu-link px-3 w-100 text-start border-0 bg-transparent' onClick={() => handleExport('excel')}>
                        <KTIcon iconName='file-sheet' className='fs-3 me-2' />
                        Export Excel
                      </button>
                    </div>
                    <div className='menu-item px-3'>
                      <button className='menu-link px-3 w-100 text-start border-0 bg-transparent' onClick={() => handleExport('pdf')}>
                        <KTIcon iconName='file' className='fs-3 me-2' />
                        Export PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{height: '1px', backgroundColor: '#f0ebe6', margin: '0 24px'}} />

        {/* Stat Cards */}
        {loading ? (
          <div className='text-center py-10'>
            <span className='spinner-border spinner-border-lg'></span>
            <p className='mt-3 text-muted'>Memuat data...</p>
          </div>
        ) : (
          <>
            <div className='row g-0' style={{padding: '20px 24px'}}>
              {stats.map((stat, idx) => (
                <div key={idx} className='col-12 col-md-4' style={{padding: '0 8px 8px 0'}}>
                  <div
                    style={{
                      border: '1px solid #eae5e0',
                      borderRadius: '10px',
                      padding: '16px 18px',
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '140px',
                      backgroundImage: `url(${toAbsoluteUrl('media/svg/background/item-background.svg')})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Decorative background circle */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#f5f1ed',
                        opacity: 0.5,
                      }}
                    />
                    <p
                      className='mb-1'
                      style={{fontSize: '12px', color: '#9e9992', fontWeight: 500, position: 'relative', zIndex: 1}}
                    >
                      {stat.label}
                    </p>
                    <p
                      className='fw-bold mb-2'
                      style={{fontSize: '2rem', lineHeight: 1.1, color: '#2c2c2c', position: 'relative', zIndex: 1}}
                    >
                      {stat.value}
                    </p>
                    {isSuperadmin ? (
                      <button
                        onClick={() => stat.href && navigate(stat.href)}
                        style={{
                          fontSize: '12px',
                          color: '#5b8de8',
                          textDecoration: 'none',
                          position: 'relative',
                          zIndex: 1,
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {stat.linkLabel}
                        <KTIcon iconName='arrow-right' className='fs-8' />
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#9e9992',
                          position: 'relative',
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {stat.linkLabel}
                        <KTIcon iconName='lock' className='fs-8' />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom: Items Activity + Valuable Goods */}
            <div className='row g-0 align-items-stretch' style={{padding: '0 24px 24px'}}>
              {/* ── Items Activity ── */}
              <div className='col-12 col-lg-7 d-flex flex-column' style={{paddingRight: '20px', marginBottom: '20px'}}>
                <div
                  className='d-flex flex-column flex-grow-1'
                  style={{
                    border: '1px solid #eae5e0',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    backgroundImage: `url(${toAbsoluteUrl('media/svg/background/item-background.svg')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '400px'
                  }}
                >
                  <div style={{marginBottom: '4px'}}>
                    <span className='fw-bold' style={{fontSize: '16px'}}>
                      Items Activity
                    </span>
                  </div>
                  <div
                    style={{fontSize: '12px', color: '#b0a89f', marginBottom: '14px'}}
                  >
                    Aktivitas Barang
                  </div>

                  {/* Tab bar */}
                  <div className='d-flex align-items-center gap-2 flex-wrap' style={{marginBottom: '16px'}}>
                    {/* Tercepat / Terlama */}
                    <div
                      className='d-flex'
                      style={{border: '1px solid #e0dbd5', borderRadius: '8px', overflow: 'hidden'}}
                    >
                      {(['tercepat', 'terlama'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab)
                            setCurrentPage(1)
                          }}
                          style={{
                            border: 'none',
                            padding: '5px 14px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: activeTab === tab ? '#5b8de8' : '#fff',
                            color: activeTab === tab ? '#fff' : '#6c6c6c',
                            transition: 'all 0.2s',
                            textTransform: 'capitalize',
                          }}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* Spacer */}
                    <div style={{flex: 1}} />

                    {/* Category dropdown */}
                    <CategoryDropdown
                      categories={categories}
                      selected={selectedCategory}
                      onSelect={(id) => {
                        setSelectedCategory(id)
                        setCurrentPage(1)
                      }}
                    />

                    {/* Spacer replaced Header labels as they are now in thead */}
                  </div>

                  {/* Table */}
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr>
                        <th style={{padding: '10px 8px', width: '36px', borderBottom: '1px solid #ede9e4'}}></th>
                        <th style={{padding: '10px 12px', fontSize: '13px', color: '#9e9992', fontWeight: 600, textAlign: 'left', width: '50%', borderBottom: '1px solid #ede9e4'}}>Barang</th>
                        <th style={{padding: '10px 12px', fontSize: '13px', color: '#9e9992', fontWeight: 600, textAlign: 'center', width: '30%', borderBottom: '1px solid #ede9e4'}}>Tgl Update</th>
                        <th style={{padding: '10px 8px', fontSize: '13px', color: '#9e9992', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #ede9e4'}}>Stok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedActivities.length > 0 ? (
                        paginatedActivities.map((item, idx) => (
                          <tr
                            key={item.id}
                            style={{borderBottom: '1px dashed #ede9e4'}}
                          >
                            <td
                              style={{
                                padding: '10px 8px',
                                width: '36px',
                                color: '#b0a89f',
                                fontSize: '13px',
                                backgroundColor: '#f5f2ee',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontWeight: 600
                              }}
                            >
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>
                            <td style={{padding: '10px 12px', fontSize: '13px', color: '#3a3a3a', width: '50%'}}>
                              <div style={{fontWeight: 500}}>{item.name}</div>
                            </td>
                            <td style={{padding: '10px 12px', textAlign: 'center', width: '30%'}}>
                              {item.updated_at ? (
                                <span style={{fontSize: '12px', color: '#b0a89f', backgroundColor: '#f5f2ee', padding: '4px 8px', borderRadius: '4px', fontWeight: 500}}>
                                  {new Date(item.updated_at).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </span>
                              ) : (
                                <span style={{fontSize: '12px', color: '#b0a89f'}}>-</span>
                              )}
                            </td>
                            <td
                              style={{
                                padding: '10px 8px',
                                textAlign: 'right',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#3a3a3a',
                              }}
                            >
                              {item.quantity.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            style={{padding: '24px', textAlign: 'center', color: '#b0a89f'}}
                          >
                            Tidak ada data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {filteredActivities.length > 0 && (
                    <div
                      className='d-flex align-items-center justify-content-between'
                      style={{marginTop: '14px'}}
                    >
                      <span style={{fontSize: '12px', color: '#b0a89f'}}>
                        {(currentPage - 1) * itemsPerPage + 1} dari {filteredActivities.length}{' '}
                        ditampilkan
                      </span>

                      <div className='d-flex gap-1 align-items-center'>
                        <button
                          onClick={() => setCurrentPage((p) => p - 1)}
                          disabled={currentPage === 1}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: '1px solid #e0dbd5',
                            borderRadius: '6px',
                            backgroundColor: '#fff',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: currentPage === 1 ? 0.4 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <KTIcon iconName='arrow-left' className='fs-6' />
                        </button>

                        {Array.from({length: totalPages}, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                              width: '30px',
                              height: '30px',
                              border: currentPage === page ? 'none' : '1px solid #e0dbd5',
                              borderRadius: '6px',
                              backgroundColor: currentPage === page ? '#897870' : '#fff',
                              color: currentPage === page ? '#fff' : '#3a3a3a',
                              cursor: 'pointer',
                              fontWeight: currentPage === page ? 700 : 400,
                              fontSize: '13px',
                            }}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={currentPage === totalPages}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: '1px solid #e0dbd5',
                            borderRadius: '6px',
                            backgroundColor: '#fff',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            opacity: currentPage === totalPages ? 0.4 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <KTIcon iconName='arrow-right' className='fs-6' />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Valuable Goods ── */}
              <div className='col-12 col-lg-5 d-flex flex-column' style={{paddingLeft: '0px', marginBottom: '20px'}}>
                <div
                  className='d-flex flex-column flex-grow-1'
                  style={{
                    border: '1px solid #eae5e0',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#fff',
                    backgroundImage: `url(${toAbsoluteUrl('media/svg/background/item-background.svg')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '400px'
                  }}
                >
                  <div style={{marginBottom: '4px'}}>
                    <div className='fw-bold' style={{fontSize: '16px'}}>
                      Valuable Goods
                    </div>
                    <div style={{fontSize: '12px', color: '#b0a89f', marginBottom: '14px'}}>Nilai Barang</div>
                  </div>

                  {/* Tertinggi / Terendah */}
                  <div className='d-flex align-items-center gap-2 flex-wrap' style={{marginBottom: '16px'}}>
                    <div
                      className='d-flex'
                      style={{border: '1px solid #e0dbd5', borderRadius: '8px', overflow: 'hidden'}}
                    >
                      {(['tertinggi', 'terendah'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveValueTab(tab)}
                          style={{
                            border: 'none',
                            padding: '5px 14px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: activeValueTab === tab ? '#5b8de8' : '#fff',
                            color: activeValueTab === tab ? '#fff' : '#6c6c6c',
                            transition: 'all 0.2s',
                            textTransform: 'capitalize',
                          }}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart + Legend */}
                  <div className='d-flex align-items-center justify-content-center flex-grow-1' style={{marginTop: '20px', gap: '30px'}}>
                    {/* Pie Chart */}
                    <div style={{flexShrink: 0, transform: 'scale(1.15)', transformOrigin: 'center'}}>
                      <PieChart data={valuableGoods} />
                    </div>

                    {/* Legend */}
                    <div style={{flex: 1, minWidth: 0, paddingLeft: '10px'}}>
                      <p
                        className='fw-bold mb-3'
                        style={{fontSize: '14px', color: '#3a3a3a'}}
                      >
                        Top 5 Nilai Barang {activeValueTab === 'tertinggi' ? 'Tertinggi' : 'Terendah'}
                      </p>
                      {valuableGoods.length > 0 ? (
                        valuableGoods.map((item, index) => (
                          <div
                            key={item.id}
                            className='d-flex align-items-start gap-2'
                            style={{marginBottom: '10px'}}
                          >
                            <div
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: item.color,
                                flexShrink: 0,
                                marginTop: '2px'
                              }}
                            />
                            <div style={{flex: 1, minWidth: 0}}>
                              <div 
                                style={{
                                  fontSize: '13px', 
                                  color: '#3a3a3a',
                                  fontWeight: 500,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  marginBottom: '2px'
                                }}
                                title={item.name}
                              >
                                {item.name}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{fontSize: '12px', color: '#b0a89f', textAlign: 'center', marginTop: '20px'}}>
                          Tidak ada data
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}

export {DashboardWrapper}