# MO Marketplace

A full-stack product marketplace with variant management, JWT authentication, and Quick Buy flow.

## Architecture

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS 10 + TypeORM + PostgreSQL |
| **Frontend** | React 18 + Vite 5 + TypeScript |
| **Auth** | JWT with bcrypt password hashing, Passport strategy |
| **Validation** | class-validator / class-transformer (backend) + Zod + react-hook-form (frontend) |
| **API Docs** | Swagger (auto-generated at `/api`) |
| **Styling** | Custom CSS with dark theme, CSS custom properties |

## Prerequisites

- Node.js v20+
- npm v9+ or pnpm v8+
- PostgreSQL 15+ (local or Docker)
- Git

## Quick Start

### 1. Clone & Database Setup

```bash
git clone <repo-url>
cd mo-marketplace

# Option A: Docker (recommended)
docker run --name mo-db -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mo_marketplace -p 5432:5432 -d postgres:15

# Option B: Local PostgreSQL
createdb mo_marketplace
# TypeORM will auto-sync tables on first run (synchronize: true)
```

### 2. Backend

```bash
cd mo-marketplace-api

# Configure environment
cp .env.example .env
# Edit .env with your database credentials if different from defaults

# Install & run
npm install
npm run start:dev

# API available at:      http://localhost:3000
# Swagger docs at:       http://localhost:3000/api
```

### 3. Frontend

```bash
cd mo-marketplace-web
npm install
npm run dev

# App available at:      http://localhost:5173
```

### 4. Quick Test

1. Open http://localhost:5173
2. Click **Register** → create an account
3. Click **+ New Product** → fill in details, add variants with color/size/material attributes
4. View the product → select variants → click **Quick Buy**

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login with email & password, returns JWT |
| `GET` | `/auth/me` | Yes | Get current user profile |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/products` | No | List all products with variants |
| `GET` | `/products/:id` | No | Get product detail with variants |
| `POST` | `/products` | Yes | Create product (optionally with inline variants) |
| `PUT` | `/products/:id` | Yes | Update product fields |
| `DELETE` | `/products/:id` | Yes | Delete product and all its variants |

### Variants

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/products/:id/variants` | Yes | Add a variant to a product |
| `PUT` | `/products/:id/variants/:variantId` | Yes | Update variant price/stock/SKU |
| `DELETE` | `/products/:id/variants/:variantId` | Yes | Remove a variant |

### Quick Buy

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/products/:id/quick-buy` | Yes | Purchase a variant (decrements stock) |

**Body:** `{ "variantId": "uuid", "quantity": 1 }`

### Example: Create Product with Variants

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Classic T-Shirt",
    "description": "A comfortable cotton t-shirt",
    "basePrice": 29.99,
    "category": "Apparel",
    "variants": [
      {
        "attributes": { "color": "red", "size": "M", "material": "cotton" },
        "price": 34.99,
        "stock": 50,
        "sku": "TSHIRT-RED-M-COT"
      },
      {
        "attributes": { "color": "blue", "size": "L", "material": "polyester" },
        "price": 39.99,
        "stock": 30,
        "sku": "TSHIRT-BLU-L-POLY"
      }
    ]
  }'
```

## Key Decisions & Trade-offs

### combination_key Generation

Variant attributes are sorted **alphabetically by key**, then values are joined with hyphens.

| Input | Generated Key |
|-------|--------------|
| `{color: "red", size: "M", material: "cotton"}` | `red-M-cotton` |
| `{size: "M", color: "red", material: "cotton"}` | `red-M-cotton` |

Sorting by key ensures consistent keys regardless of attribute insertion order. The utility lives in `src/variants/combination-key.util.ts`.

### Duplicate Prevention (Two Layers)

1. **Service layer**: Pre-checks all variants in a batch create for key collisions; checks existing DB records when adding a single variant. Returns `409 Conflict` with a clear message like `Variant combination "red-M-cotton" already exists for this product`.
2. **Database layer**: `@Unique(['product', 'combinationKey'])` constraint as a safety net against race conditions.

### Out-of-Stock Handling

- **UI**: Variant chips with `stock <= 0` are visually disabled (grayed out, strikethrough, labeled "sold out")
- **Quick Buy button**: Disabled when selected variant is out of stock or user is not authenticated
- **Backend**: Validates `variant.stock >= quantity` before decrementing; returns `409 Conflict` with `Insufficient stock. Available: X, Requested: Y`

### Auth Strategy

- Simple JWT with bcrypt (10 salt rounds) — the assessment allows "mock or simple token-based"
- Product listing and detail are **public**; create/update/delete/buy are **JWT-protected**
- Token stored in `localStorage` for simplicity; auto-redirect to login on 401

### Frontend Validation

- Zod schemas mirror backend DTOs (email format, min lengths, price >= 0)
- react-hook-form provides real-time inline validation feedback
- API errors displayed via `react-hot-toast` notifications
- Variant attributes validated: at least one key-value pair required, price required

### Edge Cases Handled

