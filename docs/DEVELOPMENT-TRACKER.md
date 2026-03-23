# Hash Agent — Development Tracker

> Project: Hash Agent (hashagent.io)
> Repository: TerpAgent monorepo → apps/hash-agent
> Started: 2026-03-23
> Lead: Leo (Hash Agent)

---

## Session Log

### Session 1 — 2026-03-23: Foundation Build

**Duration**: ~2 hours
**Scope**: Phases 0-2 (scaffolding + schema + infrastructure)

**Completed**:
1. Analyzed 8 source documents (batch records, equipment logs, Excel trackers)
2. Captured Hashy.so competitive intelligence (homepage, hash-app, changelog, pricing)
3. Explored TerpAgent codebase architecture (185 API routes, 110+ Prisma models)
4. Designed full 7-phase implementation plan
5. Scaffolded `apps/hash-agent/` with complete directory structure
6. Created all config files (package.json, tsconfig, tailwind, next.config, postcss)
7. Added 15 Prisma models + 16 enums to shared schema
8. Built auth (NextAuth 5 shared), middleware, RBAC
9. Created dashboard layout with full sidebar navigation
10. Built dashboard homepage with KPI cards + data widgets
11. Created domain utility functions (yield calc, unit conversion, batch numbering)
12. Created Zod validation schemas for batch + rosin wizards
13. Built batch API route (list + create with auto-calculations)
14. Created comprehensive type definitions

**Key Files Created**: 20+
**Lines of Code**: ~2,500 (new) + ~1,300 (schema additions)

### Session 2 — 2026-03-23: Core Workflows + AI

**Duration**: In progress
**Scope**: Phases 3A, 3B, 5 (wizards + AI assistant)

**Building**:
- Bubble Hash Batch Wizard (5-step)
- Rosin Batch Wizard (5-step)
- AI Assistant with Gemini function calling
- Remaining API routes

---

## Document → Feature Mapping

This tracks which uploaded documents map to which app features.

| # | Document | Feature | Status |
|---|----------|---------|--------|
| 1 | Hash Manufacturing Tracking HHC.xlsx (Bulk Hash Tracker) | `/batches` list view + CSV import | 🔨 |
| 1 | Hash Manufacturing Tracking HHC.xlsx (Bulk Rosin Tracker) | `/rosin` list view + CSV import | ⏳ |
| 1 | Hash Manufacturing Tracking HHC.xlsx (Pressed Hashish Tracker) | `/pressed` list view | ⏳ |
| 1 | Hash Manufacturing Tracking HHC.xlsx (Biomass List via Metrc) | `/batches/new` step 1 source picker | 🔨 |
| 2 | Bubble Hash Manufacturing Batch Record.docx | `BubbleHashWizard` (5 steps) + PDF export | 🔨 |
| 3 | Rosin Manufacturing Batch Record.docx | `RosinWizard` (5 steps) + PDF export | 🔨 |
| 4 | Example of Filled Out Rosin Batch Record.pdf | PDF template reference for export | ⏳ |
| 5 | Cleaning Log Manufacturing.pdf | `CleaningLogWizard` + PDF export | ⏳ |
| 6 | Equipment Maintenance Log — Freeze Dryers.docx | Freeze dryer maintenance workflow + PDF | ⏳ |
| 7 | Equipment Maintenance Log — 2-Stage Water Filtration.docx | Filtration maintenance workflow + PDF | ⏳ |
| 8 | Equipment Maintenance Log — HydroLogic RO.docx | RO system maintenance workflow + PDF | ⏳ |

---

## Data Model Source Traceability

Every field in the Prisma schema traces back to a specific document cell/field.

### HashBatch ← Bulk Hash Tracker (Sheet 1) + BH Batch Record (Doc 2)

| Prisma Field | Source Document | Source Column/Field |
|---|---|---|
| strain | Bulk Hash Tracker | Column A "Strain" |
| washDate | Bulk Hash Tracker | Column B "Date (Washed)" |
| materialState | Bulk Hash Tracker | Column C "Plant Material State" |
| materialGrade | Bulk Hash Tracker | Column D "Plant Material Grade" |
| metrcSourceUid | Bulk Hash Tracker | Column E "Plant Material UID No." |
| batchNumber | Bulk Hash Tracker | Column F "Batch Manufacturing Record Number" |
| farmSource | Bulk Hash Tracker | Column G "Farm" |
| rawMaterialWeightG | Bulk Hash Tracker | Column J "Plant Weight (g)" |
| rawMaterialWeightLb | Bulk Hash Tracker | Column H "Raw Material Weight (lbs)" |
| wetWasteWeightG | Bulk Hash Tracker | Column K "Wet Waste Weight (lbs)" → converted |
| yield160u | Bulk Hash Tracker | Column O "Weight of 160 Micron (g)" |
| yield120u | Bulk Hash Tracker | Column P "Weight of 120 Micron (g)" |
| yield90u | Bulk Hash Tracker | Column Q "Weight of 90 Micron (g)" |
| yield73u | Bulk Hash Tracker | Column R "Weight of 73 Micron (g)" |
| yield45u | Bulk Hash Tracker | Column S "Weight of 45 Micron (g)" |
| totalYieldG | Bulk Hash Tracker | Column N "Total Weight dried resin (g)" |
| yieldPct | Bulk Hash Tracker | Column T "Resin % vs. biomass" |
| allocQa | Bulk Hash Tracker | Column U "Qty to QA Sample" |
| allocPackaged | Bulk Hash Tracker | Column V "Qty to Packaged Bubble Hash (g)" |
| allocPressed | Bulk Hash Tracker | Column W "Qty to Pressed Bubble Hash (g)" |
| allocPreRoll | Bulk Hash Tracker | Column X "Qty to Bulk Pre-Roll Hash (g)" |
| allocWhiteLabel | Bulk Hash Tracker | Column Y "Qty to Bulk White Label BH(g)" |
| allocRosin | Bulk Hash Tracker | Column Z "Wt. of Bubble Hash to Rosin (g)" |
| allocLossG | Bulk Hash Tracker | Column AA "Loss" |
| equipmentUsed | BH Batch Record | "List of Processing Equipment" section |
| shelfLimitF | BH Batch Record | "Shelf Limit (°F)" column |
| freezeTimeHrs | BH Batch Record | "Freeze Time (hrs)" column |
| dryingTimeHrs | BH Batch Record | "Drying Time (hrs)" column |
| qualityTier | BH Batch Record | "Overall Quality Grade" checkboxes |
| processedBy | BH Batch Record | "Weighed by (Int.)" |
| verifiedBy | BH Batch Record | "Verified by (QAP)" |

