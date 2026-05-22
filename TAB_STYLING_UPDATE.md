# Tab Styling Update - Unified Design System

## ✅ **Update Selesai!**

Styling tab **"Tercepat / Terlama"** (Items Activity) telah disamakan dengan **"Tertinggi / Terendah"** (Valuable Goods).

---

## 📊 **Before vs After**

### **BEFORE** ❌
```
┌─────────────────────────────────────┐
│ Items Activity                      │
├─────────────────────────────────────┤
│ ⚫ Tercepat  ⚪ Terlama  [dropdown]  │  ← Pill-style, dark (#4a4a4a)
│                                     │
│ 1. Item A          500              │
│ 2. Item B          300              │
└─────────────────────────────────────┘
```

**Style:**
- Type: **Individual pill buttons** (rounded separately)
- Border radius: `20px` each button
- Background (active): `#4a4a4a` (dark gray)
- Background (inactive): `#f0ebe6` (beige)
- Padding: `6px 16px`
- Font size: `13px`
- Gap between buttons: `8px`

---

### **AFTER** ✅
```
┌─────────────────────────────────────┐
│ Items Activity                      │
├─────────────────────────────────────┤
│ ┌─────────────────┐                │
│ │Tercepat│Terlama │ [dropdown]     │  ← Segmented control, blue (#5b8de8)
│ └─────────────────┘                │
│                                     │
│ 1. Item A          500              │
│ 2. Item B          300              │
└─────────────────────────────────────┘
```

**Style:**
- Type: **Segmented control** (single box with border)
- Border: `1px solid #e0dbd5`
- Border radius: `8px` (outer box only)
- Background (active): `#5b8de8` (blue)
- Background (inactive): `#fff` (white)
- Padding: `5px 14px` per button
- Font size: `12px`
- Text transform: `capitalize`
- Overflow: `hidden` (for clean edges)

---

## 🎨 **Consistent Design System**

### **Items Activity Tabs:**
```tsx
<div
  className='d-flex'
  style={{border: '1px solid #e0dbd5', borderRadius: '8px', overflow: 'hidden'}}
>
  {(['tercepat', 'terlama'] as const).map((tab) => (
    <button
      style={{
        backgroundColor: activeTab === tab ? '#5b8de8' : '#fff',
        color: activeTab === tab ? '#fff' : '#6c6c6c',
        padding: '5px 14px',
        fontSize: '12px',
        fontWeight: 600,
        // ...
      }}
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  ))}
</div>
```

### **Valuable Goods Tabs:**
```tsx
<div
  className='d-flex'
  style={{border: '1px solid #e0dbd5', borderRadius: '8px', overflow: 'hidden'}}
>
  {(['tertinggi', 'terendah'] as const).map((tab) => (
    <button
      style={{
        backgroundColor: activeValueTab === tab ? '#5b8de8' : '#fff',
        color: activeValueTab === tab ? '#fff' : '#6c6c6c',
        padding: '5px 14px',
        fontSize: '12px',
        fontWeight: 600,
        // ...
      }}
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  ))}
</div>
```

**Identical Properties:**
- ✅ Border: `1px solid #e0dbd5`
- ✅ Border radius: `8px`
- ✅ Active color: `#5b8de8` (blue)
- ✅ Inactive color: `#fff` (white)
- ✅ Text color (active): `#fff`
- ✅ Text color (inactive): `#6c6c6c`
- ✅ Padding: `5px 14px`
- ✅ Font size: `12px`
- ✅ Font weight: `600`
- ✅ Transition: `all 0.2s`
- ✅ Text transform: `capitalize`

---

## 🎯 **Visual Comparison**

### **Tab States:**

#### **Inactive State:**
```
┌──────────────────┐
│ Tercepat │Terlama│  ← White bg, gray text (#6c6c6c)
└──────────────────┘
```

#### **Active State - Tercepat:**
```
┌──────────────────┐
│ Tercepat │Terlama│  ← Blue bg (#5b8de8), white text
└──────────────────┘
```

#### **Active State - Terlama:**
```
┌──────────────────┐
│ Tercepat │Terlama│  ← Blue bg (#5b8de8), white text
└──────────────────┘
```

---

## 📁 **Changes Summary**

### **File Modified:**
```
src/app/pages/dashboard/DashboardWrapper.tsx
```

### **Lines Changed:**
- **Line 767-800**: Tab bar styling untuk Items Activity

### **Before Code:**
```tsx
<button
  onClick={() => {
    setActiveTab('tercepat')
    setCurrentPage(1)
  }}
  style={{
    border: 'none',
    borderRadius: '20px',        // ← Individual rounded
    padding: '6px 16px',
    fontSize: '13px',
    backgroundColor: activeTab === 'tercepat' ? '#4a4a4a' : '#f0ebe6',  // ← Dark theme
    color: activeTab === 'tercepat' ? '#fff' : '#6c6c6c',
  }}
>
  Tercepat
</button>
```

