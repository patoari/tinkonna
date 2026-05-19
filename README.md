# Tinkonna (Gents Shop)

Comprehensive e-commerce platform combining a Laravel backend with a modern React frontend. This repository contains the backend application in `backend/` and the frontend single page app in `frontend/`.

**Tech Stack:**
- **Backend:** PHP 8.x, Laravel (artisan present), Composer
- **Frontend:** React, Vite, Node.js, npm/yarn
- **Database:** MySQL / MariaDB (see `gents_shop.sql`)
- **Push notifications:** VAPID keys and service worker in `frontend/public/sw.js`

**Repository layout (high level):**
- `backend/` — Laravel application and API server. See [backend/README.md](backend/README.md).
- `frontend/` — React application built with Vite. See [frontend/README.md](frontend/README.md).
- `gents_shop.sql` — example SQL dump to seed a database schema.
- `start-backend.bat` / `start-frontend.bat` — Windows helper scripts for starting dev servers.

**Important files:** [start-backend.bat](start-backend.bat), [start-frontend.bat](start-frontend.bat), [gents_shop.sql](gents_shop.sql)

**Quick Links**
- Overview and architecture: **Architecture** section below.
- Local dev: **Setup** and **Running locally** sections.

**License & Contributing**
See the **Contributing** and **License** sections at the end of this file.

**Table of Contents**
- **Project Overview**
- **Prerequisites**
- **Setup**
  - Backend
  - Frontend
- **Environment & Database**
- **Running (Development & Production)**
- **Testing**
- **Push Notifications (VAPID)**
- **Architecture & Folder Structure**
- **Troubleshooting**
- **Contributing**
- **License & Acknowledgements**

**Project Overview**

This project is a full-stack e-commerce application. The backend exposes APIs and business logic via Laravel, and the frontend is a single-page application built with React and Vite that consumes those APIs.

**Prerequisites**
- **PHP** 8.0+ and Composer installed on your machine.
- **Node.js** 16+ and `npm` (or `yarn`) for frontend builds.
- **MySQL** / MariaDB for local development, or another supported database.
- Recommended (Windows): Git Bash, and using the provided `.bat` scripts to simplify start-up.

**Setup**

1) Clone the repository

```bash
git clone <repo-url> tinkonna
cd tinkonna
```

2) Backend setup

- Copy environment file: `cp backend/.env.example backend/.env` (or manually create `.env` on Windows).
- From `backend/` install PHP dependencies:

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
```

- Configure database credentials in `backend/.env` (see **Environment & Database** below), then run migrations & seeders:

```bash
php artisan migrate --seed
```

- Alternatively, import `gents_shop.sql` into your MySQL server to provision an initial schema and sample data.

3) Frontend setup

```bash
cd frontend
npm install
# for development
npm run dev
# for production build
npm run build
```

**Environment & Database**

- Backend expects a typical Laravel `.env` with entries for `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and `APP_URL`.
- Example minimal database block in `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tinkonna
DB_USERNAME=root
DB_PASSWORD=secret
```

- If you're on Windows and prefer the provided SQL dump, import `gents_shop.sql` with a GUI (MySQL Workbench) or CLI:

```bash
mysql -u root -p tinkonna < gents_shop.sql
```

**Running (Development & Production)**

- Quick dev helper scripts (Windows): execute [start-backend.bat](start-backend.bat) and [start-frontend.bat](start-frontend.bat) from repo root.
- Run backend dev server manually:

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

- Run frontend dev server:

```bash
cd frontend
npm run dev
```

- Production notes: build frontend with `npm run build` then deploy built assets to a static host or place them in the Laravel `public/` folder. For the backend, use a proper PHP-FPM + Nginx/Apache configuration and run queue workers with Supervisor for background jobs.

**Testing**

- Backend: Laravel tests can be run from `backend/`:

```bash
cd backend
./vendor/bin/phpunit
```

- Frontend: check `frontend/package.json` for available test scripts (e.g., `npm test`).

**Push Notifications (VAPID) & Service Worker**

- VAPID keys are included at `frontend/vapid_keys.txt` and the frontend includes a service worker at `frontend/public/sw.js`.
- To generate new VAPID keys, see `frontend/scripts/generate_vapid.js` and backend helper `scripts/generate_vapid.php`.

**Architecture & Folder Structure (quick tour)**

