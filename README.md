# MO Marketplace

A full-stack product marketplace with variant management, JWT authentication, and Quick Buy flow.

## Architecture

- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React + Vite + TypeScript
- **Auth**: JWT (bcrypt password hashing, Passport strategy)
- **Validation**: class-validator (backend) + Zod + react-hook-form (frontend)
- **API Docs**: Swagger (auto-generated at `/api`)

## Prerequisites

- Node.js v20+
- npm v9+
- PostgreSQL 15+ (local or Docker)

## Quick Start

### 1. Database Setup

```bash
# Option A: Docker (recommended)
docker run --name mo-db -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mo_marketplace -p 5432:5432 -d postgres:15

# Option B: Local PostgreSQL
createdb mo_marketplace
```

### 2. Backend

```bash
cd mo-marketplace-api

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Install & run
npm install
npm run start:dev

# API: http://localhost:3000
# Swagger: http://localhost:3000/api
```

### 3. Frontend

```bash
cd mo-marketplace-web
npm install
npm run dev

# App: http://localhost:5173
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/auth/me` | Yes | Current user profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | No | List all products |
| GET | `/products/:id` | No | Get product detail |
| POST | `/products` | Yes | Create product (with variants) |
| PUT | `/products/:id` | Yes | Update product |
| DELETE | `/products/:id` | Yes | Delete product |

### Variants
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/products/:id/variants` | Yes | Add variant |
| PUT | `/products/:id/variants/:vid` | Yes | Update variant |
| DELETE | `/products/:id/variants/:vid` | Yes | Delete variant |

### Quick Buy
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/products/:id/quick-buy` | Yes | Purchase a variant |

## Key Decisions & Trade-offs

### combination_key Generation
Variant attributes are sorted alphabetically by key, values are lowercased and joined with hyphens.
Example: `{color: "Red", size: "M", material: "Cotton"}` → `"cotton-red-m"`

This ensures consistent keys regardless of attribute insertion order.

### Duplicate Prevention
- **Backend**: Unique constraint on `(product_id, combination_key)` at the database level
- **Create flow**: Pre-checks all variants for duplicates before saving
- **Add variant**: Checks existing variants before insertion

### Out-of-Stock Handling
- Variants with `stock <= 0` are visually disabled (strikethrough + grayed out)
- Quick Buy button is disabled when selected variant is out of stock
- Backend validates stock availability during purchase

### Auth Strategy
- Simple JWT with bcrypt — the assessment allows "mock or simple token-based"
- Product listing and detail are public; create/update/delete/buy require auth
- Token stored in localStorage for simplicity

### Frontend Validation
- Zod schemas mirror backend DTOs
- react-hook-form provides real-time validation feedback
- API errors are displayed via toast notifications

## Project Structure

```
mo-marketplace-api/         # NestJS backend
  src/
    auth/                   # JWT auth (register, login, guard, strategy)
    products/               # Product CRUD + quick-buy
    variants/               # Variant entities + DTOs
    common/                 # Exception filter
    app.module.ts           # Root module (TypeORM, Config)
    main.ts                 # Bootstrap (CORS, Swagger, Validation)

mo-marketplace-web/         # React frontend
  src/
    api/                    # Axios client + endpoint wrappers
    components/             # QuickBuyModal
    pages/                  # Login, Register, ProductList, ProductDetail, ProductCreate
    store/                  # AuthContext (JWT + user state)
    types/                  # TypeScript interfaces
```
