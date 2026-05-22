// ============================================================================
// SIMPLIFIED CATEGORY DROPDOWN - SOLUSI CEPAT
// ============================================================================
// Copy code ini dan replace CategoryDropdown component yang ada
// di DashboardWrapper.tsx (sekitar baris 120-230)

interface CategoryDropdownProps {
  categories: CategoryOption[]
  selected: string
  onSelect: (id: string) => void
}

const CategoryDropdown: FC<CategoryDropdownProps> = ({categories, selected, onSelect}) => {
  return (
    <select
      value={selected}
      onChange={(e) => onSelect(e.target.value)}
      className='form-select form-select-sm'
      style={{
        border: '1px solid #d9d4cf',
        borderRadius: '8px',
        minWidth: '140px',
        fontSize: '13px',
        padding: '6px 12px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        appearance: 'auto'
      }}
    >
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.label}
        </option>
      ))}
    </select>
  )
}

// ============================================================================
// ALTERNATIF: ENHANCED DROPDOWN (Jika mau tetap custom)
// ============================================================================

const CategoryDropdown: FC<CategoryDropdownProps> = ({categories, selected, onSelect}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedLabel = categories.find((c) => c.id === selected)?.label ?? 'Pilih Kategori'

  // Debug log
  console.log('CategoryDropdown:', {
    categoriesCount: categories.length,
    selected,
    selectedLabel,
    open
  })

  return (
    <div ref={ref} style={{position: 'relative'}}>
      <button
        type="button"
        onClick={() => {
          console.log('Dropdown clicked, current state:', open)
          setOpen((prev) => !prev)
        }}
        className='btn btn-light btn-sm d-flex align-items-center gap-2'
        style={{
          border: '1px solid #d9d4cf',
          borderRadius: '8px',
          minWidth: '140px',
          backgroundColor: '#fff',
          padding: '6px 12px'
        }}
      >
        <span style={{flex: 1, textAlign: 'left', fontSize: '13px'}}>
          {selectedLabel}
        </span>
        <KTIcon iconName={open ? 'up' : 'down'} className='fs-7' />
      </button>

      {open && (
        <div
          className='bg-white shadow rounded'
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 9999, // Very high z-index
            minWidth: '180px',
            maxWidth: '280px',
            border: '1px solid #ece8e4',
            padding: '6px 0',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {categories.length === 0 ? (
            <div className='px-3 py-2 text-muted' style={{fontSize: '13px'}}>
              Tidak ada kategori
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className='px-3 py-2'
                style={{
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: selected === cat.id ? 600 : 400,
                  color: selected === cat.id ? '#1a73e8' : '#333',
                  backgroundColor: selected === cat.id ? '#f5f2ee' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}
                onClick={() => {
                  console.log('Category selected:', cat.id, cat.label)
                  onSelect(cat.id)
                  setOpen(false)
                }}
                onMouseEnter={(e) => {
                  if (selected !== cat.id) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {cat.label}
                {selected === cat.id && (
                  <span style={{marginLeft: '8px', color: '#1a73e8'}}>✓</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// FIX fetchItemsActivity FUNCTION
// ============================================================================
// Replace fungsi fetchItemsActivity yang ada (sekitar baris 434-468)

const fetchItemsActivity = async () => {
  try {
    console.log('🔍 Fetching items with category:', selectedCategory)
    
    // Fetch ALL items
    const items = await getInventory({per_page: 1000})
    console.log('📦 Total items fetched:', items.length)
    
    // Filter by category if not 'all'
    let filteredItems = items
    if (selectedCategory !== 'all') {
      const selectedCategoryData = categories.find(c => c.id === selectedCategory)
      console.log('🎯 Selected category data:', selectedCategoryData)
      
      if (selectedCategoryData) {
        // Try multiple ways to match category
        filteredItems = items.filter(item => {
          const itemCategory = item.category?.toLowerCase() || ''
          const selectedCatName = selectedCategoryData.label.toLowerCase()
          
          // Match by name or ID
          const matchByName = itemCategory === selectedCatName
          const matchById = item.category_id === selectedCategory
          
          return matchByName || matchById
        })
        
        console.log('✅ Filtered items:', filteredItems.length)
      }
    }
    
    // Sort based on active tab
    let sortedItems = [...filteredItems]
    if (activeTab === 'tercepat') {
      sortedItems.sort((a, b) => b.quantity - a.quantity)
    } else if (activeTab === 'terlama') {
      sortedItems.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateA - dateB // oldest first
      })
    } else {
      // 'terima' - most recent
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
      category: item.category
    }))

    console.log('📊 Final activities:', activities.length)
    setAllActivities(activities)
    setCurrentPage(1)
  } catch (error) {
    console.error('❌ Error fetching items activity:', error)
    setAllActivities([])
  }
}

// ============================================================================
// FIX STATE (Tambahkan 'terlama' tab)
// ============================================================================
// Ganti baris state activeTab menjadi:

const [activeTab, setActiveTab] = useState<'tercepat' | 'terima' | 'terlama'>('tercepat')

// ============================================================================
// TESTING CHECKLIST
// ============================================================================
/*
1. Open browser DevTools (F12) → Console tab
2. Refresh dashboard page
3. Look for logs:
   - "📦 Categories loaded:" → shows categories from API
   - "CategoryDropdown:" → shows dropdown state
4. Click category dropdown
5. Select a category
6. Check console for:
   - "🎯 Selected category data:"
   - "✅ Filtered items:"
   - "📊 Final activities:"
7. Verify table updates with filtered data
8. Try different categories
9. Try "Semua Kategori" to show all items again

COMMON ISSUES:
- If dropdown doesn't show: Check z-index (should be 9999)
- If filter doesn't work: Check category field name in API response
- If no data after filter: Category name might not match exactly
- If dropdown closes immediately: Check ref and click outside handler
*/
