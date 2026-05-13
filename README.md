<div align="center">

# 🅿️ ParkFlow

### Smart Parking Management System for Commercial Plazas

**A complete plaza parking solution built for the Pakistani market**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](#)

[Live Demo](#) · [Backend Repo](https://github.com/HassanHashmi123/parkflow-backend) · [Features](#-features) · [Tech Stack](#-tech-stack)

</div>

---

## 📖 About

**ParkFlow** is a production-ready, full-stack parking management SaaS designed for Pakistani commercial plazas (hospitals, malls, shopping centers, and housing societies). It intelligently differentiates between **permanent shop keepers** and **walk-in guests**, automating fee collection while providing a seamless experience for parking operators.

Built with a focus on **real-world Pakistani business workflows** — monthly fee collection from shops, guest parking with QR-coded slips, multi-role access control, and bulk data management for plazas with hundreds of shops.

---

## ✨ Key Features

### 🎯 Smart Vehicle Detection
- **Auto-detect permanent vs guest** vehicles by license plate
- Instant 500ms lookup with visual feedback
- Permanent shop vehicles bypass slip generation
- Guest vehicles get QR-coded parking slips
- Camera-based **ANPR (Automatic Number Plate Recognition)** support

### 🏪 Multi-Shop Plaza Management
- Manage **2000+ shops** with bulk CSV import
- Floor and block organization
- Owner contact details + CNIC tracking
- Active/inactive status management
- Inline editing of shop details

### 🚗 Vehicle Registry
- Pre-register shop keeper vehicles (no slip needed)
- Multiple vehicles per shop supported
- Vehicle type categorization (Car/Bike/Truck)
- CSV bulk upload for 100+ vehicles at once

### 💳 Monthly Payment Collection
- Track monthly fee collection per shop
- Quick "Mark Paid" workflow
- Multiple payment methods (Cash, Bank, Cheque, Online)
- Receipt number tracking
- Pending payments report with overdue alerts
- Month-by-month historical view

### 📊 Business Analytics
- **4 animated chart types** (Daily, Hourly, Monthly, By Vehicle Type)
- Revenue breakdown and trends
- Real-time stats dashboard
- **PDF export** with branding for client reports
- Date range filtering

### 🔐 Role-Based Access Control
- **Admin** — Full access including shop & user management
- **Operator** — Check-in/out and daily operations
- **Viewer** — Read-only reports and history
- JWT-based authentication
- Audit log for sensitive actions

### 🎨 Modern UI/UX
- **Glassmorphism design** with frosted glass effects
- **Framer Motion animations** throughout
- Confetti celebrations on guest checkout 🎉
- Skeleton loaders for smooth data loading
- Mobile-responsive with bottom navigation
- Dark mode support (coming soon)

---

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **PDF Generation:** jsPDF + html2canvas
- **Notifications:** Sonner

### Backend (Separate Repo)
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt (passlib)
- **OCR Engine:** EasyOCR (for ANPR)

---

## 📸 Screenshots

> *Add screenshots here after deployment. Recommended sections:*
> - Login Page (animated gradient background)
> - Dashboard (live stats)
> - Smart Check-In (permanent vehicle detection)
> - Shops Management (CSV bulk upload)
> - Monthly Payments (pending vs paid)
> - Reports (animated charts)

---

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- npm 10+
- ParkFlow backend running ([Backend Setup Guide](https://github.com/HassanHashmi123/parkflow-backend))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/HassanHashmi123/parkflow-frontend.git
cd parkflow-frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | `admin` | `admin123` | Full system access |
| Operator | `operator` | `operator123` | Check-in/out + reports |
| Viewer | `viewer` | `viewer123` | Read-only access |

---

## 📂 Project Structure

```
parkflow-frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── checkin/         # Smart vehicle check-in
│   │   │   ├── checkout/        # Smart vehicle check-out
│   │   │   ├── active/          # Live active vehicles
│   │   │   ├── today/           # Today's sessions
│   │   │   ├── search/          # Advanced search
│   │   │   ├── reports/         # Analytics & PDF reports
│   │   │   ├── settings/        # User profile & password
│   │   │   ├── admin/
│   │   │   │   ├── shops/             # Shop management
│   │   │   │   ├── permanent-vehicles/# Vehicle registry
│   │   │   │   ├── payments/          # Monthly payments
│   │   │   │   ├── vehicle-types/     # Rate management
│   │   │   │   └── users/             # User management
│   │   │   ├── layout.tsx       # Dashboard shell
│   │   │   └── page.tsx         # Dashboard home
│   │   ├── login/               # Authentication
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Design system
│   ├── components/              # Reusable components
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── TopBar.tsx
│   │   ├── StatCard.tsx
│   │   ├── ParkingSlip.tsx
│   │   ├── Confetti.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── AuthGuard.tsx
│   │   └── Skeletons.tsx
│   └── lib/
│       ├── api.ts               # API client (all endpoints)
│       ├── auth.ts              # JWT auth + Zustand store
│       └── utils.ts             # Helper functions
├── public/                      # Static assets
├── package.json
├── tailwind.config.js
├── next.config.mjs
└── tsconfig.json
```

---

## 💼 Business Model

### For Plaza Owners
- **One-time setup fee:** Rs. 150,000 - 300,000 (depending on plaza size)
- **Annual maintenance contract (AMC):** Rs. 60,000/year
- **Optional add-ons:** Camera/ANPR hardware, thermal printer integration

### Revenue Potential (Per Plaza)
- **2000 shops × Rs. 3,000 monthly fees** = Rs. 60 lakh/month recurring
- **Daily guest revenue** = Rs. 7-10 lakh/month additional
- **Total plaza revenue potential:** Rs. 67-70 lakh/month

---

## 🌟 Why ParkFlow?

### Problem
Pakistani commercial plazas manage thousands of shops manually:
- Paper-based shop registries
- Cash-only monthly collections without proper records
- Lost guest parking slips
- No analytics or reporting
- Disputes over parking fees

### Solution
ParkFlow digitizes the entire workflow:
- ✅ Instant plate-based vehicle detection
- ✅ Automated fee collection workflows
- ✅ Real-time dashboard for plaza managers
- ✅ Mobile-friendly for operators at gates
- ✅ Professional PDF reports for management
- ✅ Multi-role security

---

## 🗺️ Roadmap

- [x] **Phase 1:** Core check-in/checkout with QR slips
- [x] **Phase 2A:** Authentication + role-based access
- [x] **Phase 2B:** Operations pages (active, today, search, reports)
- [x] **Phase 3A:** Plaza shops + permanent vehicles + monthly payments
- [x] **Phase 3B:** Admin panel for shops/vehicles/payments
- [x] **Phase 3C:** Smart operator pages with permanent vs guest detection
- [ ] **Phase 4:** WhatsApp notifications for monthly reminders
- [ ] **Phase 5:** Payment gateway integration (JazzCash, EasyPaisa)
- [ ] **Phase 6:** Production IP camera + boom barrier integration
- [ ] **Phase 7:** Multi-tenant SaaS (multiple plazas on one platform)

---

## 🤝 Contributing

This is a proprietary project. For commercial inquiries, licensing, or custom deployments, please contact:

**Hassan Hashmi**
- GitHub: [@HassanHashmi123](https://github.com/HassanHashmi123)
- Email: *hassanhashmi078@gmail.com*

---

## 📄 License

**Proprietary** — All rights reserved.

This software is licensed for commercial use only. Unauthorized copying, modification, or distribution is prohibited. Contact the author for licensing inquiries.

---

## 🙏 Acknowledgments

Built with passion for the Pakistani commercial real estate sector. Special thanks to the open-source community for the amazing tools that made this possible.

---

<div align="center">

**Built with ❤️ in Pakistan 🇵🇰**

*Streamlining parking management for commercial plazas across Pakistan*

⭐ If you find this project useful, consider giving it a star!

</div>
