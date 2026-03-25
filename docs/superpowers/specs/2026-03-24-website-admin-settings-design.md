# Hash Agent — Website, Admin & Settings Design Spec

> Date: 2026-03-24
> Status: Approved
> Scope: Landing page rebuild, auth page polish, logo integration, settings page, admin dashboard, VIP account creation

---

## 1. Landing Page (Complete Rebuild)

### Design System
- Background: #050505, Surface: #111111, Card: #151515
- Primary: #14b8a6 (teal), matches logo
- Borders: rgba(255,255,255,0.06-0.08)
- Fonts: Inter (400-700) + JetBrains Mono
- Animations: ScrollReveal via IntersectionObserver, threshold 0.15, stagger 80ms, cubic-bezier(0.16,1,0.3,1)

### Page Sections
1. **Navbar** — Fixed, glass blur bg-[#050505]/80 backdrop-blur-md, Logo SVG + wordmark, nav links, CTA
2. **Hero** — Gradient headline, subhead, 2 CTAs, animated dashboard mockup (JSX, not image)
3. **Stats bar** — 3 metrics with count-up animation, border-y divider
4. **Product showcases** — 3 alternating 2-col sections (Batch Intelligence, AI Assistant, Equipment Monitoring)
5. **Feature grid** — 6 glass cards (3x2), icons, hover glow
6. **How It Works** — 3-step numbered cards
7. **Pricing** — 4 tiers (Free, Pro $49/mo, Commercial $149/mo, Enterprise), Pro highlighted
8. **Final CTA** — "Ready to dial in your lab?" + radial glow
9. **Footer** — Logo, nav columns, legal links

### Components to Create
- `components/landing/Navbar.tsx`
- `components/landing/Hero.tsx`
- `components/landing/StatsBar.tsx`
- `components/landing/ProductShowcase.tsx`
- `components/landing/FeatureGrid.tsx`
- `components/landing/HowItWorks.tsx`
- `components/landing/Pricing.tsx`
- `components/landing/FinalCTA.tsx`
- `components/landing/Footer.tsx`
- `components/landing/ScrollReveal.tsx`
- `components/landing/DashboardMockup.tsx`
- `components/landing/ChatMockup.tsx`
- `components/shared/Logo.tsx`

---

## 2. Auth Pages

### Login
- Logo SVG centered, glass card container, background radial glow
- Fields: email, password. Teal CTA. Forgot password + Create account links.

### Register
- Same glass card treatment. Fields: Name, Lab/Company, Email, Password.
- Creates User + Organization + OrgMember(OWNER) in transaction.

---

## 3. Logo Integration

- Copy SVG to `public/logo.svg`, PNG to `public/logo.png`
- Generate favicon
- Reusable `<Logo />` component with size variants (sm/md/lg)
- Placement: navbar, hero, footer, auth pages, dashboard sidebar, admin sidebar, favicon

---

## 4. Settings Page

### Route: `app/(dashboard)/settings/page.tsx`
### Layout: Tab-based (6 tabs)

1. **Profile** — Name edit, email display, save button
2. **Security** — Change password (current + new + confirm), last login
3. **Organization** — Org name edit (OWNER only), plan badge, member count
4. **Team** — Member table, invite form (email + role), remove/role change. OWNER/ADMIN gated.
5. **Billing** — Current plan, usage, upgrade button
6. **Notifications** — Toggle switches for alert types

### API Routes
- `PATCH /api/settings/profile`
- `PATCH /api/settings/password`
- `PATCH /api/settings/organization`
- `GET/POST/DELETE /api/settings/team`
- `PATCH /api/settings/team/[id]`
- `GET /api/settings/billing`

---

## 5. Admin Dashboard

### Auth: ADMIN_EMAILS env var whitelist
### Route: `app/admin/` with own layout
### File: `lib/admin.ts` — isAdminEmail(), requireAdmin()

### Pages
1. **Overview** — KPI cards, plan distribution chart, recent signups
2. **Users** — Paginated table (25/page), search, sort, CSV export, slide-out panel
3. **Create VIP** — Form: email, name, temp password, org name, plan. Creates full account.
4. **Organizations** — Paginated table, search, CSV export
5. **Analytics** — Date range, signup trend, plan distribution, DAU/WAU/MAU

### Schema Addition
- `mustChangePassword Boolean @default(false)` on User model
- Force password change flow when true

### API Routes
- `GET /api/admin/users`
- `POST /api/admin/users` (create VIP)
- `GET /api/admin/organizations`
- `GET /api/admin/analytics`
- `GET /api/auth/admin-check`

### Components
- `components/admin/AdminShell.tsx`
- `components/admin/UserTable.tsx`
- `components/admin/CreateVIPForm.tsx`
- `components/admin/OrgTable.tsx`
- `components/admin/AdminCharts.tsx`
- `components/admin/ExportButton.tsx`

---

## 6. Middleware Updates

- `/admin` routes: session + admin email check
- Force password change redirect when `mustChangePassword` is true
- `/settings` already covered by dashboard route group

---

## 7. Dashboard Updates

- Logo SVG in sidebar header
- Settings nav item (gear icon) added to sidebar
