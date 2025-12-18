# 📋 User Acceptance Testing (UAT) - Fashion Industry Management System

**Project:** SIM Fashion Industry  
**Environment:** Development  
**Date:** ___________________  
**Tester:** ___________________  
**Version:** v1.0

---

## 🎯 Objective

Melakukan pengujian sistem untuk memastikan semua fitur berfungsi sesuai requirement dan siap untuk production.

---

## ⚙️ Pre-Test Setup

### Environment Check

- [ ] Backend (Laravel) running di: `http://localhost:8000`
- [ ] Frontend (React) running di: `http://localhost:3011`
- [ ] Dev Mode enabled (`VITE_DEV_MODE=true`)
- [ ] Database terkoneksi dan ter-seed
- [ ] Browser: Chrome/Firefox/Edge (latest version)

### Login Credentials

**Development Mode (Quick Login):**
```javascript
// Browser Console (F12):
quickLoginAsSuperAdmin()
```

**Normal Login (jika dev mode disabled):**
- Username: ___________________
- Password: ___________________
- Role: ___________________

---

## 🧪 Test Cases

### 1. Authentication & Authorization

#### 1.1 Login Process
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 1.1.1 | Login dengan Quick Login | 1. Buka Console (F12)<br>2. Ketik: `quickLoginAsSuperAdmin()` | - Redirect ke dashboard<br>- User terlogin sebagai Super Admin | ⬜ Pass<br>⬜ Fail | |
| 1.1.2 | Login Normal (credentials) | 1. Input username<br>2. Input password<br>3. Click Login | - Berhasil login<br>- Redirect ke dashboard | ⬜ Pass<br>⬜ Fail | |
| 1.1.3 | Login dengan credentials salah | 1. Input wrong credentials<br>2. Click Login | - Tampil error message<br>- Tidak redirect | ⬜ Pass<br>⬜ Fail | |
| 1.1.4 | Logout | 1. Click user menu<br>2. Click Logout | - Berhasil logout<br>- Redirect ke login page<br>- Session cleared | ⬜ Pass<br>⬜ Fail | |

#### 1.2 Permission & Access Control
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 1.2.1 | Dev Mode - Access All Pages | 1. Login as any user<br>2. Navigate semua menu | - Semua menu accessible<br>- No permission error | ⬜ Pass<br>⬜ Fail | Dev mode only |
| 1.2.2 | Super Admin Access | 1. Login as Super Admin<br>2. Check all menus | - Can access all features<br>- User Management visible<br>- Log System visible | ⬜ Pass<br>⬜ Fail | |
| 1.2.3 | Regular Admin Access | 1. Login as Admin<br>2. Check menus | - Can access assigned features<br>- Restricted features hidden/disabled | ⬜ Pass<br>⬜ Fail | Production only |

---

### 2. Dashboard

| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 2.1 | Dashboard Loading | 1. Login<br>2. Observe dashboard | - Dashboard loads < 3 seconds<br>- No console errors<br>- All widgets display | ⬜ Pass<br>⬜ Fail | |
| 2.2 | Statistics Widgets | 1. Check statistics cards | - Total Inventory count<br>- Low Stock alerts<br>- Recent activities | ⬜ Pass<br>⬜ Fail | |
| 2.3 | Charts & Graphs | 1. Check visualization | - Charts render correctly<br>- Data accurate<br>- Interactive (hover/click) | ⬜ Pass<br>⬜ Fail | |
| 2.4 | Recent Transactions | 1. Check transaction list | - Shows recent 10 transactions<br>- Sorted by date (newest first) | ⬜ Pass<br>⬜ Fail | |

---

### 3. Inventory Management