### **After Code:**
```tsx
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
        backgroundColor: activeTab === tab ? '#5b8de8' : '#fff',  // ← Blue theme
        color: activeTab === tab ? '#fff' : '#6c6c6c',
        transition: 'all 0.2s',
        textTransform: 'capitalize',
      }}
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  ))}
</div>
```

---

## 🔍 **Key Improvements**

### **1. Visual Consistency**
- ✅ Both tab groups now use identical segmented control design
- ✅ Same blue accent color (#5b8de8) across dashboard
- ✅ Same border styling (#e0dbd5)
- ✅ Same typography (12px, weight 600)

### **2. Code Consistency**
- ✅ DRY principle: Using `.map()` instead of duplicate buttons
- ✅ Type safety: `as const` for tab values
- ✅ Cleaner code: Single container with overflow hidden

### **3. UX Consistency**
- ✅ Users see familiar pattern in both cards
- ✅ Easier to understand active/inactive states
- ✅ Better visual hierarchy with blue accent

---

## 🧪 **Testing Checklist**

### **Visual Tests:**
- [ ] Tab border displays correctly (#e0dbd5)
- [ ] Border radius is 8px on outer container
- [ ] Active tab has blue background (#5b8de8)
- [ ] Inactive tab has white background
- [ ] Text color switches correctly (white/gray)
- [ ] No gap between buttons (seamless segmented control)
- [ ] Smooth transition animation (0.2s)

### **Functional Tests:**
- [ ] Click "Tercepat" → activeTab changes, page resets to 1
- [ ] Click "Terlama" → activeTab changes, page resets to 1
- [ ] Data filters correctly based on selected tab
- [ ] State persists when interacting with other elements

### **Responsive Tests:**
- [ ] Desktop (≥992px): Tabs display correctly
- [ ] Tablet (768px-991px): Tabs don't break
- [ ] Mobile (<768px): Tabs remain usable with flex-wrap

### **Cross-Browser Tests:**
- [ ] Chrome/Edge: Rendering correct
- [ ] Firefox: Rendering correct
- [ ] Safari: Rendering correct

---

## 🎨 **Design Tokens Reference**

### **Colors:**
```css
--tab-active-bg: #5b8de8;      /* Blue accent */
--tab-inactive-bg: #fff;       /* White */
--tab-border: #e0dbd5;         /* Light brown-gray */
--tab-text-active: #fff;       /* White */
--tab-text-inactive: #6c6c6c;  /* Gray */
```

### **Spacing:**
```css
--tab-padding: 5px 14px;       /* Vertical | Horizontal */
--tab-border-radius: 8px;      /* Outer container */
--tab-gap: 0;                  /* No gap between buttons */
```

### **Typography:**
```css
--tab-font-size: 12px;
--tab-font-weight: 600;
--tab-text-transform: capitalize;
```

### **Animation:**
```css
--tab-transition: all 0.2s;
```

---

## 📸 **Screenshots Reference**

### **Items Activity - New Style:**
```
┌───────────────────────────────────────────┐
│ Items Activity               Kategori     │
│                                            │
│ ┌──────────────────┐  ┌────────┐   Stok  │
│ │ Tercepat │Terlama│  │Kategori▼│         │
│ └──────────────────┘  └────────┘          │
│                                            │
│ 1  Kain Batik Solo          500           │
│ 2  Kain Songket Palembang   300           │
│ 3  Kain Tenun Flores        200           │
└───────────────────────────────────────────┘
```

### **Valuable Goods - Existing Style:**
```
┌───────────────────────────────────────────┐
│ Valuable Goods      ┌──────────────────┐  │
│ Nilai Barang        │Tertinggi│Terendah│  │
│                     └──────────────────┘  │
│                                            │
│  [Pie]  │  Top 5 Nilai Barang             │
│  Chart  │  • Kain Motif A                 │
│         │  • Kain Motif B                 │
└───────────────────────────────────────────┘
```

**Both now share identical tab styling!** ✨

---

## 🚀 **Next Steps (Optional)**

### **Future Enhancements:**
1. **Hover Effects:**
   ```tsx
   '&:hover': {
     backgroundColor: activeTab === tab ? '#4a7ed1' : '#f5f5f5',
   }
   ```

2. **Focus States:**
   ```tsx
   '&:focus': {
     outline: '2px solid #5b8de8',
     outlineOffset: '2px',
   }
   ```

3. **Disabled States:**
   ```tsx
   disabled: loading,
   opacity: loading ? 0.5 : 1,
   cursor: loading ? 'not-allowed' : 'pointer',
   ```

4. **Icon Support:**
   ```tsx
   <KTIcon iconName='chart-line' className='fs-7' />
   {tab.charAt(0).toUpperCase() + tab.slice(1)}
   ```

---

**Status:** ✅ **Complete**  
**Date:** 2026-04-05  
**Impact:** Visual consistency across dashboard tabs  
**Breaking Changes:** None (purely visual update)
