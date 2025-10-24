# Backend Structure Document for Koperasi Pegawai BKI

## 1. Backend Architecture

**Overall Design**
- Built on Next.js (App Router) using Node.js and TypeScript
- Monorepo-style structure: frontend pages and backend API routes live together under `/app`
- Server Components fetch data securely; Client Components handle user interactions
- Drizzle ORM provides a type-safe interface to PostgreSQL
- Better Auth handles session management and magic-link authentication

**Design Patterns & Frameworks**
- **MVC-Lite**: API routes act as controllers, Drizzle models define data, React Server Components serve as views
- **Dependency Injection** via custom SDK (`/lib/accurate.ts`) for Accurate.id API calls
- **Middleware** for Role-Based Access Control (RBAC) and authentication checks

**Scalability, Maintainability & Performance**
- **Scalability**: Next.js auto-scales serverless functions on Vercel, and PostgreSQL scales vertically or via read replicas
- **Maintainability**: Clear separation of concerns (`/app`, `/lib`, `/db`, `/components`) and consistent TypeScript types
- **Performance**: Server Components minimize client bundle size; edge caching on Vercel and CDN accelerate asset delivery

## 2. Database Management

**Technology**
- Relational database: **PostgreSQL**
- ORM: **Drizzle ORM** for schema definitions, queries, and migrations

**Data Organization**
- Core tables: `profiles`, `payment_requests`, `payment_request_history`, `loan_applications`, `loan_approval_history`
- Each record tracks status and timestamps for auditability
- Separate history tables to maintain an immutable log of approval steps

**Data Access & Practices**
- Use Drizzle’s query builder in API routes to fetch or update records
- Versioned migration files ensure consistent schema across environments
- Database seeding scripts initialize default user roles and demo data

## 3. Database Schema

### Human-Readable Schema Overview

1. **profiles**: stores user data and roles
   - `id`, `email`, `name`, `role`, `created_at`, `updated_at`
2. **payment_requests**: tracks public payment order submissions
   - `id`, `profile_id`, `amount`, `description`, `status`, `created_at`, `updated_at`
3. **payment_request_history**: logs status changes for payment requests
   - `id`, `payment_request_id`, `changed_by`, `from_status`, `to_status`, `timestamp`
4. **loan_applications**: stores loan requests from members
   - `id`, `profile_id`, `amount`, `term_months`, `interest_rate`, `status`, `created_at`, `updated_at`
5. **loan_approval_history**: logs each approval step in loan flow
   - `id`, `loan_application_id`, `changed_by`, `from_status`, `to_status`, `timestamp`

### SQL Definitions (PostgreSQL)

```sql
-- 1. profiles
enable extension if not exists "uuid-ossp";
create table profiles (
  id            uuid    default uuid_generate_v4() primary key,
  email         text    not null unique,
  name          text    not null,
  role          text    not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- 2. payment_requests
create table payment_requests (
  id             uuid    default uuid_generate_v4() primary key,
  profile_id     uuid    references profiles(id) on delete cascade,
  amount         numeric(12,2) not null,
  description    text    not null,
  status         text    not null,
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- 3. payment_request_history
create table payment_request_history (
  id                   uuid    default uuid_generate_v4() primary key,
  payment_request_id   uuid    references payment_requests(id) on delete cascade,
  changed_by           uuid    references profiles(id),
  from_status          text    not null,
  to_status            text    not null,
  timestamp            timestamptz default now() not null
);

-- 4. loan_applications
create table loan_applications (
  id            uuid    default uuid_generate_v4() primary key,
  profile_id    uuid    references profiles(id) on delete cascade,
  amount        numeric(12,2) not null,
  term_months   integer not null,
  interest_rate numeric(5,2) not null,
  status        text    not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- 5. loan_approval_history
create table loan_approval_history (
  id                   uuid    default uuid_generate_v4() primary key,
  loan_application_id  uuid    references loan_applications(id) on delete cascade,
  changed_by           uuid    references profiles(id),
  from_status          text    not null,
  to_status            text    not null,
  timestamp            timestamptz default now() not null
);
```

## 4. API Design and Endpoints

