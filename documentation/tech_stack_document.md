# Tech Stack Document for Koperasi Pegawai BKI

This document explains, in everyday language, the choices behind the technologies used to build the Koperasi Pegawai BKI application. It covers frontend, backend, infrastructure, third-party services, security, performance, and a final summary of why each piece was selected.

---

## 1. Frontend Technologies

These are the tools we use to build everything the user sees and interacts with in their browser.

- **Next.js (App Router)**
  - Framework for server-rendered and statically-generated React apps.
  - Lets us mix server-side logic (for secure data fetching) with client-side interactivity.

- **TypeScript**
  - Adds type safety to JavaScript so we catch errors early (for example, mixing up user roles or data fields).

- **React**
  - Core library for building reusable, component-based user interfaces.

- **shadcn/ui**
  - A collection of ready-to-use, accessible React components (forms, tables, dialogs) that follow best UI/UX practices.

- **Tailwind CSS v4**
  - A utility-first CSS framework that accelerates styling with small, composable classes.
  - Built-in support for dark mode and easy theming to match BKI branding.

- **State Management (optional but recommended)**
  - **Zustand** or **Jotai**: lightweight libraries for managing complex form or application state without prop drilling.

- **Data Fetching & Caching**
  - **React Query (TanStack Query)**: handles server data fetching, caching, background updates, and error states automatically. Great for dashboard data and financial info from Accurate.id.

How it enhances the user experience:

- Fast, SEO-friendly pages with Next.js’s hybrid rendering.
- Consistent, accessible UI components out of the box.
- Predictable styling and theming with Tailwind.
- Smooth form flows and up-to-date data with React Query.

---

## 2. Backend Technologies

These power the server side, handle data storage, and expose APIs that the frontend calls.

- **Next.js API Routes**
  - Built-in way to write backend endpoints alongside the frontend code.
  - Handles authentication, form submissions, and acts as a secure proxy to Accurate.id.

- **Better Auth**
  - Provides sign-in/sign-up, session management, and security primitives.
  - Extended to support magic-link authentication via the Accurate.id email lookup.

- **PostgreSQL**
  - A reliable, open-source relational database for structured data like user profiles, payment requests, loan applications, and approval history.

- **Drizzle ORM**
  - Type-safe ORM that pairs with TypeScript to define and query your database schemas with confidence.

- **Accurate.id Proxy**
  - All calls to the Accurate.id API go through our own server endpoints (`/app/api/accurate/...`) so API keys never reach the browser.

How these parts work together:

- User actions in the frontend call Next.js API Routes.
- Middleware checks the user’s session and role (via Better Auth).
- After authorization, the route reads or writes to PostgreSQL using Drizzle.
- For financial data or authentication lookups, the route requests Accurate.id behind the scenes.

---

## 3. Infrastructure and Deployment

How we host, build, and deliver the application reliably and at scale.

- **Version Control: Git & GitHub**
  - All code is tracked in Git and stored on GitHub for collaboration and history.

- **Docker & Docker Compose**
  - Standardizes the local development environment (PostgreSQL, environment variables) so every developer has the same setup.

- **Vercel**
  - Platform specializing in Next.js deployments.
  - Automatic builds and previews on every pull request.
  - Global edge network for fast page loads.

- **CI/CD Pipelines**
  - GitHub Actions (or Vercel’s built-in pipeline) runs tests and linting on each commit.
  - Successful checks trigger a production deployment.

Benefits:

- Quick setup for new developers.
- Automated testing and deploys keep production stable.
- Scalability handled by Vercel’s serverless and edge functions.

---

## 4. Third-Party Integrations

External services that extend functionality without reinventing the wheel.

- **Accurate.id API**
  - Used for:
    - Verifying employee emails and generating magic-link tokens.
    - Fetching real-time savings and loan balances for the member dashboard.
  - Integrated through secure Next.js proxy routes to keep API keys safe.

(Note: No payment processors or analytics tools are integrated at this stage, but these could be added later as needed.)

---

## 5. Security and Performance Considerations

Measures we’ve put in place to protect data and keep the app snappy.

Security

- **Magic-Link Authentication**
  - Short-lived links emailed to verified BKI addresses via Accurate.id lookup.

- **Role-Based Access Control (RBAC)**
  - Next.js Middleware and route checks ensure only `member`, `staff_pengadaan`, `manager`, or `bendahara` can access specific pages and APIs.

- **Environment Variables**
  - Database URLs, API keys, and secrets live in `.env` files and Vercel’s environment settings, never in source control.

- **Secure Proxy for External APIs**
  - Accurate.id and any future third-party calls go through server routes to avoid exposing credentials.

Performance

- **Server-Side Rendering and Static Generation**
  - Next.js optimizes public pages and critical user flows for speed and SEO.

- **Code Splitting & Lazy Loading**
  - Only the code needed for each page is sent to the client.

- **Tailwind CSS Purge**
  - Removes unused styles in production builds to minimize CSS size.

- **Caching & Revalidation**
  - React Query and Next.js ISR (Incremental Static Regeneration) keep data fresh without overloading the server.

---

## 6. Conclusion and Tech Stack Summary

By combining modern, battle-tested tools at every layer, the Koperasi Pegawai BKI application achieves:

- **Developer Productivity**: Next.js, TypeScript, and shadcn/ui speed up building consistent interfaces and backends in one codebase.

- **Robust Security**: Better Auth with magic links, RBAC via middleware, and secure API proxies keep sensitive financial data safe.

- **Scalability & Reliability**: PostgreSQL, Docker, and Vercel’s global edge guarantee that the app can grow with your cooperative’s needs.

- **Excellent User Experience**: Fast page loads, real-time updates, accessible components, and dark mode support ensure every user—from members to finance staff—has a smooth workflow.

This carefully chosen tech stack aligns with the goals of the Koperasi Pegawai BKI project: a secure, scalable, and user-friendly platform for managing payment orders and loan applications seamlessly.