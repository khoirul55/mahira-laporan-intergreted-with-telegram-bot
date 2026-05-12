# 📋 Flow Lengkap Fitur Mahira Tour App
> **Version**: 1.0.0  
> **Last Updated**: 11 Mei 2026  
> **Status**: Phase 1 & 2 Complete - Ready for Testing

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                MAHIRA TOUR APP ARCHITECTURE         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 16.2.4)                        │
│  ├── Authentication (Supabase Auth)                   │
│  ├── UI Components (shadcn/ui + TailwindCSS)         │
│  └── Client/Server Components                       │
│                                                       │
│  Backend (Supabase)                                  │
│  ├── PostgreSQL Database                                │
│  ├── Authentication Service                             │
│  ├── File Storage Service                              │
│  └── RLS Security Policies                             │
│                                                       │
│  Integration                                           │
│  ├── Telegram Bot API (Phase 3)                      │
│  └── Vercel Hosting                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Core Features**

### **1. Authentication & Authorization**

#### **🔐 Login System**
- **Flow**: Login → Authentication → Role-based Redirect
- **Pages**: `/login`
- **Roles**: `staff`, `direksi`
- **Security**: Supabase Auth with JWT tokens

#### **👥 User Management**
- **Staff Registration**: CRUD oleh Direksi
- **Profile Management**: Update data diri
- **Role Assignment**: Staff vs Direksi permissions
- **Division Assignment**: Setiap staff ke divisi tertentu

#### **🔒 Security Features**
- **RLS Policies**: Row Level Security di database
- **Session Management**: Auto-logout session expired
- **API Protection**: Middleware authentication
- **Permission Control**: Akses berdasarkan role

---

### **2. Daily Reporting System**

#### **📝 Morning: Planning**
- **Flow**: Login → Beranda → Buat Rencana
- **Page**: `/beranda/laporan`
- **Features**:
  - Input rencana kerja harian
  - Auto-save sebagai draft
  - Timestamp tracking
  - Division-based visibility

#### **📊 Evening: Reporting**
- **Flow**: Login → Beranda → Update Laporan
- **Features**:
  - Update catatan sore hari
  - Upload bukti foto (max 5MB)
  - Submit final report
  - Status tracking (draft → submitted)

#### **👁️ Direksi Monitoring**
- **Flow**: Login → Dashboard → Pantau Laporan
- **Page**: `/dashboard/laporan`
- **Features**:
  - Real-time monitoring semua staff
  - Status indicators (belum buat, draft, submitted)
  - Quick access ke detail laporan
  - Filter by date dan status

#### **💬 Feedback System**
- **Feature**: Direksi bisa beri feedback
- **Flow**: Detail laporan → Add feedback
- **Benefits**:
  - Performance review
  - Improvement suggestions
  - Historical tracking

---

### **3. Absence Management**

#### **📅 Leave Request**
- **Flow**: Beranda → Izin → Ajukan
- **Page**: `/beranda/izin`
- **Types**: `sakit`, `cuti`, `izin`, `lainnya`
- **Features**:
  - Date picker untuk rentang izin
  - Reason input
  - File attachment (bukti)
  - Status tracking (pending → approved/rejected)

#### **👀 Direksi Approval**
- **Flow**: Dashboard → Absences → Review
- **Page**: `/dashboard/absences`
- **Features**:
  - List semua permintaan izin
  - Quick approve/reject
  - Filter by status dan date
  - Email notifications (future)

---

### **4. Announcement System**

#### **📢 Create Announcement**
- **Flow**: Dashboard → Pengumuman → Buat
- **Page**: `/dashboard/pengumuman`
- **Features**:
  - Rich text editor
  - Target audience (all/specific division)
  - Priority levels (normal/urgent)
  - Schedule posting
  - File attachment

#### **📋 View Announcements**
- **Flow**: Beranda → Pengumuman
- **Page**: `/beranda/pengumuman`
- **Features**:
  - Filter by division
  - Search functionality
  - Read/unread status
  - Archive old announcements

---

## 🆕 **Phase 1: Document Archive System**

### **📁 File Management**

#### **📤 Upload Files**
- **Flow**: Beranda/Dashboard → Arsip → Upload
- **Pages**: 
  - Staff: `/beranda/arsip`
  - Direksi: `/dashboard/arsip`
- **Features**:
  - Drag & drop upload
  - Multiple file selection
  - File validation (max 10MB)
  - Allowed types: PDF, Excel, Word, Image
  - Progress indicators
  - Description metadata

#### **📥 Download Files**
- **Security**: Signed URLs dengan expiry (60s)
- **Features**:
  - One-click download
  - Original filename preserved
  - Download tracking
  - Security via RLS policies

#### **🗑️ File Operations**
- **Delete**: Hapus file + storage cleanup
- **Edit**: Update description metadata
- **Search**: Real-time search dalam arsip
- **Filter**: By date, type, division

