# Hash Agent Phases 3C-7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Hash Agent from current state (Phases 0-5 done) through Phase 7 — standalone Prisma schema, remaining workflow pages, PDF generation, analytics, compliance, and equipment maintenance scheduling.

**Architecture:** Hash Agent is a standalone Next.js 14.2 app (port 3001) using Prisma ORM against a shared Supabase PostgreSQL database. All Hash Agent tables use `ha_` prefix via `@@map`. Pages follow Server Component data fetching with `auth()` guard. API routes validate with Zod, scope by `orgId`, return `{ data, error }` shape. Components use Tailwind dark theme with domain-specific color tokens.

**Tech Stack:** Next.js 14.2, TypeScript strict, Prisma 5, NextAuth 5, Tailwind CSS 3, Zod, React Hook Form, Recharts 3, @react-pdf/renderer 4, date-fns 4, Lucide React icons, Material Symbols for nav.

---

## File Structure Overview

### Task 1: Standalone Prisma Schema
- Modify: `prisma/schema.prisma` — Full standalone schema with auth models + all 15 ha_* models

### Task 2: npm install
- No files — dependency installation

### Task 3: Pressed Hash Pages
- Create: `components/pressed/PressedCard.tsx`
- Create: `components/pressed/PressedDetail.tsx`
- Create: `app/(dashboard)/pressed/page.tsx`
- Create: `app/(dashboard)/pressed/[id]/page.tsx`
- Create: `app/(dashboard)/pressed/new/page.tsx`
- Create: `app/api/pressed/[id]/route.ts`

### Task 4: Cleaning Log Pages
- Create: `components/cleaning/CleaningLogCard.tsx`
- Create: `components/cleaning/CleaningWizard.tsx`
- Create: `app/(dashboard)/cleaning/page.tsx`
- Create: `app/(dashboard)/cleaning/new/page.tsx`
- Create: `app/api/cleaning/[id]/route.ts`
- Create: `lib/validations/cleaning.ts`

### Task 5: Equipment Management Page
- Create: `components/equipment/EquipmentCard.tsx`
- Create: `components/equipment/RegisterEquipmentForm.tsx`
- Create: `app/(dashboard)/equipment/page.tsx`
- Create: `app/api/equipment/route.ts`
- Create: `app/api/equipment/[id]/route.ts`

### Task 6: Maintenance Log Pages
- Create: `components/maintenance/MaintenanceCard.tsx`
- Create: `components/maintenance/MaintenanceWizard.tsx`
- Create: `app/(dashboard)/maintenance/page.tsx`
- Create: `app/(dashboard)/maintenance/new/page.tsx`
- Create: `app/api/maintenance/route.ts`
- Create: `app/api/maintenance/[id]/route.ts`
- Create: `lib/validations/maintenance.ts`

### Task 7: PDF Generator
- Create: `lib/pdf-generator.ts`

### Task 8: METRC Utilities
- Create: `lib/metrc-utils.ts`

### Task 9: Analytics Dashboard
- Create: `components/analytics/YieldByStrainChart.tsx`
- Create: `components/analytics/MicronDistributionChart.tsx`
- Create: `components/analytics/RosinTrendChart.tsx`
- Create: `components/analytics/KpiSummary.tsx`
- Create: `app/(dashboard)/analytics/page.tsx`
- Create: `app/api/analytics/yields/route.ts`

### Task 10: Compliance Page
- Create: `components/compliance/ComplianceCard.tsx`
- Create: `app/(dashboard)/compliance/page.tsx`
- Create: `app/api/compliance/reports/route.ts`

### Task 11: Maintenance Scheduler
- Create: `lib/maintenance-scheduler.ts`
- Create: `app/api/cron/maintenance/route.ts`

---

## Tasks

### Task 1: Standalone Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

The current schema is a stub pointing to TerpAgent's shared schema. We need a complete standalone schema with auth models (User, Account, Session, VerificationToken, Organization, OrgMember) plus all 15 Hash Agent models and 16 enums.

- [ ] **Step 1: Write the complete standalone Prisma schema**

Replace `prisma/schema.prisma` with a full schema containing:

1. Generator + datasource blocks
2. Shared auth models: `User`, `Account`, `Session`, `VerificationToken`, `Organization`, `OrgMember`
3. Shared enums: `OrgRole`, `OrgPlan`
4. All 16 Hash Agent enums: `MaterialState`, `MaterialGrade`, `QualityTier`, `HashBatchStatus`, `RosinProductType`, `RosinBatchStatus`, `PressedBatchStatus`, `FreezeDryerPhase`, `FreezeDryerConnectionType`, `HaAlertCategory`, `HaAlertSeverity`, `HaAlertStatus`, `CleaningStatus`, `FilterType`, `HaMaintenanceCategory`, `HaMaintenanceStatus`
5. All 15 Hash Agent models mapped to `ha_*` tables: `HashBatch`, `MicronAllocation`, `RosinBatch`, `PressedBatch`, `BiomassLot`, `FreezeDryer`, `FreezeDryerTelemetry`, `WaterFiltrationSystem`, `FilterStatusLog`, `HaCleaningLog`, `HaCleaningEntry`, `HaEquipmentMaintenanceLog`, `HaAlert`, `HaAiSession`, `HaAiMessage`

Key conventions to follow:
- All ha_* models have `orgId` FK to `Organization`
- Use `@@map("ha_table_name")` for all Hash Agent models
- Use `@map("column_name")` for snake_case DB columns
- Use `@default(uuid())` for IDs
- Include `createdAt` and `updatedAt` timestamps on all models
- Relation fields must match what existing code references (e.g., `db.hashBatch.findMany` expects model named `HashBatch`)

The auth models must match NextAuth 5 + @auth/prisma-adapter expectations:
- `User`: id, name, email, emailVerified, image, hashedPassword, lastLoginAt, memberships relation
- `Account`: provider/providerAccountId compound unique
- `Session`: sessionToken unique
- `VerificationToken`: identifier/token compound unique
- `Organization`: id, name, plan (OrgPlan enum), members/hash agent relations
- `OrgMember`: userId + orgId compound unique, role (OrgRole enum)

- [ ] **Step 2: Validate the schema**

Run: `cd /c/Users/suzuk/Downloads/HashAgent && npx prisma validate`
Expected: "The schema is valid."

- [ ] **Step 3: Generate the Prisma client**

Run: `cd /c/Users/suzuk/Downloads/HashAgent && npx prisma generate`
Expected: "Generated Prisma Client"

---

### Task 2: Install Dependencies

- [ ] **Step 1: Run npm install**

Run: `cd /c/Users/suzuk/Downloads/HashAgent && npm install`
Expected: Dependencies installed successfully

---

### Task 3: Pressed Hash Pages

**Files:**
- Create: `components/pressed/PressedCard.tsx`
- Create: `components/pressed/PressedDetail.tsx`
- Create: `app/(dashboard)/pressed/page.tsx`
- Create: `app/(dashboard)/pressed/[id]/page.tsx`
- Create: `app/(dashboard)/pressed/new/page.tsx`
- Create: `app/api/pressed/[id]/route.ts`

Existing: API routes at `app/api/pressed/route.ts` (GET list + POST create) already exist and work.

- [ ] **Step 1: Create PressedCard component**

`components/pressed/PressedCard.tsx` — Client component. Follows same pattern as `BatchCard.tsx` and `RosinCard.tsx`. Props: id, strain, batchNumber, pressDate, inputWeightG, finalWeightG, processingLossPct, status (PressedBatchStatus), sourceHashBatch (strain + batchNumber). Displays status badge with STATUS_STYLES map, weight metrics, date, and links to `/pressed/${id}`.

- [ ] **Step 2: Create pressed hash list page**

`app/(dashboard)/pressed/page.tsx` — Server component. Auth guard with `auth()`, redirects if no `orgId`. Fetches `db.pressedBatch.findMany` ordered by `pressDate desc`, includes `sourceHashBatch` select. Renders header with "Pressed Hash" title + count + "New Batch" link to `/pressed/new`. Grid of PressedCard components. Empty state with compress icon + "Create your first pressed hash batch" CTA.

- [ ] **Step 3: Create pressed hash detail page**