#### 3.1 View Inventory
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 3.1.1 | List All Items | 1. Navigate to Inventory<br>2. Observe item list | - All items displayed<br>- Pagination works<br>- Shows: Name, Category, Stock, Price | ⬜ Pass<br>⬜ Fail | |
| 3.1.2 | Search Inventory | 1. Input keyword in search<br>2. Click Search | - Filtered results appear<br>- Search by: Name, SKU, Category | ⬜ Pass<br>⬜ Fail | |
| 3.1.3 | Filter by Category | 1. Select category filter<br>2. Apply filter | - Shows items in selected category only | ⬜ Pass<br>⬜ Fail | |
| 3.1.4 | Filter by Stock Status | 1. Select "Low Stock"<br>2. Apply filter | - Shows items below minimum stock | ⬜ Pass<br>⬜ Fail | |
| 3.1.5 | Sorting | 1. Click column header (Name, Stock, Price)<br>2. Observe order | - Items sorted ascending/descending | ⬜ Pass<br>⬜ Fail | |
| 3.1.6 | Pagination | 1. Navigate to page 2<br>2. Change items per page | - Pagination functional<br>- Correct item count | ⬜ Pass<br>⬜ Fail | |

#### 3.2 Create Inventory
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 3.2.1 | Create Valid Item | 1. Click "Add New Item"<br>2. Fill all required fields<br>3. Upload image (optional)<br>4. Click Save | - Item created successfully<br>- Success notification<br>- Redirected to list/detail<br>- New item appears in list | ⬜ Pass<br>⬜ Fail | |
| 3.2.2 | Create - Missing Required Fields | 1. Click "Add New Item"<br>2. Leave required fields empty<br>3. Click Save | - Validation errors shown<br>- Form not submitted<br>- Error indicators on fields | ⬜ Pass<br>⬜ Fail | |
| 3.2.3 | Create - Invalid Data | 1. Input negative stock<br>2. Input invalid price<br>3. Click Save | - Validation errors<br>- "Stock must be positive"<br>- "Price must be > 0" | ⬜ Pass<br>⬜ Fail | |
| 3.2.4 | Create - Duplicate SKU | 1. Input existing SKU<br>2. Click Save | - Error: "SKU already exists" | ⬜ Pass<br>⬜ Fail | |
| 3.2.5 | Create - Image Upload | 1. Upload image (valid format)<br>2. Save item | - Image uploaded<br>- Preview displayed<br>- Image accessible in detail | ⬜ Pass<br>⬜ Fail | |

#### 3.3 Edit Inventory
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 3.3.1 | Edit Item Details | 1. Click Edit on an item<br>2. Modify fields<br>3. Save changes | - Changes saved<br>- Success notification<br>- Updated data in list | ⬜ Pass<br>⬜ Fail | |
| 3.3.2 | Edit - Update Stock | 1. Click Edit<br>2. Change stock quantity<br>3. Save | - Stock updated<br>- History recorded | ⬜ Pass<br>⬜ Fail | |
| 3.3.3 | Edit - Change Image | 1. Click Edit<br>2. Upload new image<br>3. Save | - New image replaced old one<br>- Old image deleted (if applicable) | ⬜ Pass<br>⬜ Fail | |

#### 3.4 Delete Inventory
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 3.4.1 | Delete Single Item | 1. Click Delete<br>2. Confirm deletion | - Confirmation dialog appears<br>- Item deleted after confirm<br>- Removed from list | ⬜ Pass<br>⬜ Fail | |
| 3.4.2 | Delete - Cancel | 1. Click Delete<br>2. Click Cancel | - Item NOT deleted<br>- Still in list | ⬜ Pass<br>⬜ Fail | |
| 3.4.3 | Delete - With Dependencies | 1. Try delete item in active transaction | - Error/Warning shown<br>- Prevent deletion or confirm cascade | ⬜ Pass<br>⬜ Fail | |

#### 3.5 Item Detail View
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 3.5.1 | View Item Details | 1. Click item name/detail button | - Modal/page opens<br>- Shows: Name, SKU, Category, Stock, Price, Description, Image, Supplier | ⬜ Pass<br>⬜ Fail | |
| 3.5.2 | View Stock History | 1. Open item detail<br>2. Check history tab | - Shows stock in/out history<br>- Date, quantity, type, user | ⬜ Pass<br>⬜ Fail | |

---

### 4. Supplier Management

