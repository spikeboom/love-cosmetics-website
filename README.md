# Love Cosmetics

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)

[Português](./README.pt-BR.md)

E-commerce platform for cosmetics and beauty products built with Next.js 15, React 19, and modern web technologies.

## Features

- **Product Catalog** - Browse products by category with dynamic filtering
- **Shopping Cart** - Add products, apply coupons, and manage quantities
- **Checkout Flow** - Multi-step checkout with identification, shipping, and payment
- **User Authentication** - Customer registration, login, and password recovery
- **Customer Dashboard** - Manage account data, addresses, orders, and security settings
- **Payment Integration** - PagBank integration with PIX and credit card support
- **Admin Panel** - Order management and invoice generation
- **Shipping Calculation** - Frenet API integration for shipping quotes
- **ERP Integration** - Bling API for invoice (NF-e) generation

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4 + Material UI 6
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with jose library
- **Forms**: React Hook Form + Zod validation
- **Testing**: Playwright for E2E tests
- **State Management**: React Context + Cookies

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/spikeboom/love-cosmetics-website.git
cd love-cosmetics-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Configure the following variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PAGBANK_TOKEN` - PagBank API credentials
- `BLING_CLIENT_ID` / `BLING_CLIENT_SECRET` - Bling ERP credentials
- `FRENET_TOKEN` - Frenet shipping API token

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin panel routes
│   ├── (global)/          # Main store routes
│   │   ├── (cliente-logado)/  # Authenticated customer area
│   │   ├── (loja)/        # Store pages (login, register)
│   │   └── (main)/        # Main pages (home, checkout, PDP)
│   └── api/               # API routes
│       ├── cliente/       # Customer authentication & data
│       ├── pagbank/       # Payment processing
│       ├── pedido/        # Order management
│       └── bling/         # ERP integration
├── components/            # Reusable React components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # External API services
└── types/                 # TypeScript type definitions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Playwright tests |
| `npm run test:headed` | Run tests with browser UI |
| `npm run test:ui` | Open Playwright test UI |

## API Routes

### Authentication
- `POST /api/cliente/auth/cadastrar` - Register new customer
- `POST /api/cliente/auth/entrar` - Customer login
- `POST /api/cliente/auth/sair` - Logout
- `POST /api/cliente/auth/recuperar-senha` - Password recovery

### Orders
- `POST /api/pedido` - Create new order
- `GET /api/pedido/admin` - List orders (admin)
- `POST /api/pedidos/[id]/gerar-nota` - Generate invoice

### Payments
- `POST /api/pagbank/create-order` - Create PagBank payment
- `POST /api/pagbank/webhook` - Payment notifications

## License

Private - All rights reserved.
