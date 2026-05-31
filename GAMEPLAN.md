# GAMEPLAN
Date: 2026-02-05
Status: Planning-only. No implementation has been done in this step.

## 1) Scope and constraints
- This document is an audit + vision + execution plan only.
- Do not remove any existing pages/features. If we reorganize navigation, move outlier/ancillary features under a "Tools" section.
- Focus the product on two primary outcomes for solo operators: (1) winning software engineering clients, (2) running a solo recruiting business.
- Automation should be human-in-the-loop by default and use Playwright or the Electron webview where appropriate.
- Rename "Upwork Guide" conceptually to "Upwork Proposal Tool" (implementation later).
- Embedded browser has been made generic and a new scraper tool exists; the plan must leverage these as first‑class primitives.

## 2) Codebase audit (current state)
### Stack and architecture
- Next.js app router with React 19 + Next 16 canary; Bun-based tooling.
- Prisma + Postgres data model covering CRM, projects, tasks, billing, email, agents, workflows, tickets, knowledge, templates, skills.
- Electron integration for local project management and embedded browser workflows.
- AI integrations: OpenAI + Anthropic SDKs, MCP server/tools, RAG endpoints, and agent orchestration.
- Playwright is present (deps + API usage) for automation/screenshotting.

### Core subsystems that already exist
- Orchestration + agents: agent/workflow/ticket models, MCP endpoints, agent activity streaming.
- RAG and knowledge: endpoints for context, indexing, search, and memory storage.
- Config + templates: shared configs, project/app templates, dependency management, template files.
- Electron runtime: project discovery, app launching, embedded browser, filesystem-aware tooling.
- Embedded browser is now generic, and a new scraper tool exists (to be used as a unified capture pipeline).

### Feature inventory (what exists today)
- Marketing / client acquisition
  - `/lead-generation`, `/lead-generation/search`, `/agency-leads`, `/outreach`, `/find-work`, `/email-automation`, `/email-marketing`, `/linkedin-integration`, `/execution-calendar`, `/action-plan`.
- Upwork tool
  - `/upwork-guide` plus API routes for HTML extraction and proposal generation. Uses Electron embedded browsing and AI fallback templates.
- Recruiting
  - `/recruiting`, `/recruiting-dashboard`, `/recruiting/candidates/search`, `/recruiting/training`, `/recruiting-action-guide`, `/recruiting/network-mapping`.
- CRM / sales ops
  - `/clients`, `/leads`, `/proposals`, `/contracts`, `/portfolio` (mostly mock data UIs at present).
- Delivery / PM
  - `/projects`, `/projects/[name]/*`, `/tasks`, `/teams`, `/workflows`, `/agents`, `/automate`.
- Billing
  - `/billing`, `/invoices`, `/payments`, `/time-tracking`.
- Insights
  - `/analytics`, `/analytics/dashboard`, `/business-intelligence`, `/revenue-analytics`.
- Communications
  - `/email`, `/calendar`, `/calendar/integrations`, `/scheduling`.
- Tools / studio / dev system
  - `/studio`, `/asset-designer`, `/templates`, `/components/*`, `/docs/*`, `/design/*`, `/layouts/*`, `/features/*`, `/data`, `/configs`, `/configuration`.

### Reality check (functionality depth)
- Many UI pages are demo or static (hardcoded data arrays, mock metrics) rather than wired to Prisma models.
- The most “real” functionality today is in project management (Electron), Upwork extraction + proposal generation, and MCP/RAG/agent infrastructure.
- Recruiting hub uses a local store and seed data; not yet first-class pipeline in the DB.
- Email/calendar UIs exist but are not fully integrated with provider APIs.

## 3) Product vision (focus for solo operators)
### North star
Build a “solo growth OS” that turns a solo software engineer or solo recruiter into a consistent pipeline and repeatable revenue.

