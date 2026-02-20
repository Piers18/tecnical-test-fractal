# Backend — Order Management API

REST API built with Express and TypeScript for managing orders and products.

## Tech Stack

- **Node.js** + **Express 4**
- **TypeScript** — Static typing
- **pg** — PostgreSQL driver
- **tsx** — Direct TypeScript execution in development

## Installation

```bash
npm install
```

## Running

```bash
# Development (hot-reload)
npm run dev

# Production build
npm run build

# Run production
npm start
```

## Architecture

```
src/
├── index.ts          # Express setup, middleware, and route mounting
├── db.ts             # PostgreSQL connection pool
├── init-db.ts        # Table creation and seed data
├── types/
│   └── index.ts      # Shared interfaces
└── routes/
    ├── products.ts       # /api/products — Product CRUD
    ├── orders.ts         # /api/orders — Order CRUD + status management
    └── orderProducts.ts  # /api/orders/:id/products — Order-product management
```

## Design Patterns

- **Modular routing**: Each resource has its own route file
- **Connection pooling**: Efficient connection reuse with `pg.Pool`
- **Idempotent initialization**: Tables are created with `IF NOT EXISTS`
- **Server-side validation**: Every endpoint validates incoming data
- **State protection**: Completed orders reject modifications (HTTP 403)

## Endpoints

### `GET /api/health`

Server health check.

### Products (`/api/products`)

- `GET /` — List all products
- `GET /:id` — Get product by ID
- `POST /` — Create a product (`{ name, unit_price }`)
- `PUT /:id` — Update a product
- `DELETE /:id` — Delete a product

### Orders (`/api/orders`)

- `GET /` — List all orders with product count and total price (JOIN query)
- `GET /:id` — Get an order with detailed product list
- `POST /` — Create an order (`{ order_number, date? }`)
- `PUT /:id` — Update order number
- `DELETE /:id` — Delete an order (cascades to products)
- `PATCH /:id/status` — Change status (`{ status: 'Pending' | 'InProgress' | 'Completed' }`)

### Order Products (`/api/orders/:id/products`)

- `GET /` — List products in an order
- `POST /` — Add product (`{ product_id, qty }`)
- `PUT /:productId` — Update quantity (`{ qty }`)
- `DELETE /:productId` — Remove product from the order

## Response Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | Successful operation                    |
| 201  | Resource created                        |
| 400  | Invalid data                            |
| 403  | Operation not allowed (completed order) |
| 404  | Resource not found                      |
| 409  | Conflict (duplicate order number)       |
| 500  | Internal server error                   |
