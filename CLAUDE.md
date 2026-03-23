## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.


##UI/UX Self-Review Protocol (TerpAgent)


After completing ANY code change that touches the frontend — components, pages,
wizards, buttons, forms, layouts, or data displays — you MUST perform a full
UI/UX self-review before declaring the task complete. This is not optional.

The Standard You Are Designing To
TerpAgent is not competing with generic SaaS. It is competing for the attention
and trust of growers who currently use whiteboards, spreadsheets, and gut feel.
The benchmark for visual quality and interaction design is Linear.app —
surgical precision, zero clutter, every interaction feels considered.
Additional references to hold in mind:

Linear — information density done right, keyboard-first, no wasted space
Notion — flexible structure, progressive disclosure, feels calm not corporate
Superhuman — speed as a feature, every action has a shortcut, nothing is buried
Vercel Dashboard — dark-first, data-rich but scannable, status always visible
Farm/OS — the only direct cultivation competitor worth studying for domain patterns

Before shipping any UI change, ask: Would a Linear engineer be embarrassed by this?
If yes, fix it first.

Persona Simulation — Run This Before Every Flow Change
You must mentally simulate TWO users before touching any workflow:
Persona A — Maya, First-Time Home Grower

Grows 2–4 plants in a tent. This is her first grow.
Has never used cultivation software. Came from a Reddit thread.
She will click the most visually prominent thing on screen.
She does NOT read labels carefully. She reads icons and button shapes.
Her first question when she opens TerpAgent: "Where do I put my plant?"
Her failure mode: she creates something in the wrong order (task before space,
space before facility) and gets confused or sees an empty state with no guidance.
She will abandon the app within 60 seconds if she doesn't feel forward momentum.

Simulate Maya's first session:

She lands on the dashboard. What does she see first? Is there a clear "Start here" path?
She wants to add her plant. How many taps/clicks does it take from the dashboard?
Does the app tell her what to create FIRST (facility → space → plant order)?
After adding her first plant, does she land somewhere that feels like progress?
Does anything on screen assume knowledge she doesn't have?

Persona B — Marcus, Professional Facility Manager

Manages a licensed 5,000 sq ft facility. 200+ plants across 6 rooms.
Has used spreadsheets and maybe one other cultivation app.
He evaluates software on: speed, data completeness, and whether it maps to
how he actually thinks about his operation.
His first question: "Can I see the state of my entire facility at a glance?"
His failure mode: the app makes him click too many times to log routine data.
He'll tolerate complexity but not inefficiency.

Simulate Marcus's first session:

He lands on the dashboard. Can he see facility-level status without drilling in?
He wants to log an environmental reading for Room 3. How many steps?
He wants to see which plants are due for feeding today across ALL rooms.
Can he find this without navigating to each room individually?
Does the app feel like it respects that he knows what he's doing?
Would he trust the data architecture enough to migrate his operation to it?

If any simulation reveals friction, confusion, or dead ends — fix the flow before
touching the visual polish. Flow first. Polish second.

Step 1 — Spatial Awareness & Hierarchy Check
Before any other review, orient yourself:

 Is the entity hierarchy (Facility → Space → Plant → Task) navigable from
the current screen without going back to a root page?
 Does the breadcrumb or nav always tell the user WHERE they are in that hierarchy?
 Is there a persistent "home base" the user can always return to in one click?
 Can a user who is lost self-recover in under 3 clicks?
 Does every page have a single dominant purpose that's clear within 3 seconds?


Step 2 — Functional Verification

Confirm the changed feature works end-to-end in the browser
Test all edge cases: empty state, single item, many items, error states, loading states
Verify all buttons trigger the correct action and give immediate user feedback
Confirm no console errors, no layout breaks at 1280px or 1440px width


Step 3 — The First-Click Test
For every screen or flow introduced or modified:

 Where does the eye land first? (use visual weight — size, color, contrast)
 Is that the RIGHT place for the eye to land given what the user needs to do?
 Is the primary action the most visually prominent element on the screen?
 Are secondary actions clearly subordinate — smaller, lower contrast, or
tucked into a menu — so they don't compete?
 Is every destructive action (delete, archive, reset) behind at minimum one
confirmation, visually de-emphasized, and never the default action?
 Are empty states actionable? An empty plant list should say "Add your first plant"
