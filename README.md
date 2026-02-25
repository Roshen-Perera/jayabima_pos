## Jayabima POS

Jayabima POS is a full-stack Point of Sale web application built for small to mid-sized retail operations. It provides day-to-day sales workflows, inventory and customer management, and operational reporting in a modern, fast, and responsive interface. The project is structured around the Next.js App Router and uses Prisma with PostgreSQL to deliver a clean API surface and reliable data access.

### Highlights

- End-to-end POS flow with cart management, checkout, and receipt handling
- Role-based user model with authentication, session handling, and account management
- Customer, inventory, sales, suppliers, and reports sections with shared UI patterns
- Centralized stores and hooks for predictable client state
- Typed models and validation schemas to keep data consistent across UI and API

### Tech Stack

- Next.js 16 App Router, React 19, TypeScript 5
- Prisma ORM with PostgreSQL (Neon-ready)
- Tailwind CSS 4 with component utilities
- Zustand for client state management
- Zod for request and form validation
- Nodemailer for email flows

### Feature Areas

- **Authentication:** login, register, password reset, and session support under `app/api/auth/*`
- **Customers:** listing, search, stats, and CRUD-friendly forms
- **Inventory:** product listings, search, and stock visibility
- **Sales & POS:** cart management, checkout, receipt modal, and sales dashboard
- **Suppliers & Reports:** management screens and reporting views

### Project Structure

- `app/`: Next.js routes, pages, and layouts
- `app/api/`: route handlers for auth and server-side actions
- `components/`: shared UI and layout components
- `store/`: Zustand stores for domain state
- `lib/`: helpers for Prisma, auth, and utilities
- `prisma/`: schema and database configuration

### Environment Variables

Create a `.env` file at the project root with values similar to:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="your-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EMAIL_USER="you@example.com"
EMAIL_PASSWORD="app-password"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_FROM="Jayabima POS <you@example.com>"
```

### Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the app. The API routes live under `app/api` and Prisma models are defined in `prisma/schema.prisma`.

### Scripts

- `npm run dev` - start the development server
- `npm run build` - build the production bundle
- `npm run start` - run the production server
- `npm run lint` - lint the codebase
