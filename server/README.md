# O.U.A.T. API (MySQL)

Express API for catalogue data and form submissions (Hostinger MySQL).

## Setup

1. Copy project root `.env.example` to `.env` and fill **DB_** variables (from hPanel → Databases).
2. Install dependencies: `npm install` (from project root).
3. Apply schema: `npm run db:migrate`
4. Test connection: `npm run db:test`
5. Start API: `npm run dev:api` (port **3001** by default).

## Hostinger notes

- **Node.js app (hPanel):** Set **Entry file** to `server/index.js` (not `server.js` at the project root). Build command: `npm run build` if the host runs a build step; start command: `npm start` (runs `node server/index.js`).
- **phpMyAdmin works ≠ remote works.** phpMyAdmin logs in as `user@localhost`. Your PC connects as `user@your-public-ip` — you need **Remote MySQL** for site **bipminds.com** (`%` or your IP) plus matching password.
- **API on Hostinger** (same account as the DB): `DB_HOST=127.0.0.1` (not `localhost` for Node.js).
- **API on your PC**: `DB_HOST=srvXXXX.hstgr.io` from **Remote MySQL** (manage **bipminds.com**).
- If remote login keeps failing: **Enter phpMyAdmin** → Import → upload `server/db/schema.sql` (and run migrate SQL for `users` if needed).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | API + DB status |
| GET | `/api/collections` | All collections |
| GET | `/api/products?collection=&sort=` | Products |
| POST | `/api/newsletter` | `{ email }` |
| POST | `/api/contact` | Contact form |
| POST | `/api/enquiries` | B2B form |

Seed catalogue: `npm run db:seed` (after `db:apply`). Example SQL: `server/db/catalog-queries.sql`.

### Product list API

`GET /api/products` query parameters:

| Param | Example | Purpose |
|-------|---------|---------|
| `collection` | `glassware` | Filter by collection slug |
| `sort` | `featured`, `newest`, `price-asc`, `price-desc` | Sort order |
| `featured` | `1` | Featured only |
| `ids` | `p-001,p-002` | Specific product ids |
| `limit` | `8` | Max rows (cap 100) |
| `q` | `tumbler` | Search name / story / description |

Frontend: `productService.js` uses these via `VITE_CATALOG_SOURCE=auto` (API with mock fallback).

### Product photos

- Edit `catalog/galleryMap.js` — map each product slug to up to **6** filenames in `src/components/images/`.
- `npm run catalog:sync-images` — copies files to `public/images/` (mock / URL mode).
- `npm run db:seed` — stores **base64 data URLs** in `products.images_json` for API mode.
- Add new PNGs under `src/components/images/`, register in `IMAGE_FILES`, then re-sync and re-seed.

### Product + image tables

| Table | Purpose |
|-------|---------|
| `products` | `name`, `price`, `available_quantity`, `description`, `is_active`, slug, collection, … |
| `product_images` | One row per photo: `product_id`, `sort_order`, `image_src` (URL or base64), `alt_text`, `tone`, `is_active` |

API still returns `images: [{ src, alt, tone }, …]` on each product (joined from `product_images`).

Catalogue reads/writes use **stored procedures** (`sp_products_list`, `sp_product_upsert`, etc.) — see `server/scripts/install-procedures.js` and `server/db/stored-procedures.sql`. Re-run `npm run db:migrate` after pulling SP changes.