| Edge Case | Backend | Frontend |
|-----------|---------|----------|
| Duplicate variant combination | `409 Conflict` with combination_key in message | Toast error displayed |
| Out-of-stock variant | N/A (listing is informational) | Chip disabled + strikethrough + "(sold out)" |
| Insufficient stock on purchase | `409 Conflict` with available vs requested | Toast error displayed |
| Invalid inputs | `400 Bad Request` with field-level errors (class-validator) | Inline form errors (Zod) |
| Non-existent product/variant | `404 Not Found` | Redirect to product list with toast |
| Unauthorized access | `401 Unauthorized` | Auto-redirect to login page |
| Duplicate email registration | `409 Conflict` "Email already registered" | Toast error displayed |

## Project Structure

```
mo-marketplace-api/              # NestJS backend
  src/
    auth/                        # JWT authentication module
      dto/                       #   RegisterDto, LoginDto
      entities/                  #   User entity
      guards/                    #   JwtAuthGuard
      strategies/                #   JWT Passport strategy
      auth.controller.ts         #   /auth endpoints
      auth.module.ts             #   Module wiring
      auth.service.ts            #   Auth business logic
    products/                    # Product management module
      dto/                       #   CreateProductDto, UpdateProductDto, QuickBuyDto
      entities/                  #   Product entity
      products.controller.ts     #   /products endpoints (CRUD + variants + quick-buy)
      products.module.ts         #   Module wiring
      products.service.ts        #   Product + variant business logic
    variants/                    # Variant definitions
      dto/                       #   CreateVariantDto, UpdateVariantDto
      entities/                  #   Variant entity (JSONB attributes, combination_key)
      combination-key.util.ts    #   generateCombinationKey() utility
    common/                      # Shared utilities
      decorators/                #   @Public() decorator
      filters/                   #   HttpExceptionFilter
      pipes/                     #   ValidateUUIDPipe
    config/                      # Configuration
      database.config.ts         #   PostgreSQL connection config
      jwt.config.ts              #   JWT secret and expiry config
    app.module.ts                # Root module (TypeORM, ConfigModule)
    main.ts                      # Bootstrap (CORS, Swagger, ValidationPipe)
  .env.example                   # Environment template

mo-marketplace-web/              # React frontend
  src/
    api/                         # HTTP client layer
      client.ts                  #   Axios instance with JWT interceptor
      auth.ts                    #   Auth API (register, login)
      products.ts                #   Products API (CRUD, variants, quick-buy)
    components/                  # Reusable UI components
      VariantSelector.tsx        #   Attribute-grouped variant picker
      QuickBuyModal.tsx          #   Purchase modal with quantity & total
    pages/                       # Route pages
      LoginPage.tsx              #   Login form with Zod validation
      RegisterPage.tsx           #   Registration form
      ProductListPage.tsx        #   Product card grid
      ProductDetailPage.tsx      #   Detail view with variant selection
      ProductCreatePage.tsx      #   Create form with dynamic variant builder
    store/                       # State management
      AuthContext.tsx             #   React Context for JWT + user state
    types/                       # Shared TypeScript interfaces
      index.ts                   #   Product, Variant, User, AuthResponse
  .env.example                   # Environment template
```

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | API server port |
| `NODE_ENV` | `development` | Environment mode |
| `DATABASE_URL` | — | PostgreSQL connection string (Railway/cloud — takes priority over individual vars) |
| `DB_HOST` | `localhost` | PostgreSQL host (local dev) |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | — | Database password |
| `DB_NAME` | `mo_marketplace` | Database name |
| `JWT_SECRET` | — | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated allowed origins |

### Frontend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |

## Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. **New Project** → **Deploy from GitHub repo** → select `mo-marketplace`
3. Click the service → **Settings**:
   - **Root Directory** → `mo-marketplace-api`
   - **Build Command** → `npm install && npm run build`
   - **Start Command** → `node dist/main.js`
4. **Add PostgreSQL**: Click **+ New** → **Database** → **PostgreSQL**
5. Click your web service → **Variables** → **Add Reference Variable** → select `DATABASE_URL` from PostgreSQL
6. Add remaining variables:
   - `PORT` = `3000`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(any random string)*
   - `JWT_EXPIRES_IN` = `7d`
   - `CORS_ORIGINS` = *(your Vercel frontend URL, set after Step 2)*
7. Copy the Railway public URL from **Settings** → **Networking** → **Generate Domain**

### Frontend → Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → Import `mo-marketplace`
2. Set **Root Directory** → `mo-marketplace-web`
3. Set **Framework Preset** → `Vite`
4. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL (e.g. `https://mo-marketplace-api-production.up.railway.app`)
5. Deploy
6. Copy the Vercel URL → go back to Railway and set `CORS_ORIGINS`

## API Documentation

Interactive Swagger documentation is auto-generated and available at:

- **Local:** http://localhost:3000/api
- **Deployed:** `<your-backend-url>/api`

Swagger includes:
- All endpoints with request/response schemas
- JWT Bearer authentication (click **Authorize** to add your token)
- Try-it-out functionality for testing endpoints directly
- DTO validation rules visible on each schema