#### 4.1 View Suppliers
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 4.1.1 | List All Suppliers | 1. Navigate to Suppliers | - All suppliers displayed<br>- Shows: Name, Contact, Email, Phone | ⬜ Pass<br>⬜ Fail | |
| 4.1.2 | Search Suppliers | 1. Input keyword<br>2. Search | - Filtered results by name/contact | ⬜ Pass<br>⬜ Fail | |

#### 4.2 CRUD Operations
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 4.2.1 | Add Supplier | 1. Click "Add Supplier"<br>2. Fill form<br>3. Save | - Supplier created<br>- Success message | ⬜ Pass<br>⬜ Fail | |
| 4.2.2 | Edit Supplier | 1. Edit supplier data<br>2. Save | - Data updated successfully | ⬜ Pass<br>⬜ Fail | |
| 4.2.3 | Delete Supplier | 1. Delete supplier<br>2. Confirm | - Supplier deleted<br>- Or warning if has items | ⬜ Pass<br>⬜ Fail | |
| 4.2.4 | View Supplier Items | 1. Click supplier detail<br>2. View items from this supplier | - List items supplied by this supplier | ⬜ Pass<br>⬜ Fail | |

---

### 5. Category Management

| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 5.1 | List Categories | Navigate to Categories | - All categories shown | ⬜ Pass<br>⬜ Fail | |
| 5.2 | Add Category | 1. Add new category<br>2. Save | - Category created | ⬜ Pass<br>⬜ Fail | |
| 5.3 | Edit Category | 1. Edit category name<br>2. Save | - Name updated | ⬜ Pass<br>⬜ Fail | |
| 5.4 | Delete Category | 1. Delete unused category<br>2. Confirm | - Category deleted | ⬜ Pass<br>⬜ Fail | |
| 5.5 | Delete Category with Items | Try delete category with items | - Warning/Error shown<br>- Prevent deletion or reassign items | ⬜ Pass<br>⬜ Fail | |

---

### 6. Material Management

| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 6.1 | List Materials | Navigate to Materials | - All materials shown | ⬜ Pass<br>⬜ Fail | |
| 6.2 | Add Material | 1. Add new material<br>2. Set properties<br>3. Save | - Material created | ⬜ Pass<br>⬜ Fail | |
| 6.3 | Edit Material | Edit and save | - Updated successfully | ⬜ Pass<br>⬜ Fail | |
| 6.4 | Delete Material | Delete material | - Material deleted | ⬜ Pass<br>⬜ Fail | |

---

### 7. User Management (Super Admin Only)

#### 7.1 User List
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 7.1.1 | View All Users | Navigate to User Management | - Shows all users<br>- Display: Name, Email, Role, Status | ⬜ Pass<br>⬜ Fail | Super Admin only |
| 7.1.2 | Search Users | Search by name/email | - Filtered results | ⬜ Pass<br>⬜ Fail | |
| 7.1.3 | Filter by Role | Filter by Super Admin/Admin/Staff | - Shows users of selected role | ⬜ Pass<br>⬜ Fail | |

#### 7.2 User CRUD
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 7.2.1 | Create User | 1. Add new user<br>2. Fill details<br>3. Assign role<br>4. Save | - User created<br>- Email sent (if configured)<br>- Can login | ⬜ Pass<br>⬜ Fail | |
| 7.2.2 | Edit User | 1. Edit user details<br>2. Change role<br>3. Save | - User updated<br>- Role changed | ⬜ Pass<br>⬜ Fail | |
| 7.2.3 | Deactivate User | 1. Deactivate user account | - User status: inactive<br>- Cannot login | ⬜ Pass<br>⬜ Fail | |
| 7.2.4 | Delete User | 1. Delete user<br>2. Confirm | - User deleted or soft-deleted | ⬜ Pass<br>⬜ Fail | |

#### 7.3 Permission Management
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 7.3.1 | Assign Permissions | 1. Edit user<br>2. Select permissions<br>3. Save | - Permissions saved<br>- User can access granted features | ⬜ Pass<br>⬜ Fail | |
| 7.3.2 | Remove Permissions | 1. Uncheck permissions<br>2. Save | - Access revoked immediately | ⬜ Pass<br>⬜ Fail | |

---

### 8. History/Transaction Log

| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 8.1 | View History | Navigate to History | - Shows all transactions<br>- Date, Type, User, Item, Quantity | ⬜ Pass<br>⬜ Fail | |
| 8.2 | Filter by Date | 1. Select date range<br>2. Apply filter | - Shows transactions in range | ⬜ Pass<br>⬜ Fail | |
| 8.3 | Filter by Type | Filter by: Stock In/Out/Adjustment | - Shows selected transaction type | ⬜ Pass<br>⬜ Fail | |
| 8.4 | Filter by User | Select user from dropdown | - Shows that user's transactions | ⬜ Pass<br>⬜ Fail | |
| 8.5 | Search History | Search by item name/SKU | - Filtered results | ⬜ Pass<br>⬜ Fail | |
| 8.6 | Export History | 1. Click Export<br>2. Select format (Excel/PDF) | - File downloaded<br>- Contains filtered data | ⬜ Pass<br>⬜ Fail | |

---

### 9. System Logs (Super Admin Only)

| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 9.1 | View System Logs | Navigate to Log System | - Shows all system logs<br>- Timestamp, Level, Message, User | ⬜ Pass<br>⬜ Fail | Super Admin only |
| 9.2 | Filter by Level | Filter: Info/Warning/Error | - Shows logs of selected level | ⬜ Pass<br>⬜ Fail | |
| 9.3 | Filter by Date | Select date range | - Shows logs in range | ⬜ Pass<br>⬜ Fail | |
| 9.4 | Search Logs | Search by keyword | - Filtered log results | ⬜ Pass<br>⬜ Fail | |
| 9.5 | View Log Detail | Click log entry | - Shows full log details<br>- Stack trace (if error) | ⬜ Pass<br>⬜ Fail | |

---

### 10. UI/UX Testing

#### 10.1 Responsiveness
| No | Test Case | Device/Resolution | Expected Result | Status | Notes |
|----|-----------|-------------------|----------------|--------|-------|
| 10.1.1 | Desktop (1920x1080) | Test all pages | - Layout proper<br>- All elements visible | ⬜ Pass<br>⬜ Fail | |
| 10.1.2 | Laptop (1366x768) | Test all pages | - Responsive layout<br>- No horizontal scroll | ⬜ Pass<br>⬜ Fail | |
| 10.1.3 | Tablet (768px) | Test all pages | - Mobile menu appears<br>- Touch-friendly | ⬜ Pass<br>⬜ Fail | |
| 10.1.4 | Mobile (375px) | Test critical features | - Stacked layout<br>- Readable text<br>- Accessible buttons | ⬜ Pass<br>⬜ Fail | |

#### 10.2 Navigation
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 10.2.1 | Sidebar Menu | 1. Click menu items<br>2. Expand/collapse submenus | - Smooth transitions<br>- Active state highlighted | ⬜ Pass<br>⬜ Fail | |
| 10.2.2 | Breadcrumb | Navigate deep pages | - Breadcrumb updates<br>- Clickable links work | ⬜ Pass<br>⬜ Fail | |
| 10.2.3 | Back Button | Use browser back button | - Previous page loads correctly<br>- No broken state | ⬜ Pass<br>⬜ Fail | |

#### 10.3 Forms & Validation
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 10.3.1 | Required Fields | Leave required empty and submit | - Red indicators<br>- Helpful error messages | ⬜ Pass<br>⬜ Fail | |
| 10.3.2 | Input Validation | Input invalid formats (email, phone, number) | - Real-time validation<br>- Clear error messages | ⬜ Pass<br>⬜ Fail | |
| 10.3.3 | Success Feedback | Submit valid form | - Success notification<br>- Clear confirmation | ⬜ Pass<br>⬜ Fail | |

#### 10.4 Loading States
| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 10.4.1 | Page Loading | Navigate between pages | - Loading spinner/skeleton<br>- No flash of unstyled content | ⬜ Pass<br>⬜ Fail | |
| 10.4.2 | API Loading | Submit form/fetch data | - Loading indicator<br>- Disabled submit during load | ⬜ Pass<br>⬜ Fail | |
| 10.4.3 | Image Loading | Load pages with images | - Placeholder while loading<br>- Smooth fade-in | ⬜ Pass<br>⬜ Fail | |

