# Gents Shop - POS & E-Commerce System

A modern, full-featured hybrid point-of-sale (POS) and e-commerce web application for retail shops selling men's clothing and accessories.

## 🚀 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Tailwind CSS v4 + Vite |
| Backend | Laravel 12 (PHP 8.2+) |
| Database | MariaDB 10.11+ |
| Auth | Laravel Sanctum (Token-based) |
| Permissions | Spatie Laravel Permission |
| Charts | Recharts |
| State | React Context API + TanStack Query |

## 📁 Project Structure

```
tinkonna/
├── backend/                 # Laravel 12 Backend API
│   ├── app/
│   │   ├── Console/Commands/    # Artisan commands (ExpireBookings)
│   │   ├── Http/Controllers/Api/ # All API controllers
│   │   └── Models/              # Eloquent models
│   ├── database/
│   │   ├── migrations/          # All DB migrations
│   │   └── seeders/             # DatabaseSeeder with roles & themes
│   └── routes/
│       └── api.php              # All API routes
├── frontend/                # React Frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── contexts/        # Auth, Cart, Theme contexts
│       ├── pages/           # All page components
│       │   ├── admin/       # Admin panel pages
│       │   ├── auth/        # Login & Register
│       │   ├── customer/    # Customer profile & cart
│       │   └── public/      # Public homepage & products
│       └── lib/             # Axios, utils
├── setup.bat                # One-click setup script
├── start-backend.bat        # Start Laravel server
└── start-frontend.bat       # Start Vite dev server
```

## ⚡ Quick Setup

### Prerequisites
- PHP 8.2+ with extensions: pdo_mysql, mbstring, openssl, tokenizer, xml, ctype, json, bcmath, gd
- Composer
- Node.js 18+ and npm
- MariaDB 10.11+

### Step 1: Configure Database

Create a MariaDB database:
```sql
CREATE DATABASE gents_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gents_shop
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Step 2: Run Setup

Double-click `setup.bat` or run manually:

```bash
# Backend setup
cd backend
php artisan migrate:fresh --seed
php artisan storage:link

# Frontend setup
cd frontend
npm install
```

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open: **http://localhost:5173**

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gentsshop.com | admin123 |
| Staff | staff@gentsshop.com | staff123 |
| Customer | customer@example.com | customer123 |

## ✅ Features Implemented

### Core POS Features
- ✅ Product catalog with dual sizing (Standard M/L/XL/XXL & Measurement in inches)
- ✅ Two-level product ID system (Base_Product_ID + Product_Variant_ID)
- ✅ Barcode generation for each product variant
- ✅ Printable product labels with barcode
- ✅ Sales transaction recording with barcode scanning
- ✅ Flexible pricing (fixed & variable price products)
- ✅ Inventory quantity auto-update after sales
- ✅ Available sizes display after sale completion
- ✅ Product availability lookup by ID/barcode

### Reports & Analytics
- ✅ Daily sales report with print support
- ✅ Weekly sales report with charts
- ✅ Monthly sales report with trend analysis
- ✅ Cash flow report (Revenue, COGS, Gross Profit, Net Profit, Cash on Hand)
- ✅ Bilingual printing (English & Bangla)
- ✅ Expense tracking by category

### E-Commerce Features
- ✅ Public homepage with product listings
- ✅ Product filtering by category
- ✅ Product search
- ✅ Customer registration & authentication
- ✅ Shopping cart with persistent storage
- ✅ Free booking (24-hour reservation)
- ✅ Paid booking (7-day reservation with 20% fee)
- ✅ Mobile banking payment integration (bKash, Nagad, Rocket)
- ✅ Payment verification dashboard
- ✅ Customer profile with order & booking history

### Admin Features
- ✅ Role-based access control (RBAC) with Spatie Permission
- ✅ Custom role creation with granular permissions
- ✅ Role-based dashboard
- ✅ User management (staff, admin accounts)
- ✅ Announcement system with 5 types
- ✅ Theme management for 6 special occasions
- ✅ Animated flying symbols for festive themes
- ✅ Custom theme icon upload
- ✅ Sales receipt generation (80mm thermal printer)
- ✅ Bilingual receipts (English/Bangla)

### UI/UX
- ✅ Modern, clean design with Tailwind CSS v4
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Dark sidebar admin layout
- ✅ Interactive charts (Recharts)
- ✅ Toast notifications
- ✅ Loading states & empty states
- ✅ Pagination
- ✅ Bangladeshi Taka (৳) currency formatting
- ✅ Bengali fonts (Hind Siliguri, Noto Sans Bengali)

## 🌐 API Endpoints

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Customer registration |
| POST | /auth/login | Login |
| GET | /public/products | Public product listing |
| GET | /public/announcements | Active announcements |
| GET | /public/active-theme | Current active theme |
| GET | /products | Admin product list |
| POST | /products | Create product |
| GET | /products/availability | Check by ID/barcode |
| POST | /sales | Create sale transaction |
| GET | /reports/daily | Daily report |
| GET | /reports/weekly | Weekly report |
| GET | /reports/monthly | Monthly report |
| GET | /reports/cashflow | Cash flow report |
| POST | /expenses | Add expense |
| POST | /bookings | Create booking |
| POST | /booking-payments/{id}/approve | Approve payment |
| GET | /admin/dashboard | Dashboard stats |

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px – 1024px  
- Desktop: > 1024px

## 🎨 Themes

Predefined themes for special occasions:
- 🌙 Eid-ul-Fitr (crescent moons, stars, lanterns)
- 🐑 Eid-ul-Adha
- 🥭 Pohela Boishakh (mangoes, flowers, Bengali motifs)
- 🇧🇩 Independence Day (national flags, patriotic symbols)
- 🏆 Victory Day
- 📚 Mother Language Day (books, alphabets)

Each theme supports custom icon uploads (PNG/SVG/GIF/WebP, max 500KB, max 200×200px).

## 🔄 Background Tasks

Run the booking expiry command (or set up a cron job):
```bash
php artisan bookings:expire
```

For production, add to crontab:
```
* * * * * php /path/to/backend/artisan schedule:run
```

---

**Built with ❤️ for Gents Shop, Bangladesh**
