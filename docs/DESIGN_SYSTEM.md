# Digital Clan Books — Design System Reference

**Version:** 1.0  
**Stack:** React 19 · Vite · Tailwind CSS v4 · PWA  
**Mode:** Dark-first (light mode optional in v2)

This document is the single source of truth for UI decisions across **Reader**, **Admin CMS**, and **Subscription** surfaces.

---

## 1. Brand & positioning

| Attribute | Definition |
|-----------|------------|
| **Product** | Premium B2B eBook platform with paywall, offline reading, and author tooling |
| **Audience** | Publishers, authors, and professional readers |
| **Tone** | Confident, refined, trustworthy — not playful or consumer-bookstore casual |
| **Visual metaphor** | A private reading lounge meets a modern SaaS control panel |

**Tagline (internal):** *Read without limits. Publish with control.*

---

## 2. Design principles

1. **Dark-first clarity** — Reduce eye strain for long reading sessions; use contrast deliberately, not maximum white-on-black.
2. **Glass, not gimmick** — Glassmorphism only on chrome (headers, modals, cards). Reading content stays on solid, low-distraction surfaces.
3. **Hierarchy through space** — Prefer whitespace and type scale over heavy borders and boxes.
4. **One accent, many neutrals** — Indigo is the only strong brand hue; everything else is slate.
5. **States are explicit** — Loading, paywall (402), offline, and errors each have a distinct, consistent treatment.
6. **Touch-friendly PWA** — Minimum 44×44px tap targets; reader UI optimized for mobile offline.

---

## 3. Color system

### 3.1 Core palette (CSS variables)

```css
/* Brand */
--color-brand-50:  #eef2ff;
--color-brand-100: #e0e7ff;
--color-brand-400: #818cf8;
--color-brand-500: #6366f1;   /* Primary actions */
--color-brand-600: #4f46e5;   /* Primary hover */
--color-brand-700: #4338ca;

/* Neutrals (slate) */
--color-surface-950: #020617;  /* App background deepest */
--color-surface-900: #0f172a;  /* Page background */
--color-surface-800: #1e293b;  /* Elevated panels */
--color-surface-700: #334155;  /* Borders strong */
--color-surface-600: #475569;  /* Muted borders */
--color-surface-400: #94a3b8;  /* Secondary text */
--color-surface-200: #e2e8f0;  /* Primary text on dark */
--color-surface-100: #f1f5f9;  /* Headings emphasis */

/* Semantic */
--color-success-500: #10b981;
--color-success-900: #064e3b;
--color-warning-500: #f59e0b;
--color-warning-900: #78350f;
--color-error-500:   #ef4444;
--color-error-900:   #7f1d1d;
--color-info-500:    #3b82f6;

/* Paywall / monetization */
--color-paywall-500: #f59e0b;  /* Amber — upgrade CTA */
--color-paywall-glow: rgba(245, 158, 11, 0.15);

/* Glass */
--glass-bg:        rgba(15, 23, 42, 0.55);
--glass-border:    rgba(255, 255, 255, 0.08);
--glass-highlight: rgba(255, 255, 255, 0.04);
```

### 3.2 Semantic token map

| Token | Usage |
|-------|--------|
| `bg-app` | `--color-surface-950` → full-page gradient base |
| `bg-panel` | `--color-surface-900` → cards, sidebars |
| `bg-elevated` | `glass-bg` + `backdrop-blur-xl` → headers, modals |
| `text-primary` | `--color-surface-100` |
| `text-secondary` | `--color-surface-400` |
| `text-brand` | `--color-brand-400` |
| `border-subtle` | `--glass-border` |
| `border-focus` | `--color-brand-500` at 50% opacity |

### 3.3 Gradients

```css
/* App shell (Admin + Marketing) */
--gradient-app: linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e1b4b 100%);

/* Primary CTA */
--gradient-cta: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);

/* Reader immersive mode (optional) */
--gradient-reader: linear-gradient(180deg, #0f172a 0%, #020617 100%);
```

### 3.4 Tailwind v4 theme extension (`src/styles/theme.css`)

```css
@theme {
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --color-surface-950: #020617;
  --color-surface-900: #0f172a;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Plus Jakarta Sans", var(--font-sans);
  --font-serif: "Literata", Georgia, serif;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-2xl: 1.5rem;
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.35);
}
```

---

## 4. Typography

### 4.1 Font stack

