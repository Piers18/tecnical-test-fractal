# Order Management System

Full-stack order management system built with React + TypeScript on the frontend and Express + TypeScript on the backend, using PostgreSQL as the database.

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, React Router, Axios |
| Backend  | Node.js, Express 4, TypeScript                  |
| Database | PostgreSQL 15 (Docker)                          |
| Styling  | Vanilla CSS with modular design system          |
| Icons    | Google Material Icons                           |

## Prerequisites

- **Node.js** v18+
- **npm** v9+
- **Docker Desktop** installed and running

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd pruebaTecnica
```

### 2. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 15 container on port `5433`.

### 3. Start the backend

```bash
cd backend
npm install
npm run dev
```

The server runs on `http://localhost:4000`. On first start, it automatically creates the database tables and seeds 3 default products.

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Project Structure

```
pruebaTecnica/
├── docker-compose.yml              # PostgreSQL configuration
├── README.md                       # This documentation
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Server entry point
│       ├── db.ts                   # PostgreSQL connection pool
│       ├── init-db.ts              # Schema initialization & seed data
│       ├── types/
│       │   └── index.ts            # TypeScript interfaces
│       └── routes/
│           ├── products.ts         # Product CRUD
│           ├── orders.ts           # Order CRUD + status management
│           └── orderProducts.ts    # Order-product management
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx                # Entry point
│       ├── App.tsx                 # Route configuration
│       ├── index.css               # Complete design system
│       ├── types/
│       │   └── index.ts            # TypeScript interfaces
│       ├── api/
│       │   └── api.ts              # Axios HTTP client
│       ├── components/
│       │   ├── Layout.tsx          # Sidebar layout
│       │   ├── Sidebar.tsx         # Side navigation
│       │   ├── Modal.tsx           # Reusable modal
│       │   └── ConfirmModal.tsx    # Confirmation modal
│       └── pages/
│           ├── MyOrders.tsx        # Orders listing view
│           ├── AddEditOrder.tsx    # Create/edit order view
│           └── Products.tsx        # Products CRUD view
```

## Application Views

### My Orders (`/my-orders`)

- Title "My Orders"
- Table with columns: ID, Order #, Date, # Products, Final Price, Status, Options
- Row options:
  - **Edit**: Redirects to the edit view
  - **Delete**: Confirmation modal before deletion
  - **Change status**: Dropdown with Pending, InProgress, Completed options
- "Add Order" button to create a new order

### Add/Edit Order (`/add-order/:id`)

- Dynamic title: "Add Order" or "Edit Order" based on the ID parameter
- Form fields:
  - **Order #**: Editable input
  - **Date**: Disabled, auto-filled with current date
  - **# Products**: Disabled, auto-calculated product count
  - **Final Price**: Disabled, auto-calculated price sum
- Button to add product → Opens a modal with product selector and quantity input
- Table of added products with edit and remove options
- Save/Create order button

### Products (`/products`)

- Full CRUD for products
- Table with columns: ID, Name, Unit Price, Options
- Modal for adding/editing products
- Confirmation before deletion

## API Endpoints

### Products

| Method   | Route               | Description          |
| -------- | ------------------- | -------------------- |
| `GET`    | `/api/products`     | List all products    |
| `GET`    | `/api/products/:id` | Get a single product |
| `POST`   | `/api/products`     | Create a product     |
| `PUT`    | `/api/products/:id` | Update a product     |
| `DELETE` | `/api/products/:id` | Delete a product     |

### Orders

| Method   | Route                    | Description                                      |
| -------- | ------------------------ | ------------------------------------------------ |
| `GET`    | `/api/orders`            | List orders (with product count and total price) |
| `GET`    | `/api/orders/:id`        | Get an order with its products                   |
| `POST`   | `/api/orders`            | Create an order                                  |
| `PUT`    | `/api/orders/:id`        | Update an order                                  |
| `DELETE` | `/api/orders/:id`        | Delete an order                                  |
| `PATCH`  | `/api/orders/:id/status` | Change order status                              |

### Order Products

| Method   | Route                                 | Description                   |
| -------- | ------------------------------------- | ----------------------------- |
| `GET`    | `/api/orders/:id/products`            | List products in an order     |
| `POST`   | `/api/orders/:id/products`            | Add product to the order      |
| `PUT`    | `/api/orders/:id/products/:productId` | Update quantity               |
| `DELETE` | `/api/orders/:id/products/:productId` | Remove product from the order |

## Database

### Schema

#### `products` Table

| Column     | Type          | Description       |
| ---------- | ------------- | ----------------- |
| id         | SERIAL PK     | Unique identifier |
| name       | VARCHAR(255)  | Product name      |
| unit_price | DECIMAL(10,2) | Unit price        |

#### `orders` Table

| Column       | Type               | Description                    |
| ------------ | ------------------ | ------------------------------ |
| id           | SERIAL PK          | Unique identifier              |
| order_number | VARCHAR(50) UNIQUE | Order number                   |
| date         | DATE               | Order date                     |
| status       | VARCHAR(20)        | Pending, InProgress, Completed |
| created_at   | TIMESTAMP          | Creation timestamp             |
| updated_at   | TIMESTAMP          | Last update timestamp          |

#### `order_products` Table

| Column     | Type       | Description             |
| ---------- | ---------- | ----------------------- |
| id         | SERIAL PK  | Unique identifier       |
| order_id   | INTEGER FK | References orders(id)   |
| product_id | INTEGER FK | References products(id) |
| qty        | INTEGER    | Quantity (minimum 1)    |

### Seed Data

On first backend startup, 3 default products are created:

- Product A — $29.99
- Product B — $49.99
- Product C — $99.99

## Extra Features

### Status Management

Orders support three statuses:

- **Pending** (blue badge): Initial status on creation
- **InProgress** (orange badge): Order being processed
- **Completed** (green badge): Order fulfilled

### Completed Order Protection

Orders with "Completed" status cannot be modified or deleted:

- The backend returns `403 Forbidden` on edit, delete, or product modification attempts
- The frontend renders the order in read-only mode
- Edit and delete buttons are disabled

## Environment Variables

### Backend

| Variable      | Default   | Description       |
| ------------- | --------- | ----------------- |
| `PORT`        | 4000      | Server port       |
| `DB_HOST`     | localhost | PostgreSQL host   |
| `DB_PORT`     | 5433      | PostgreSQL port   |
| `DB_USER`     | admin     | Database user     |
| `DB_PASSWORD` | admin123  | Database password |
| `DB_NAME`     | orders_db | Database name     |

## Available Scripts

### Backend

```bash
npm run dev      # Development server with hot-reload (tsx watch)
npm run build    # Compile TypeScript
npm start        # Run production build
```

### Frontend

```bash
npm run dev      # Vite development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Technical Considerations

- **No authentication**: The API is open, no login or tokens required
- **CORS enabled**: The backend accepts requests from any origin
- **Cascade delete**: Deleting an order automatically removes its associated products
- **Idempotent init**: Database initialization uses `IF NOT EXISTS` to avoid conflicts
- **Validation**: Both frontend and backend validate data before processing
