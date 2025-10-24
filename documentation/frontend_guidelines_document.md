# Frontend Guideline Document

This document outlines how we build and maintain the frontend for the **Koperasi Pegawai BKI** web application. It covers the architecture, design principles, styling, component structure, state management, routing, performance, testing, and more. Whether you’re new to the project or just need a refresher, this guide will give you a clear understanding of how everything fits together.

## 1. Frontend Architecture

**Frameworks and Libraries**
- **Next.js (App Router)**: Our foundation for both public pages and protected member/admin portals. It lets us mix server-rendered pages with interactive client components.
- **TypeScript**: Adds type safety to catch errors early and makes our code easier to understand.
- **Tailwind CSS v4** and **shadcn/ui**: Provide a utility-first styling framework plus a set of reusable, accessible UI components (forms, tables, dialogs, etc.).
- **Better Auth**: Handles user sessions and magic-link authentication, extended for our Accurate.id email lookup.

**How It Supports Scalability, Maintainability, and Performance**
- **Scalability**: Next.js App Router lets us break the app into folders and layouts. As features grow—from public forms to multi-role admin dashboards—new pages and API routes can slot right in.
- **Maintainability**: TypeScript and Drizzle ORM schemas keep our data models clear. Tailwind’s utility classes and shadcn/ui components mean less custom CSS, fewer style conflicts.
- **Performance**: Server components fetch data directly without sending extra JavaScript to the client. Tailwind’s build process removes unused CSS. Next.js optimizes images and code splits by default.

## 2. Design Principles

**1. Usability**
- Keep forms and buttons clear and consistent.
- Provide feedback on every action: loading spinners, success messages, or error warnings.

**2. Accessibility**
- Use semantic HTML (headings, labels, landmarks).
- Ensure keyboard navigation and screen-reader compatibility in every component (shadcn/ui helps here).
- Maintain sufficient color contrast.

**3. Responsiveness**
- Design layouts that adapt from mobile to desktop using Tailwind’s responsive utilities.
- Test breakpoints early to avoid layout surprises.

**4. Consistency**
- Stick to a shared color palette, typography, and spacing scale.
- Reuse components (forms, tables, dialogs) rather than creating one-off styles.

## 3. Styling and Theming

**Styling Approach**
- **Tailwind CSS**: Utility-first classes for margins, padding, colors, typography, and more. We configure Tailwind in `tailwind.config.js` to include our custom colors and dark mode.
- **shadcn/ui**: Pre-built components styled with Tailwind, ensuring accessible markup out of the box.

**Theming**
- **Dark Mode**: Configured in Tailwind with the `media` or `class` strategy. Users can toggle between light and dark themes.
- **Glassmorphism + Modern Flat**: We combine a modern, flat design with subtle glassmorphic backgrounds (semi-transparent cards with a slight blur) on dashboards.

**Color Palette**
- Primary Blue: `#1D4ED8` (links, primary buttons)
- Secondary Purple: `#9333EA` (accent elements)
- Success Green: `#10B981` (confirmations)
- Warning Yellow: `#F59E0B` (alerts)
- Danger Red: `#EF4444` (errors)
- Background Light: `#F9FAFB`
- Background Dark: `#111827`

**Typography**
- **Inter**: A clean, modern sans-serif font loaded via Google Fonts.
- Headings use varying weights of Inter (600–700), body text at 400.

## 4. Component Structure

**Organization**
- `/components/ui`: Core building blocks and shadcn/ui overrides.
- `/components/public`: Components used on public pages (payment form, tracker).
- `/components/member`: Loan application form steps, data display widgets.
- `/components/admin`: Approval queue tables, history dialogs, role-based sidebars.

**Reusability**
- Every piece of UI is a React component. Common pieces (buttons, inputs, tables) live in `/components/ui`.
- Domain-specific components import and compose these building blocks.

**Benefits of Component-Based Architecture**
- **Isolation**: Each component manages its own markup, styles, and tests.
- **Reusability**: Write once, use everywhere—reduces duplication and bugs.
- **Easier Maintenance**: Updating a shared button style updates it across the app automatically.

## 5. State Management

**Approach**
- **Server Components + Client Components**: Next.js server components fetch data directly. Client components handle interactions and local UI state.
- **React Query (TanStack Query)**: Recommended for fetching and caching data from our API routes and Accurate.id. It automatically handles background re-fetching, loading, and error states.
- **Context API**: Used sparingly for global data, like the authenticated user’s profile.
- **Zustand (optional)**: For complex local state across multi-step loan forms, you can introduce a lightweight store.

## 6. Routing and Navigation

**Routing**
- **File-based Routing**: Each folder and file under `/app` maps to a URL path (e.g., `/app/request-po/page.tsx` → `/request-po`).
- **Nested Layouts**: We have separate layouts for public, member, and admin sections (`/app/layout.tsx`, `/app/dashboard/layout.tsx`, `/app/admin/layout.tsx`).
- **Middleware**: Next.js Middleware checks user roles on protected routes, redirecting unauthorized users.

**Navigation**
- **next/link** for internal links.
- **next/navigation** hooks (`useRouter`, `usePathname`) for client-side navigation and active link highlighting.
- **Sidebar & Breadcrumbs**: Rendered in layouts to guide users through the portal sections.

## 7. Performance Optimization

**Key Strategies**
- **Code Splitting**: Next.js automatically splits code by route. We can further use dynamic imports for rarely used components (e.g., heavy chart libraries).
- **Lazy Loading**: Images via `next/image` with built-in optimization and lazy loading.
- **Tailwind Purge**: Removes unused CSS classes in production.
- **Server Components**: Reduce client bundle size by keeping data-fetching logic on the server.
- **Prefetching**: Next.js prefetches linked pages in the background when they enter the viewport.

## 8. Testing and Quality Assurance

**Unit Testing**
- **Vitest** (or **Jest**): Test individual functions, utility modules, and Drizzle ORM queries.

**Integration Testing**
- **React Testing Library**: Render components in isolation or small combinations, simulate user interactions, and assert expected output.

**End-to-End (E2E) Testing**
- **Cypress** (or **Playwright**): Automate critical flows—public payment request submission, loan application, manager approval, treasurer posting to Accurate.id.

**Linting & Formatting**
- **ESLint** with TypeScript plugin and Next.js rules.
- **Prettier** for consistent code formatting.

## 9. Conclusion and Overall Frontend Summary

This frontend setup uses Next.js with TypeScript, Tailwind CSS, and shadcn/ui to create a fast, scalable, and maintainable application for Koperasi Pegawai BKI. Our design principles—usability, accessibility, responsiveness, and consistency—guide every UI decision. Component-based structure, along with React Query and optional Zustand, keeps state organized. File-based routing, nested layouts, and middleware enforce security and clear navigation. Performance optimizations ensure fast load times, and a robust testing strategy maintains reliability.

By following these guidelines, any developer—regardless of background—can confidently build, extend, and maintain the frontend of the Koperasi Pegawai BKI application.