| Role | Family | Weight | Use |
|------|--------|--------|-----|
| **Display** | Plus Jakarta Sans | 600–700 | Page titles, marketing hero |
| **UI / Body** | Inter | 400–600 | Forms, nav, metadata |
| **Reader** | Literata | 400 | eBook page content (serif for long-form) |
| **Mono** | JetBrains Mono | 400 | Code, IDs, debug (admin only) |

**Google Fonts import (index.html or CSS):**
```
Plus Jakarta Sans: 600, 700
Inter: 400, 500, 600
Literata: 400, 500
```

### 4.2 Type scale

| Name | Size | Line height | Weight | Example |
|------|------|-------------|--------|---------|
| `display-xl` | 2.25rem / 36px | 1.2 | 700 | Marketing hero |
| `display-lg` | 1.875rem / 30px | 1.25 | 700 | Page title |
| `heading-md` | 1.125rem / 18px | 1.4 | 600 | Section headers |
| `body-md` | 0.875rem / 14px | 1.5 | 400 | Form labels, UI |
| `body-sm` | 0.8125rem / 13px | 1.5 | 400 | Hints, captions |
| `label-xs` | 0.6875rem / 11px | 1.4 | 600 | Uppercase labels, badges |
| `reader-base` | 1.0625rem / 17px | 1.75 | 400 | Book page text |
| `reader-lg` | 1.1875rem / 19px | 1.8 | 400 | Accessibility reading mode |

### 4.3 Label pattern (Admin)

```text
DIGITAL CLAN LTD     ← label-xs, uppercase, tracking-widest, text-brand-400
Content Management   ← display-lg, text-primary
```

---

## 5. Spacing & layout

### 5.1 Spacing scale (4px base)

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Icon gaps |
| `space-2` | 8px | Tight inline |
| `space-3` | 12px | Form field padding |
| `space-4` | 16px | Card padding mobile |
| `space-6` | 24px | Card padding desktop |
| `space-8` | 32px | Section gaps |
| `space-12` | 48px | Page vertical rhythm |

### 5.2 Layout widths

| Container | Max width | Surfaces |
|-----------|-----------|----------|
| `container-reader` | 680px | Single-column reading |
| `container-app` | 768px | Auth, paywall modal |
| `container-admin` | 1152px (`max-w-6xl`) | CMS two-column |
| `container-store` | 1280px (`max-w-7xl`) | Book grid storefront |

### 5.3 Grid patterns

**Admin CMS (current):**
```
┌─────────────────────────────────────────────┐
│ Header (glass, sticky)                       │
├──────────────────┬──────────────────────────┤
│ Metadata column  │ Assets column            │
│ (form fields)    │ (dropzones + CTA)        │
└──────────────────┴──────────────────────────┘
```

**Storefront (proposed):**
```
┌─────────────────────────────────────────────┐
│ Nav + search                                 │
├────────┬────────┬────────┬────────────────┤
│ Book   │ Book   │ Book   │ Book           │
│ card   │ card   │ card   │ card           │
└────────┴────────┴────────┴────────────────┘
```

**Reader (proposed):**
```
┌─────────────────────────────────────────────┐
│ Minimal top bar (title, progress, offline)   │
├─────────────────────────────────────────────┤
│                                              │
│         Serif content column                 │
│                                              │
├─────────────────────────────────────────────┤
│ Page nav + bookmark                          │
└─────────────────────────────────────────────┘
```

---

## 6. Elevation, glass & borders

### 6.1 Glass panel (signature component)

```html
<!-- Reference classes -->
<div class="
  rounded-2xl
  border border-white/10
  bg-white/5
  backdrop-blur-xl
  shadow-2xl
">
```

| Property | Value |
|----------|--------|
| Background | `bg-white/5` or `rgba(15,23,42,0.55)` |
| Blur | `backdrop-blur-xl` (24px) |
| Border | `1px solid rgba(255,255,255,0.08)` |
| Radius | `rounded-2xl` (16px) for panels; `rounded-xl` (12px) for inputs |
| Shadow | `shadow-2xl` with low spread |

### 6.2 Solid panel (reader content)

No blur. `bg-surface-900` with `border-subtle` — keeps reading distraction-free.

### 6.3 Border hierarchy

| Level | Class | Use |
|-------|-------|-----|
| Subtle | `border-white/10` | Cards, inputs |
| Strong | `border-white/20` | Focused inputs |
| Accent | `border-brand-500/40` | Active nav item |
| Paywall | `border-amber-500/50` | Upgrade modal |
| Error | `border-red-500/50` | Validation |

---

## 7. Component specifications