### Primary user archetypes
- Solo software engineering consultant: needs leads, quick qualification, tight scope/proposals, and predictable delivery.
- Solo recruiter: needs client acquisition, candidate sourcing, and a lightweight placement pipeline.

### Expanded business model support
- Recruiting from scratch (no warm network): source open roles, source candidates, secure right‑to‑represent, then submit candidates.
- Engineering company as employer: hire W‑2/contract talent, staff on projects, and capture margin on billable rates (not just placements).

### Outcome-driven focus
- Weekly pipeline visibility: new leads, conversations booked, proposals sent, deals closed.
- Faster time-to-first-contract via automation + templates + prioritized targets.
- Lightweight operations suitable for a single owner/operator.

### Product promise
- “Find work, qualify it, win it, and deliver it” from one place.
- One playbook that supports both client acquisition and recruiting placements.

## 4) Strategic information architecture (future state)
Proposed top-level navigation (keep existing pages, just re-group):
- Dashboard
- Marketing (lead gen, outreach, Upwork Proposal Tool, email marketing, LinkedIn tools, agency leads, execution calendar, action plan, find work)
- Recruiting (hub, candidate search, training, action guide, network mapping, dashboard, recruiting‑from‑scratch launcher)
- CRM (clients, leads, proposals, contracts, portfolio)
- Email
- Calendar
- Projects
- Tasks
- Insights (analytics, revenue, BI)
- Billing (invoices, payments, time tracking)
- Engineering (automation sequences, API setup/validation, documentation, employer‑of‑record staffing ops)
- Automate (agents, teams, workflows)
- Tools (studio, templates, components, docs, design, layouts, asset designer, internal demos, data/config utilities, scraper tool UI)

## 5) Automation and scraping strategy
- Use Playwright + generic embedded browser for assisted automation (human-in-the-loop).
- Default to “assist” mode (user sees the browser, approves actions) to reduce compliance risk.
- Unify all capture flows on the new scraper tool:
  - Capture listing HTML → AI extraction → normalize → CRM/ATS import.
- Add queueing + rate limiting + provider-specific adapters.
- Maintain audit logs for automation actions and approvals.

## 6) Key gaps to close before monetization
- End-to-end “lead → conversation → proposal → contract → delivery → invoice” pipeline is not wired.
- Recruiting pipeline not represented in DB or connected to real sourcing inputs.
- Email + calendar UI not connected to real provider data.
- Analytics are static; no unified metrics or pipeline forecasting.
- No auth/roles or tenant separation for multi-user or “client” access.
- Monetization (pricing, paywall, licensing) is not implemented.
- Missing operational guardrails: consent, compliance for scraping/posting, and system observability.
- Employer‑of‑record staffing model requires payroll, tax, and compliance pathways.

## 7) Execution instructions for agents (must follow)
- Each task and subtask below must be owned by exactly one agent.
- Every task and subtask must include `Agent:`, `Prompt:`, and `Why:` fields.
- Update item status immediately upon starting work and frequently during work.
- Use these markers: `[ ]` not started, `[~]` in progress, `[x]` complete.
- If an item blocks or changes scope, update the status and add a short note in the item prompt.
- Never start an item already marked `[~]` or `[x]` unless you are the listed agent and explicitly resuming.

## 8) Comprehensive task list for AI engineers
### Workstream A: Product definition and UX focus
1. [ ] Task: Define ICP, positioning, and offers for solo software engineering + solo recruiting
Agent: Windsurf - Claude
Prompt: "Review GAMEPLAN.md and the current pages. Write a 1-page ICP and positioning brief for each track, including primary pain points, promise, and 3 service offers that the product should support."
Why: Clear ICP + positioning prevents feature sprawl and makes acquisition messaging coherent.

1.1 [ ] Subtask: ICP validation checklist
Agent: Windsurf - Claude
Prompt: "Create a checklist of 15 validation questions to confirm the ICP and offer-market fit."
Why: Ensures the plan is grounded in real demand before heavy buildout.