`app/(dashboard)/pressed/[id]/page.tsx` — Server component. Fetches single pressed batch with `sourceHashBatch` include. Displays: batch info header (strain, batch number, status), metrics grid (input weight, final weight, processing loss, loss %), source hash link, METRC UID, notes, processed/verified by, dates.

- [ ] **Step 4: Create pressed hash new page**

`app/(dashboard)/pressed/new/page.tsx` — Client component form. Fields: sourceHashBatchId (select from available hash batches via fetch), strain (auto-populated from selected batch), batchNumber, pressDate, micronsUsed, inputWeightG, finalWeightG, notes, metrcUid, processedBy, verifiedBy. Uses react-hook-form + Zod validation. POSTs to `/api/pressed`. Redirects to `/pressed/${id}` on success.

- [ ] **Step 5: Create pressed batch detail API route**

`app/api/pressed/[id]/route.ts` — GET (single batch with sourceHashBatch include), PATCH (partial update with org ownership check), DELETE (soft archive to ARCHIVED status). Follow exact same pattern as `app/api/batches/[id]/route.ts`.

---

### Task 4: Cleaning Log Pages

**Files:**
- Create: `lib/validations/cleaning.ts`
- Create: `components/cleaning/CleaningLogCard.tsx`
- Create: `components/cleaning/CleaningWizard.tsx`
- Create: `app/(dashboard)/cleaning/page.tsx`
- Create: `app/(dashboard)/cleaning/new/page.tsx`
- Create: `app/api/cleaning/[id]/route.ts`

Existing: `app/api/cleaning/route.ts` (GET list + POST create) already exists.

- [ ] **Step 1: Create cleaning validation schema**

`lib/validations/cleaning.ts` — Zod schemas for cleaning log creation. Main schema: weekOf (string, required), entries array with dayOfWeek (0-6), date (string), equipmentName (string), cleaned (boolean), cleanedBy (string optional), verifiedBy (string optional), notes (string optional).

- [ ] **Step 2: Create CleaningLogCard component**

`components/cleaning/CleaningLogCard.tsx` — Client component. Props: id, logNumber, weekOf, entryCount, completedCount. Shows log number, week date range, completion progress bar (completedCount/entryCount), links to detail.

- [ ] **Step 3: Create CleaningWizard component**

`components/cleaning/CleaningWizard.tsx` — Client component. A 7-day cleaning entry form. Accepts weekOf date, auto-generates 7 day entries (Mon-Sun). Each day row has: date (auto-calculated), equipment name (dropdown of standard equipment: "500 Gallon DCI Tank", "Bruteless 30 Gallon", "Bruteless 40 Gallon", "LTP-01", "LTP-02", "LTP-03"), cleaned checkbox, cleanedBy text, verifiedBy text, notes. Uses react-hook-form with useFieldArray for entries. Submit POSTs to `/api/cleaning`.

- [ ] **Step 4: Create cleaning log list page**

`app/(dashboard)/cleaning/page.tsx` — Server component. Auth guard. Fetches `db.haCleaningLog.findMany` with entries count. Renders header "Cleaning Logs" + "New Log" button. Grid of CleaningLogCard components. Empty state with cleaning icon.

- [ ] **Step 5: Create cleaning new page**

`app/(dashboard)/cleaning/new/page.tsx` — Wraps CleaningWizard component. Sets title metadata.

- [ ] **Step 6: Create cleaning detail API route**

`app/api/cleaning/[id]/route.ts` — GET (single log with entries), PATCH (update entries), DELETE (delete log). Auth + org scope guard.

---

### Task 5: Equipment Management Page

**Files:**
- Create: `components/equipment/EquipmentCard.tsx`
- Create: `components/equipment/RegisterEquipmentForm.tsx`
- Create: `app/(dashboard)/equipment/page.tsx`
- Create: `app/api/equipment/route.ts`
- Create: `app/api/equipment/[id]/route.ts`

This page serves as the unified equipment registry — freeze dryers, water filtration systems, presses, and wash tanks.

- [ ] **Step 1: Create equipment API route**