### 7.1 Button

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| **Primary** | `gradient-cta` | white | none |
| **Secondary** | `bg-white/5` | `text-surface-200` | `border-white/10` |
| **Ghost** | transparent | `text-brand-400` | none |
| **Danger** | `bg-red-600/20` | `text-red-300` | `border-red-500/30` |
| **Paywall** | `bg-amber-600` | white | none |

**Sizes:** `sm` (py-1.5 px-3 text-sm) · `md` (py-2.5 px-4) · `lg` (py-3.5 px-6)

**States:** `disabled:opacity-60 disabled:cursor-not-allowed` · loading = spinner + label change

**Focus:** `focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900`

### 7.2 Input / Textarea / Select

```html
<input class="
  w-full rounded-xl
  border border-white/10
  bg-surface-900/60
  px-4 py-2.5 text-sm text-surface-100
  placeholder:text-surface-600
  outline-none
  focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/25
" />
```

| State | Treatment |
|-------|-----------|
| Default | `border-white/10` |
| Focus | Brand ring |
| Error | `border-red-500/50` + error text below in `text-red-400 text-xs` |
| Disabled | `opacity-50 cursor-not-allowed` |

### 7.3 Toggle (publish switch)

- Track: `h-7 w-12 rounded-full`
- Off: `bg-surface-600` · On: `bg-brand-500`
- Thumb: `h-6 w-6 bg-white shadow` · translate-x-5 when on
- `role="switch"` + `aria-checked`

### 7.4 Card — Book (storefront)

```
┌─────────────────────┐
│  Cover (3:4 ratio)  │
│  gradient overlay   │
├─────────────────────┤
│ Title (2 lines max) │
│ Author · Genre      │
│ ★ Free: 5 pages     │
└─────────────────────┘
```

- Cover: `aspect-[3/4] object-cover rounded-lg`
- Hover: `scale-[1.02] transition-transform` + subtle glow `shadow-brand-500/10`
- Offline badge: top-right pill `bg-surface-900/80`

### 7.5 File dropzone (existing — canonical)

- Min height: `180px`
- Idle: `border-dashed border-surface-600/80 bg-surface-900/40`
- Dragging: `border-brand-400 bg-brand-500/10`
- Icon circle: `h-12 w-12 bg-brand-500/20 text-brand-300`

### 7.6 Toast (existing — canonical)

| Type | Border | Background |
|------|--------|------------|
| success | `emerald-500/50` | `emerald-950/80` |
| error | `red-500/50` | `red-950/80` |
| info | `indigo-500/50` | `indigo-950/80` |

Position: `fixed top-4 right-4` · auto-dismiss 5s · `backdrop-blur-md`

### 7.7 Modal — Paywall (402)

```
┌──────────────────────────────────────┐
│  🔒  Continue Reading                │
│  You've reached the free preview.    │
│                                      │
│  [ PayPal Subscribe ]  (primary)     │
│  [ Maybe later ]       (ghost)       │
└──────────────────────────────────────┘
```

- Overlay: `bg-black/60 backdrop-blur-sm`
- Panel: glass + `border-amber-500/50`
- Title: `text-amber-400 font-bold`

### 7.8 Navigation

**Admin header:**
- Sticky, glass, `border-b border-white/10`
- Left: label + title · Right: actions (Sign out, Reader App)

**Reader nav (proposed):**
- Bottom tab bar on mobile: Library · Reading · Account
- Top bar on desktop: logo, search, profile

### 7.9 Badge / Pill

```html
<span class="rounded-full px-2.5 py-0.5 text-label-xs font-semibold
             bg-brand-500/15 text-brand-400 border border-brand-500/25">
  Published
</span>
```

Variants: `published` (brand) · `draft` (slate) · `offline` (emerald) · `subscriber` (violet)

### 7.10 Skeleton / Loading

- Pulse: `animate-pulse bg-surface-700/50 rounded-lg`
- Spinner: indigo arc on transparent circle (already in Admin submit)
- Full-page: centered spinner + `text-secondary` message

---

## 8. Iconography

