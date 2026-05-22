# Fix Category Filter Dropdown - Dashboard

## Masalah
Dropdown kategori barang tidak muncul atau tidak berfungsi dengan baik.

## Solusi

### 1. Ganti fungsi `fetchItemsActivity` (baris ~434-468)

**Dari:**
```typescript
const fetchItemsActivity = async () => {
  try {
    const params: any = {per_page: 100}
    if (selectedCategory !== 'all') {
      params.category = selectedCategory
    }

    const items = await getInventory(params)
    
    // ... rest of code
  } catch (error) {
    console.error('Error fetching items activity:', error)
  }
}
```

**Menjadi:**
```typescript
const fetchItemsActivity = async () => {
  try {
    // Always fetch all items, filter in frontend for reliability
    const items = await getInventory({per_page: 1000})
    
    // Filter by category if not 'all'
    let filteredItems = items
    if (selectedCategory !== 'all') {
      // Find category name from ID
      const selectedCategoryData = categories.find(c => c.id === selectedCategory)
      if (selectedCategoryData) {
        filteredItems = items.filter(item => 
          item.category?.toLowerCase() === selectedCategoryData.label.toLowerCase()
        )
      }
    }
    
    // Sort based on active tab
    let sortedItems = [...filteredItems]
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
      category: item.category
    }))

    setAllActivities(activities)
    setCurrentPage(1) // Reset to first page
  } catch (error) {
    console.error('Error fetching items activity:', error)
    setAllActivities([])
  }
}
```

### 2. Pastikan useEffect dependency sudah benar (seharusnya sudah ada)

```typescript
useEffect(() => {
  fetchItemsActivity()
}, [activeTab, selectedCategory])
```

**PENTING:** Tambahkan `categories` sebagai dependency juga:

```typescript
useEffect(() => {
  if (categories.length > 0) {
    fetchItemsActivity()
  }
}, [activeTab, selectedCategory, categories])
```

### 3. Debug - Tambahkan console.log untuk tracking

Di dalam fungsi `fetchCategories`, tambahkan log:

```typescript
const fetchCategories = async () => {
  try {
    const categoriesData = await getCategories()
    console.log('📦 Categories loaded:', categoriesData)
    
    const categoryOptions: CategoryOption[] = [
      {id: 'all', label: 'Semua Kategori'},
      ...categoriesData.map(cat => ({
        id: cat.id,
        label: cat.name
      }))
    ]
    
    console.log('📦 Category options:', categoryOptions)
    setCategories(categoryOptions)
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}
```

Di dalam `CategoryDropdown` component, tambahkan log:

```typescript
const CategoryDropdown: FC<CategoryDropdownProps> = ({categories, selected, onSelect}) => {
  const [open, setOpen] = useState(false)
  
  console.log('🔽 Dropdown rendered with:', {
    categoriesCount: categories.length,
    selected,
    categories
  })
  
  // ... rest of code
```

### 4. Alternatif: Simplify dropdown jika tetap tidak muncul

Ganti CategoryDropdown dengan versi sederhana:

```typescript
const CategoryDropdown: FC<CategoryDropdownProps> = ({categories, selected, onSelect}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedLabel = categories.find((c) => c.id === selected)?.label ?? 'Pilih Kategori'

  return (
    <div ref={ref} style={{position: 'relative'}}>
      <button
        onClick={() => setOpen((o) => !o)}
        className='btn btn-light btn-sm d-flex align-items-center gap-2'
        style={{
          border: '1px solid #d9d4cf',
          borderRadius: '8px',
          minWidth: '140px',
          backgroundColor: '#fff'
        }}
      >
        <span style={{flex: 1, textAlign: 'left', fontSize: '13px'}}>{selectedLabel}</span>
        <KTIcon iconName='down' className='fs-7' />
      </button>

      {open && (
        <div
          className='bg-white shadow-sm rounded'
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 200,
            minWidth: '180px',
            border: '1px solid #ece8e4',
            padding: '6px 0',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className='px-3 py-2'
              style={{
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: selected === cat.id ? 600 : 400,
                color: selected === cat.id ? '#1a73e8' : '#6c757d',
                backgroundColor: selected === cat.id ? '#f5f2ee' : 'transparent',
              }}
              onClick={() => {
                console.log('Selected category:', cat.id, cat.label)
                onSelect(cat.id)
                setOpen(false)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = selected === cat.id ? '#f5f2ee' : 'transparent'
              }}
            >
              {cat.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## Testing Steps

1. Buka browser DevTools (F12)
2. Refresh halaman dashboard
3. Lihat console logs untuk:
   - `📦 Categories loaded:` - memastikan data kategori ter-load
   - `📦 Category options:` - memastikan options terbentuk
   - `🔽 Dropdown rendered with:` - memastikan dropdown menerima data
4. Click dropdown kategori
5. Pilih salah satu kategori
6. Check console log `Selected category:`
7. Lihat apakah table ter-filter

## Troubleshooting

### Dropdown tidak muncul sama sekali
- Check apakah `categories` array kosong
- Check z-index conflicts dengan elemen lain
- Check overflow hidden pada parent elements

### Dropdown muncul tapi kosong
- Check response dari `getCategories()` API
- Pastikan mapping `cat.id` dan `cat.name` sesuai dengan struktur data

### Filter tidak bekerja
- Check apakah `item.category` dari API match dengan `cat.name`
- Try case-insensitive comparison
- Log filtered results untuk debugging

### Kategori tidak match
- Backend mungkin return category dalam format berbeda
- Check exact field name: `item.category` vs `item.category_name` vs `item.categories.category_name`
- Adjust filter logic sesuai struktur data

## Alternative: Native Select (Fallback)

Jika dropdown custom tetap bermasalah, gunakan native select:

```tsx
<select
  value={selectedCategory}
  onChange={(e) => {
    setSelectedCategory(e.target.value)
    setCurrentPage(1)
  }}
  className='form-select form-select-sm'
  style={{
    border: '1px solid #d9d4cf',
    borderRadius: '8px',
    minWidth: '140px',
    fontSize: '13px'
  }}
>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.label}
    </option>
  ))}
</select>
```

Ini lebih sederhana dan reliable.