1.2 [ ] Subtask: North-star metrics
Agent: Windsurf - Claude
Prompt: "Define 5 measurable success metrics for each track (engineering, recruiting)."
Why: Metrics align roadmap decisions with business outcomes.

2. [ ] Task: Core workflow UX designs
Agent: Windsurf - Claude
Prompt: "Design low-fidelity UX flows for lead intake, qualification, outreach sequence, proposal, and close. Provide annotated flow steps."
Why: Sequenced UX flows reduce confusion and improve conversion for solo operators.

2.1 [ ] Subtask: Recruiting workflow UX
Agent: Windsurf - Claude
Prompt: "Design low-fidelity UX flow for candidate sourcing → outreach → screening → placement."
Why: Recruiting requires a distinct pipeline that must be explicit to execute solo.

2.2 [ ] Subtask: Recruiting-from-scratch launcher UX
Agent: Windsurf - Claude
Prompt: "Design pages to launch a recruiting business from zero: find roles, find candidates, right-to-represent workflow, and company outreach."
Why: This is the main entrypoint for a solo recruiter without a warm network.

2.3 [ ] Subtask: Employer-of-record staffing UX
Agent: Windsurf - Claude
Prompt: "Design UX for staffing where the engineering company employs talent and bills clients (timecards, margin, payroll checkpoints)."
Why: This model changes operational flow and needs UI support.

### Workstream B: Information architecture and navigation
3. [ ] Task: Information architecture + navigation plan
Agent: Windsurf - Claude
Prompt: "Map all existing pages into the proposed IA. Identify any pages that should live under Tools. Provide a final nav structure and rationale."
Why: Strong IA reduces user confusion and highlights primary value paths.

3.1 [ ] Subtask: Rename plan for Upwork Guide → Upwork Proposal Tool
Agent: Windsurf - Claude
Prompt: "Provide exact naming, route changes, and copy changes needed to rebrand Upwork Guide without breaking functionality."
Why: Language should match the intended outcome (proposal creation).

3.2 [ ] Subtask: Marketing vs Recruiting ownership map
Agent: Windsurf - Claude
Prompt: "List which pages belong to Marketing vs Recruiting and why, to avoid overlap."
Why: Prevents duplicate workflows and conflicting mental models.

### Workstream C: Data model and API wiring
4. [ ] Task: Data model audit and gap analysis
Agent: Windsurf - Codex
Prompt: "Audit Prisma models against required product flows. Propose schema additions/changes (leads, opportunities, recruiting pipeline, placements, staffing). Map them to UI pages."
Why: The DB must represent the real workflow before UI wiring can be meaningful.

4.1 [ ] Subtask: Migration plan
Agent: Windsurf - Codex
Prompt: "Draft a migration plan and seed strategy to move from mock UI data to Prisma-backed data."
Why: Minimizes disruption while moving to real data.

4.2 [ ] Subtask: API surface map
Agent: Windsurf - Codex
Prompt: "List required API endpoints for each core flow and map to existing routes where possible."
Why: Ensures backend coverage for all critical UX flows.

5. [ ] Task: CRM pipeline implementation plan
Agent: Windsurf - Codex
Prompt: "Define stages, entities, and status transitions for a solo-friendly CRM pipeline; specify how clients/leads/proposals/contracts link in DB."
Why: Pipeline clarity is the backbone of acquisition and delivery.

5.1 [ ] Subtask: CRM UI wiring plan
Agent: Windsurf - Codex
Prompt: "Identify which CRM pages are mock and what data they should consume."
Why: Avoids wasted UI work and aligns with the real data model.

### Workstream D: Marketing and client acquisition
6. [ ] Task: Lead ingestion + enrichment system plan
Agent: Windsurf - Cascade
Prompt: "Design ingestion for CSV, manual entry, and scraping-assisted inputs. Specify dedupe rules, enrichment fields, and storage model."
Why: Lead quality and cleanliness directly impact outreach success.

