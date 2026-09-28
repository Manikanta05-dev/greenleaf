# GreenLeaf Nursery — production-ready e-commerce starter

A full-stack plant nursery storefront built with Next.js App Router, TypeScript, PostgreSQL + Prisma, secure cookie/JWT sessions, and Stripe Checkout. It includes a customer storefront, search/filtering, cart, accounts, addresses, checkout, orders, and an admin dashboard.

## Stack
- Next.js 16.3.3 + React 19 + TypeScript
- PostgreSQL + Prisma ORM 7.10
- Secure httpOnly JWT session cookie + bcrypt password hashing
- Stripe Checkout + signed webhook
- Responsive CSS with no UI framework dependency
- Deploy target: Vercel + managed PostgreSQL (Prisma Postgres, Neon, Supabase, etc.)

## Local setup
1. Install Node.js 22.12+.
2. Create PostgreSQL database.
3. Copy `.env.example` to `.env` and fill in values.
4. Install dependencies: `npm install`
5. Create/apply schema: `npx prisma migrate dev --name init`
6. Seed demo catalog/admin: `npm run db:seed`
7. Start: `npm run dev`
8. Open http://localhost:3000

Demo admin: `admin@greenleaf.local` / `ChangeMe123!` — change it immediately for any real deployment.

## Stripe
Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Configure a Stripe webhook endpoint at `/api/stripe/webhook` for `checkout.session.completed` and `checkout.session.expired`. Use Stripe test keys first. Card details are handled by Stripe Checkout and are never stored by this application.

## Production checklist
- Set a strong random `AUTH_SECRET` (32+ random bytes).
- Use HTTPS and set `NEXT_PUBLIC_APP_URL` to the real HTTPS origin.
- Use a managed PostgreSQL database with backups and connection pooling.
- Configure Stripe live keys and verify the webhook endpoint.
- Replace demo Unsplash images with licensed product photography/CDN assets.
- Change/remove the seeded admin credentials.
- Add email provider (Resend/Postmark/etc.) for order confirmations and password reset.
- Add rate limiting/WAF (Vercel Firewall/Upstash/etc.) for auth and checkout routes.
- Add shipping carrier integration for live tracking and fulfillment labels.
- Add tax/GST rules appropriate to the business's registration and jurisdiction.
- Run `npm run build` in CI before deployment.

## API surface
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/orders` — create/save a shipping address
- `POST /api/checkout` — validate stock, create order, create Stripe Checkout Session
- `POST /api/stripe/webhook` — mark payment state and release stock for expired sessions

## Database models
User, Address, Category, Product, Order, OrderItem, plus enums for role/order/payment status.

## Deploy
For Vercel, import the repository, add environment variables, connect PostgreSQL, run migrations from CI or locally, and deploy. A production PostgreSQL service should provide pooling/backups. See current Next.js/Prisma deployment guidance before launch.