---

### 11. Performance Testing

| No | Test Case | Metric | Expected | Actual | Status | Notes |
|----|-----------|--------|----------|--------|--------|-------|
| 11.1 | Page Load Time | Dashboard | < 3 seconds | _____ | ⬜ Pass<br>⬜ Fail | |
| 11.2 | API Response | GET inventory list (100 items) | < 1 second | _____ | ⬜ Pass<br>⬜ Fail | |
| 11.3 | Form Submission | Create new item | < 2 seconds | _____ | ⬜ Pass<br>⬜ Fail | |
| 11.4 | Search Performance | Search inventory (1000+ items) | < 500ms | _____ | ⬜ Pass<br>⬜ Fail | |
| 11.5 | Image Upload | Upload 5MB image | < 5 seconds | _____ | ⬜ Pass<br>⬜ Fail | |

---

### 12. Security Testing

| No | Test Case | Steps | Expected Result | Status | Notes |
|----|-----------|-------|----------------|--------|-------|
| 12.1 | XSS Prevention | Input `<script>alert('XSS')</script>` in form | - Script not executed<br>- Escaped in display | ⬜ Pass<br>⬜ Fail | |
| 12.2 | SQL Injection | Input `'; DROP TABLE users; --` | - Query safe<br>- No database error | ⬜ Pass<br>⬜ Fail | Backend test |
| 12.3 | CSRF Protection | Submit form without CSRF token | - Request rejected | ⬜ Pass<br>⬜ Fail | Backend test |
| 12.4 | Unauthorized Access | 1. Logout<br>2. Try access protected URL directly | - Redirected to login<br>- No data exposed | ⬜ Pass<br>⬜ Fail | |
| 12.5 | Token Expiration | 1. Let token expire<br>2. Make API request | - Auto logout<br>- Redirect to login | ⬜ Pass<br>⬜ Fail | |

---

### 13. Browser Compatibility

| Browser | Version | Dashboard | Inventory | Forms | Status | Notes |
|---------|---------|-----------|-----------|-------|--------|-------|
| Chrome | Latest | ⬜ | ⬜ | ⬜ | ⬜ Pass<br>⬜ Fail | |
| Firefox | Latest | ⬜ | ⬜ | ⬜ | ⬜ Pass<br>⬜ Fail | |
| Edge | Latest | ⬜ | ⬜ | ⬜ | ⬜ Pass<br>⬜ Fail | |
| Safari | Latest | ⬜ | ⬜ | ⬜ | ⬜ Pass<br>⬜ Fail | Mac only |

---

## 🐛 Bug Report Template

Jika menemukan bug, gunakan format ini:

```markdown
### Bug #___: [Title]

**Severity:** ⬜ Critical | ⬜ High | ⬜ Medium | ⬜ Low

**Module:** _____________

**Description:**
[Jelaskan bug yang ditemukan]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[Apa yang seharusnya terjadi]

**Actual Result:**
[Apa yang sebenarnya terjadi]

**Screenshots:**
[Attach screenshot jika ada]

**Environment:**
- Browser: _____________
- OS: _____________
- Screen Resolution: _____________

**Console Errors:**
```
[Paste console errors from F12]
```

**Additional Notes:**
[Informasi tambahan]
```

---

## 📊 Test Summary

### Overall Statistics

- **Total Test Cases:** _____ / _____
- **Passed:** _____ (____%)
- **Failed:** _____ (____%)
- **Not Tested:** _____ (____%)

### Critical Issues Found

| # | Module | Issue | Severity | Status |
|---|--------|-------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Sign-off

**Tester:**

Name: _____________________  
Signature: _____________________  
Date: _____________________

**Project Manager:**

Name: _____________________  
Signature: _____________________  
Date: _____________________

---

**Test Completion Date:** ___________________  
**Status:** ⬜ Approved | ⬜ Approved with Conditions | ⬜ Rejected

**Next Actions:**
- [ ] Fix critical bugs
- [ ] Re-test failed cases
- [ ] Deploy to staging
- [ ] Final approval
- [ ] Production deployment