6.1 [ ] Subtask: Prospect discovery workflow
Agent: Windsurf - Cascade
Prompt: "Define the end-to-end flow for prospect discovery including data sources, tagging, and export to outreach."
Why: Discovery must be repeatable and fast for a solo operator.

6.2 [ ] Subtask: Compliance notes for ingestion
Agent: Windsurf - Cascade
Prompt: "List provider compliance constraints and how to implement human-in-the-loop safeguards."
Why: Reduces risk of account bans or legal exposure.

7. [ ] Task: Outreach engine plan
Agent: Windsurf - Codex
Prompt: "Design outreach sequencing (email + LinkedIn) with personalization fields, templates, scheduling, and follow-up logic."
Why: Consistent follow‑up is what converts leads for solo operators.

7.1 [ ] Subtask: Template library spec
Agent: Windsurf - Codex
Prompt: "Define default outreach templates for software engineering and recruiting tracks."
Why: Templates reduce friction and improve time-to-send.

8. [ ] Task: Upwork Proposal Tool roadmap
Agent: Windsurf - Codex
Prompt: "Convert Upwork Guide into a proposal tool that supports job capture, extraction, scoring, proposal generation, and submission assistance."
Why: Upwork remains the fastest inbound source for many solo engineers.

8.1 [ ] Subtask: Job capture improvements
Agent: Windsurf - Codex
Prompt: "Define how Playwright/Electron capture flows should work for Upwork and other marketplaces."
Why: Reliable capture is prerequisite for automated proposal workflows.

8.2 [ ] Subtask: Proposal quality rubric
Agent: Windsurf - Codex
Prompt: "Create a rubric to score proposal quality and integrate that into the generation pipeline."
Why: Rubrics help improve win rates over time.

### Workstream E: Recruiting
9. [ ] Task: Recruiting pipeline DB + UI plan
Agent: Windsurf - Cascade
Prompt: "Define recruiting stages, candidate entities, client roles, and placement tracking. Map to recruiting pages."
Why: Recruiting needs its own pipeline with measurable stages.

9.1 [ ] Subtask: Candidate import/sourcing plan
Agent: Windsurf - Cascade
Prompt: "Design sourcing inputs (LinkedIn/GitHub/CSV) and the minimal data required per candidate."
Why: A minimal dataset keeps sourcing fast and focused.

9.2 [ ] Subtask: Outreach + follow-up plan for candidates
Agent: Windsurf - Cascade
Prompt: "Define candidate outreach messaging and follow-up schedule for a solo operator."
Why: Candidate response rates require structured follow‑up.

9.3 [ ] Subtask: Right-to-represent workflow
Agent: Windsurf - Cascade
Prompt: "Define the right-to-represent (RTR) capture, storage, and approval flow, including timestamped consent and client visibility."
Why: RTR is legally and operationally critical in recruiting.

### Workstream F: Communications and scheduling
10. [ ] Task: Email integration plan
Agent: Windsurf - Cascade
Prompt: "Design how to connect Gmail/Outlook/IMAP to the email UI, including syncing threads to CRM/recruiting records."
Why: Centralized communication is required to avoid losing deals.

10.1 [ ] Subtask: Template + sequence sending plan
Agent: Windsurf - Cascade
Prompt: "Define how outreach sequences will send emails, track opens/replies, and log outcomes."
Why: Enables disciplined outreach and measurable conversion.

11. [ ] Task: Calendar integration plan
Agent: Windsurf - Cascade
Prompt: "Map existing Apple/ICS/Outlook API routes to a calendar sync plan and meeting booking flow."
Why: Booking calls quickly is key to closing pipeline.

11.1 [ ] Subtask: Booking links + scheduling rules
Agent: Windsurf - Cascade
Prompt: "Define scheduling rules, buffers, and templates for solo operations."
Why: Protects maker time while keeping availability realistic.

