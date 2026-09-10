# StockDesk

Product catalog and inventory management system. An authenticated admin can manage
categories and products with stock tracking.

Built as a full-stack coding assessment for Gmart Online (Pvt) Ltd.

## Tech stack

**Backend**
- Node.js with Express
- MySQL accessed through Knex (migrations and query builder, mysql2 driver)
- JWT authentication with bcryptjs password hashing

**Frontend**
- React with Vite
- TanStack React Query for all server state
- React Router with protected routes
- Axios with request and response interceptors
- Tailwind CSS

## Prerequisites

- Node.js 18 or later
- MySQL 8 or later running locally

## Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd gmart-product-catalog
```

### 2. Create the database

In MySQL Workbench or the MySQL shell:

```sql
CREATE DATABASE product_catalog
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your MySQL credentials:

```
PORT=5002

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=product_catalog

JWT_SECRET=any_long_random_string_at_least_32_characters
JWT_EXPIRES_IN=1d
```

Run the migrations and seed the sample data:

```bash
npm run migrate
npm run seed
npm run dev
```

The API runs on http://localhost:5002

### 4. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on http://localhost:5173

## Login credentials

The seed creates one admin account:

```
Email:    admin@gmart.com
Password: Admin@123
```

## Available scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start the API with nodemon |
| `npm start` | Start the API |
| `npm run migrate` | Apply all pending migrations |
| `npm run rollback` | Roll back the last migration batch |
| `npm run seed` | Insert the sample data |
| `npm run db:reset` | Roll back everything, re-migrate and re-seed |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |

## API endpoints

All endpoints except register and login require an `Authorization: Bearer <token>` header.
Requests without a valid token return 401.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an admin account |
| POST | `/api/auth/login` | Authenticate and receive a token |
| GET | `/api/auth/me` | Return the authenticated user |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all categories with product counts |
| GET | `/api/categories/:id` | Get one category |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category |
| POST | `/api/categories/bulk-delete` | Delete several categories |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Paginated, searchable list |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

The product list accepts query parameters:

```
GET /api/products?page=1&limit=10&search=phone&categoryId=2
```

The response includes pagination metadata:

```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 10, "total": 18, "totalPages": 2 }
}
```

## Database schema

```
users                categories              products
-----                ----------              --------
id (PK)              id (PK)                 id (PK)
name                 name (unique)           name
email (unique)       description             description
password (hash)      created_at              price      DECIMAL(10,2)
role                 updated_at              stock      INT UNSIGNED
created_at                                   category_id (FK → categories.id)
updated_at                                   created_at
                                             updated_at
```

## Design decisions

**Category deletion is blocked, not cascaded.** The foreign key uses `ON DELETE RESTRICT`,
so the database refuses to delete a category that still has products. The controller checks
for attached products first and returns a 409 with a readable message naming how many
products are blocking the delete. Cascading would silently destroy every product in the
category from a single click, which is unrecoverable data loss.

**Stock cannot go below zero at two levels.** The column is `INT UNSIGNED`, so the database
itself rejects a negative value regardless of how the write arrives. The controller also
validates and returns a clear 400, so the client gets a useful message rather than a raw
database error.

**Price is `DECIMAL(10,2)`, not a float.** Floating point cannot represent most decimal
fractions exactly, so monetary totals drift over many rows. Note that the mysql2 driver
returns `DECIMAL` columns as strings to preserve that precision, which the frontend
converts before formatting.

**Pagination counts and rows share one filtered query.** The base query is built once with
the search and category filters applied, then cloned twice: once for `COUNT(*)` and once
for the page of rows. A Knex query builder is consumed on execution, so cloning is required.
This guarantees the total and the returned rows never disagree.

**Search is debounced by 400ms.** Without it, every keystroke would fire a request.

**React Query keys include every parameter.** The key `["products", { page, search }]` means
each page and search term is cached independently, so paging back is instant. After any
mutation the product and category caches are invalidated so the server stays the single
source of truth rather than the client patching its own state.

**Axios interceptors handle auth centrally.** A request interceptor attaches the stored
token to every call. A response interceptor clears the session and redirects on a 401,
except on the login endpoint where a 401 legitimately means wrong credentials.

**Indexes on `products.name` and `products.category_id`.** These are the columns filtered
and joined on. A leading-wildcard `LIKE '%term%'` cannot use a standard B-tree index, so at
larger scale a `FULLTEXT` index would be the appropriate next step.


## Not implemented

Given the time available, the following were left out:

- Refresh tokens (the access token is valid for one day)
- Role-based permissions beyond a single admin role
- Product image upload
- Automated tests