# Frontend — Order Management App

Web application built with React and TypeScript for visual order and product management.

## Tech Stack

- **React 19** — UI library
- **TypeScript** — Static typing
- **Vite 7** — Build tool and dev server
- **React Router 7** — SPA navigation
- **Axios** — HTTP client
- **Google Material Icons** — Iconography
- **Vanilla CSS** — Styles with custom properties

## Installation

```bash
npm install
```

## Running

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Architecture

```
src/
├── main.tsx              # React entry point
├── App.tsx               # React Router configuration
├── index.css             # Complete design system
│
├── types/
│   └── index.ts          # TypeScript interfaces
│
├── api/
│   └── api.ts            # Typed Axios client
│
├── components/
│   ├── Layout.tsx        # Main layout (sidebar + outlet)
│   ├── Sidebar.tsx       # Side navigation
│   ├── Modal.tsx         # Reusable modal component
│   └── ConfirmModal.tsx  # Confirmation modal with actions
│
└── pages/
    ├── MyOrders.tsx       # Orders listing view
    ├── AddEditOrder.tsx   # Create/edit order view
    └── Products.tsx       # Products CRUD view
```

## Routes

| Route            | Component      | Description               |
| ---------------- | -------------- | ------------------------- |
| `/`              | —              | Redirects to `/my-orders` |
| `/my-orders`     | `MyOrders`     | Orders listing            |
| `/add-order/new` | `AddEditOrder` | Create new order          |
| `/add-order/:id` | `AddEditOrder` | Edit existing order       |
| `/products`      | `Products`     | Product management        |

## Design System

### Visual Theme

- **Layout**: Fixed left sidebar + main content area
- **Colors**: Light theme with orange accent (#e8732a)
- **Typography**: Inter (Google Fonts)
- **Icons**: Google Material Icons
- **Components**: Cards with subtle borders, clean tables, colored status badges

### Status Badges

| Status     | Color  |
| ---------- | ------ |
| Pending    | Blue   |
| InProgress | Orange |
| Completed  | Green  |

## Reusable Components

### `Modal`

Generic modal with overlay, title, and close button. Accepts any content as children.

```tsx
<Modal isOpen={true} onClose={handleClose} title="Title">
  {/* Content */}
</Modal>
```

### `ConfirmModal`

Confirmation modal with message, cancel button, and action button. Supports `danger` mode for destructive actions.

```tsx
<ConfirmModal
  isOpen={true}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Delete"
  message="Are you sure?"
  confirmText="Delete"
  danger
/>
```

### `Sidebar`

Side navigation with branding, active link highlighting, and user profile.

### `Layout`

Wrapper component that combines the Sidebar with React Router's `<Outlet>`.

## Backend Connection

The `api/api.ts` file centralizes all HTTP calls using Axios with base URL `http://localhost:4000/api`. Every function is typed using the interfaces defined in `types/index.ts`.

### Available functions:

**Products:**

- `getProducts()` / `createProduct()` / `updateProduct()` / `deleteProduct()`

**Orders:**

- `getOrders()` / `getOrder()` / `createOrder()` / `updateOrder()` / `deleteOrder()` / `updateOrderStatus()`

**Order Products:**

- `getOrderProducts()` / `addOrderProduct()` / `updateOrderProduct()` / `removeOrderProduct()`

## Notes

- The Add/Edit Order view handles two flows:
  - **Create** (`/add-order/new`): Products are stored in local state until save
  - **Edit** (`/add-order/:id`): Products are sent directly to the API
- Completed orders are rendered in read-only mode
- Date, # Products, and Final Price fields are auto-calculated
- The sidebar collapses to icons-only on screens smaller than 768px