**Library:** [Lucide React](https://lucide.dev) (consistent stroke, 1.5px)

| Concept | Icon |
|---------|------|
| Book / Library | `BookOpen` |
| Upload | `Upload` |
| Offline | `Download` |
| Paywall | `Lock` |
| Admin | `LayoutDashboard` |
| Settings | `Settings` |
| Bookmark | `Bookmark` |

**Sizes:** `16` inline · `20` buttons · `24` section · `32` empty states

---

## 9. Motion

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Hover color/bg | 150ms | `ease-out` |
| Modal enter | 200ms | `ease-out` (fade + scale 0.98→1) |
| Toast enter | 250ms | slide from right |
| Page turn (reader) | 300ms | `ease-in-out` |
| Toggle thumb | 200ms | `transition-transform` |

**Reduce motion:** respect `prefers-reduced-motion: reduce` — disable transforms, keep opacity fades only.

---

## 10. Surface-specific guidelines

### 10.1 Reader app (`/`)

- **Goal:** Immersion, legibility, offline confidence
- **Background:** solid `surface-900`, no gradient behind text
- **Typography:** Literata for content; Inter for chrome
- **Chrome:** minimal — progress bar `bg-brand-500` on `surface-700` track
- **Paywall:** amber modal, never block free pages without clear page count

### 10.2 Admin CMS (`/admin`)

- **Goal:** Efficiency, confidence, premium SaaS feel
- **Background:** `gradient-app`
- **Layout:** two-column ≥ `lg` breakpoint; single column stacked on mobile
- **Density:** comfortable — not cramped tables; forms breathe with `space-4`

### 10.3 Auth screens

- Centered single card, `max-w-md`
- No split marketing panel in v1 (add later)
- Clear error under form, never alert()

### 10.4 Storefront (future `/browse`)

- Grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6`
- Filter chips horizontal scroll on mobile
- Cover-forward design — text secondary to artwork

---

## 11. Accessibility

| Requirement | Standard |
|-------------|----------|
| Color contrast (UI text) | WCAG AA — 4.5:1 minimum |
| Color contrast (large headings) | 3:1 minimum |
| Focus indicators | Visible on all interactive elements |
| Tap targets | ≥ 44×44px |
| Form labels | Always associated; no placeholder-only labels |
| Errors | `aria-invalid` + `aria-describedby` on inputs |
| Modals | Focus trap, `Escape` to close, `role="dialog"` |
| Reader font scaling | Support 100%–150% user preference |

---

## 12. Responsive breakpoints

| Name | Min width | Tailwind |
|------|-----------|----------|
| Mobile | 0 | default |
| Tablet | 640px | `sm:` |
| Desktop | 1024px | `lg:` |
| Wide | 1280px | `xl:` |

**PWA safe areas:** `padding-bottom: env(safe-area-inset-bottom)` on bottom nav.

---

## 13. Recommended file structure

```text
frontend/src/
├── styles/
│   ├── theme.css          # @theme tokens (Tailwind v4)
│   ├── globals.css        # imports, base body, fonts
│   └── utilities.css      # glass-panel, gradient-app helpers
├── components/
│   ├── ui/                # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Toggle.tsx
│   │   └── Spinner.tsx
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── AdminHeader.tsx
│   │   └── ReaderChrome.tsx
│   ├── FileDropzone.tsx   # (move from root when refactoring)
│   └── Toast.tsx
├── pages/
├── lib/
└── hooks/
    └── useToast.ts
```

---

## 14. Implementation priority

| Order | Task | Status |
|-------|------|--------|
| 1 | Add `theme.css` + Google Fonts | Done |
| 2 | Build `ui/Button`, `Input`, `Card`, `Badge`, `Modal`, `Toggle`, `Spinner` | Done |
| 3 | Refactor `AdminDashboard` to use primitives | Done |
| 4 | Unify `HomePage` with same tokens | Done |
| 5 | Reader layout + Literata content column | Partial (`text-reader` on preview) |
| 6 | Storefront book grid + cards | Pending |
| 7 | Paywall modal component (shared) | Done (`PaywallModal`) |
| 8 | Storybook or Ladle (optional) | Pending |

---

## 15. Quick reference — copy-paste classes

```text
/* App shell */
min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100

/* Glass card */
rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md

/* Primary button */
rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 hover:from-indigo-500 hover:to-violet-500

/* Input */
w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50

/* Secondary text */
text-sm text-slate-400

/* Brand label */
text-xs font-semibold uppercase tracking-widest text-indigo-400
```

---

## 16. What to avoid

- Light gray text on mid-gray backgrounds (fails contrast)
- Glass on every nested element (visual noise)
- Multiple accent colors (violet + cyan + green competing)
- Rounded-full on large panels (use `rounded-2xl`)
- Consumer-bookstore clichés (wood textures, sepia everywhere)
- Hard-coded hex in components — always use theme tokens

---

*This document should be updated when new surfaces ship (storefront, reader, checkout). Component implementations in `src/components/ui/` should mirror section 7.*