**Architecture**
- All endpoints implemented as Next.js API Routes under `/app/api`
- Proxy routes for Accurate.id under `/app/api/accurate` to keep API keys server-side
- RESTful conventions: GET for reads, POST for creations, PATCH for updates

**Key Endpoints**

| Method | Path                              | Purpose                                         |
|--------|-----------------------------------|-------------------------------------------------| 
| POST   | /api/auth/magic-link             | Send magic link email (integrates Accurate.id)  |
| POST   | /api/auth/callback               | Validate link and establish session             |
| GET    | /api/accurate/savings            | Fetch member savings from Accurate.id           |
| GET    | /api/accurate/loans              | Fetch member loan balances from Accurate.id     |
| POST   | /api/payment-requests            | Create a new payment request                    |
| GET    | /api/payment-requests/:id        | Retrieve status of a single payment request     |
| PATCH  | /api/payment-requests/:id/status | Update status (e.g., approve/reject)            |
| POST   | /api/loan-applications           | Submit a new loan application                   |
| GET    | /api/loan-applications?status=.. | List loan applications filtered by status       |
| PATCH  | /api/loan-applications/:id/status| Approve or reject a loan application            |

**Communication Flow**
1. Frontend calls API routes via Fetch or React Query
2. API route checks session and RBAC via middleware
3. Route handler executes Drizzle queries or Accurate SDK calls
4. Response returned as JSON with consistent envelope `{ data, error }`

## 5. Hosting Solutions

**Development**
- **Docker & Docker Compose** spin up local PostgreSQL, environment variables, and build environment consistently

**Production**
- **Vercel** for Next.js deployment
  - Automatic CI/CD on git pushes
  - Global edge network for fast page loads
  - Built-in TLS, CDN, and auto-scaling serverless functions

**Benefits**
- Zero-configuration deployments on Vercel
- Pay-as-you-go serverless costs
- Built-in logging and metrics

## 6. Infrastructure Components

- **Load Balancer / Edge Network**: Vercel’s edge infrastructure distributes traffic across serverless instances
- **Content Delivery Network (CDN)**: Static assets and public pages cached globally via Vercel/Cloudflare
- **Caching Layer**: 
  - Next.js ISR (Incremental Static Regeneration) for public pages
  - React Query caches member data with stale-while-revalidate
- **Background Jobs** (future): Use a queue (e.g., BullMQ + Redis) for email notifications and long tasks

## 7. Security Measures

- **Authentication & Authorization**
  - Magic link flow with short expiration times
  - RBAC enforced via Next.js Middleware and server checks
  - Sessions stored securely (HTTP-only cookies)
- **Data Encryption**
  - TLS for all in-transit traffic
  - Environment variables for secrets (e.g., DB URL, API keys)
- **API Protection**
  - Proxy Accurate.id requests to avoid client-side key exposure
  - Rate limiting on sensitive endpoints
- **Compliance & Auditing**
  - History tables track every status change
  - Logs retained via Vercel’s monitoring or external log provider (e.g., LogDNA)

## 8. Monitoring and Maintenance

- **Performance Monitoring**
  - Vercel Analytics for serverless function timings
  - Frontend Core Web Vitals via Next.js telemetry
- **Error Tracking**
  - Sentry or LogRocket for capturing exceptions in API routes and frontend
- **Health Checks & Alerts**
  - Uptime monitoring (e.g., Uptime Robot)
  - Alerts on failed deployments or high error rates
- **Maintenance Strategy**
  - Scheduled database backups and migrations
  - Periodic dependency updates and security audits
  - Automated tests (unit, integration, end-to-end) run on CI before deployment

## 9. Conclusion and Overall Backend Summary

The backend for the Koperasi Pegawai BKI application leverages a modern Next.js App Router setup, PostgreSQL with Drizzle ORM, and secure magic-link authentication. It balances scalability—via serverless functions and edge caching—with maintainability through clear folder structures and type-safe code. Key API routes handle everything from public payment requests to multi-step loan approval workflows, while RBAC and audit logs ensure security and compliance. Hosted on Vercel with Docker-powered local development, this infrastructure provides a reliable, cost-effective foundation for growing the cooperative’s digital services.