# GoConHub

An on-demand home services marketplace connecting customers with verified local vendors in Botswana. Customers can browse, book, pay, and review handymen and service providers — all from a single platform.

## Features

### Customer
- Browse and search vendors by category, location, or keyword
- Book services with date/time selection
- In-app messaging with vendors
- Mobile money (Orange/eWallet) and card payment flows
- Leave star ratings and reviews after completed jobs
- Raise disputes on bookings
- Help & support ticket submission

### Vendor
- Guided onboarding (profile, skills, identity docs, bank details)
- Service listing management (create, edit, delete, pricing)
- Booking management (accept, decline, complete)
- Real-time availability toggle (live/hidden)
- In-app messaging with customers
- Marketplace product listings
- Help & support access

### Admin
- Dashboard with platform-wide metrics
- Vendor verification and KYC (identity document review)
- Booking and payment oversight
- Dispute resolution centre
- User management (approve, suspend)
- Service category management
- Support ticket management
- Marketplace order moderation
- Platform settings

## Tech Stack

| Layer        | Technology                                    |
|-------------|-----------------------------------------------|
| Framework   | Next.js 14 (App Router)                       |
| Language    | TypeScript                                    |
| Database    | PostgreSQL (Supabase)                         |
| ORM         | Prisma 7 with `@prisma/adapter-pg`            |
| Auth        | HTTP-only cookies + JWT (`jose`)               |
| Passwords   | `bcryptjs`                                    |
| Styling     | Pure CSS with custom properties (no Tailwind) |
| UI Library  | Chakra UI (admin panel)                       |
| Icons       | Lucide React + custom SVG icons               |
| Animations  | Framer Motion                                 |
| Validation  | Zod                                           |
| Email       | Resend                                        |
| SMS/OTP     | Twilio                                        |
| Deployment  | Vercel                                        |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone the repo

```bash
git clone git@github.com:vimotechnologies/goconhub.git
cd goconhub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
JWT_SECRET="your-random-secret-min-32-chars"
```

Get your database connection string from Supabase: **Settings → Database → URI** (Session mode, port 5432).

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (auth, bookings, services, etc.)
│   ├── customer/         # Customer pages (explore, bookings, messages, profile)
│   ├── vendor/           # Vendor pages (dashboard, services, bookings, profile)
│   ├── support/          # Public support page
│   └── layout.tsx        # Root layout with UserProvider
├── components/
│   ├── admin/            # Admin dashboard and tab components
│   ├── auth/             # Login, register, OTP flows
│   ├── layout/           # Navigation (CustomerNav, VendorNav, AdminNav)
│   ├── onboarding/       # Vendor onboarding wizard
│   ├── support/          # Support form component
│   └── ui/               # Shared UI primitives (Toast, Toggle, Avatar, etc.)
├── context/              # React context (UserContext)
├── hooks/                # Custom hooks (useToast, etc.)
├── lib/                  # Utilities (auth, session, prisma, types, formatting)
└── styles/               # Global CSS with theme variables
prisma/
├── schema.prisma         # Database models
└── prisma.config.ts      # Prisma 7 config (adapter + connection)
```

## API Routes

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | `/api/auth/register`      | Create user (+ vendor if applicable) |
| POST   | `/api/auth/login`         | Authenticate and set session cookie |
| POST   | `/api/auth/logout`        | Clear session cookie               |
| GET    | `/api/auth/me`            | Get current user from cookie       |
| GET    | `/api/vendors`            | List vendors (filter by category/search) |
| GET    | `/api/bookings`           | List bookings for current user     |
| POST   | `/api/bookings`           | Create a new booking               |
| PATCH  | `/api/bookings/[id]`      | Update booking status              |
| GET    | `/api/messages`           | List messages for a booking        |
| POST   | `/api/messages`           | Send a message                     |
| GET    | `/api/services`           | List vendor's services             |
| POST   | `/api/services`           | Create a service                   |
| PATCH  | `/api/services/[id]`      | Update a service                   |
| DELETE | `/api/services/[id]`      | Delete a service                   |
| PATCH  | `/api/profile`            | Update user/vendor profile         |
| POST   | `/api/onboarding`         | Save onboarding data               |
| POST   | `/api/support`            | Submit a support ticket            |
| POST   | `/api/disputes`           | Raise a booking dispute            |
| POST   | `/api/otp/send`           | Send OTP code                      |
| POST   | `/api/otp/verify`         | Verify OTP code                    |

## Themes

The app uses CSS custom properties with three distinct themes:

- **Customer** — Warm amber tones (`#d97706` accent)
- **Vendor** — Dark navy + teal (`#2dd4bf` accent)
- **Admin** — Indigo palette (`#4F46E5` accent) with dark sidebar

Themes are applied via `data-theme` attributes on layout wrappers.

## Deployment

The app is deployed on **Vercel**. The build command is:

```bash
prisma generate && next build
```

Required environment variables on Vercel:

| Variable               | Description                          |
|------------------------|--------------------------------------|
| `DATABASE_URL`         | Supabase PostgreSQL connection string |
| `JWT_SECRET`           | Secret key for JWT signing           |
| `NEXT_PUBLIC_APP_NAME` | App display name                     |
| `NEXT_PUBLIC_APP_URL`  | Production URL (for callbacks)       |

## License

All rights reserved. This project is proprietary software owned by Vimo Technologies.
