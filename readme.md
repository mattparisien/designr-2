# New App (MVP Scope)

A pared‑down creative canvas for quickly producing a single-page branded (or themed) visual with minimal friction. This README classifies what belongs in the **Minimum Viable Product** versus what is **Upcoming / Deferred** (even if some of it already exists in code).

---

## 🎯 Product Goal (MVP)
Enable a user to:
1. Sign in
2. Create a design (single page)
3. Add / edit / move / resize text and simple shapes
4. Apply a basic color palette
5. Export the result (PNG)
6. Optionally generate helper copy via AI (headline / short blurb)

Deliver this with reliability and low cognitive load.

---

## ✅ MVP Feature Set

### Core Domain
- Single entity: `Project` (no separate Template/Brand management in UI)
- One page per project (multi-page deferred)
- Elements:
  - Text element (content, position, width, dynamic height, font size, basic bold toggle)
  - Shape element (simple rectangle block with fill)
- Selection + drag + resize (horizontal for text; free for shape)

### Styling & Color
- Project-level palette (array of hex colors; up to 5)
- Manual color assignment to selected element (fill for shapes, text color for text)
- Simple palette picker (preset swatches or native color input)

### Persistence
- CRUD: Create / List / Load / Update Project
- Autosave or explicit save (choose one—keep logic simple)
- Basic Mongo (or pluggable simple store) backing

### Export
- Export current canvas as PNG (client-side canvas capture acceptable)

### AI (Single Narrow Assist)
- Generate headline / tagline (one endpoint, no tool orchestration)
- Safe, non-diagnostic language (if reused later for wellbeing context)

### UX / UI
- Dashboard (list projects + “New Project” button)
- Editor layout:
  - Top bar: Project title (editable), Export button
  - Left (optional) or inline floating mini toolbar: Add Text, Add Shape
  - Right minimal panel OR popover: color picker, font size input
- Keyboard: basic delete selected element
- Continuous animated gradient heading (optional flourish—can be removed if distracting)

### Tech / Architecture
- Frontend: Next.js + Tailwind (trim custom tokens to essentials)
- State: A single lightweight store (Zustand) for editor (elements, selection, palette)
- Backend: Express + Mongoose (Projects + Auth)
- Auth: Email/password (or magic link) – minimal session/JWT
- No queues, no background workers
- No external font loading (use system fonts list: Inter/Arial)

### Quality / Ops
- Basic error toasts
- TypeScript strict enough to avoid `any` in core editor logic
- ESLint / Prettier baseline
- Minimal logging (server + client console warnings)

---

## 🔜 Upcoming / Deferred Features

These may already exist partially in the codebase but are **not required for MVP** and should be disabled / hidden until post-launch.

### Canvas / Elements
- Additional element types: images, lines, triangles, circles, complex shapes
- Layer / z-index management UI
- Rotation, opacity sliders, blending modes
- Grouping, multi-select, alignment guides, smart snapping (advanced)
- Rich text (multiple styles inside one block)
- Letter spacing, line height, underline, strikethrough, italics (beyond bold)
- Auto-fit heuristics & complex width recalculation
- Overlap-aware recoloring + graph-based palette remapping
- Gradient fills & advanced color picker (HSV panels, hue sliders, eyedropper)

### Multi-Entity & Libraries
- Templates library (CRUD)
- Brands model (logos, multi-palettes, guidelines)
- Asset library (images, icons, uploads)
- Font management & custom font uploads

### Multi-Page / Documents
- Multiple pages per project
- Page duplication, reordering, page thumbnails

### Advanced AI / Agents
- Tool orchestration (create_project, transform pages, recolor, etc.)
- Prompt chaining, semantic search, multi-mode suggestions
- Copy rewriting / variation generation
- Intelligent layout or auto-design

### Collaboration & Sharing
- Real-time multi-user editing (WebSockets)
- Commenting / annotations
- Share links (view-only), public gallery
- Role-based permissions (owner, editor, viewer)

### Theming & Branding
- Dynamic theme tokens, container queries
- Animated / mood-based palette generation
- Accessible contrast auto-adjust

### Export / Output
- PDF export, multi-page PDF
- SVG export
- Social size presets & auto-resize

### Performance / Infra
- Server-side rendering of thumbnails
- Image optimization pipeline
- Caching (Redis), background job workers
- Rate limiting & abuse detection

### Analytics & Growth
- In-app telemetry, funnel metrics
- Onboarding tours, template recommendations
- A/B testing

### Wellbeing / Mental Health Expansion (Future Track)
- Guided journaling templates
- Mood tracking elements
- Reflection prompts AI
- Crisis keyword detection & resource surfacing
- Encrypted local-only mode

### Security / Compliance
- Audit logs
- Data export & deletion self-service
- Region-based data residency
- HIPAA / GDPR compliance extensions

---

## 🗂 Suggested Folder Structure (Trimmed for MVP)
```
/backend
  /src
    /models/Project.ts
    /routes/projects.ts
    /routes/auth.ts
    /lib/db.ts
/frontend
  /src
    /app
      /dashboard
      /editor/[id]
    /components (Heading, Canvas, ElementControls, Toolbar, ColorPicker)
    /lib/store (editorStore, projectsAPI)
    /types (project, element)
```

---

## 🚀 Quick Start (MVP)

### Backend
```
pnpm install
pnpm dev   # or npm/yarn
```
Environment:
```
MONGO_URI=...
JWT_SECRET=...
PORT=5001
```

### Frontend
```
pnpm install
pnpm dev
```
Environment:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## 🧪 Manual Test Checklist (MVP)
- Create project → appears in dashboard
- Open project → add text → edit content → change font size → resize width → export PNG
- Add shape → recolor → save → reload -> state persists
- Generate AI headline (optional) → insert into selected text element

---

## 🧭 Post-MVP Prioritization Hint
After validating core usage:
1. Add image element + upload
2. Introduce 3–5 curated templates
3. Add multi-page if strong retention / storytelling need
4. Expand AI (copy variants) only if users struggle with ideation

---

## 🛑 What NOT To Do Before MVP
- Don’t polish complex recolor logic
- Don’t ship brand + template dashboards simultaneously
- Don’t over-invest in animation or micro-interactions
- Don’t add every formatting control—scope creep kills velocity

---

## 📌 Guiding Principle
Ship the smallest coherent loop: “Create → Edit → Export → Return & Continue”. Every extra feature must defend its impact on that loop.

---

## 🗣 Feedback Loop
Instrument (lightweight):
- Count: created projects, edited elements, exports per user
- Time to first export
- Drop-off before edit

Use this to pick the first post-MVP enhancement grounded in actual friction.

---

## 🪄 Upgrade Path (Example)
MVP Palette → Themed Palette Packs → AI Mood-Based Palette → Brand Systems

---

## ⚖️ License / Attribution
(Choose license: MIT / UNLICENSED)

---

## 🙋 Support
Open a GitHub issue or contact the maintainer.

---
Happy shipping.