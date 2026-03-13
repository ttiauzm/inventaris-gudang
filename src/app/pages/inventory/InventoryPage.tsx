//InventoryPage.tsx
import {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../_metronic/helpers'
import EmptyState404 from '../../components/EmptyState404'
import TiltedCard from '../../components/TiltedCard'
import {InventoryModal} from './components/InventoryModal'
import {ItemDetailModal} from './components/ItemDetailModal'
import {getInventory } from './core/_requests'
import { InventoryItem } from './core/_model'
import {exportInventoryToExcel, exportInventoryToPDF} from '../../utils/exportUtils'
import {useAuth} from '../../modules/auth'
import {isSuperAdmin as checkSuperAdmin} from '../../utils/permissionHelper'

const InventoryPage: FC = () => {
  const {currentUser} = useAuth()
  // Check superadmin - akan otomatis bypass di dev mode
  const isSuperAdmin = checkSuperAdmin(currentUser)
  
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    minStock: '',
    maxStock: '',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  })

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const data = await getInventory()
      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(inventory.map(item => item.category).filter(Boolean)))
  const suppliers = Array.from(new Set(inventory.map(item => item.supplier).filter(Boolean)))

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !filters.category || item.category === filters.category
    const matchesSupplier = !filters.supplier || item.supplier === filters.supplier
    const matchesMinStock = !filters.minStock || item.quantity >= parseInt(filters.minStock)
    const matchesMaxStock = !filters.maxStock || item.quantity <= parseInt(filters.maxStock)

    return matchesSearch && matchesCategory && matchesSupplier && matchesMinStock && matchesMaxStock
  })

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let aVal: any = a[filters.sortBy as keyof InventoryItem]
    let bVal: any = b[filters.sortBy as keyof InventoryItem]
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()
    
    if (filters.sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const handleAdd = () => {
    if (!isSuperAdmin) {
      alert('Hanya SuperAdmin yang dapat menambah barang')
      return
    }
    setSelectedItem(null)
    setShowModal(true)
  }

  const handleCardClick = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowDetailModal(true)
  }

  const handleEdit = (item: InventoryItem) => {
    setShowDetailModal(false)
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleTakeItem = async (quantity: number, description: string) => {
    if (!selectedItem || !currentUser) return

    const {takeInventoryItem} = await import('./core/_requests')
    await takeInventoryItem(
      selectedItem.id,
      quantity,
      description || `Pengambilan barang oleh ${currentUser.fullname || currentUser.username}`,
      selectedItem.supplier_id
    )
    fetchInventory() // Refresh stok setelah berhasil
  }

  const handleSave = () => {
    setShowModal(false)
    fetchInventory()
  }

  const handleExport = async (type: 'excel' | 'pdf') => {
    if (type === 'excel') {
      exportInventoryToExcel(sortedInventory)
    } else {
      await exportInventoryToPDF(sortedInventory)
    }
    setShowExportMenu(false)
  }

  const resetFilters = () => {
    setFilters({
      category: '',
      supplier: '',
      minStock: '',
      maxStock: '',
      sortBy: 'name',
      sortOrder: 'asc'
    })
  }

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'name' && v !== 'asc').length

  return (
    <>
    <div style={{borderRadius: '9px',margin: '10px' ,paddingTop: '2vh',padding: '10px', backgroundColor: '#B7ADA6', minHeight: 'calc(5vh - 40px)'}}>
      {/* Padding Container */}
      {/* <div style={{padding: '20px', backgroundColor: '#B7ADA6', minHeight: 'calc(100vh - 80px)'}}> */}
        <div className='card mb-5' style={{backgroundColor: '#FFFFFF'}}>
          <div className='card-header border-0 pt-6'>
            <div className='card-title'>
              <h3 className='fw-bold mb-0'>Inventori</h3>
            </div>
            
            <div className='card-toolbar gap-3'>
              <div className='d-flex align-items-center position-relative'>
                <KTIcon iconName='magnifier' className='fs-3 position-absolute ms-5' />
                <input
                  type='text'
                  className='form-control form-control-solid w-250px ps-13'
                  placeholder='Cari Barang'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-light-primary'} position-relative`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <KTIcon iconName='filter' className='fs-3' />
                Filter
                {activeFiltersCount > 0 && (
                  <span className='position-absolute top-0 start-100 translate-middle badge badge-circle badge-danger'>
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Export Dropdown */}
              {isSuperAdmin && (
              <div className='position-relative'>
                <button
                  className='btn btn-sm btn-light-success'
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <KTIcon iconName='file-down' className='fs-3' />
                  Export
                </button>
                {showExportMenu && (
                  <div className='menu menu-sub menu-sub-dropdown show position-absolute' style={{top: '100%', right: 0, zIndex: 105}}>
                    <div className='menu-item px-3'>
                      <button className='menu-link px-3' onClick={() => handleExport('excel')}>
                        <KTIcon iconName='file-sheet' className='fs-3 me-2' />
                        Export Excel
                      </button>
                    </div>
                    <div className='menu-item px-3'>
                      <button className='menu-link px-3' onClick={() => handleExport('pdf')}>
                        <KTIcon iconName='file' className='fs-3 me-2' />
                        Export PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )}

              {isSuperAdmin && (
                <button className='btn btn-sm btn-primary' onClick={handleAdd}>
                  <KTIcon iconName='plus' className='fs-3' />
                  Tambah
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className='card-body border-top pt-6'>
              <div className='row g-4'>
                <div className='col-md-3'>
                  <label className='form-label fs-7 fw-bold'>Kategori</label>
                  <select
                    className='form-select form-select-sm'
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value=''>Semua Kategori</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className='col-md-3'>
                  <label className='form-label fs-7 fw-bold'>Supplier</label>
                  <select
                    className='form-select form-select-sm'
                    value={filters.supplier}
                    onChange={(e) => setFilters({...filters, supplier: e.target.value})}
                  >
                    <option value=''>Semua Supplier</option>
                    {suppliers.map(sup => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>

                <div className='col-md-2'>
                  <label className='form-label fs-7 fw-bold'>Min Stock</label>
                  <input
                    type='number'
                    className='form-control form-control-sm'
                    value={filters.minStock}
                    onChange={(e) => setFilters({...filters, minStock: e.target.value})}
                    placeholder='0'
                  />
                </div>

                <div className='col-md-2'>
                  <label className='form-label fs-7 fw-bold'>Max Stock</label>
                  <input
                    type='number'
                    className='form-control form-control-sm'
                    value={filters.maxStock}
                    onChange={(e) => setFilters({...filters, maxStock: e.target.value})}
                    placeholder='999'
                  />
                </div>

                <div className='col-md-2'>
                  <label className='form-label fs-7 fw-bold'>Urutkan</label>
                  <div className='d-flex gap-2'>
                    <select
                      className='form-select form-select-sm'
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    >
                      <option value='name'>Nama</option>
                      <option value='quantity'>Stock</option>
                      <option value='price'>Harga</option>
                    </select>
                    <button
                      className='btn btn-sm btn-icon btn-light'
                      onClick={() => setFilters({
                        ...filters, 
                        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                      })}
                    >
                      <KTIcon 
                        iconName={filters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                        className='fs-3' 
                      />
                    </button>
                  </div>
                </div>

                <div className='col-12'>
                  <button className='btn btn-sm btn-light' onClick={resetFilters}>
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className='card-body py-4'>
            <div className='mb-5 d-flex justify-content-between align-items-center'>
              <h5 className='text-muted mb-0'>{sortedInventory.length} barang</h5>
              {activeFiltersCount > 0 && (
                <span className='badge badge-light-primary'>
                  {activeFiltersCount} filter aktif
                </span>
              )}
            </div>

            {loading ? (
              <div className='text-center py-10'>
                <span className='spinner-border spinner-border-lg' />
              </div>
            ) : (
              <div className='row g-6'>
                {sortedInventory.length > 0 ? (
                  sortedInventory.map((item) => (
                    <div key={item.id} className='col-12 col-sm-6 col-md-4 col-lg-3'>
                      <TiltedCard
                        imageSrc={item.image}
                        title={item.name}
                        supplier={item.supplier}
                        quantity={item.quantity}
                        unit={item.unit}
                        price={item.price}
                        onClick={() => handleCardClick(item)}
                      />
                    </div>
                  ))
                ) : (
                  <div className='col-12'>
                    <EmptyState404
                      title='Tidak ada barang ditemukan'
                      subtitle='Pastikan kata kunci pencarian Anda benar.'
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <InventoryModal
          item={selectedItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleSave}
        />
      )}

      {showDetailModal && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setShowDetailModal(false)}
          onEdit={handleEdit}
          onTakeItem={async (qty, desc) => {
            await handleTakeItem(qty, desc)
          }}
        />
      )}
      {/* </div> */}
    </>
  )
}

export {InventoryPage}