with a button — never just "No plants found."


Step 4 — Button & Action Legibility Audit
For every button or interactive element introduced or modified:

 Is it visually identifiable as a button without hovering?
 Does label or icon communicate the action without ambiguity?
 Is it in the location where the eye naturally falls at that moment?
 Does it give immediate feedback on click (loading state, success state)?
 Is the verb specific? ("Add Plant" not "Submit", "Log Feeding" not "Save")
 Are icon-only buttons reserved for universally understood icons (+ × ✓ ←)?
If there's any doubt, add a label.


Step 5 — Wizard & Multi-Step Flow Review
TerpAgent's core value is delivered through guided workflows. These must be
the most polished interactions in the entire app.
For any wizard or multi-step form:

 Does each step do ONE thing? Max 3 fields per step unless they are tightly
related (e.g. strain name + strain type belong together)
 Is there a visible step indicator showing position and total steps?
 Are required vs optional fields unambiguously differentiated?
 Does the primary CTA ("Next", "Add Plant") sit at the natural end of the
content flow — never floating, never requiring a scroll to find?
 Can the user go back without losing any data?
 Does the completion state land the user on the newly created entity's page
— not a generic list?
 Is there a contextual hint at each step explaining WHY this information matters?
("Your grow space dimensions help TerpAgent calculate your plant density
and flag overcrowding.")

The Guided Onboarding Path must be airtight:
Facility → Space/Room → Add Plant → First Task
A first-time user must be able to complete this entire chain without reading
documentation. If they can't, the onboarding is broken.

Step 6 — Information Density & Visual Balance
Cultivation software is data-dense by nature. The job is not to show less —
it's to show the right things at the right time.
Run this check on every screen:

 Is there one dominant visual element per screen that anchors the user's attention?
 Is secondary data collapsed, de-emphasized, or behind a disclosure until needed?
 Are status indicators (growth stage, health, alerts) consistent in color and
iconography across ALL views — not just this one?
 Does the screen feel balanced? (Check: is one column or section visually
heavier than everything else? Does it feel like it belongs together?)
 Is there consistent spacing? (All cards same padding, all section gaps same
value, no elements that look like they landed by accident)
 Would removing any element make the screen clearer without losing meaning?
If yes — remove it or collapse it.

Visual balance test: Squint at the screen until it blurs. The primary action
should still be the brightest/largest shape. If something else dominates — fix the hierarchy.

Step 7 — Motion & Feedback Quality
Static UIs feel cheap. Every interaction should feel alive.

 Do modals and drawers animate in? (slide or fade — never pop)
 Do success states give a moment of positive feedback? (brief green flash,
checkmark animation, toast that feels intentional not generic)
 Do loading states use skeleton screens, not spinners, for content areas?
 Do destructive actions (delete, archive) have a brief hesitation animation
that signals "this is serious"?
 Are hover states present on all interactive elements?
 Do list items animate in on first load with a subtle stagger?


Step 8 — Cultivation Domain Sanity Check

 Do all labels use cultivation vocabulary?
(strain not "product", grow space/room not "location",
veg/flower/harvest not "phase 1/2/3", PPM not "concentration value")
 Is the Facility → Space → Plant hierarchy visually navigable at all times?
 Does every metric show its unit? (days, °F/°C, RH%, pH, PPM, PPFD)
 Are all tasks and schedules tied visually to a parent entity?
(No orphaned tasks. Every task should answer: "for which plant/space?")
 Do AI-generated SOPs and tasks read like they were written by an experienced
cultivator, not a generalist assistant?


Step 9 — Competitive Benchmark Check
Before marking any significant UI component done, hold it against:

Would a Linear user find this obvious? (clarity of action, no mystery meat)
Would a Notion user find this flexible? (can they adapt it to their workflow?)
Would a Vercel user trust the data? (does it feel precise, reliable, professional?)

If the answer to any of these is "probably not" — keep refining.

Self-Review Output Format
Before saying "done", output this block:
## UI/UX Review — [Feature Name]

**Persona A (Maya) simulation:** PASS / friction found → [describe fix]
**Persona B (Marcus) simulation:** PASS / friction found → [describe fix]
**Spatial hierarchy:** PASS / issues found → [describe fix]
**First-click test:** PASS / issues found → [describe fix]
**Button legibility:** PASS / issues found → [describe fix]
**Wizard flow:** N/A / PASS / issues found → [describe fix]
**Info density & balance:** PASS / issues found → [describe fix]
**Motion & feedback:** PASS / issues found → [describe fix]
**Domain language:** PASS / issues found → [describe fix]
**Competitive benchmark:** PASS / needs refinement → [describe]

**Verdict:** Ready / Needs revision → [what's pending]
Do not skip this block. Do not output "PASS" for items you did not actually check.


## /video

CREATIVE IDENTITY
You are a senior motion designer and tech brand strategist with 15+ years building launch films, product demos, and campaign videos for category-defining software companies. Your work draws from the visual language of Apple, Linear, Vercel, Stripe, and Arc — companies that treat motion as a core product discipline, not an afterthought.
Your job is not to "make a video." Your job is to make someone feel, in 30–90 seconds, that this software is the obvious next step in how the world works. Every frame should look like it cost $50,000 to produce.
You think in sequences, not slides. You think in momentum, not transitions. You think in tension and release, not "show feature, explain feature."

BEFORE YOU WRITE A SINGLE LINE OF CODE
Answer these questions. If the user hasn't provided the answers, ask for them before starting.

What is the ONE thing this video needs the viewer to feel? (not think — feel)
Who is the viewer? (solo founder? enterprise CTO? home grower? developer?)
What's the villain? (the painful before-state this software eliminates)
What's the transformation? (the after-state — how their world changes)
What is the single most powerful visual moment you can create?

Build the entire video backward from your answer to question 5.

NARRATIVE STRUCTURE (The 4-Act Arc)
Every video — regardless of length — must follow this arc:
Act 1 — The Hook (0–20% of runtime)

Open on tension, not on branding
Show the problem viscerally — chaos, noise, friction, the painful "before"
No logo. No product name. No "introducing..."
The viewer should feel mild discomfort or recognition. That's the hook.

Act 2 — The Turn (20–40%)

One moment of visual contrast: something shifts
The product arrives as relief, not as a product
This is the exhale. Everything slows or snaps into clarity.

Act 3 — The Proof (40–85%)

Demonstrate the capability — but show outcomes, not features
Each feature beat gets ONE visual proof, not a walkthrough
Move quickly. Respect the viewer's intelligence.
Use kinetic data, environmental reactions, or state changes — never static screenshots

Act 4 — The Provocation (85–100%)

End on something that makes the viewer lean forward, not nod
A question, a future state, a subtle challenge
Logo + tagline — but only here. Never earlier.


VISUAL DESIGN RULES
Composition

Every frame is a designed frame. Before writing a component, sketch the composition mentally. Where is the focal point? What is the visual weight? What is the negative space doing?
Follow the rule of thirds. Never center everything unless centering is the deliberate design choice.
Text and UI elements should breathe. Minimum 48px margin from frame edges on a 1920-wide canvas.
Max 3 visual elements competing for attention per frame. If there are more, layer them in sequence.

Typography

Use ONE display typeface for hero text. One supporting face for body/data. Never three.
Hero text: Large, confident, tight line-height (1.0–1.1). Not bold for bold's sake — bold because weight carries intent.
Every text reveal is an event. Stagger characters or lines. Nothing should appear — things should arrive.
Minimum sizes: display 64px+, subhead 32px+, body/label 18px+. If it's smaller, it shouldn't be there.
Letter-spacing on all-caps text: +0.08em minimum.

Color

Define a 3-color palette before writing any component: Brand, Accent, Surface
Surface is not white. Use #080C10, #0A0F1A, #0D1117, or a dark desaturated tone — dark surfaces make everything glow
Brand color should appear in max 30% of any given frame. The rest is negative space and surface.
Accent is used ONCE per act for maximum visual punctuation. It means something when it appears.
Never use more than 2 colors in any single motion element.
Gradients are allowed ONLY for: background atmospheres, glow effects, and color-to-transparent fades. Never on UI elements.

Motion Principles
Everything has physics. Nothing should feel like a CSS transition.

Overshoot: Elements that land should overshoot slightly and spring back. spring({ stiffness: 180, damping: 14 }) is your baseline.
Anticipation: Before something big enters, create 2–4 frames of counter-motion. A card that flies in should pull back 8px first.
Follow-through: After a major beat, the frame doesn't freeze. Secondary elements continue reacting for 6–12 frames.
Ease curves: Only use ease-out for entrances (fast start, slow land), ease-in for exits (slow leave, fast out), spring for UI interactions.
NO: interpolate(frame, [0, 30], [0, 1]) with linear easing. This is the #1 cause of cheap-looking videos.
NO: Every element animating at the same speed. Vary durations by ±20% to create organic timing.
YES: Staggered reveals with delay = index * 4 (frames, not ms) across siblings.

Camera & Depth

Use translateZ and perspective to create depth layers. Foreground elements move faster than background elements during camera moves.
Parallax is not decoration — it is the illusion of space. Use it anywhere a "camera" is conceptually moving through a scene.
Zoom-in on key moments. Not a subtle 1.02x — a purposeful 1.1–1.3x from the focal point, eased over 20–40 frames.
Blur elements NOT in focus. blur(4px) on background layers during foreground reveals.


DATA & UI VISUALIZATION RULES
When showing product UI, metrics, or data:

Never use static screenshots. Animate every value — counters, progress bars, charts — as if the data is live.
Data should breathe. Numbers increment with subtle easing. Charts draw themselves. Graphs pulse.
Mock UIs should look more refined than the actual product — this is aspirational, not documentary.
Use interpolate with Easing.bezier(0.16, 1, 0.3, 1) for all data animations.
Show only the data that proves the point. One hero metric is worth ten dashboard numbers.
If showing a list or feed, stagger item reveals at 3–6 frame intervals.


ENVIRONMENT & ATMOSPHERE

Every scene has a light source. Define where light is coming from and let it affect every element.
Use radial gradients on the background surface at 8–15% opacity to simulate ambient light — the product should feel like it exists in a room, not on a slide.
Particle systems are allowed for atmosphere: 20–80 small dots/circles with slow drift (not sparkles — subtle field noise).
Depth fog: Background elements should be 15–25% lower opacity than foreground. Create a Z-axis even in flat compositions.
Screen glows: If UI elements are shown, add a subtle bloom effect around bright elements — box-shadow: 0 0 40px rgba(brandColor, 0.3).


AUDIO CONSIDERATIONS
(Output notes for the sound designer — write these as code comments)

Mark every major visual beat with // AUDIO: [impact/swoosh/chime/rise]
The video must work without sound. Every message must land visually.
Rhythm: Note the target BPM feel — // TEMPO: 120bpm feel so music selection is informed by cut rhythm.


WHAT "CHEAP" LOOKS LIKE — NEVER DO THESE

❌ Fade in / fade out as the primary transition
❌ Text that "types itself" unless it's a deliberate terminal/code metaphor
❌ Every element entering from the left
❌ White backgrounds with black text and a product screenshot
❌ Linear easing on anything visible
❌ More than 3 typefaces
❌ A feature list read like a checklist
❌ Product logo in the first 5 seconds
❌ Stock-motion "swoosh" or "zoom" transitions with no compositional intent
❌ Elements that pop on without an entrance animation
❌ Sound effects that are louder than the music


REMOTION-SPECIFIC IMPLEMENTATION STANDARDS
typescript// REQUIRED IMPORTS — always use these
import { spring, interpolate, Easing, useCurrentFrame, useVideoConfig } from 'remotion';

// SPRING PRESETS
const springFast   = spring({ frame, fps, config: { stiffness: 280, damping: 20 } });
const springMedium = spring({ frame, fps, config: { stiffness: 180, damping: 14 } });
const springSlow   = spring({ frame, fps, config: { stiffness: 80,  damping: 12 } });

// EASING PRESETS
const easeOut  = Easing.bezier(0.16, 1, 0.3, 1);   // entrances
const easeIn   = Easing.bezier(0.7, 0, 0.84, 0);    // exits
const easeInOut = Easing.bezier(0.87, 0, 0.13, 1);  // crossfades

// STAGGER PATTERN
const stagger = (index: number, delay = 4) =>
  Math.max(0, frame - delay * index);

// COLOR SYSTEM (define at top of Composition, pass via props)
const BRAND   = '#YOUR_BRAND_HEX';
const ACCENT  = '#YOUR_ACCENT_HEX';
const SURFACE = '#0D1117';
const TEXT_PRIMARY   = '#F0F4FF';
const TEXT_SECONDARY = 'rgba(240,244,255,0.55)';
Component Quality Checklist
Before submitting any Remotion component, verify:

 Every animation uses spring() or a named Easing curve — no linear interpolation
 Entry animations stagger if there are sibling elements
 The first frame is a designed composition, not a blank screen
 At least one moment of visual surprise or delight exists
 The video communicates its core message with the audio muted
 Dark surface palette is applied — no white/light backgrounds
 Typography hierarchy is strict: max 2 font sizes per scene
 Every major beat is marked with an // AUDIO: comment


REFERENCE AESTHETIC
When uncertain about a creative decision, ask: "Would Linear ship this?"
Linear's motion design is the gold standard for B2B SaaS video:

Dark surfaces, precise type, surgical animation timing
Nothing decorative — every element earns its place
Speed is confidence — cuts are faster than you think you should go
The product looks like it was designed by people who care about every pixel

Your output should feel like it belongs in that world.

# Hash Agent — Claude Code Handoff Document
> Primary context document for Claude Code. Read this fully before writing any code.

---

## 1. What Is Hash Agent?

**Hash Agent** is a standalone AI-first management and compliance application for cannabis **concentrate manufacturers, hash makers, and extract processors**. It is a sibling product to **TerpAgent** (cannabis cultivation management), sharing the same ecosystem, infrastructure, and AI layer — but targeting an entirely different user type and workflow.

Hash Agent is **not a module inside TerpAgent**. It is its own product with its own URL, onboarding, and UX. Think of the relationship like Jira and Confluence — distinct products, shared ecosystem and auth.

### Target Users
- **Hash makers / rosin producers** — solventless concentrate manufacturers
- **BHO / hydrocarbon extraction operators** — butane/propane/mixed extraction labs
- **Ethanol extraction processors** — large-scale hemp or cannabis extraction
- **Multi-product extract manufacturers** — running multiple SKUs, batches, and extraction methods simultaneously

### Core Problems Being Solved
1. Batch traceability from input material → finished concentrate SKU
2. Yield tracking and efficiency analysis by run, operator, method, and input cultivar
3. Quality control logging (micron, pressure, temp, time, consistency grading)
4. Compliance documentation (state-level traceability, COA management, testing logs)
5. Equipment maintenance and scheduling
6. AI-assisted process optimization recommendations

---

## 2. Ecosystem Position & Shared Infrastructure

### Relationship to TerpAgent

| Layer | TerpAgent | Hash Agent | Shared? |
|---|---|---|---|
| Auth | Supabase Auth | Supabase Auth | ✅ Same Supabase project |
| Database | Supabase Postgres | Supabase Postgres | ✅ Same project, separate schemas |
| AI | Gemini Flash / Flash-Lite | Gemini Flash / Flash-Lite | ✅ Same routing logic |
| UI Components | Shared design system | Shared design system | ✅ `/packages/ui` |
| DB Client | `/packages/db` | `/packages/db` | ✅ Shared typed client |
| Billing | Stripe | Stripe | ✅ Same Stripe account, separate products |
| Deployment | Vercel (separate project) | Vercel (separate project) | ❌ Independent deploys |
| Codebase | `/apps/terp-agent` | `/apps/hash-agent` | ❌ Separate Next.js apps |

---

## 3. Monorepo Structure

This project lives inside a **Turborepo monorepo** alongside TerpAgent. The root structure is:

```
/
├── apps/
│   ├── terp-agent/          # terpagent.com — cultivation management
│   └── hash-agent/          # hashagent.io — extract/concentrate processing
├── packages/
│   ├── ui/                  # Shared component library (shadcn/ui base)
│   ├── db/                  # Supabase client, shared types, shared migrations
│   ├── ai-client/           # Gemini Flash/Flash-Lite routing logic
│   ├── auth/                # Shared Supabase auth helpers
│   └── config/              # Shared ESLint, Tailwind, TypeScript configs
├── turbo.json
├── package.json             # Workspace root
└── CLAUDE.md                # This file
```

### Monorepo Commands
```bash
# Run Hash Agent in dev
turbo dev --filter=hash-agent

# Build only Hash Agent
turbo build --filter=hash-agent

# Build all apps + packages
turbo build

# Type check everything
turbo typecheck

# Run specific package
turbo dev --filter=@repo/ui
```

---

## 4. Hash Agent App Structure (`/apps/hash-agent`)

### Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shared design tokens from `/packages/ui`
- **Database**: Supabase (shared project with TerpAgent, `hash_agent` schema)
- **Auth**: Supabase Auth (shared — users can have accounts on both products)
- **AI**: Google Gemini via `/packages/ai-client` (Flash for complex, Flash-Lite for simple)
- **Deployment**: Vercel — separate project from TerpAgent

### App Directory Layout
```
/apps/hash-agent/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── batches/                  # Batch management
│   │   ├── runs/                     # Individual extraction runs
│   │   ├── inventory/                # Input material inventory
│   │   ├── equipment/                # Equipment tracking
│   │   ├── quality/                  # QC logs and COA management
│   │   ├── compliance/               # State compliance docs
│   │   └── agent/                    # AI assistant interface
│   ├── api/
│   │   ├── ai/route.ts               # AI assistant endpoint
│   │   ├── batches/route.ts
│   │   └── webhooks/route.ts
│   ├── layout.tsx
│   └── page.tsx                      # Marketing/landing page
├── components/
│   ├── batches/
│   ├── runs/
│   ├── equipment/
│   └── shared/                       # Hash Agent-specific shared components
├── lib/
│   ├── supabase/
│   ├── ai/                           # Hash Agent-specific AI prompt configs
│   └── utils/
├── types/
│   └── index.ts                      # Hash Agent domain types
└── middleware.ts                     # Auth route protection
```

---

## 5. Domain & Deployment

### Domains
- **Primary**: `hashagent.io` — main product URL
- **Redirect**: `hashagent.app` → redirects to `hashagent.io` (301)
- **Ecosystem URL**: `hash.terpagent.com` → redirects to `hashagent.io` (301)

### Vercel Setup
- Create a **new Vercel project** (`hash-agent`) separate from TerpAgent
- Root directory: `apps/hash-agent`
- Build command: `cd ../.. && turbo build --filter=hash-agent`
- Install command: `pnpm install` (from monorepo root)
- Framework preset: Next.js

### DNS Configuration
Add to DNS provider (Cloudflare recommended):
```
hashagent.io    A / CNAME    → Vercel (follow Vercel domain docs)
hashagent.app   CNAME        → Vercel OR redirect record to hashagent.io
```
For `hash.terpagent.com` redirect, add in the TerpAgent Vercel project under domain redirects.

### Environment Variables (Hash Agent Vercel Project)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_AI_API_KEY=
NEXT_PUBLIC_APP_URL=https://hashagent.io
NEXT_PUBLIC_TERP_AGENT_URL=https://terpagent.com
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## 6. Database Schema

Hash Agent uses the **same Supabase project** as TerpAgent but in a dedicated `hash_agent` Postgres schema. Cross-product tables (users, organizations, billing) live in the `public` schema and are shared.

### Shared Tables (public schema — do not recreate)
```sql
public.users               -- Auth users (managed by Supabase Auth)
public.organizations       -- Org/company records
public.org_members         -- User-org membership + roles
public.subscriptions       -- Stripe subscription state
```

### Hash Agent Schema (hash_agent.*)
```sql
hash_agent.facilities          -- Processing facility records
hash_agent.rooms               -- Rooms/zones within facilities
hash_agent.equipment           -- Extraction equipment inventory
hash_agent.input_batches       -- Incoming raw material (flower/trim/kief)
hash_agent.extraction_runs     -- Individual extraction run records
hash_agent.batch_outputs       -- Finished concentrate outputs per run
hash_agent.qc_logs             -- Quality control log entries
hash_agent.coa_documents       -- COA file references + metadata
hash_agent.compliance_events   -- State compliance reporting events
hash_agent.maintenance_logs    -- Equipment maintenance records
hash_agent.agent_conversations -- AI assistant conversation history
```

### Key Relationships
```
organizations → facilities → rooms → equipment
input_batches → extraction_runs → batch_outputs → qc_logs
batch_outputs → coa_documents
extraction_runs → maintenance_logs (equipment used)
```

### Supabase RLS Pattern
Follow TerpAgent's RLS conventions:
- All tables have `organization_id` column
- RLS policies gate all access by `org_members` membership
- Service role key used only in server-side API routes
- Client uses anon key with RLS enforced

---

## 7. AI Layer (`/packages/ai-client`)

### Routing Logic (inherit from TerpAgent)
```typescript
// Flash-Lite — fast, cheap, high-volume
const FLASH_LITE_TRIGGERS = [
  'simple lookup', 'yes/no question', 'field validation',
  'short summary', 'unit conversion', 'quick tip'
]

// Flash — complex reasoning, analysis, recommendations
const FLASH_TRIGGERS = [
  'yield analysis', 'process optimization', 'compliance review',
  'batch comparison', 'troubleshooting', 'report generation'
]
```

### Hash Agent-Specific AI Contexts
The AI assistant should be initialized with Hash Agent domain context. Key system prompt additions:

```typescript
const HASH_AGENT_SYSTEM_CONTEXT = `
You are Hash Agent, an AI assistant specialized in cannabis concentrate 
manufacturing and extraction processing. You have deep expertise in:

- Solventless extraction: ice water hash, bubble hash, dry sift, rosin pressing
- Hydrocarbon extraction: BHO, PHO, mixed hydrocarbon
- Ethanol extraction: cold ethanol, warm ethanol, ETOH wash methods
- Post-processing: winterization, dewaxing, distillation, remediation
- Quality metrics: terpene retention, potency, consistency grading (1-6 star for hash)
- Compliance: state-level batch traceability, COA interpretation, testing requirements
- Equipment: closed-loop systems, presses, freeze dryers, rotary evaporators

Always reference the user's specific run data, yield history, and equipment 
when making recommendations. Never give generic advice when specific context 
is available.
`
```

### Agentic Triggers (Planned — Phase 2)
Mirror TerpAgent's event-driven trigger framework for:
- Yield drops below historical average → alert + AI analysis prompt
- QC score outside normal range → flag for review
- Equipment maintenance interval reached → maintenance reminder
- COA expiry approaching → compliance alert

---

## 8. Shared Package Conventions

### `/packages/ui`
- Built on shadcn/ui + Radix primitives
- Tailwind CSS with shared design tokens
- **Import pattern**: `import { Button } from '@repo/ui'`
- Hash Agent may have its own color theme (amber/gold vs TerpAgent's green)
- Add new components to the package; don't duplicate in the app

### `/packages/db`
- Single Supabase client factory
- All database types auto-generated via `supabase gen types typescript`
- **Import pattern**: `import { createClient } from '@repo/db'`
- Run type gen after any schema migration:
  ```bash
  supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/db/types/supabase.ts
  ```

### `/packages/ai-client`
- Wraps Google Generative AI SDK
- Exports `createAIClient(context: AppContext)` factory
- Routes between Flash and Flash-Lite based on intent classification
- Handles streaming, error retry, and token tracking

---

## 9. Tier / Billing Structure

Hash Agent has its own tier structure independent from TerpAgent's tiers:

| Tier | Target | Key Limits |
|---|---|---|
| **Free** | Hobbyist / small operators | 10 runs/month, 1 facility, no COA storage |
| **Pro** | Single-facility processors | Unlimited runs, 1 facility, COA storage, AI assistant |
| **Commercial** | Multi-facility operations | Multi-facility, team members, compliance reporting, priority AI |
| **Enterprise** | Large-scale / multi-state | Custom, API access, dedicated support |

Billing is managed via Stripe. Use the same Stripe account as TerpAgent with separate Products/Price IDs for Hash Agent. Track subscription state in `public.subscriptions` with an `app` field (`terp_agent` | `hash_agent`).

---

## 10. Code Conventions

### TypeScript
- Strict mode enabled — no `any`, no implicit types
- Prefer `type` over `interface` for domain objects
- Use Zod for all API input validation

### File Naming
- Components: `PascalCase.tsx`
- Utilities/hooks: `camelCase.ts`
- Route handlers: `route.ts` (Next.js convention)
- Types: colocated `types.ts` or top-level `types/index.ts`

### Data Fetching
- Server Components for initial data load
- React Query (TanStack Query) for client-side state and mutations
- Server Actions for form submissions and mutations where appropriate

### Error Handling
- All API routes return `{ data, error }` shape
- Use typed error codes — not raw error messages in responses
- Log errors server-side; return safe messages to client

### Comments
- Comment **why**, not **what**
- Complex domain logic (extraction calculations, compliance rules) must have comments explaining the domain context

---

## 11. Self-Review Protocol

Before completing any task, Claude Code must verify:

**Schema changes**
- [ ] Migration file created in `supabase/migrations/`
- [ ] RLS policies defined for all new tables
- [ ] Types regenerated (`supabase gen types`)
- [ ] `organization_id` present on all new tables

**New API routes**
- [ ] Input validated with Zod
- [ ] Auth checked via Supabase server client
- [ ] Organization-scoped — user cannot access another org's data
- [ ] Error responses use consistent `{ data: null, error: string }` shape

**New components**
- [ ] Uses tokens/components from `/packages/ui` before creating new ones
- [ ] Mobile responsive
- [ ] Loading and empty states handled
- [ ] No hardcoded colors — use Tailwind theme tokens only

**AI features**
- [ ] System context includes Hash Agent domain context
- [ ] Uses correct model tier (Flash vs Flash-Lite) for the use case
- [ ] Conversation history stored in `hash_agent.agent_conversations`
- [ ] User's run/batch data injected into prompt context where relevant

---

## 12. Key Domain Glossary

| Term | Definition |
|---|---|
| **Input batch** | Raw material received (flower, trim, kief, fresh frozen) before processing |
| **Extraction run** | A single processing event — one input batch through one method |
| **Batch output** | Finished concentrate produced from a run (may be multiple SKUs) |
| **Yield %** | `(output_weight / input_weight) × 100` — primary efficiency metric |
| **Wash** | One pass of solvent/water over input material (ice water context) |
| **Press** | The rosin pressing step — temperature, pressure, time, micron bag size |
| **Star rating** | Solventless hash quality grade — 1-6 stars (6 = full melt, direct dabable) |
| **COA** | Certificate of Analysis — third-party lab test results |
| **Terps** | Terpenes — aromatic compounds; high retention = higher quality |
| **Live** | Processed from fresh frozen (never dried) material — higher terpene content |
| **Cure** | Post-processing aging of hash/rosin to develop texture and terpene profile |
| **Remediation** | Post-extraction cleanup to remove pesticides, heavy metals, or solvents |
| **METRC / BioTrackTHC** | State-level cannabis traceability systems for compliance |

---

## 13. Phase Roadmap

### Phase 1 — MVP (current focus)
- [ ] Monorepo scaffolding with Turborepo
- [ ] Hash Agent Next.js app bootstrapped
- [ ] Supabase schema (`hash_agent` schema + core tables)
- [ ] Auth (shared with TerpAgent or standalone — confirm with Leo)
- [ ] Extraction run logging (input → run → output)
- [ ] Basic yield tracking and history
- [ ] AI assistant (chat interface, domain-aware)
- [ ] Marketing/landing page at `hashagent.io`

### Phase 2 — Core Product
- [ ] Full batch traceability (input → run → output → COA)
- [ ] Equipment maintenance tracking
- [ ] QC grading system (star rating, terpene notes, consistency)
- [ ] Dashboard with yield analytics by method, operator, cultivar
- [ ] Agentic triggers (yield alerts, maintenance reminders)
- [ ] Compliance event logging

### Phase 3 — Commercial
- [ ] Multi-facility support
- [ ] Team roles and permissions
- [ ] State compliance report generation
- [ ] COA document storage and management
- [ ] API for integrations (METRC, BioTrackTHC)
- [ ] Mobile app (Capacitor wrapper, same as TerpAgent strategy)

---

## 14. Questions to Confirm with Leo Before Building

- [ ] **Auth**: Should Hash Agent share the same Supabase Auth project as TerpAgent, enabling cross-product single sign-on? Or start standalone and merge later?
- [ ] **Monorepo state**: Is TerpAgent already in a monorepo structure, or does the monorepo need to be set up from scratch with TerpAgent migrated in?
- [ ] **Design theme**: Same visual theme as TerpAgent (green/cannabis) or distinct identity (amber/gold for concentrates)?
- [ ] **Phase 1 AI scope**: Full chat assistant on day 1, or basic extraction run logging first?
- [ ] **Compliance states**: Which state(s) to support first for compliance features?