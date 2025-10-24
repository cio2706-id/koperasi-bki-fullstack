# Project Requirements Document for Koperasi Pegawai BKI

## 1. Project Overview

Koperasi Pegawai BKI is a web-based cooperative management system tailored for employees of Bank Koperasi Indonesia (BKI). It streamlines two key business processes: payment order (PO) submissions and multi-step loan applications. The public portal allows anyone to submit and track payment requests, the member portal gives authenticated employees a secure space to view their savings and request new loans, and the admin portal lets various staff roles (procurement, manager, treasury) handle approval workflows in a centralized interface.

This system is being built to replace manual, paper-based approval chains and disconnected financial reporting tools. Our success criteria are: 1) faster turnaround on payment orders and loan approvals, 2) real-time visibility into request statuses for both members and staff, and 3) a clear audit trail of each transaction. Meeting these objectives will reduce errors, improve user satisfaction, and increase overall operational efficiency.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- Public Portal
  - Submit a new Payment Order (PO) form
  - Track PO status by reference number
- Member Portal (Authenticated)
  - View savings and outstanding loans via Accurate.id integration
  - Fill out a multi-step Loan Application form
- Admin Portal (Authenticated, Role-Based)
  - Procurement staff can view and approve POs (status: PENDING_STAFF_APPROVAL)
  - Managers can approve POs and loans (status: PENDING_MANAGER_APPROVAL)
  - Treasury staff can finalize and post approved items (status: PENDING_BENDAHARA_APPROVAL)
  - Approval history logging and status updates
- Authentication & Authorization
  - Magic-link login integrated with Accurate.id employee lookup
  - Role-based access control via Next.js Middleware
- Data Layer
  - PostgreSQL database with Drizzle ORM schemas for profiles, payment_requests, loan_applications, approval_history
- APIs & Integration
  - Secure proxy routes for Accurate.id API calls, encapsulated in `/lib/accurate.ts`
- Theming & UI
  - Responsive design using shadcn/ui and Tailwind CSS
  - Dark mode support
- Infrastructure & Deployment
  - Docker Compose for local dev
  - Vercel deployment configuration

### Out-of-Scope (Later Phases)
- Mobile-specific UI or native apps
- Notifications via email or SMS (webhooks, background jobs)
- Advanced reporting or dashboards beyond basic queues
- Payment gateway integration for actual fund disbursement
- Auditing and logging beyond basic approval history
- Multi-language support beyond English

## 3. User Flow

A new visitor lands on the public homepage and sees two main actions: "Submit Payment Order" and "Track Payment Order." When they click "Submit Payment Order," they fill out a form with their details, PO amount, purpose, and upload attachments. Upon submission, they're given a reference number. If they choose "Track Payment Order," they enter that reference number and see the current status and approval stage.

An employee navigates to "Member Login" and requests a magic link via their official email. After clicking the link, they enter the member dashboard where their current savings and loan balances are displayed (fetched in real time from Accurate.id). They click "Apply for Loan," go through a three-step form (personal details, loan terms, review), and submit. Their loan then appears in the admin portal queues. Admin users log in, see role-specific dashboards listing pending items, click "Approve" or "Reject," and the system automatically moves each item to the next status and logs the action.

## 4. Core Features

- **Authentication & Authorization**: Magic-link login, Accurate.id lookup, Next.js Middleware enforcing RBAC.
- **Public Payment Portal**: Submission form, status tracking, file uploads.
- **Member Dashboard**: Real-time savings/loan data via Accurate.id, multi-step loan application form.
- **Admin Portal**: Role-aware queues for procurement, manager, treasury; inline approve/reject; history log.
- **API Integration**: Secure proxy routes for Accurate.id, centralized SDK in `/lib/accurate.ts`.
- **Database & ORM**: PostgreSQL with Drizzle ORM schemas (`profiles`, `payment_requests`, `loan_applications`, `approval_history`).
- **UI Components & Theming**: shadcn/ui components, Tailwind CSS v4, dark mode.
- **Infrastructure**: Docker Compose, Vercel deployment, environment-driven secrets.

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router), React, TypeScript
- **Styling & UI**: Tailwind CSS, shadcn/ui components
- **Authentication**: Better Auth (custom magic links)
- **Database & ORM**: PostgreSQL, Drizzle ORM
- **Server/API**: Next.js API Routes, custom routes for Accurate.id proxy
- **State & Data Fetching**: React Query (TanStack Query) for member dashboard caching
- **DevOps & Deployment**: Docker, Docker Compose, Vercel
- **Testing**: Vitest/Jest (unit), React Testing Library (integration), Cypress/Playwright (E2E)

## 6. Non-Functional Requirements

- **Performance**: Page load under 2 seconds on average; API response under 500ms
- **Security**: HTTPS everywhere, short-lived magic links (<15 minutes), RBAC middleware, sanitized inputs
- **Scalability**: Support up to 1,000 concurrent users without database deadlocks
- **Usability**: Accessible forms (WCAG AA), mobile-responsive design, clear error messages
- **Reliability**: 99.9% uptime on Vercel, database backups daily

## 7. Constraints & Assumptions

- Accurate.id API credentials and endpoints are available and stable
- PostgreSQL version ≥13 is used both locally and in production
- All user roles (`member`, `staff_pengadaan`, `manager`, `bendahara`) are pre-seeded in the database
- Environment variables (`DATABASE_URL`, `ACCURATE_API_KEY`, etc.) will be injected securely
- No external payment gateway or notification service in v1

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: Accurate.id may throttle requests. Mitigate with caching and exponential backoff in `/lib/accurate.ts`.
- **Approval Race Conditions**: Two admins might approve the same item simultaneously. Use database transactions and row-level locking.
- **Magic Link Vulnerabilities**: If links are not short-lived or tied to a single use, they could be reused. Enforce one-time use and expiration.
- **Large File Uploads**: PO attachments could be large; enforce size limits in the client and server.
- **State Drift in Multi-Step Forms**: Without proper state management, form data may be lost when navigating steps. Use React Query or a lightweight store (Zustand) to persist interim form state.

---
*This PRD is intended as the definitive guide for all subsequent technical documentation and development. Every requirement, flow, and constraint is specified to avoid ambiguity and support AI-driven code generation.*