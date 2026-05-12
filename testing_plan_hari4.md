# 🧪 Testing Plan - Hari 4 Implementation

> **Tanggal**: 8 Mei 2026  
> **Status**: Ready for Testing  
> **Environment**: Production (Vercel)

---

## 📋 **Infrastructure Status Check**

### ✅ **COMPLETED SETUP**
- [x] **GitHub**: Code pushed dengan clean state
- [x] **Supabase Database**: Schema arsip & search indexes
- [x] **Supabase Storage**: Bucket `division-archives` ready
- [x] **RLS Policies**: Security terkonfigurasi
- [x] **Environment Variables**: Sudah ada di production

---

## 🧪 **Kronologi Testing Case**

### **Phase 1: Arsip Dokumen Divisi**

#### **Test Case 1.1: Upload File**
**Scenario**: Staff upload file ke arsip divisi
**Steps**:
1. Login sebagai staff
2. Menu: Beranda → Arsip
3. Klik "Upload File"
4. Pilih file PDF/Excel (max 10MB)
5. Isi description
6. Submit

**Expected Result**:
- ✅ File berhasil upload
- ✅ Muncul di daftar arsip
- ✅ Metadata tersimpan (nama, size, uploader)
- ✅ File tersimpan di Supabase Storage

#### **Test Case 1.2: Download File**
**Scenario**: Staff download file dari arsip
**Steps**:
1. Klik icon download di daftar file
2. Verifikasi file terdownload

**Expected Result**:
- ✅ File berhasil download
- ✅ Signed URL berfungsi (60s expiry)
- ✅ Nama file sesuai

#### **Test Case 1.3: Delete File**
**Scenario**: Staff hapus file dari arsip
**Steps**:
1. Klik icon trash
2. Konfirmasi delete
3. Verify file hilang

**Expected Result**:
- ✅ File terhapus dari database
- ✅ File terhapus dari storage
- ✅ Daftar terupdate

#### **Test Case 1.4: Edit Description**
**Scenario**: Staff edit deskripsi file
**Steps**:
1. Klik icon edit
2. Ubah description
3. Save

**Expected Result**:
- ✅ Description terupdate
- ✅ Real-time update di UI

#### **Test Case 1.5: Direksi Access**
**Scenario**: Direksi akses arsip semua divisi
**Steps**:
1. Login sebagai direksi
2. Menu: Dashboard → Arsip
3. Browse semua file

**Expected Result**:
- ✅ Melihat file dari semua divisi
- ✅ Filter by division berfungsi
- ✅ Download/delete semua file

---

### **Phase 2: Search & Filter Laporan**

#### **Test Case 2.1: Basic Search**
**Scenario**: Staff cari laporan sendiri
**Steps**:
1. Menu: Beranda → Riwayat
2. Ketik keyword di search bar
3. Tekan Enter

**Expected Result**:
- ✅ Results muncul sesuai keyword
- ✅ Search di plan_notes & notes
- ✅ Real-time filtering

#### **Test Case 2.2: Date Filter**
**Scenario**: Filter laporan by date range
**Steps**:
1. Buka filter options
2. Pilih "Hari Ini"
3. Verify results

**Expected Result**:
- ✅ Hanya laporan hari ini
- ✅ Date range berfungsi
- ✅ Stats terupdate

#### **Test Case 2.3: Status Filter**
**Scenario**: Filter by status laporan
**Steps**:
1. Filter: Status → "Sudah Submit"
2. Verify results

**Expected Result**:
- ✅ Hanya laporan submitted
- ✅ Badge status correct
- ✅ Stats accurate

#### **Test Case 2.4: Advanced Search (Direksi)**
**Scenario**: Direksi search semua laporan staff
**Steps**:
1. Menu: Dashboard → Riwayat
2. Search by nama staff
3. Filter by division
4. Filter by status

**Expected Result**:
- ✅ Search by nama berfungsi
- ✅ Division filter berfungsi
- ✅ Combined filters work
- ✅ Export CSV available

#### **Test Case 2.5: Export CSV**
**Scenario**: Export hasil search ke CSV
**Steps**:
1. Apply filter/search
2. Klik "Export CSV"
3. Verify download

**Expected Result**:
- ✅ CSV terdownload
- ✅ Data sesuai filter
- ✅ Format CSV correct

#### **Test Case 2.6: Performance Test**
**Scenario**: Test search performance
**Steps**:
1. Search dengan complex query
2. Measure response time
3. Test pagination

**Expected Result**:
- ✅ Fast response (<2s)
- ✅ Indexes working
- ✅ No timeout errors

---

## 🚀 **Deployment Strategy**

### **Option A: Test di Vercel (Recommended)**
**Keuntungan**:
- Production environment
- Real user testing
- Auto-deploy dari GitHub

**Steps**:
```bash
# 1. Build production
npm run build

# 2. Push ke GitHub (auto-deploy)
git push origin main

# 3. Monitor deployment
# Buka Vercel dashboard
```

### **Option B: Test Lokal**
**Keuntungan**:
- Debug mudah
- Fast iteration
- No deploy time

**Steps**:
```bash
# 1. Install dependencies
npm install

# 2. Run development
npm run dev

# 3. Test di localhost:3000
```

---

## 📊 **Test Matrix**

| Feature | Staff Test | Direksi Test | Status |
|---------|------------|---------------|---------|
| Upload File | ✅ | ❌ | Ready |
| Download File | ✅ | ✅ | Ready |
| Delete File | ✅ | ✅ | Ready |
| Search Laporan | ✅ | ✅ | Ready |
| Filter Date | ✅ | ✅ | Ready |
| Filter Status | ✅ | ✅ | Ready |
| Export CSV | ✅ | ✅ | Ready |
| Performance | ⏳ | ⏳ | Ready |

---

## 🐛 **Known Issues & Solutions**

### **Issue 1: File Upload Timeout**
**Solution**: Increase Vercel function timeout
```javascript
// vercel.json
{
  "functions": {
    "src/app/api/upload/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### **Issue 2: Search Index Not Working**
**Solution**: Verify pg_trgm extension
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
```

### **Issue 3: RLS Policy Block**
**Solution**: Check user permissions
```sql
SELECT get_user_role(), get_user_division();
```

---

## 📋 **Test Checklist**

### **Pre-Test Checklist**
- [ ] Environment variables di Vercel
- [ ] Supabase connection working
- [ ] Storage bucket accessible
- [ ] Build successful

### **Post-Test Checklist**
- [ ] All test cases passed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Security working

---

## 🎯 **Success Criteria**

### **Phase 1 Success**
- ✅ Upload/download file smooth
- ✅ RLS permissions working
- ✅ Storage integration stable
- ✅ UI responsive and intuitive

### **Phase 2 Success**
- ✅ Search fast and accurate
- ✅ Filters working correctly
- ✅ Export CSV functional
- ✅ Performance optimized

### **Overall Success**
- ✅ No critical bugs
- ✅ User experience smooth
- ✅ Production ready
- ✅ Documentation complete

---

## 🚦 **Next Steps After Testing**

1. **Bug Fixes**: Address any issues found
2. **Phase 3**: Telegram Bot integration
3. **Polish**: UI/UX improvements
4. **Documentation**: User guide creation
5. **Monitoring**: Production monitoring setup
