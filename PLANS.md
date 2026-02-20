# PLANS — "The Body as a Distributed System"

This plan is intentionally split into small, low-risk PR-sized steps (MVP first).

## What exists today (quick scan)
- Minimal static portfolio site with:
  - `index.html` (single-page content)
  - `style.css` (basic styling)

## Proposed minimal structure (static first)

### Routes / pages
- `/` → portfolio homepage (`index.html`)
- `/projects/body-distributed-system.html` → dedicated project page + dashboard MVP scaffold

### Files
- `index.html` — keep existing landing page, add link to the new project page
- `projects/body-distributed-system.html` — project page content + "Bio SRE Console" dashboard placeholder
- `style.css` — shared styles + project/dashboard styles
- `assets/` (future) — icons/images/data snapshots

### Components (HTML sections, no framework)
- Hero (project title, subtitle, status)
- Project Overview
- System Mapping (body ↔ distributed systems analogies)
- Dashboard MVP section
  - Console header
  - KPI cards (static placeholders)
  - Event log panel (sample static rows)
- Next Steps / TODO block

## Step-by-step plan

1. **Step 1 (this PR): Scaffold project page + placeholder dashboard section**
   - Create new project page route.
   - Add dashboard MVP section with static placeholder data.
   - Add TODO list directly on page.
   - Add run instructions for local preview.

2. **Step 2: Static data model + cleaner dashboard cards**
   - Move placeholder metrics/log entries into a small JS/JSON file.
   - Render cards from data rather than hardcoding repeated markup.

3. **Step 3: Interaction MVP**
   - Add simple filters/toggles (e.g., subsystem: cardiovascular/neural/immune).
   - Add basic state indicators and timestamps.

4. **Step 4: Visual polish + narrative quality**
   - Improve typography, spacing, and SRE-console visual identity.
   - Add small inline diagrams/icons.

5. **Step 5: Content hardening**
   - Expand technical write-up and architecture notes.
   - Add citations/references and known limitations.

## Run instructions (local)
- From repo root:
  - `python3 -m http.server 8000`
- Open:
  - `http://localhost:8000/`
  - `http://localhost:8000/projects/body-distributed-system.html`