#### **📊 Archive Statistics**
- **Staff View**: Hanya divisi sendiri
- **Direksi View**: Semua divisi
- **Metrics**:
  - Total files per divisi
  - Total storage usage
  - Files uploaded today
  - Active divisions count

---

## 🔍 **Phase 2: Search & Filter System**

### **🔍 Universal Search Component**

#### **📝 Search Bar**
- **Component**: `SearchBar` (reusable)
- **Features**:
  - Real-time search dengan debouncing
  - Multiple filter combinations
  - Active filter indicators
  - Clear all filters
  - Responsive design

#### **🎛️ Filter Options**
- **Date Filter**: 
  - Presets: Hari ini, kemarin, minggu ini, bulan ini
  - Custom range picker
  - Relative date calculations
- **Status Filter**: Submitted, Draft, Plan Only, Overdue
- **Division Filter**: Filter per divisi (direksi only)
- **File Type Filter**: PDF, Excel, Word, Image, Other

### **📊 Report Search**

#### **👤 Staff Search**
- **Page**: `/beranda/riwayat`
- **Scope**: Hanya laporan sendiri
- **Features**:
  - Search di plan notes & catatan
  - Filter by status dan date
  - Export personal reports ke CSV
  - Statistics dashboard

#### **👥 Direksi Search**
- **Page**: `/dashboard/riwayat`
- **Scope**: Semua laporan staff
- **Features**:
  - Search by nama staff, division, content
  - Advanced filter combinations
  - Division summary statistics
  - Export all reports ke CSV
  - Performance metrics per division

#### **📈 Search Performance**
- **Database Indexes**: Full-text search dengan Indonesian language
- **Optimization**: Trigram indexes untuk name search
- **Caching**: Real-time stats dengan useMemo
- **Speed**: Response time <2s target

---

## 📱 **UI/UX Features**

### **🎨 Design System**
- **Framework**: TailwindCSS v4
- **Components**: shadcn/ui component library
- **Theme**: Consistent color scheme
- **Icons**: Lucide React icons
- **Typography**: Geist font family

### **📱 Responsive Design**
- **Desktop**: Full feature availability
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly interfaces
- **Adaptive**: Breakpoint-based design

### **⚡ Performance Features**
- **Loading States**: Skeleton loaders
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: Real-time feedback
- **Progress Indicators**: Upload/download progress
- **Infinite Scroll**: Untuk large datasets

### **🔄 Real-time Updates**
- **Live Search**: Debounced input handling
- **Auto-refresh**: Periodic data updates
- **Optimistic Updates**: Immediate UI feedback
- **Conflict Resolution**: Handle concurrent edits

---

## 🔧 **Technical Features**

### **🗄️ Database Schema**

#### **Core Tables**
```sql
users (id, email, full_name, role, division_id, is_active)
divisions (id, name, description)
daily_reports (id, user_id, report_date, plan_notes, notes, status, direksi_notes, evidence_url)
absences (id, user_id, absence_date, type, reason, status)
announcements (id, title, content, target_division_id, created_by, priority)
division_files (id, division_id, uploaded_by, filename, file_path, file_size, file_type, description)
```

#### **Security Features**
- **RLS Policies**: Row Level Security
- **JWT Tokens**: Secure authentication
- **API Keys**: Environment-based secrets
- **Input Validation**: Type checking & sanitization

### **🗃️ File Storage**
- **Provider**: Supabase Storage
- **Buckets**: 
  - `report_evidences` (bukti laporan)
  - `division-archives` (arsip dokumen)
- **Security**: Signed URLs dengan expiry
- **Validation**: File type & size limits

### **🚀 Performance Optimization**
- **Database Indexes**: Search & filter optimization
- **Caching Strategy**: React memoization
- **Bundle Optimization**: Next.js production build
- **Image Optimization**: Compression & webp support

---

## 🔗 **Integration Features**

### **🤖 Phase 3: Telegram Bot**
- **Notifications**: Daily report reminders
- **Commands**: /status, /reports, /help
- **Groups**: Division-specific notifications
- **Automation**: Auto-send summaries

### **📧 Email Notifications**
- **Welcome**: New user registration
- **Approval**: Absence request status
- **Reminders**: Daily report deadlines
- **Announcements**: New company announcements

### **📊 Analytics & Reporting**
- **Usage Metrics**: Feature usage tracking
- **Performance**: Response time monitoring
- **Error Tracking**: Bug report aggregation
- **User Behavior**: Feature adoption rates

---

## 🛠️ **Development Features**

### **🔧 Development Tools**
- **Environment**: Local development dengan hot reload
- **TypeScript**: Type safety & IDE support
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting consistency

### **🧪 Testing Framework**
- **Unit Tests**: Component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User flow testing
- **Performance Tests**: Load & speed testing

