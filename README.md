# Society Management System

A comprehensive MERN stack application for managing residential societies, including billing, complaints, amenities, staff management, and more.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite + Bootstrap 5
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## 📋 Features

### Authentication & Authorization
- **Multi-role System**: Admin, Resident, Security, Staff
- **Email Verification**: OTP-based email verification for new registrations
- **Separate Staff Login**: Staff members (Security, Housekeeping, etc.) have their own login portal
- **JWT-based Authentication**: Secure token-based authentication

### Admin Panel

#### 🏢 Society Management
- View and update society details (name, address, city, state, pincode)
- **Create Flats**: Single flat creation or bulk creation for entire blocks
- **Manage Flats**: 
  - View all flats with occupancy status
  - Edit flat details (block, floor, number, maintenance charge)
  - Assign/unassign residents to flats
  - Delete vacant flats

#### 👥 Staff Management
- Add staff members with roles (Security, Housekeeping, Gardener, etc.)
- Set email and password for staff login access
- Track staff attendance (Present/Absent/Half-day)
- Manage salary details and payment history
- View monthly attendance summary

#### 💰 Bills & Payments
- Generate maintenance bills for all flats
- View all bills with status (Pending/Paid/Cancelled)
- **Mark as Paid (Cash)**: Record cash payments
- **Cancel Bills**: Cancel incorrect or disputed bills
- Display payment details modal with:
  - QR Code for digital payments
  - UPI ID
  - Bank account details (Account Number, IFSC, Bank Name)

#### 📢 Notices
- Create society-wide announcements
- Set notice priority and expiry dates
- Publish/unpublish notices

#### 🔧 Complaints Management
- View all resident complaints
- **Resolve complaints**: Mark complaints as resolved with remarks
- Track complaint status and history

### Resident Panel

#### 📊 Dashboard
- View assigned flat details
- See pending bills and payment status
- Quick access to amenities and notices

#### 💳 Bills
- View personal maintenance bills
- See payment history
- Access payment details (QR/UPI/Bank) for pending bills

#### 🏊 Amenities
- View available society amenities
- Book amenities (gym, pool, clubhouse, etc.)
- Check booking status

#### 📝 Complaints
- Raise new complaints
- Track complaint status
- View resolution remarks

#### 📋 Notices
- View all active society notices
- Filter by priority

### Staff Portal

#### 🔐 Staff Login
- Separate login page for staff members
- Access via `/staff-login` route

#### ✅ Self Attendance
- Mark daily attendance (one entry per day)
- View personal attendance history
- Monthly attendance stats

#### 📢 Notice Viewing
- View society notices relevant to staff

### Security Features
- View visitor logs
- Manage entry/exit records

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

Seed roles:
```bash
npm run seed:roles
```

Start server:
```bash
npm start
# or for development
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

Start development server:
```bash
npm run dev
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/verify-email` - Verify email with token

### Staff Authentication
- `POST /api/staff/login` - Staff login
- `GET /api/staff/me` - Get staff profile
- `POST /api/staff/me/attendance` - Mark self attendance
- `GET /api/staff/me/attendance` - Get own attendance history
- `GET /api/staff/me/notices` - Get notices for staff

### Society
- `GET /api/societies/me` - Get current society
- `PATCH /api/societies/me` - Update society details

### Flats
- `GET /api/flats` - Get all flats
- `POST /api/flats` - Create flat
- `PATCH /api/flats/:id` - Update flat
- `DELETE /api/flats/:id` - Delete flat
- `GET /api/flats/available-residents` - Get residents for assignment

### Bills
- `GET /api/bills` - Get bills
- `POST /api/bills/generate` - Generate bills for all flats
- `PATCH /api/bills/:id/mark-paid` - Mark bill as paid (cash)
- `PATCH /api/bills/:id/cancel` - Cancel bill

### Staff (Admin)
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Add staff member
- `PATCH /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff
- `PATCH /api/staff/:id/attendance` - Mark attendance (admin)

### Complaints
- `GET /api/complaints` - Get complaints
- `POST /api/complaints` - Create complaint
- `PATCH /api/complaints/:id/resolve` - Resolve complaint (admin)

### Notices
- `GET /api/notices` - Get notices
- `POST /api/notices` - Create notice
- `PATCH /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Amenities
- `GET /api/amenities` - Get amenities
- `POST /api/amenities/book` - Book amenity

## 📁 Project Structure

```
Society Management/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── logger.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── billController.js
│   │   ├── complaintController.js
│   │   ├── flatController.js
│   │   ├── noticeController.js
│   │   ├── societyController.js
│   │   ├── staffAuthController.js
│   │   ├── staffController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── ...
│   ├── models/
│   │   ├── User.js
│   │   ├── Society.js
│   │   ├── Flat.js
│   │   ├── Bill.js
│   │   ├── Staff.js
│   │   ├── Notice.js
│   │   ├── Complaint.js
│   │   └── ...
│   ├── routes/
│   │   └── ...
│   ├── services/
│   │   └── defaultSocietyService.js
│   ├── utils/
│   │   └── ...
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── StaffLoginPage.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── SocietyManagementPage.jsx
│   │   │   │   └── StaffManagementPage.jsx
│   │   │   ├── common/
│   │   │   │   ├── BillsPage.jsx
│   │   │   │   ├── ComplaintsPage.jsx
│   │   │   │   ├── NoticesPage.jsx
│   │   │   │   └── ...
│   │   │   ├── resident/
│   │   │   │   └── ResidentDashboard.jsx
│   │   │   ├── staff/
│   │   │   │   └── StaffDashboardPage.jsx
│   │   │   └── security/
│   │   │       └── SecurityDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🔐 Default Credentials (After Password Reset)

| Role | Email | Password |
|------|-------|----------|
| Admin | (your registered email) | Admin@123 |
| Resident | (any resident email) | Resident@123 |
| Staff | (staff email set by admin) | Staff@123 |

## 📝 Recent Updates (February 2026)

### New Features Added
1. **Society Management Page** - Complete society and flat management
2. **Staff Management Page** - Staff CRUD with attendance and salary tracking
3. **Staff Self-Service Portal** - Staff login, self-attendance, notice viewing
4. **Flat Edit Modal** - Update flat details including maintenance charge
5. **Payment Details Modal** - QR code, UPI, and bank details display
6. **Complaint Resolution** - Admin can resolve complaints with remarks
7. **Bill Management** - Mark paid (cash) and cancel bill options

### Bug Fixes
- Fixed society ID mismatch across users, staff, and flats
- Fixed flat update conflict error when modifying maintenance charge
- Fixed resident assignment synchronization with User.flat field
- Auto-refresh user data on page load for latest flat assignments

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Support

For support, please open an issue in the repository or contact the development team.
