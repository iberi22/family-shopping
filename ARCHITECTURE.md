# ARCHITECTURE.md - System Architecture

**Project:** Family Shopping (Canasta Familiar)
**Version:** 2.0.0
**Generated:** 2026-03-24
**Updated:** 2026-03-25

## Overview

Family Shopping is an open-source family shopping management system for Colombian supermarkets. It enables price comparison across stores, shopping list management, savings tracking, price alerts, and store geolocation.

**Target Market:** Colombian families managing household grocery budgets
**Author:** Belal (BeRi0n3)
**Repo:** https://github.com/iberi22/family-shopping

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Applications                         │
│   (Mobile App, Web Frontend, CLI, or any HTTP client)               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTP/REST
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Canasta Familiar API Server                      │
│                         Express.js :3003                            │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │   Routes    │  │  Services   │  │   Scraper   │  │   Utils   │ │
│  │  /api/*     │  │  Business   │  │   Service   │  │           │ │
│  │  /health    │  │    Logic    │  │  (undici)   │  │           │ │
│  └─────────────┘  └──────┬──────┘  └─────────────┘  └───────────┘ │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SQLite Database                               │
│                        (better-sqlite3)                             │
│                                                                      │
│  stores | products | prices | shopping_lists | purchases           │
│  categories | alerts | savings_goals | family_members | budgets    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. API Server (`src/index.ts`)
- **Technology:** Express.js + TypeScript
- **Port:** 3003 (configurable via PORT env)
- **Middleware:** CORS, JSON body parser
- **Responsibility:** HTTP request handling, route dispatching

### 2. Database Layer (`src/db/init.ts`)
- **Technology:** SQLite via better-sqlite3
- **Location:** `./data/canasta.db`
- **Responsibility:** Persistent storage, schema initialization
- **Features:** Auto-creates tables, inserts default categories and sample stores

### 3. Business Services (`src/services/canasta.service.ts`)
| Service | Responsibility |
|---------|---------------|
| `storeService` | CRUD for stores, geolocation search |
| `productService` | Product catalog, search, categories |
| `priceService` | Price recording, comparison, best price |
| `listService` | Shopping list management |
| `categoryService` | Category management |
| `statsService` | Monthly spending statistics |
| `alertService` | Price drop & budget alerts |
| `savingsService` | Savings calculation from promotions & comparisons |
| `geoService` | Store proximity search, coordinates |

### 4. Web Scraper Service (`src/services/scraper.service.ts`)
- **Technology:** undici HTTP client
- **Targets:** Éxito, Jumbo, Olímpica, Mercado Libre APIs
- **Responsibility:** Real-time price fetching from online stores
- **Timeout:** 10 seconds per request

---

## Data Flow

### Price Comparison Flow
```
1. Client → GET /api/prices/compare/:productId
2. API route → priceService.comparePrices(productId)
3. Service → SELECT prices FROM stores WHERE product_id = ?
4. Database → Returns price list sorted by price ASC
5. Response → [{store, price, promotion, ...}, ...]
```

### Shopping List Completion Flow
```
1. Client → POST /api/lists/:id/complete { total }
2. API → listService.complete(id, total)
3. Service → UPDATE shopping_lists SET status='completed'
4. Service → INSERT into purchases table
5. Response → { success: true }
```

### Alert Checking Flow
```
1. Client → POST /api/alerts/check
2. API → alertService.checkAlerts()
3. Service → For each active alert:
   - price_drop: Check if current price <= threshold
   - budget: Check if monthly spend >= threshold
   - promotion: Check for recent promos
4. Response → { triggered: [alert, ...], count }
```

---

## Database Schema

### Core Entities
| Table | Purpose |
|-------|---------|
| `stores` | Supermarkets with geolocation |
| `categories` | Product categories with icons/colors |
| `products` | Product catalog with barcode |
| `prices` | Price history per product per store |
| `shopping_lists` | Family shopping lists |
| `shopping_list_items` | Items in shopping lists |
| `purchases` | Completed purchase transactions |
| `purchase_items` | Line items in purchases |
| `family_members` | User management |
| `budgets` | Budget limits per category |

### Alert System
| Table | Purpose |
|-------|---------|
| `alerts` | Price drop, budget, promotion alerts |
| `savings_goals` | Monthly savings targets |
| `price_alerts_log` | Alert trigger history |

---

## API Endpoints Summary

| Category | Endpoints |
|----------|-----------|
| **Health** | `GET /health` |
| **Stores** | `GET/POST /api/stores`, `GET /api/stores/nearby`, `GET /api/stores/map`, `GET/PATCH /api/stores/:id` |
| **Products** | `GET /api/products`, `GET /api/products/search`, `GET/POST /api/products/:id` |
| **Prices** | `GET /api/prices`, `GET /api/prices/compare/:productId`, `GET /api/prices/best/:productId`, `POST /api/prices` |
| **Lists** | `GET/POST /api/lists`, `GET /api/lists/:id`, `POST /api/lists/:id/items`, `POST /api/lists/:id/complete` |
| **Alerts** | `GET/POST /api/alerts`, `POST /api/alerts/check`, `DELETE /api/alerts/:id` |
| **Savings** | `GET /api/savings`, `GET /api/savings/promotions`, `GET /api/savings/comparison`, `POST/GET /api/savings/goal` |
| **Scraper** | `GET /api/scrape/search`, `GET /api/scrape/recommend`, `GET /api/scrape/compare` |

---

## Supported Colombian Stores

- **Supermarkets:** Éxito, Carrefour, Jumbo, Carulla, Olímpica, Aldi
- **Discount:** D1, Ara
- **Wholesale:** Cash
- **Online:** Mercado Libre, Linio, Falabella

---

## Security Considerations

1. **Local-First:** All data stored locally in SQLite — no cloud sync by default
2. **No Authentication:** Current version has no user auth (family_members table exists for future use)
3. **Input Validation:** Uses Zod for validation (dependency present)
4. **CORS:** Enabled for all origins (configure for production)
5. **SQL Injection:** Protected via better-sqlite3 prepared statements

---

## Development Status

| Component | Status |
|-----------|--------|
| API Server | ✅ Stable |
| Database Schema | ✅ Stable |
| Core Services | ✅ Stable |
| Web Scraper | ✅ Functional (rate limit aware) |
| Unit Tests | ⚠️ Not configured |
| ESLint | ⚠️ Config file exists, not enforced |
| CI/CD | ⚠️ Basic GitHub Actions |

---

*Generated by SWAL Agent System - TOGAF ADM Lite*
