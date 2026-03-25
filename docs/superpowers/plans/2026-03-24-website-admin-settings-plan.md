# Implementation Plan — Website, Admin & Settings

## Workstreams (execute in order, parallelize where noted)

### WS1: Foundation (Logo + Shared Components)
1. Copy logo files to public/
2. Create Logo component (sm/md/lg variants)
3. Create ScrollReveal component
4. Update favicon
5. Add ADMIN_EMAILS to env handling

### WS2: Landing Page Rebuild
1. Create all landing components (Navbar, Hero, DashboardMockup, StatsBar, ProductShowcase, FeatureGrid, HowItWorks, Pricing, FinalCTA, Footer, ChatMockup)
2. Rebuild app/page.tsx composing all sections
3. Add animations and scroll reveals
4. Test responsive at mobile/tablet/desktop

### WS3: Auth Page Polish
1. Redesign login page with logo + glass card
2. Redesign register page with logo + glass card
3. Add background glow effects
4. Test auth flow end-to-end

### WS4: Settings Page
1. Create settings page with tab layout
2. Build Profile tab + API
3. Build Security tab (password change) + API
4. Build Organization tab + API
5. Build Team tab (invite/remove/role change) + API
6. Build Billing tab + API
7. Build Notifications tab
8. Add Settings to dashboard sidebar nav

### WS5: Admin Dashboard
1. Create lib/admin.ts (isAdminEmail, requireAdmin)
2. Create AdminShell component
3. Create admin layout with auth guard
4. Build Overview page + KPI queries
5. Build Users page + API + table + search + export
6. Build Create VIP page + API
7. Build Organizations page + API
8. Build Analytics page + API + charts
9. Update middleware for admin routes

### WS6: Schema + Dashboard Updates
1. Add mustChangePassword to User model
2. Add logo to dashboard sidebar
3. Run prisma generate
4. Update middleware for force password change

### WS7: Testing & Optimization
1. Browser test: landing page all sections
2. Browser test: auth flow (register → login → dashboard)
3. Browser test: settings all tabs
4. Browser test: admin all pages
5. Browser test: VIP account creation flow
6. Performance optimization