`app/api/equipment/route.ts` — GET: Queries both `db.freezeDryer.findMany` and `db.waterFiltrationSystem.findMany` for the org, returns combined list tagged with `type: 'freeze_dryer' | 'water_filtration'`. POST: Creates either a freeze dryer or water filtration system based on `type` field in body. Zod validation for each type.

- [ ] **Step 2: Create equipment detail API route**

`app/api/equipment/[id]/route.ts` — GET, PATCH, DELETE for individual equipment. Accepts `type` query param to know which table to query.

- [ ] **Step 3: Create EquipmentCard component**

`components/equipment/EquipmentCard.tsx` — Client component. Unified card for any equipment type. Props: id, name, type ('freeze_dryer' | 'water_filtration' | 'press' | 'wash_tank'), model, serial, isOnline (optional), status. Shows type icon, name/model/serial, online status for connected equipment, link to appropriate detail page.

- [ ] **Step 4: Create RegisterEquipmentForm component**

`components/equipment/RegisterEquipmentForm.tsx` — Client component. Form to register new equipment. Type selector (Freeze Dryer, Water Filtration, Press), then dynamic fields based on type. Freeze Dryer: name, callsign, model, serial, pumpModel, connectionType. Water Filtration: name, model, sedimentFilterDate, carbonFilterDate, preFilterDate. POSTs to `/api/equipment`.

- [ ] **Step 5: Create equipment list page**

`app/(dashboard)/equipment/page.tsx` — Server component. Fetches all equipment (freeze dryers + water filtration systems). Renders header "Equipment" + "Register Equipment" button (opens modal or links to form). Sections: "Freeze Dryers" and "Water Filtration" with EquipmentCard grids. Empty state per section.

---

### Task 6: Maintenance Log Pages

**Files:**
- Create: `lib/validations/maintenance.ts`
- Create: `components/maintenance/MaintenanceCard.tsx`
- Create: `components/maintenance/MaintenanceWizard.tsx`
- Create: `app/(dashboard)/maintenance/page.tsx`
- Create: `app/(dashboard)/maintenance/new/page.tsx`
- Create: `app/api/maintenance/route.ts`
- Create: `app/api/maintenance/[id]/route.ts`

- [ ] **Step 1: Create maintenance validation schema**

`lib/validations/maintenance.ts` — Zod schemas. Fields: category (HaMaintenanceCategory enum), equipmentId (string), equipmentType ('freeze_dryer' | 'water_filtration'), date (string), description (string), actionsTaken (string), partsReplaced (string optional), performedBy (string), verifiedBy (string optional), nextDueDate (string optional), notes (string optional).

- [ ] **Step 2: Create maintenance API routes**

`app/api/maintenance/route.ts` — GET (list maintenance logs for org, filterable by category and equipmentId), POST (create with Zod validation).

`app/api/maintenance/[id]/route.ts` — GET, PATCH, DELETE. Standard pattern.

- [ ] **Step 3: Create MaintenanceCard component**

`components/maintenance/MaintenanceCard.tsx` — Client component. Props: id, category, equipmentName, date, description, performedBy, status. Category-specific icon and color (freeze dryer = snowflake/cyan, water = droplet/blue, press = compress/amber). Date, performer name, description preview.

- [ ] **Step 4: Create MaintenanceWizard component**

`components/maintenance/MaintenanceWizard.tsx` — Client component. 3-step wizard using WizardShell:
1. **Equipment Selection**: Category picker (Freeze Dryer, Water Filtration, RO System, Press, Wash Tank, General) + equipment selector (populated from `/api/equipment`)
2. **Maintenance Details**: Date, description, actions taken, parts replaced, status
3. **Sign Off**: Performed by, verified by, next due date, notes

POSTs to `/api/maintenance`. Redirects to `/maintenance` on success.

- [ ] **Step 5: Create maintenance list page**

`app/(dashboard)/maintenance/page.tsx` — Server component. Auth guard. Fetches `db.haEquipmentMaintenanceLog.findMany` ordered by date desc. Filter tabs by category. Renders MaintenanceCard grid + "Log Maintenance" CTA. Empty state.

- [ ] **Step 6: Create maintenance new page**

