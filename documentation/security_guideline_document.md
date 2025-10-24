# Security Guideline Document: Koperasi Pegawai BKI

This document defines the security best practices and controls for the `koperasi-bki-fullstack` application. It aligns with industry-standard principles and tailors them to the Next.js/TypeScript, Better Auth, Drizzle ORM, and Accurate.id integration.

---

## 1. Security by Design
- Embed security from day one; do not bolt on protections later.  
- Review threat models for each user flow: public PO request, member loan application, admin approval.  
- Perform periodic threat assessments (e.g., OWASP Top 10, SANS Top 25) on both frontend and API layers.

## 2. Authentication & Access Control
**2.1 Authentication**  
- Use Better Auth with a magic-link flow via Accurate.id: 
  - Generate cryptographically strong, single-use, short-lived tokens.  
  - Store tokens hashed in the database; expire after 10 minutes.  
- Enforce HTTPS/TLS for all login links.  

**2.2 Session Management**  
- Issue signed, HttpOnly, Secure, SameSite=Strict cookies.  
- Implement idle (15 min) and absolute (24 h) session timeouts.  
- On logout or token expiration, purge session data server-side.  

**2.3 Role-Based Access Control (RBAC)**  
- Define roles: `member`, `staff_pengadaan`, `manager`, `bendahara`.  
- Enforce route guards via Next.js Middleware: check session and required role before page or API.  
- Validate authorization on every API route; do not trust client-supplied role flags.

**2.4 Multi-Factor Authentication (MFA)** (Future enhancement)  
- Consider TOTP or SMS OTP for high-privilege roles (e.g., admin modifying user roles).

## 3. Input Handling & Output Encoding
- Treat **all** user, API, and external inputs as untrusted.  
- Validate server-side:
  - Use Zod/Yup to validate JSON payloads in API routes.  
  - Limit string lengths, enforce patterns (numbers, dates).  
- Prevent injection:
  - Use Drizzle ORM’s parameterized queries; never concatenate SQL.  
  - Sanitize any HTML or Markdown fields before rendering.  
- Encode output in React using `{domPurify.sanitize()}` when injecting HTML.  
- Validate redirect URLs against an allow-list to avoid open redirect attacks.

## 4. Data Protection & Privacy
**4.1 Encryption in Transit & at Rest**  
- Enforce TLS 1.2+ for all front-end and API traffic (Vercel auto-enforces).  
- Encrypt database disks or use managed Postgres with at-rest encryption.  

**4.2 Secrets Management**  
- Store `ACCURATE_API_KEY`, database credentials, JWT secrets in environment variables or a vault (do not commit to Git).  
- Rotate secrets periodically and upon personnel changes.  

**4.3 Sensitive Data Handling**  
- Hash any additional secrets (magic-link tokens) with Argon2 or bcrypt.  
- Mask or truncate PII in logs; avoid logging user email or financial figures in plaintext.  
- Comply with local privacy regulations (e.g., mask KTP numbers).

## 5. API & Service Security
- **Proxy Accurate.id calls** through Next.js API routes (`/app/api/accurate/*`), never expose keys in browser.  
- Apply rate limiting (e.g., 100 requests/min) using middleware like `express-rate-limit` or Vercel Edge Middleware.  
- Configure CORS to allow only your public origin(s).  
- Enforce proper HTTP methods: GET for reads, POST for creates, PUT/PATCH for updates, DELETE for removals.
- Version your API paths (`/api/v1/loans`, `/api/v1/po-requests`) to allow safe evolution.

## 6. Web Application Security Hygiene
- **CSRF Protection**: Use Next.js built-in CSRF tokens or third-party libraries; include tokens in state-changing requests (POST/PUT/DELETE).  
- **Security Headers** (e.g., via `next.config.js` or a custom server):
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Content-Security-Policy` restricting scripts to your domain and trusted CDNs.
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Secure Cookies**: `HttpOnly`, `Secure`, `SameSite=Strict`.  
- **Clickjacking**: Deny embedding via `frame-ancestors` in CSP.
- **Avoid Client-Side Secrets**: Do not store tokens or API keys in `localStorage` or `sessionStorage`.
- **Subresource Integrity** for any third-party scripts or styles loaded via CDN.

## 7. Infrastructure & Configuration
- **Docker Compose** for local Postgres; use a dedicated non-root database user with least privileges.  
- **Hardened Node.js**: Disable debug/verbose modes in production.  
- **TLS Configuration**: Rely on Vercel’s managed TLS but verify TLS 1.2+ and strong ciphers via Qualys SSL Labs.  
- **Port Exposure**: Only expose the Next.js server port (3000) on localhost; use a reverse proxy in production.
- **File Permissions**: Grant `rw` only to the application user; avoid world-writable directories.

## 8. Dependency Management
- Lock dependencies with `package-lock.json`; commit the lockfile.  
- Use automated SCA tools (Dependabot, Snyk) to detect vulnerable packages.  
- Regularly update Next.js, React, Drizzle, and Better Auth to their latest secure versions.  
- Remove unused dependencies to minimize the attack surface.

## 9. Monitoring, Logging & Incident Response
- Log security-relevant events (failed logins, role changes, suspicious API requests) to a central system (e.g., Datadog, ELK).  
- Avoid logging PII or secrets.  
- Implement alerting on anomalies: brute-force spikes, unexpected 500 errors in API proxy.  
- Define an incident response plan: triage, containment, eradication, recovery, lessons learned.

## 10. Testing & Validation
- **Automated Tests**:
  - Unit tests for business logic (Vitest/Jest).  
  - Integration tests for API routes (Next.js API testing tools or Postman/Newman).  
  - End-to-end tests (Playwright/Cypress) covering login, PO submission, loan workflows.  
- **Security Testing**:
  - Regularly run static code analysis (ESLint with security plugins).  
  - Perform penetration tests, or at least a focused OWASP ZAP scan against staging.  
  - Validate CSP and cookie flags in browser dev tools.

---

Adhering to these guidelines will ensure the `koperasi-bki-fullstack` codebase remains secure, maintainable, and resilient against common and advanced threats.

*End of Document*