### **📚 Documentation**
- **Code Comments**: JSDoc documentation
- **API Docs**: OpenAPI specification
- **User Guide**: Feature documentation
- **Deployment Guide**: Setup instructions

---

## 🎯 **User Role Matrix**

| Feature | Staff | Direksi | Description |
|----------|--------|----------|-------------|
| **Login** | ✅ | ✅ | Role-based authentication |
| **Daily Planning** | ✅ | ❌ | Create morning plans |
| **Daily Reporting** | ✅ | ❌ | Submit evening reports |
| **View Own Reports** | ✅ | ❌ | Personal report history |
| **Upload Evidence** | ✅ | ❌ | Add photo evidence |
| **Request Absence** | ✅ | ❌ | Submit leave requests |
| **View Announcements** | ✅ | ✅ | Company announcements |
| **Upload Archive Files** | ✅ | ✅ | Division document archive |
| **View Division Archive** | ✅ | ✅ | Own division files |
| **Search Reports** | ✅ | ✅ | Search functionality |
| **Export CSV** | ✅ | ✅ | Data export |
| **Manage Users** | ❌ | ✅ | CRUD staff accounts |
| **Manage Divisions** | ❌ | ✅ | CRUD divisions |
| **Monitor All Reports** | ❌ | ✅ | View all staff reports |
| **Approve Absences** | ❌ | ✅ | Review leave requests |
| **Create Announcements** | ❌ | ✅ | Company announcements |
| **View All Archives** | ❌ | ✅ | Cross-division files |
| **Delete Any Files** | ❌ | ✅ | Archive management |
| **Add Feedback** | ❌ | ✅ | Report performance review |

---

## 🔄 **Complete User Flows**

### **📝 Staff Daily Workflow**
```
1. Login → /beranda
2. Morning: Buat Rencana → /beranda/laporan
3. Work: Execute tasks
4. Evening: Update Laporan → Add notes + evidence
5. Submit: Finalize daily report
6. Archive: Upload dokumen → /beranda/arsip
7. History: View riwayat → /beranda/riwayat
```

### **👀 Direksi Daily Workflow**
```
1. Login → /dashboard
2. Monitor: Pantau laporan → /dashboard/laporan
3. Review: Check staff submissions
4. Feedback: Add performance notes
5. Manage: Approve absences → /dashboard/absences
6. Communicate: Create announcements → /dashboard/pengumuman
7. Archive: Review all files → /dashboard/arsip
8. Search: Advanced filtering → /dashboard/riwayat
```

### **🔄 Cross-Functional Workflows**
```
Document Upload:
Staff Upload → Division Archive → Direksi Review → Download/Manage

Leave Request:
Staff Request → Direksi Review → Approval → Notification → Record

Report Feedback:
Staff Submit → Direksi Review → Add Feedback → Staff View → Improvement

Announcement:
Direksi Create → Targeted Delivery → Staff Read → Acknowledge
```

---

## 🎯 **Success Metrics**

### **📈 Performance KPIs**
- **Login Time**: <3 seconds
- **Search Response**: <2 seconds
- **Upload Speed**: Progress indicators
- **Mobile Performance**: Touch-friendly
- **Error Rate**: <1% user interactions

### **👥 User Adoption**
- **Daily Report Compliance**: >90%
- **Archive Usage**: Active uploads
- **Search Usage**: Frequent queries
- **Mobile Access**: >50% traffic

### **🔧 System Health**
- **Uptime**: >99.5%
- **Database Performance**: Optimized queries
- **Storage Usage**: Within limits
- **Security**: Zero breaches

---

## 🚀 **Future Enhancements**

### **Phase 3: Advanced Features**
- **Telegram Bot Integration**: Automated notifications
- **Advanced Analytics**: Business intelligence
- **Mobile App**: Native iOS/Android
- **API Integration**: Third-party systems
- **Workflow Automation**: Business process automation

### **Phase 4: Enterprise Features**
- **Multi-tenant**: Multiple companies
- **Advanced Security**: 2FA, SSO
- **Compliance**: Audit trails, GDPR
- **Scalability**: Load balancing
- **Internationalization**: Multi-language support

---

## 📞 **Support & Maintenance**

### **🔧 Technical Support**
- **Bug Reports**: GitHub Issues
- **Feature Requests**: User feedback
- **Documentation**: Comprehensive guides
- **Monitoring**: Real-time alerts

### **🔄 Regular Maintenance**
- **Database**: Index optimization
- **Storage**: Cleanup old files
- **Security**: Policy updates
- **Performance**: Code optimization

---

**🎯 Status: Production Ready untuk Testing!**

Semua fitur core dan tambahan sudah diimplementasikan dengan lengkap. Sistem siap untuk comprehensive testing dan user adoption.