`app/(dashboard)/maintenance/new/page.tsx` — Wraps MaintenanceWizard. Sets metadata.

---

### Task 7: PDF Generator

**Files:**
- Create: `lib/pdf-generator.ts`

Uses `@react-pdf/renderer` to generate batch record PDFs matching the original DOCX templates.

- [ ] **Step 1: Create PDF generator utility**

`lib/pdf-generator.ts` — Exports functions:

1. `generateHashBatchPDF(batch)` — Generates a Bubble Hash Batch Record PDF. Sections: Header (company, batch number, date), Starting Material (strain, state, grade, farm, METRC UID, weights), Processing (wash date, equipment, freeze dryer, drying params), Output (micron yields table with 160u-25u, total yield, yield %, quality tier), Allocation (QA, packaged, pressed, pre-roll, white label, rosin, loss), Sign-off (processed by, verified by).

2. `generateRosinBatchPDF(batch)` — Rosin Batch Record PDF. Sections: Header, Source Hash (batch ref, micron weights used), Press Setup (equipment, product type), Processing (date, yield, consistency), Post-Processing (decarb weight, loss, chip estimate, bag weight), Output (product name, UIDs), Sign-off.

3. `generateCleaningLogPDF(log)` — Weekly cleaning log PDF. Table: Day | Date | Equipment | Cleaned | By | Verified | Notes.

4. `generateMaintenanceLogPDF(log)` — Equipment maintenance record PDF. Header (equipment name, category), Details (date, description, actions, parts), Sign-off.