- `backend/app/Models/` — Eloquent models such as `Product.php`, `Booking.php`, `CustomerProfile.php`.
- `backend/routes/api.php` — API endpoints used by the frontend.
- `frontend/src/` — React app sources: `components/`, `pages/`, `hooks/`, and `contexts/`.
- `public/` — Laravel public assets and entry `index.php` for the backend.

**Entity Relationship Diagram (ERD)**

Below is a high-level ER diagram showing the main relational entities and their relationships. This is intended as an overview; consult `database/migrations/` for the authoritative schema.

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : ordered_in
    PRODUCT }o--|| CATEGORY : belongs_to
    PRODUCT ||--o{ PRODUCT_IMAGE : has
    **Entity Relationship Diagram (ERD) — Detailed**

    The diagram below expands the schema to include core entities, common attributes (PK = primary key, FK = foreign key), and cardinalities. For the authoritative and up-to-date definition refer to `database/migrations/`.

    ```mermaid
    erDiagram
        %% Entities with key attributes (PK, FK) and relationships
        USER {
          int id PK
          string name
          string email
          string password
          timestamp created_at
        }

        CUSTOMER_PROFILE {
          int id PK
          int user_id FK
          string phone
          string alternate_phone
          text notes
        }

        ROLE {
          int id PK
          string name
        }

        PERMISSION {
          int id PK
          string name
        }

        PRODUCT {
          int id PK
          string sku
          string title
          text description
          decimal price
          boolean active
        }

        PRODUCT_VARIANT {
          int id PK
          int product_id FK
          string variant_name
          string size
          int stock
          decimal price_override
        }

        PRODUCT_IMAGE {
          int id PK
          int product_id FK
          string path
          boolean is_primary
        }

        CATEGORY {
          int id PK
          string name
          int parent_id FK
        }

        ORDER {
          int id PK
          int user_id FK
          decimal total_amount
          string status
          timestamp placed_at
        }

        ORDER_ITEM {
          int id PK
          int order_id FK
          int product_variant_id FK
          int quantity
          decimal unit_price
        }

        CART_ITEM {
          int id PK
          int user_id FK
          int product_variant_id FK
          int quantity
        }

        BOOKING {
          int id PK
          int user_id FK
          int product_variant_id FK
          int quantity
          string status
          timestamp expires_at
        }

        BOOKING_PAYMENT {
          int id PK
          int booking_id FK
          decimal amount
          string method
          string status
        }

        PAYMENT_TRANSACTION {
          int id PK
          int order_id FK
          decimal amount
          string gateway
          string status
          string transaction_ref
        }

        DELIVERY_ADDRESS {
          int id PK
          int user_id FK
          string address_line1
          string city
          string postal_code
          string country
        }

        NOTIFICATION {
          int id PK
          int user_id FK
          string type
          text payload
          boolean read
        }

        ANNOUNCEMENT {
          int id PK
          string title
          text body
          timestamp published_at
        }

        EXPENSE {
          int id PK
          decimal amount
          string category
          timestamp incurred_at
        }

        OWNER_TRANSACTION {
          int id PK
          int expense_id FK
          decimal amount
          string note
        }

        BANK_ACCOUNT {
          int id PK
          string bank_name
          string account_number
        }

        MOBILE_BANKING_ACCOUNT {
          int id PK
          string provider
          string account_number
        }

        INVENTORY_LOG {
          int id PK
          int product_variant_id FK
          int delta
          string reason
          timestamp logged_at
        }

        COUPON {
          int id PK
          string code
          decimal discount
          timestamp expires_at
        }

        SHIPMENT {
          int id PK
          int order_id FK
          string carrier
          string tracking_number
          string status
        }

        %% Relationships
        USER ||--o{ CUSTOMER_PROFILE : has
        USER ||--o{ ORDER : places
        USER ||--o{ CART_ITEM : owns
        USER ||--o{ DELIVERY_ADDRESS : has
        USER ||--o{ NOTIFICATION : receives

        ROLE ||--o{ PERMISSION : grants
        USER }o--|| ROLE : assigned

        CATEGORY ||--o{ PRODUCT : categorizes
        PRODUCT ||--o{ PRODUCT_VARIANT : provides
        PRODUCT ||--o{ PRODUCT_IMAGE : has
        PRODUCT_VARIANT ||--o{ INVENTORY_LOG : logs

        ORDER ||--|{ ORDER_ITEM : contains
        ORDER ||--o{ PAYMENT_TRANSACTION : records
        ORDER ||--o{ SHIPMENT : shipped_via
        ORDER_ITEM }o--|| PRODUCT_VARIANT : references

        CART_ITEM }o--|| PRODUCT_VARIANT : references

        BOOKING ||--|{ BOOKING_PAYMENT : paid_by
        BOOKING }o--|| USER : for
        BOOKING }o--|| PRODUCT_VARIANT : reserves

        ANNOUNCEMENT ||--o{ USER : targeted_to
        NOTIFICATION ||--o{ USER : targeted_to

        EXPENSE ||--o{ OWNER_TRANSACTION : funds
        BANK_ACCOUNT ||--o{ OWNER_TRANSACTION : used_by
        MOBILE_BANKING_ACCOUNT ||--o{ OWNER_TRANSACTION : used_by

        COUPON ||--o{ ORDER : applied_to

        %% Cardinality examples
        PRODUCT_VARIANT }o--|| PRODUCT : variant_of
        ORDER_ITEM ||--|| ORDER : belongs_to

    ```

    **Notes (detailed):**
    - `USER` represents authentication users; `CUSTOMER_PROFILE` stores customer-specific details separate from auth data.
    - `PRODUCT_VARIANT` stores per-size/measurement stock and optional price overrides; `INVENTORY_LOG` records stock changes.
    - `ORDER`/`ORDER_ITEM` capture finalized purchases; `PAYMENT_TRANSACTION` records gateway results and `SHIPMENT` tracks fulfilment.
    - `BOOKING` and `BOOKING_PAYMENT` allow reserved items and partial payments with expiry semantics.
    - `ROLE` / `PERMISSION` represent RBAC (Spatie) mappings; actual linking tables (`role_user`, `permission_role`) exist in migrations.
    - `ANNOUNCEMENT` and `NOTIFICATION` are separate: announcements are broadcast content, notifications are per-user delivery records.
    Refer to `database/migrations/` and `backend/app/Models/` for the concrete column definitions, constraints, and pivot tables (e.g., `role_user`, `permission_role`, `category_product`).
                          ↓ HTTPS/API
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Laravel API Routes (RESTful)                         │   │
│  │ - Authentication Middleware (Sanctum)                │   │
│  │ - CORS Middleware                                    │   │
│  │ - Rate Limiting                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Service Classes & Controllers                        │   │
│  │ - Product Management Service                         │   │
│  │ - Transaction Processing Service                     │   │
│  │ - Booking Management Service                         │   │
│  │ - Payment Verification Service                       │   │
│  │ - Notification Service                               │   │
│  │ - Report Generation Service                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Eloquent ORM Models                                  │   │
│  │ - Product, ProductVariant, Category                  │   │
│  │ - Booking, CartItem, Transaction                     │   │
│  │ - User, Role, Permission                             │   │
│  │ - Notification, Announcement, Theme                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER (MariaDB)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Relational Database with Transactions                │   │
│  │ - Users & Authentication                             │   │
│  │ - Products & Inventory                               │   │
│  │ - Orders & Transactions                              │   │
│  │ - Bookings & Payments                                │   │
│  │ - Notifications & Announcements                       │   │
│  │ - Financial Records                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
tinkonna/
│
├── 📄 README.md                          # Main documentation (this file)
├── 📄 requirements.md                    # Business requirements document
├── 📄 PUSH_NOTIFICATIONS_SETUP.md        # Push notification configuration
├── 📄 UPLOAD_FLOW_DIAGRAM.md             # File upload workflow
├── 📄 gents_shop.sql                     # Database backup (optional)
├── 📄 setup.bat                          # One-click Windows setup
├── 📄 start-backend.bat                  # Start Laravel dev server
├── 📄 start-frontend.bat                 # Start React dev server
│
├── 📁 backend/                           # Laravel 12 API Backend
│   ├── app/
│   │   ├── Console/Commands/             # Custom Artisan commands
│   │   ├── Http/Controllers/Api/         # RESTful API controllers
│   │   ├── Http/Middleware/              # HTTP middleware
│   │   ├── Models/                       # Eloquent ORM Models
│   │   ├── Providers/                    # Service providers
│   │   └── Services/                     # Business logic services
│   ├── bootstrap/
│   ├── config/                           # Configuration files
│   ├── database/
│   │   ├── migrations/                   # Database migrations
│   │   ├── seeders/                      # Database seeders
│   │   └── factories/                    # Model factories
│   ├── public/
│   ├── routes/
│   │   └── api.php                       # API routes
│   ├── storage/
│   ├── tests/
│   ├── .env.example                      # Environment template
│   ├── artisan                           # Artisan CLI
│   ├── composer.json                     # PHP dependencies
│   └── vite.config.js
│
├── 📁 frontend/                          # React 19 + Vite Frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/                   # Reusable components
│   │   ├── contexts/                     # React Context
│   │   ├── pages/                        # Page components
│   │   ├── hooks/                        # Custom React hooks
│   │   ├── lib/                          # Utility libraries
│   │   └── assets/                       # Static assets
│   ├── public/
│   │   ├── sw.js                         # Service worker
│   │   └── index.html
│   ├── .eslintrc.js
│   ├── vite.config.js
│   ├── package.json
│   └── tailwind.config.js
│
└── 📁 .git/                              # Version control (if initialized)
```

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### System Requirements
- **Windows/Linux/macOS** - Any operating system
- **Administrator Access** - For some installation steps
- **Disk Space** - Minimum 500MB available

### Required Software

#### 1. PHP 8.2+
Download from: https://www.php.net/downloads

**Required Extensions:**
- PDO MySQL
- mbstring
- openssl
- tokenizer
- XML
- ctype
- json
- bcmath
- GD (for image processing)

**Verification:**
```mermaid
classDiagram
  %% Tables as classes with attributes (PK / FK markers)
  class User {
    +int id <<PK>>
    +string name
    +string email
    +string password
    +timestamp created_at
  }

  class CustomerProfile {
    +int id <<PK>>
    +int user_id <<FK>>
    +string phone
    +string alternate_phone
    +text notes
  }

  class Role {+int id <<PK>>\n+string name}
  class Permission {+int id <<PK>>\n+string name}

  class Product {
    +int id <<PK>>
    +string sku
    +string title
    +text description
    +decimal price
    +boolean active
  }

  class ProductVariant {
    +int id <<PK>>
    +int product_id <<FK>>
    +string variant_name
    +string size
    +int stock
    +decimal price_override
  }

  class ProductImage {+int id <<PK>>\n+int product_id <<FK>>\n+string path\n+boolean is_primary}
  class Category {+int id <<PK>>\n+string name\n+int parent_id <<FK>>}

  class Order {+int id <<PK>>\n+int user_id <<FK>>\n+decimal total_amount\n+string status\n+timestamp placed_at}
  class OrderItem {+int id <<PK>>\n+int order_id <<FK>>\n+int product_variant_id <<FK>>\n+int quantity\n+decimal unit_price}

  class CartItem {+int id <<PK>>\n+int user_id <<FK>>\n+int product_variant_id <<FK>>\n+int quantity}

  class Booking {+int id <<PK>>\n+int user_id <<FK>>\n+int product_variant_id <<FK>>\n+int quantity\n+string status\n+timestamp expires_at}
  class BookingPayment {+int id <<PK>>\n+int booking_id <<FK>>\n+decimal amount\n+string method\n+string status}

  class PaymentTransaction {+int id <<PK>>\n+int order_id <<FK>>\n+decimal amount\n+string gateway\n+string status\n+string transaction_ref}

  class DeliveryAddress {+int id <<PK>>\n+int user_id <<FK>>\n+string address_line1\n+string city\n+string postal_code\n+string country}

  class Notification {+int id <<PK>>\n+int user_id <<FK>>\n+string type\n+text payload\n+boolean read}
  class Announcement {+int id <<PK>>\n+string title\n+text body\n+timestamp published_at}

  class Expense {+int id <<PK>>\n+decimal amount\n+string category\n+timestamp incurred_at}
  class OwnerTransaction {+int id <<PK>>\n+int expense_id <<FK>>\n+decimal amount\n+string note}

  class BankAccount {+int id <<PK>>\n+string bank_name\n+string account_number}
  class MobileBankingAccount {+int id <<PK>>\n+string provider\n+string account_number}

  class InventoryLog {+int id <<PK>>\n+int product_variant_id <<FK>>\n+int delta\n+string reason\n+timestamp logged_at}
  class Coupon {+int id <<PK>>\n+string code\n+decimal discount\n+timestamp expires_at}
  class Shipment {+int id <<PK>>\n+int order_id <<FK>>\n+string carrier\n+string tracking_number\n+string status}

  %% Relationships (multiplicity shown where helpful)
  User "1" o-- "0..*" CustomerProfile : has
  User "1" o-- "0..*" Order : places
  User "1" o-- "0..*" CartItem : owns
  User "1" o-- "0..*" DeliveryAddress : has
  User "1" o-- "0..*" Notification : receives

  Role "1" o-- "0..*" Permission : grants
  User "*" -- "*" Role : assigned

  Category "1" o-- "0..*" Product : categorizes
  Product "1" o-- "0..*" ProductVariant : provides
  Product "1" o-- "0..*" ProductImage : has
  ProductVariant "1" o-- "0..*" InventoryLog : logs

  Order "1" o-- "1..*" OrderItem : contains
  Order "1" o-- "0..*" PaymentTransaction : records
  Order "1" o-- "0..*" Shipment : shipped_via
  OrderItem "*" -- "1" ProductVariant : references

  CartItem "*" -- "1" ProductVariant : references

  Booking "1" o-- "0..*" BookingPayment : paid_by
  Booking "*" -- "1" User : for
  Booking "*" -- "1" ProductVariant : reserves

  Announcement "1" o-- "0..*" User : targeted_to
  Notification "1" o-- "0..*" User : targeted_to

  Expense "1" o-- "0..*" OwnerTransaction : funds
  BankAccount "1" o-- "0..*" OwnerTransaction : used_by
  MobileBankingAccount "1" o-- "0..*" OwnerTransaction : used_by

  Coupon "1" o-- "0..*" Order : applied_to

  %% Styling groups
  classDef core fill:#e6f2ff,stroke:#0b5cff,stroke-width:1px;
  classDef commerce fill:#fff6e6,stroke:#ff8c00,stroke-width:1px;
  classDef payments fill:#f0fff0,stroke:#00a651,stroke-width:1px;
  classDef infra fill:#f9f0ff,stroke:#7a3ec6,stroke-width:1px;

  class User,CustomerProfile,Role,Permission,Announcement core
  class Product,ProductVariant,ProductImage,Category,Order,OrderItem,CartItem commerce
  class PaymentTransaction,Booking,BookingPayment,Coupon,Shipment payments
  class InventoryLog,Expense,OwnerTransaction,BankAccount,MobileBankingAccount infra

  %% Legend (simple)
  class Legend {
    PK = Primary Key
    FK = Foreign Key
    * = multiplicity
  }
  classDef legend fill:#ffffff,stroke:#cccccc,stroke-width:1px;
  class Legend legend

```
```

#### 4. MariaDB 10.11+
Download from: https://mariadb.org/download/ or use XAMPP, WAMP, MAMP

**Verification:**
```bash
mysql --version
```

#### 5. Git (Optional but Recommended)
Download from: https://git-scm.com/download

---

## Installation & Setup

### Option 1: Automated Setup (Windows)

```bash
cd path/to/tinkonna
setup.bat
```

### Option 2: Manual Setup

#### Step 1: Database Configuration

**Create the Database:**
```sql
CREATE DATABASE gents_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Step 2: Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env
# Or on Windows:
copy .env.example .env
```

**Edit `.env` file:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gents_shop
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

APP_NAME="Gents Shop"
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

**Install and Run:**
```bash
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link
```

#### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
npm run build
```

---

## Configuration

### Backend Environment Variables

Key variables in `backend/.env`:

```env
# Application
APP_NAME=Gents Shop
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gents_shop
DB_USERNAME=root
DB_PASSWORD=

# Push Notifications (Generate with: php artisan tinker)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
```

### Push Notifications Setup

**Generate VAPID Keys:**
```bash
cd backend
php artisan tinker
>>> \Minishlink\WebPush\VAPID::createVapidKeys();
# Copy output keys to .env
```

---

## Running the Application

### Development Mode

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

**Terminal 3 - Queue (Optional):**
```bash
cd backend
php artisan queue:listen
```

### Access Points
- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:8000/api**

---

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Key Endpoints

#### Authentication
```http
POST /api/login
POST /api/logout
POST /api/register
```

#### Products
```http
GET /api/products
GET /api/products/{id}
POST /api/products (Admin)
PUT /api/products/{id} (Admin)
```

#### Transactions
```http
POST /api/transactions (Create sale)
GET /api/transactions (Get history)
```

#### Bookings
```http
POST /api/bookings (Create booking)
GET /api/bookings (Get customer bookings)
DELETE /api/bookings/{id} (Cancel booking)
```

#### Cart
```http
GET /api/cart
POST /api/cart (Add item)
DELETE /api/cart/{item_id}
```

#### Notifications
```http
GET /api/notifications
PUT /api/notifications/{id}/read
POST /api/push/subscribe
```

---

## Database Schema

### Core Tables

**users** - Authentication and user profiles
**products** - Base product information
**product_variants** - Product size variants with inventory
**transactions** - Sales records
**transaction_items** - Line items in transactions
**bookings** - Product reservations
**cart_items** - Shopping cart items
**expenses** - Expense tracking
**notifications** - User notifications
**announcements** - Admin announcements
**themes** - Theme configurations
**push_subscriptions** - Push notification subscriptions

---

## Core Features

### Product Management
- Dynamic product variants (sizes)
- Base Product ID and Variant ID system
- Barcode generation
- Image management
- Real-time inventory tracking

### POS System
- Transaction recording
- Multiple payment methods
- Receipt generation
- Transaction history

### Booking System
- Free bookings (24 hours)
- Paid bookings (7 days, 20% fee)
- Payment verification
- Auto-expiry

### Shopping Cart
- Persistent cart storage
- Real-time price calculation
- Add/remove/update items

### Role-Based Access
- Admin, Owner, Staff, Customer roles
- Fine-grained permissions
- Protected endpoints

### Financial Management
- Revenue tracking
- Expense categorization
- Profit calculations
- Financial reports

### Notifications
- In-app notifications
- Web push notifications
- Broadcast announcements

### Themes
- Occasion-based themes
- Custom decorations
- Animated elements

---

## Development Guide

### Adding a New Endpoint

1. Create migration (if needed): `php artisan make:migration`
2. Create model: `php artisan make:model`
3. Create controller: `php artisan make:controller Api/ResourceController`
4. Define routes in `routes/api.php`
5. Implement business logic in services
6. Test the endpoint

### Backend Structure

**Flow:**
```
HTTP Request
  ↓
Route (routes/api.php)
  ↓
Controller (Validates input)
  ↓
Service (Business logic)
  ↓
Model (Database query)
  ↓
JSON Response
```

### Frontend Structure

**Hierarchy:**
```
Pages (Full pages)
  ↓
Components (Reusable UI)
  ↓
Hooks (Logic & API calls)
  ↓
Context (Global state)
  ↓
Utilities (Helpers)
```

### Code Style

**Backend:**
- Use PSR-12 standard
- Use type hints
- Add PHPDoc comments
- Run: `php artisan pint`

**Frontend:**
- Follow Airbnb style guide
- Use ESLint
- Run: `npm run lint`

---

## Testing

### Backend Tests
```bash
cd backend

# Run all tests
php artisan test

# Run specific test
php artisan test --filter=testCreateProduct

# With coverage
php artisan test --coverage
```

### Frontend Tests (Future)
```bash
cd frontend
npm run test
npm run test -- --coverage
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Verify MySQL is running
# Check .env database credentials
# Recreate database: CREATE DATABASE gents_shop;
php artisan migrate:fresh --seed
```

**2. CORS Error**
```bash
# Check FRONTEND_URL in backend .env
# Restart Laravel server
php artisan serve
```

**3. Storage Permission Error**
```bash
# Set permissions
chmod -R 775 storage bootstrap/cache
# Recreate storage link
php artisan storage:link
```

**4. npm Dependency Error**
```bash
cd frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**5. Service Worker Not Registering**
```bash
# Clear browser cache
# DevTools → Application → Clear Storage
# Restart frontend dev server
npm run dev
```

### Debug Commands

```bash
# Backend
php artisan pail --timeout=0              # Real-time logs
php artisan tinker                        # Interactive shell
php artisan route:list                    # Show routes

# Frontend
npm run lint                              # Check code style
npm run build                             # Test build
npm run preview                           # Preview built app
```

---

## Contributing

### Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes and commit
3. Follow commit message format: `feat(scope): description`
4. Push to fork and create pull request
5. Describe changes and request review

### Code Style

**Commits:** Use conventional commits
```
feat(products): add barcode generation
fix(booking): prevent double submission
docs(readme): update setup instructions
```

---

## Support

### Getting Help

- **Issues**: Check GitHub issues or create new issue
- **Documentation**: This README and project docs
- **Email**: admin@example.com (replace with actual)

### Reporting Bugs

Include:
- Description of issue
- Steps to reproduce
- Expected vs actual behavior
- System info (OS, PHP version, browser)
- Error messages/logs

---

## License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## Quick Reference

### Essential Commands

```bash
# Backend
php artisan serve                         # Start dev server
php artisan migrate                       # Run migrations
php artisan migrate:fresh --seed          # Reset database
php artisan tinker                        # Interactive shell
php artisan test                          # Run tests

# Frontend
npm run dev                               # Start dev server
npm run build                             # Production build
npm run lint                              # Check code style
npm run preview                           # Preview built app
```

### Useful URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api |
| phpMyAdmin | http://localhost/phpmyadmin |

---

**Last Updated:** May 2024  
**Made with ❤️ for retail management**

---

## Database

- Migrations: `backend/database/migrations/`
- Seeders: `backend/database/seeders/` (roles, example data)
- Factory data: `backend/database/factories/`

Common tasks

```bash
php artisan migrate:fresh --seed   # reset DB and seed (use carefully)
php artisan migrate                # run pending migrations
php artisan db:seed --class=SomeSeeder
```

Backups

- Use `mysqldump` or a managed backup for production. Keep SQL dumps out of the repo.

---

## Scripts and Useful Files

- `setup.bat` — convenience script to install deps and run migrations (Windows)
- `start-backend.bat` — runs Laravel server
- `start-frontend.bat` — runs Vite dev server
- `frontend/vapid_keys.txt` — stored VAPID keys for push notifications
- `backend/scripts/generate_vapid.php` and `frontend/scripts/generate_vapid.js` — helpers to generate VAPID keys

---

## Architecture & Folder Overview

- `backend/` — Laravel app (models, controllers, services, providers)
- `frontend/` — React app (components, pages, contexts)
- `public/` — public assets for Laravel
- `database/` — migrations and seeders

High-level responsibilities

- `app/Services` — domain services and business logic
- `app/Models` — Eloquent models and relationships
- `app/Http/Controllers/Api` — JSON APIs consumed by the frontend

---

## API Summary (select)

Base URL: `http://localhost:8000/api`

- `POST /auth/register` — register customer
- `POST /auth/login` — login (returns token)
- `GET /public/products` — public product listing
- `POST /products` — create product (admin)
- `POST /sales` — record a sale
- `POST /bookings` — create a booking
- `GET /reports/daily` — daily sales

Refer to `backend/routes/api.php` for the full list and controller responsibilities.

---

## Testing

Backend

```bash
cd backend
./vendor/bin/phpunit       # or use php artisan test
```

Frontend

```bash
cd frontend
npm test
```

Add tests when fixing bugs or adding features. Focus on API contract tests for backend and component/unit tests for frontend utilities.

---

## Deployment Notes

- Use environment-specific `.env` variables; do not commit secrets.
- Build frontend assets: `npm run build` and serve `dist/` via a static host or push to CDN.
- Use a process manager (Supervisor, systemd) for queue workers and scheduled tasks.
- Configure a regular database backup and monitor disk space for `storage/`.

Production checklist

- Set `APP_ENV=production`, `APP_DEBUG=false`
- Configure caching: `php artisan config:cache && php artisan route:cache`
- Run `php artisan migrate --force` for migrations

---

## Contributing

Thanks for considering contributions! Quick guidelines:

1. Fork the repo and create a feature branch: `feature/your-feature`
2. Run tests and linters locally
3. Open a pull request with a clear description and screenshots if UI changed
4. Keep commits focused and amend/squash as requested

Coding standards

- Follow PSR-12 for PHP
- Use Prettier / ESLint rules in `frontend/` for JS/React

---

## Troubleshooting

- If migrations fail: confirm DB credentials in `backend/.env` and that MariaDB is running.
- If uploads are missing: run `php artisan storage:link` and check `storage/permissions`.
- If Vite dev server fails: delete `node_modules` and reinstall `npm ci`.

If you hit an issue not documented here, open an issue with logs and reproduction steps.

---

## License & Contact

This repository does not include a license file. Add a `LICENSE` file if you want to make the project open-source.

For questions, contact the maintainers or open an issue in this repo.

---

_README generated and enriched to help contributors and operators._