### Workstream G: Insights and analytics
12. [ ] Task: Unified insights model
Agent: Windsurf - Codex
Prompt: "Define the analytics schema for pipeline health, revenue forecasting, and recruiting placement metrics."
Why: Decisions should be driven by actual pipeline signals.

12.1 [ ] Subtask: Dashboard metrics spec
Agent: Windsurf - Codex
Prompt: "List the key dashboard widgets and data sources for Insights."
Why: Ensures dashboards are actionable rather than decorative.

### Workstream H: Automation and agents
13. [ ] Task: Automation job runner design
Agent: Windsurf - Cascade
Prompt: "Design a job runner for Playwright/Electron actions with approvals, rate limits, retries, and logs."
Why: Automation needs controls to be safe and reliable.

13.1 [ ] Subtask: Human-in-the-loop approvals
Agent: Windsurf - Cascade
Prompt: "Specify approval checkpoints for scraping/posting actions and how they surface in UI."
Why: Reduces compliance risk and user anxiety.

13.2 [ ] Subtask: Scraper tool unification plan
Agent: Windsurf - Codex
Prompt: "Define how the new scraper tool becomes the standard ingestion path across Upwork, job boards, and lead sources."
Why: A single ingestion path reduces maintenance and improves data quality.

14. [ ] Task: Agent orchestration integration plan
Agent: Windsurf - Codex
Prompt: "Map existing agent/workflow/ticket systems to the growth use cases. Define required changes to connect AI agents to marketing/recruiting tasks."
Why: Orchestration is already in place and should be leveraged, not duplicated.

### Workstream I: Monetization and release readiness
15. [ ] Task: Monetization strategy + paywall plan
Agent: Windsurf - Claude
Prompt: "Define pricing tiers, core limits, and billing flows. Propose how to gate features in the current app."
Why: Monetization constraints should guide feature prioritization.

15.1 [ ] Subtask: Solo-friendly packaging
Agent: Windsurf - Claude
Prompt: "Specify which features are essential for a solo plan vs. pro plan."
Why: Prevents overbuilding for an advanced tier before PMF.

16. [ ] Task: Auth, accounts, and tenancy plan
Agent: Windsurf - Codex
Prompt: "Define authentication, user accounts, and tenant boundaries suitable for solo operators today and team expansion later."
Why: Required for paid tiers and multi‑user collaboration.

17. [ ] Task: Security, compliance, and data privacy plan
Agent: Windsurf - Claude
Prompt: "List compliance requirements for scraping, email sending, RTR, and data storage. Define safeguards and user agreements."
Why: The product automates sensitive workflows and must be compliant.

18. [ ] Task: QA and release plan
Agent: Windsurf - Codex
Prompt: "Define test strategy (unit, integration, Playwright e2e), release checklist, and rollback strategy."
Why: Releases must be stable to build trust for paid users.

19. [ ] Task: Onboarding + documentation plan
Agent: Windsurf - Claude
Prompt: "Design onboarding steps for a solo operator and the minimal docs that must exist before launch."
Why: Onboarding drives activation and reduces churn.

20. [ ] Task: Deployment + packaging plan
Agent: Windsurf - Codex
Prompt: "Define a plan to ship web + Electron builds, including environment management and database setup."
Why: A reliable ship pipeline is necessary for monetization.

21. [ ] Task: Observability + operational guardrails
Agent: Windsurf - Codex
Prompt: "Define logging, audit trails, rate limits, and alerting needed for scraping/posting and AI actions."
Why: Operational visibility prevents silent failures.

22. [ ] Task: Employer-of-record compliance and finance plan
Agent: Windsurf - Claude
Prompt: "Define the legal, payroll, tax, and insurance requirements for employing engineers and billing clients. Map to product requirements."
Why: This model carries higher compliance and financial risk than placement.