All PDFs use: dark header bar (#14b8a6 primary), monospace for numbers, consistent table styling, "Hash Agent" branding in footer.

---

### Task 8: METRC Utilities

**Files:**
- Create: `lib/metrc-utils.ts`

- [ ] **Step 1: Create METRC cross-reference utilities**

`lib/metrc-utils.ts` — Exports:

1. `validateMetrcUid(uid: string): boolean` — Validates METRC UID format (24-character alphanumeric with specific prefix patterns).

2. `findMissingMetrcUids(batches)` — Scans hash/rosin/pressed batches, returns list of batches missing source or product METRC UIDs.

3. `generateComplianceGapReport(orgId)` — Queries all batch types, identifies: missing UIDs, batches without COA reference, batches without QA allocation, incomplete sign-offs. Returns structured report.

4. `formatMetrcBatchNumber(batchNumber, type)` — Formats batch numbers for METRC submission.

---

### Task 9: Analytics Dashboard

**Files:**
- Create: `components/analytics/YieldByStrainChart.tsx`
- Create: `components/analytics/MicronDistributionChart.tsx`
- Create: `components/analytics/RosinTrendChart.tsx`
- Create: `components/analytics/KpiSummary.tsx`
- Create: `app/(dashboard)/analytics/page.tsx`
- Create: `app/api/analytics/yields/route.ts`

- [ ] **Step 1: Create analytics API route**

`app/api/analytics/yields/route.ts` — GET. Auth + org scope. Returns aggregated analytics data:
- Yield by strain: Group hash batches by strain, avg yield %, count
- Micron distribution: Sum of all micron yields across batches (160u through 25u)
- Rosin trends: Rosin yield % over time (by month)
- KPIs: Total batches, avg yield %, best strain, total output weight

Accepts query params: `period` (30d, 90d, 1y, all), `strains` (comma-separated filter).

- [ ] **Step 2: Create KpiSummary component**

`components/analytics/KpiSummary.tsx` — Client component. 4-card grid showing: Total Batches (count), Avg Yield % (with trend indicator), Best Performing Strain (name + yield), Total Output (weight in g/kg). Uses primary color for positive trends, accent-error for negative.

- [ ] **Step 3: Create YieldByStrainChart component**

`components/analytics/YieldByStrainChart.tsx` — Client component. Recharts `BarChart`. X-axis: strain names, Y-axis: yield %. Bars colored by quality tier. Tooltip with batch count + avg yield. Responsive container. Dark theme styling (white text, surface-card background, primary bars).

- [ ] **Step 4: Create MicronDistributionChart component**

`components/analytics/MicronDistributionChart.tsx` — Client component. Recharts `PieChart` or `RadialBarChart`. Segments for each micron grade (160u-25u) using `micron.*` color tokens. Legend with weight + percentage. Center label with total weight.

- [ ] **Step 5: Create RosinTrendChart component**

`components/analytics/RosinTrendChart.tsx` — Client component. Recharts `LineChart`. X-axis: months, Y-axis: rosin yield %. Line with primary color, area fill with primary/10 opacity. Dot on each data point. Reference line at avg yield.

- [ ] **Step 6: Create analytics page**

`app/(dashboard)/analytics/page.tsx` — Server component (fetches initial data) or client component with useEffect. Auth guard. Layout: KpiSummary at top, then 2-column grid with YieldByStrainChart (left, wider) and MicronDistributionChart (right), full-width RosinTrendChart below. Period selector (30d/90d/1y/All) at top right.

---

### Task 10: Compliance Page

**Files:**
- Create: `components/compliance/ComplianceCard.tsx`
- Create: `app/(dashboard)/compliance/page.tsx`
- Create: `app/api/compliance/reports/route.ts`

- [ ] **Step 1: Create compliance reports API route**

`app/api/compliance/reports/route.ts` — GET. Uses `generateComplianceGapReport` from `lib/metrc-utils.ts`. Returns: missing UIDs count + list, unsigned batches, batches without QA, overall compliance score (0-100%).

- [ ] **Step 2: Create ComplianceCard component**

`components/compliance/ComplianceCard.tsx` — Client component for individual compliance issues. Props: type ('missing_uid' | 'unsigned' | 'no_qa' | 'expired_coa'), batchId, batchNumber, strain, description, severity. Links to batch detail page for remediation.

- [ ] **Step 3: Create compliance page**

`app/(dashboard)/compliance/page.tsx` — Client component. Fetches compliance report from API. Top section: Compliance Score (large circular gauge or percentage), issue counts by category. Below: Tabbed list of issues (Missing UIDs, Unsigned Batches, Missing QA, Other). Each tab shows ComplianceCard list. "Export PDF" button for compliance report generation. Empty state: green checkmark + "All batches compliant."

---

### Task 11: Maintenance Scheduler + Cron

**Files:**
- Create: `lib/maintenance-scheduler.ts`
- Create: `app/api/cron/maintenance/route.ts`

- [ ] **Step 1: Create maintenance scheduler**

`lib/maintenance-scheduler.ts` — Exports:

1. `getOverdueMaintenanceTasks(orgId)` — Queries equipment with `nextMaintenanceDate < now()`. Returns list with equipment name, type, last maintenance date, overdue days.

2. `getUpcomingMaintenanceTasks(orgId, daysAhead = 7)` — Queries equipment with `nextMaintenanceDate` within N days.

3. `checkFilterReplacements(orgId)` — Queries water filtration systems. Checks if sediment/carbon/pre-filter dates are older than replacement intervals (sediment: 90 days, carbon: 180 days, pre-filter: 30 days). Returns list of filters needing replacement.

4. `createMaintenanceAlerts(orgId)` — Combines overdue + filter checks. Creates `HaAlert` records with category `MAINTENANCE_DUE` or `FILTER_DUE` for any items needing attention. Deduplicates against existing active alerts.

- [ ] **Step 2: Create maintenance cron API route**

`app/api/cron/maintenance/route.ts` — GET endpoint (designed for Vercel Cron or external cron service). Verifies `Authorization` header matches `CRON_SECRET` env var. Queries all organizations. For each org, calls `createMaintenanceAlerts(orgId)`. Returns summary of alerts created.

---

## Execution Order

Tasks 1-2 must be done first (schema + install). Tasks 3-6 can be parallelized (independent pages). Tasks 7-8 are utility libraries with no page dependencies. Tasks 9-11 depend on data from tasks 3-6 existing but can use mocked/empty data.

**Recommended serial order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

**Parallelizable groups:**
- Group A (after Task 2): Tasks 3, 4, 5, 6 (independent workflow pages)
- Group B (after Group A): Tasks 7, 8 (utility libraries)
- Group C (after Group B): Tasks 9, 10, 11 (analytics/compliance/cron)