### RosinBatch ← Bulk Rosin Tracker (Sheet 2) + Rosin Batch Record (Doc 3)

| Prisma Field | Source Document | Source Column/Field |
|---|---|---|
| sourceHashBatchId | Bulk Rosin Tracker | Column A "Name of Bulk Hash Used" |
| washDate | Bulk Rosin Tracker | Column B "Wash Date" |
| sourceHashUid | Bulk Rosin Tracker | Column C "Initial Bubble Hash UID No." |
| processDate | Bulk Rosin Tracker | Column D "Post Process Date" |
| productName | Bulk Rosin Tracker | Column E "Name of Product" |
| batchNumber | Bulk Rosin Tracker | Column F/G batch log + batch number |
| rosinProductUid | Bulk Rosin Tracker | Column H "Rosin UID No." |
| consistency | Bulk Rosin Tracker | Column I "Consistency" |
| companyProcessedFor | Bulk Rosin Tracker | Column J "Company" |
| micron120u-45u | Bulk Rosin Tracker | Columns K-O "Microns Used (g)" |
| totalHashWeightG | Bulk Rosin Tracker | Column P "Total Weight of Bubble Hash to Rosin" |
| rosinYieldWeightG | Bulk Rosin Tracker | Column Q "Wt. of Rosin Yield" |
| rosinYieldPct | Bulk Rosin Tracker | Column R "% Return on Rosin Yield" |
| decarbWeightG | Bulk Rosin Tracker | Column S "Weight of Rosin After Decarb" |
| decarbLossG | Bulk Rosin Tracker | Column T "Decarb Loss" |
| hashToRosinDiffG | Bulk Rosin Tracker | Column V "Bubble Hash to Rosin Yield Difference" |
| rosinChipEstimateG | Bulk Rosin Tracker | Column W "Estimated Number of Rosin Chips" |
| bagWeightG | Bulk Rosin Tracker | Column X "Weight of Rosin Bags per Batch (g)" |

### FreezeDryer ← Equipment Maintenance Log (Doc 6)

| Prisma Field | Source Document | Source Value |
|---|---|---|
| name: "HR-01" | Doc 6, Page 1 | Equipment Number: HR-01 (ALPHA) |
| serialNumber | Doc 6, Page 1 | Serial: Aug20 P-LFD 00771 PH |
| model | Doc 6, Page 1 | Model: HRFD-PLrg-SS-Pharm |
| pumpModel | Doc 6, Page 1 | Pump: YTP550-4C16A |

---

## Competitive Differentiation vs Hashy.so

| Feature | Hashy.so | Hash Agent |
|---------|----------|------------|
| Freeze dryer monitoring | ✅ HashyLink ($400/yr) | ✅ Built-in (included) |
| Machine control | ❌ Read-only | ✅ Start/stop/add time |
| Batch data tracking | ✅ HashApp (separate product) | ✅ Unified with monitoring |
| AI assistant | ❌ | ✅ Gemini-powered with function calling |
| Camera OCR for weights | ❌ Manual entry only | ✅ Snap scale photos |
| METRC compliance | ❌ | ✅ UID tracking + gap reports |
| PDF batch records | ❌ | ✅ Matches original templates |
| Equipment maintenance | ❌ | ✅ Freeze dryers + water filtration |
| Yield analytics | Basic | ✅ Strain comparison, micron analysis, trends |
| Pricing model | $400/yr per machine (annual only) | Flexible tiers (free → enterprise) |
| Multi-product support | Separate apps | ✅ Single dashboard |

---

## Environment Setup Checklist

Before running the app locally:

- [ ] Copy `.env.local` from TerpAgent and update:
  - [ ] `NEXTAUTH_URL=http://localhost:3001`
  - [ ] `NEXT_PUBLIC_APP_URL=http://localhost:3001`
  - [ ] Same `DATABASE_URL`, `NEXTAUTH_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - [ ] Same `GOOGLE_AI_API_KEY` (Gemini)
- [ ] Run `cd apps/web && npx prisma db push` (creates ha_* tables)
- [ ] Run `cd apps/web && npx prisma generate` (updates client types)
- [ ] Run `cd apps/hash-agent && npm install`
- [ ] Run `npm run dev:hash` from monorepo root (starts on port 3001)
