# Learning Site – Style Guide

A fun, bubbly, kid-friendly design system for all pages in this project.

---

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Fun First** | Every element should feel playful and inviting. Bright colours, rounded shapes, and bouncy motion. |
| **Simple & Clear** | Kids are the audience. Short labels, large tap targets, readable fonts, and obvious hierarchy. |
| **Safe & Friendly** | No sharp corners, no harsh contrasts, no aggressive animations. Warm pastels and soft gradients. |
| **Consistent** | Reuse the same tokens, patterns, and component styles across every new page. |

---

## 2. Colour Palette

All values are defined as CSS custom properties in `style.css`.

### Primary

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#6C5CE7` | Buttons, links, active states, hero gradient start |
| `--color-primary-light` | `#A29BFE` | Hover states, card borders, hero gradient mid |
| `--color-primary-dark` | `#5A4BD1` | Pressed states, emphasis |

### Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent-pink` | `#FD79A8` | Card titles, highlights, hero gradient end |
| `--color-accent-yellow` | `#FDCB6E` | Call-to-action accents, warm highlights |
| `--color-accent-green` | `#00CEC9` | Success states, interactive feedback |
| `--color-accent-orange` | `#E17055` | Warnings, energetic pops |
| `--color-accent-blue` | `#74B9FF` | Info badges, cool highlights |

### Derived accent shades

Darkened variants of the accent colours, used whenever an accent fill needs
white/dark text at 4.5:1 contrast (button hovers, filled speak/listen/define
controls, the Continue button).

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent-pink-dark` | `#D6407E` | `.btn--pink` hover, `.speak-button` hover/active, `.fitb-hint-btn--listen` active |
| `--color-accent-green-dark` | `#00B3AE` | `.btn--green` hover, `.fitb-continue-btn` hover |
| `--color-accent-yellow-dark` | `#E0A83E` | `.btn--yellow` hover |
| `--color-accent-blue-dark` | `#1C72C4` | `.fitb-hint-btn--define` text/active |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#F8F9FF` | Page background (very light lavender) |
| `--color-surface` | `#FFFFFF` | Card and modal backgrounds |
| `--color-text` | `#2D3436` | Body text |
| `--color-text-muted` | `#636E72` | Secondary / description text |
| `--color-border` | `#DFE6E9` | Subtle borders and dividers |

### Gradients

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-hero` | `135deg, #A29BFE → #FD79A8 → #FDCB6E` | Opaque hero gradient (solid backgrounds) |
| `--gradient-hero-glass` | `135deg, rgba(162,155,254,0.88) → rgba(253,121,168,0.86) → rgba(253,203,110,0.88)` | Semi-transparent variant used by the sticky `.hero` so `backdrop-filter` frosted-glass shows content behind it |
| `--gradient-card` | `160deg, #ffffff → #f0ecff` | Card surface background |

> **Rule of thumb:** Use at most 2–3 colours per component. Let whitespace do the talking.

---

## 3. Typography

| Property | Value |
|----------|-------|
| **Heading font** | `Fredoka` (Google Fonts) – rounded, playful |
| **Body font** | `Nunito` (Google Fonts) – clean, friendly, highly legible |
| **Fallback stack** | `'Segoe UI', system-ui, sans-serif` |

### Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero title | `clamp(2rem, 5vw, 3.25rem)` | 700 | Page main heading |
| Hero subtitle | `clamp(1rem, 2.5vw, 1.25rem)` | 600 | Page tagline |
| Card title | `1.3rem` | 600 | Exercise card heading |
| Body | `0.95–1rem` | 400 | Descriptions, paragraphs |

> **Rule of thumb:** Headings use `--font-heading`, body text uses `--font-body`. Never go below `0.85rem` for readability.

---

## 4. Spacing & Layout

An 8 px base grid via CSS custom properties:

| Token | Value |
|-------|-------|
| `--space-xs` | `0.25rem` (4 px) |
| `--space-sm` | `0.5rem` (8 px) |
| `--space-md` | `1rem` (16 px) |
| `--space-lg` | `1.5rem` (24 px) |
| `--space-xl` | `2rem` (32 px) |
| `--space-2xl` | `3rem` (48 px) |
| `--space-3xl` | `4rem` (64 px) |

### Grid

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-xl);
}
```

- Cards auto-flow into columns, minimum 280 px wide.
- **3 columns** at desktop (≥ 961 px)
- **2 columns** at tablet (641–960 px)
- **1 column** at mobile (≤ 640 px)

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.5rem` | Small elements (input fields, badges) |
| `--radius-md` | `1rem` | Medium elements (modals, dropdowns) |
| `--radius-lg` | `1.5rem` | Large elements (cards, hero section) |
| `--radius-full` | `50%` | Circles (avatars, bubbles, decorative dots) |

> **Rule of thumb:** Everything gets rounded corners. No sharp edges anywhere.

---

## 6. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.06)` | Subtle depth (input focus) |
| `--shadow-md` | `0 4px 12px rgba(108,92,231,0.12)` | Card default state |
| `--shadow-lg` | `0 8px 24px rgba(108,92,231,0.18)` | Elevated elements |
| `--shadow-pop` | `0 12px 32px rgba(253,121,168,0.22)` | Hover / active states |

Use tinted shadows (purple/pink) instead of plain grey for a more colourful feel.

---

## 7. Motion & Animation

| Token / Rule | Value |
|--------------|-------|
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `--transition-base` | `0.3s var(--ease-bounce)` |

### Patterns

- **Card hover:** `translateY(-6px) scale(1.02)` + `shadow-pop` + border colour change
- **Card press:** `translateY(-2px) scale(0.99)`
- **Image zoom on card hover:** `scale(1.08)` inside overflow hidden wrapper
- **Hero bubbles:** gentle `translateY` float animation, staggered delays
- **Page load:** cards fade in and slide up with staggered timing (see `script.js`)

> **Rule of thumb:** Keep animations under 500 ms. Use bounce easing for playful motion. Never animate in a way that could cause discomfort.

---

## 8. Components

### 8.1 Exercise Card

```
.exercise-card
├── .card-image-wrapper     (aspect-ratio: 16/10, overflow hidden)
│   └── .card-image         (object-fit: cover, hover zoom)
└── .card-body              (padding: var(--space-lg))
    ├── .card-title         (font-heading, color: accent per card)
    └── .card-description   (font-body, muted color)
```

- Background: `--gradient-card`
- Border: `2px solid --color-border`
- Border radius: `--radius-lg`
- Card title colours cycle via `:nth-child(6n+N)` selectors
- The image wrapper has no background: the `object-fit: cover` card image
  fills the 16:10 area completely, so any tint behind it is never visible.

### 8.2 Hero Header

Use the `learning-header` custom element on every page. Set its content with
the `title` and `subtitle` attributes:

| Token | Value | Usage |
|-------|-------|-------|
| `--header-inset` | `clamp(0.75rem, 2vw, 1.5rem)` | Horizontal inset for the hero breakout layout (keeps the header aligned with the page content on all screen sizes) |

```html
<learning-header
  title="Learning Exercises"
  subtitle="Pick a fun activity and start learning!"
></learning-header>
```

The component lives in `components/learning-header.js` and includes the
collapsible interaction, keyboard controls, decorative bubbles, and a
transition lock/hysteresis guard so scroll-based state changes do not visibly
oscillate while the hero is animating.

#### Collapse modes

`learning-header` supports two built-in modes:

- `collapsible` (default) - the original interactive header. It expands near the
  top of the page, collapses after scrolling, and can be toggled with click or
  keyboard.
- `collapsed-only` - a non-interactive compact header for pages where the title
  is only context and the task itself should stay front-and-center.

Use the `collapse-mode` attribute to select the mode explicitly:

```html
<learning-header
  title="Common Words"
  subtitle="Listen carefully, then write each word on your paper!"
  collapse-mode="collapsed-only"
></learning-header>
```

When `collapse-mode="collapsed-only"` is present:

- The header renders collapsed on load and never expands.
- The scroll listener, click toggle, and keyboard toggle are not bound.
- The `.hero` element loses its `role="button"`, `tabindex`, and `aria-label`
  attributes — it is decorative, not interactive — and `cursor: default`
  replaces the pointer cursor.

Changing the mode back to `collapsible` at runtime re-binds the interactions and
restores the normal expand/collapse behaviour.

For backward compatibility, the older boolean `permanently-collapsed` attribute
is still accepted and maps to `collapse-mode="collapsed-only"`, but new pages
should use `collapse-mode`.

```
.hero
├── .hero-bubbles           (absolute positioned decorative circles)
│   └── .bubble             (animated float, various sizes)
├── .hero-title             (large, bold, white)
└── .hero-subtitle          (medium, white, 92% opacity)
```

- Background: `--gradient-hero-glass` (the semi-transparent variant of `--gradient-hero`, so the `backdrop-filter` frosted glass shows the page content behind the sticky header)
- Bottom rounded corners: `radius-lg`

### 8.3 Buttons (for future pages)

```css
.btn {
  font-family: var(--font-heading);
  font-weight: 600;
  padding: var(--space-sm) var(--space-lg);
  border-radius: 999px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.btn:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: var(--shadow-pop);
  background: var(--color-primary-dark);
}
```

Use `.btn--pink`, `.btn--green`, `.btn--yellow` modifier classes for accent variations. They keep the `.btn` pill shape and the base hover lift/shadow; each modifier only swaps the fill colour.

| Modifier | Default fill | Hover / focus fill |
|----------|--------------|--------------------|
| `.btn--pink` | `var(--color-accent-pink)` | `var(--color-accent-pink-dark)` |
| `.btn--green` | `var(--color-accent-green)` | `var(--color-accent-green-dark)` |
| `.btn--yellow` | `var(--color-accent-yellow)` with `var(--color-text)` text | `var(--color-accent-yellow-dark)` (dark text kept — white fails contrast on yellow) |

The hover shades are the derived `--color-accent-*-dark` tokens from §2, which exist so every accent-coloured control shares the same darkened hover treatment instead of hardcoding hex values.

### 8.4 Shared Dialog

Use the native `<dialog>` element with the reusable `.app-dialog` shell on any page that needs a modal.

| Property | Value |
|----------|-------|
| Base class | `.app-dialog` |
| Width | `min(90vw, 32rem)` |
| Max height | `calc(100vh - 2rem)` |
| Background | `var(--color-surface)` |
| Border | `2px solid var(--color-primary-light)` |
| Border radius | `var(--radius-md)` |
| Padding | `var(--space-xl)` |
| Box shadow | `var(--shadow-lg)` |
| Backdrop | `rgba(45, 52, 54, 0.45)` via `::backdrop` |

Use `.dialog-close` for the shared close button in the top-right corner.

### 8.5 Confetti (Shared Component)

A single, dependency-free celebration effect used by **every** page that wants a confetti burst — currently the Common Words score dialog and every Fill-in-the-Blanks page. There is exactly one implementation; pages must not fork their own.

| Property | Value |
|----------|-------|
| File | `components/confetti.js` |
| Global | `Confetti` (plain script global, same pattern as `FITB` — no bundler/module system) |
| API | `Confetti.launch(containerEl, options?)`, `Confetti.stop()` |
| Loading | Include `<script src=".../components/confetti.js" defer></script>` **before** any script that calls it (`fitb.js`, `common-words.js`) |
| Styling | Applied entirely inline by the module (position, inset, z-index, pointer-events) — no matching CSS file to include or keep in sync |

**`Confetti.launch(containerEl, options)`**

- `containerEl` — any element with a defined size (game wrapper, `<dialog>`, card). Becomes the canvas's positioning context; switched to `position: relative` automatically if it's currently `static`.
- `options` (all optional, merged over defaults):

| Option | Default | Meaning |
|--------|---------|---------|
| `colors` | `['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#00CEC9', '#E17055', '#74B9FF']` | Full brand palette — every accent gets used, not just green |
| `durationMs` | `3000` | Fall + fade duration |
| `particleCount` | `120` | Piece count |
| `originY` | `0.72` | Fraction down the container the burst originates from |
| `inset` | `'-15% -10%'` | Canvas `inset` — negative values bleed past the container's own edges for a bigger-feeling burst |
| `zIndex` | `2` | Stacking order relative to the container's other children — should sit **above** opaque content, not behind it |

Calling `launch()` while a burst is already running stops the previous one first. `Confetti.stop()` cancels the animation and removes the canvas immediately (call this on cleanup — e.g. before closing a dialog, or when a new round starts).

> **Rule of thumb:** don't pass custom `colors`/`durationMs`/`particleCount` per page just for variety's sake — the whole point is that a confetti burst looks and feels identical everywhere in the app. Only override `originY`/`inset` if a container's shape genuinely requires it.

---

## 9. Sound Files

All audio lives under `static/sounds/`. These are shared across the project — not specific to any single exercise.

| Sound | Path | Used by |
|-------|------|---------|
| Correct answer | `static/sounds/correct.ogg` | Common Words, Fill-in-the-Blanks |
| Incorrect answer | `static/sounds/incorrect.ogg` | Common Words, Fill-in-the-Blanks |
| Applause | `static/sounds/applause.ogg` | Common Words (score dialog) |
| Success | `static/sounds/success.ogg` | Common Words (score dialog) |
| Word TTS | `static/sounds/<slug>-tts/<word>.mp3` | Fill-in-the-Blanks (see §14.14) |

---

## 10. Image Conventions

| Rule | Detail |
|------|--------|
| **Format** | SVG preferred (scales cleanly). PNG/JPG fallback acceptable. |
| **Directory** | All card images go in `static/images/card-img/` |
| **Naming** | `kebab-case.svg` matching the exercise slug |
| **Aspect ratio** | Display at 16:10 via `aspect-ratio` CSS property |
| **Background** | None — the `object-fit: cover` image fills the 16:10 wrapper completely, so there is no tint behind it |

### UI icons

Monochrome SVG icons for button controls. They use CSS `mask-image` + `currentColor`, so they inherit the button’s text colour and stay readable on both light and dark button fills without separate assets.

| Rule | Detail |
|------|--------|
| **Directory** | `static/images/icons/` |
| **Format** | SVG, single-colour (black fill or stroke in the source file) |
| **Naming** | `kebab-case.svg` (e.g. `speaker.svg`, `search.svg`) |
| **Base class** | `.icon` in `style.css` |
| **Modifiers** | `.icon--speaker`, `.icon--search`, etc. |
| **Markup** | `<span class="icon icon--speaker" aria-hidden="true"></span>` — always pair with an `aria-label` on the parent `<button>` |

**Available icons**

| Modifier | Asset | Used by |
|----------|-------|---------|
| `.icon--speaker` | `static/images/icons/speaker.svg` | `.speak-button` (Common Words), `.fitb-hint-btn--listen` (“say it”) |
| `.icon--search` | `static/images/icons/search.svg` | `.fitb-hint-btn--define` (“define it”) |

**Examples**

Icon-only listen button (Common Words):

```html
<button class="speak-button" type="button" aria-label="Listen to word 1">
  <span class="icon icon--speaker" aria-hidden="true"></span>
</button>
```

Icon + label hint button (Fill-in-the-Blanks):

```html
<button class="fitb-hint-btn fitb-hint-btn--listen" type="button">
  <span class="icon icon--speaker" aria-hidden="true"></span> say it
</button>
<button class="fitb-hint-btn fitb-hint-btn--define" type="button">
  <span class="icon icon--search" aria-hidden="true"></span> define it
</button>
```

> **Rule of thumb:** do not use emoji for control icons. Add a new SVG to `static/images/icons/`, a matching `.icon--*` modifier in `style.css`, and a row in the table above.

---

## 11. Responsive Breakpoints

| Breakpoint | Columns | Notes |
|------------|---------|-------|
| ≤ 640 px | 1 | Stack cards vertically, reduce hero padding |
| 641–960 px | 2 | Medium layout |
| ≥ 961 px | 3+ | Full desktop grid, auto-fill |

Use `clamp()` for font sizes to scale smoothly between breakpoints.

---

## 12. Accessibility

- Minimum contrast ratio **4.5:1** for body text (all muted text meets this on white).
- All images require meaningful `alt` text.
- Interactive cards should be reachable and activatable via keyboard.
- Animations respect `prefers-reduced-motion` (add a media query when enhancing).
- Font sizes never go below `0.85rem`.

---

## 13. Adding a New Page

1. Create `new-page.html` and link `style.css`.
2. Use the same `.page-wrapper` container and `.hero` header pattern.
3. Reuse card, button, and typography classes from this guide.
4. Add any new tokens to the `:root` block in `style.css`.
5. Keep the file structure:

```
learning-site/
├── index.html
├── new-page.html
├── style.css
├── script.js
├── style-guide.md
└── static/
    └── images/
        ├── card-img/
        │   └── *.svg
        └── icons/
            └── *.svg
    └── sounds/
        └── *.ogg
```

---

## 14. Fill-in-the-Blanks Category

Shared components for every exercise page under `fill-in-the-blanks/`. Page files (e.g. `ending-l.html`) contain only a page shell and a small config object — no category-specific logic.

### 13.1 File Layout

```
learning-site/
├── components/
│   ├── confetti.js           ← shared celebration effect, used by FITB and Common Words (see §8.5)
│   └── fill-in-the-blanks/
│       ├── fitb.css          ← shared styles (progress bar, question card, word display,
│       │                        loading skeleton, hint buttons, answer buttons, modal)
│       └── fitb.js           ← shared logic (load JSON, pick word, render UI, sounds,
│                                check answers, game loop)
├── data-files/
│   ├── ending-l.json         ← word data (one file per exercise)
│   └── fitb-scoring.json     ← shared round-end score bands (sound + confetti)
├── fill-in-the-blanks/
│   ├── index.html            ← category landing page (card grid)
│   └── ending-l.html         ← page shell + definitions modal shell + FITB.init() config only
└── static/
    └── sounds/
        ├── correct.ogg
        ├── incorrect.ogg
        └── ending-l-tts/     ← TTS folder named after the data file (without .json)
            └── <word>.mp3
```

| File | Belongs here |
|------|--------------|
| `components/confetti.js` | Shared confetti effect — not FITB-specific, see §8.5 |
| `fitb.css` | All visual styles for the game UI |
| `fitb.js` | All reusable game logic (load JSON, generate spaced-repetition rounds, render UI, sounds, check answers, game loop, persistent stats); exposes `FITB.init({ dataFile, options })`. Loads `components/confetti.js` as a dependency (script tag must come first) |
| `data-files/<slug>.json` | Words, hidden-letter count, definitions exactly as they should appear in the modal (no answer options) |
| `data-files/fitb-scoring.json` | Shared round-end score bands for every FITB page (see §14.11) |
| `fill-in-the-blanks/<slug>.html` | Page shell (`learning-header`, game container, loading skeleton in `#word-display`, definitions modal shell), links to `style.css` + `fitb.css`, script tags for `confetti.js` then `fitb.js`, and a one-line `FITB.init()` call with `dataFile` path and hardcoded `options` array. Do **not** `<link rel="preload" as="fetch">` the word JSON — `FITB.init()` fetches it on `DOMContentLoaded` after deferred scripts, so preload triggers an unused-resource warning |
| `static/sounds/<data-file-name>-tts/` | Pre-recorded TTS audio per word |

### 13.2 Page Init API

```js
FITB.init({
  dataFile: './data-files/ending-l.json',
  options: ['le', 'el', 'al'],
});
```

- `dataFile` — path to the JSON word list (relative to the page).
- `options` — fixed answer choices for that page; not stored in the JSON.

### 13.3 Question Card

The `.fitb-game` wrapper constrains both the question card and answer buttons to the same width. It uses the same viewport-centring breakout as `learning-header`, so it stays aligned on all screen sizes. On narrow viewports it spans the full header width; on wide viewports it caps at `50rem` (~60% of the header band).

| Property | Value |
|----------|-------|
| Wrapper class | `.fitb-game` |
| Header band width | `calc(100vw - (2 * var(--header-inset)))` (CSS var `--fitb-header-width`) |
| Wrapper width | `min(50rem, var(--fitb-header-width))` (CSS var `--fitb-game-width`) |
| Wrapper margin | `margin-inline: calc(50% - 50vw + var(--header-inset) + (var(--fitb-header-width) - var(--fitb-game-width)) / 2)` |
| Wrapper margin bottom | `var(--space-2xl)` |
| Card class | `.fitb-question-card` |
| Card width | `100%` (fills the wrapper) |
| Background | `var(--gradient-card)` |
| Border | `2px solid var(--color-primary-light)` |
| Border radius | `clamp(1.5rem, 4vw, 2.5rem)` (matches header shape) |
| Padding | `var(--space-xl)` (`2rem`) |
| Box shadow | `var(--shadow-md)` |

### 13.4 Progress Bar

A segmented bar above the question card shows progress through the 10-word round. Each segment is filled in one of two colours so kids can see at a glance which words they nailed on the first try:

| State | Class | Colour | Scale |
|-------|-------|-------|------|
| Empty | `.fitb-progress-segment` | `var(--color-border)` | 1.0 |
| Got it after a mistake | `.fitb-progress-segment--filled` | `var(--color-accent-green)` (teal) | `scaleY(1.15)` |
| First-guess correct | `.fitb-progress-segment--perfect` | `var(--color-accent-yellow)` (gold) | `scaleY(1.35)` + soft glow |

The newest segment also gets `.fitb-progress-segment--new` for one render, which plays a short `fitb-segment-pop` bounce animation (disabled under `prefers-reduced-motion`). Older segments keep their colour but drop the `--new` class on the next `updateProgress()` call.

`updateProgress(completedOverride, animate)` rebuilds the segment markup from `state.session.roundSummary.results[i]` (`'perfect'` → gold, anything else → teal), so the colours survive in-session advances but are not persisted — a page reload resets the colours because `roundSummary` lives only in memory (see §14.15).

### 13.5 Word Display

| Property | Value |
|----------|-------|
| Container class | `.fitb-word-display` |
| Font family | `var(--font-heading)` (`Fredoka`) |
| Font size | `clamp(2.75rem, 8vw, 4.5rem)` |
| Font weight | `700` |
| Color | `var(--color-text)` |
| Text align | `center` |
| Letter spacing (visible letters) | `0.08em` |
| Blank class | `.fitb-blank` |
| Blank letter spacing | `0.16em` |
| Blank underline | none — blanks are the `_` character only (no border or box-shadow) |
| Blank min width | `1.4ch` per hidden letter |
| Blank color (unfilled) | `var(--color-primary-light)` |

> **Layout stability:** do not add a blank underline via `border-bottom` (or any other box-model decoration). That would change the line-box height when blanks are replaced by letters on a correct answer, shrinking the question card and shifting the hint buttons.

**Loading skeleton** (shown in the page shell until `FITB.init()` fetches and renders the word)

| Property | Value |
|----------|-------|
| Loading modifier | `.fitb-word-display--loading` on `#word-display` |
| Skeleton blank class | `.fitb-skeleton-blank` |
| Default skeleton | Five `<span class="fitb-skeleton-blank">_</span>` children (renders as `_____`) |
| Skeleton blank min width | `1.4ch` (matches `.fitb-blank`) |
| Skeleton underline | none (matches `.fitb-blank`) |
| Skeleton color | `var(--color-primary-light)` on the container |
| Animation | `fitb-skeleton-pulse` — opacity pulse `1.2s ease-in-out infinite` |
| Stagger | `animation-delay` of `0.15s` per child (`nth-child(2)` through `nth-child(5)`) |
| Accessibility | `aria-busy="true"` and `aria-label="Loading word"` on `#word-display` while loading; removed when the word is rendered |
| Page shell | Every FITB page HTML includes the skeleton markup; `fitb.js` removes `.fitb-word-display--loading` when the word is ready |

### 13.6 Hint Buttons

Two hint buttons per round: **Listen** (TTS) and **Definitions** (opens modal). Each button shows a monochrome icon (see §10) before its label.

| Property | Value |
|----------|-------|
| Container class | `.fitb-hint-buttons` |
| Container layout | `display: flex; flex-wrap: nowrap; width: 100%; gap: var(--space-md)` |
| Button class | `.fitb-hint-btn` |
| Button layout | `display: inline-flex; align-items: center; justify-content: center; gap: 0.4em; flex: 1 1 0` (equal-width, single row) |
| Icon | `.icon--speaker` on listen, `.icon--search` on define (see §10) |
| Font family | `var(--font-heading)` |
| Font size | `clamp(1rem, 3.8vw, 1.25rem)` |
| Font weight | `600` |
| Padding | `var(--space-md) var(--space-sm)` |
| Border radius | `var(--radius-md)` (`1rem`) — rounded rectangle, not pill |
| Gap between buttons | `var(--space-md)` |

**Default state**

| Property | Value |
|----------|-------|
| Background | `var(--color-surface)` |
| Color | `var(--color-primary)` |
| Border | `2px solid var(--color-primary-light)` |
| Box shadow | `var(--shadow-sm)` |

**Hover state**

| Property | Value |
|----------|-------|
| Background | `var(--color-primary-light)` |
| Color | `#fff` |
| Border color | `var(--color-primary-light)` |
| Transform | `translateY(-2px) scale(1.04)` |
| Box shadow | `var(--shadow-pop)` |

**Active / pressed state**

| Property | Value |
|----------|-------|
| Background | `var(--color-primary-dark)` |
| Color | `#fff` |
| Border color | `var(--color-primary-dark)` |
| Transform | `translateY(0) scale(0.98)` |
| Box shadow | `var(--shadow-sm)` |

**Colour variants** — the two hint buttons are functionally different (audio vs. definition), so each gets its own accent instead of sharing one purple treatment. This also reduces how purple-heavy the game screen feels.

| Variant | Class | Icon | Border / text (default) | Hover background |
|---------|-------|------|--------------------------|-------------------|
| Listen | `.fitb-hint-btn--listen` | `.icon--speaker` | `var(--color-accent-pink-dark)` on `var(--color-accent-pink)` family | `var(--color-accent-pink)` |
| Define | `.fitb-hint-btn--define` | `.icon--search` | `var(--color-accent-blue-dark)` on `var(--color-accent-blue)` family | `var(--color-accent-blue)` |

> Default-state text/border colours are the darkened `--color-accent-*-dark` variants (see §2) to keep 4.5:1 contrast on white — the raw `--color-accent-pink` / `--color-accent-blue` values are too light to pass as text.

### 13.7 Parts-of-Speech Colour Palette

Used in the definitions modal for part-of-speech badges (`.fitb-pos-badge`).

| Part of speech | CSS class | Background | Text colour |
|----------------|-----------|------------|-------------|
| noun | `.fitb-pos--noun` | `#74B9FF` (`--color-accent-blue`) | `#2D3436` |
| plural noun | `.fitb-pos--plural-noun` | `#A29BFE` (`--color-primary-light`) | `#2D3436` |
| verb | `.fitb-pos--verb` | `#00CEC9` (`--color-accent-green`) | `#2D3436` |
| adjective | `.fitb-pos--adjective` | `#FD79A8` (`--color-accent-pink`) | `#2D3436` |
| adverb | `.fitb-pos--adverb` | `#FDCB6E` (`--color-accent-yellow`) | `#2D3436` |
| determiner | `.fitb-pos--determiner` | `#E17055` (`--color-accent-orange`) | `#FFFFFF` |
| pronoun | `.fitb-pos--pronoun` | `#6C5CE7` (`--color-primary`) | `#FFFFFF` |
| (fallback) | `.fitb-pos--other` | `#DFE6E9` (`--color-border`) | `#636E72` (`--color-text-muted`) |

Badge shape: `padding: 0.2rem 0.6rem`, `border-radius: var(--radius-sm)`, `font-size: 0.8rem`, `font-weight: 700`, `text-transform: lowercase`.

### 13.8 Answer Buttons

| Property | Value |
|----------|-------|
| Container class | `.fitb-answer-buttons` |
| Button class | `.fitb-answer-btn` |
| Container layout | `display: flex; flex-wrap: nowrap; width: 100%; gap: var(--space-md)` |
| Button layout | `flex: 1 1 0` (equal-width, spans full wrapper width) |
| Font family | `var(--font-heading)` |
| Font size | `clamp(1.3rem, 4.8vw, 1.75rem)` |
| Font weight | `600` |
| Padding | `var(--space-lg) var(--space-md)` |
| Border radius | `var(--radius-md)` |
| Transition | `all var(--transition-base)` |

**Default state**

| Property | Value |
|----------|-------|
| Background | `var(--color-primary)` |
| Color | `#fff` |
| Border | `none` |
| Box shadow | `var(--shadow-md)` |

**Hover state (enabled only)**

| Property | Value |
|----------|-------|
| Background | `var(--color-primary-dark)` |
| Transform | `translateY(-3px) scale(1.05)` |
| Box shadow | `var(--shadow-pop)` |

**Correct state** (class `.fitb-answer-btn--correct`)

| Property | Value |
|----------|-------|
| Background | `var(--color-accent-green)` |
| Color | `#fff` |
| Box shadow | `0 4px 16px rgba(0,206,201,0.35)` |
| Pointer events | `none` |

**Incorrect attempt feedback**

An incorrect click disables the tapped button (adds `.fitb-answer-btn--disabled`, opacity `0.45`, no pointer events) so the player cannot choose the same wrong answer again. `fitb.js` also plays `./static/sounds/incorrect.ogg` and applies a `fitb-shake` animation to `.fitb-word-display`.

**Disabled state** (class `.fitb-answer-btn--disabled`)

| Property | Value |
|----------|-------|
| Opacity | `0.45` |
| Pointer events | `none` |

### 13.9 Correct-Answer Feedback

Correct answers are communicated by **`correct.ogg` alone** — there is no on-screen message. `fitb.js` locks the answer buttons (`.fitb-answer-btn--correct` / `--disabled`, see §14.8), plays the sound, and advances after `ROUND_ADVANCE_MS`.

> There used to be a `#correct-message` element ("Great job! ✨" etc.) here. It was removed rather than fixed: reserving layout space for it was solving a self-inflicted problem, and a distinct correct-answer sound is a clearer, faster signal for kids mid-game than text they have to read. If a visual acknowledgement is wanted again later, prefer something that doesn't participate in document flow at all (e.g. a brief overlay/toast) over reintroducing a block-level element above the buttons.

### 13.10 Definitions Modal

Native `<dialog>` element using the shared `.app-dialog` shell from `style.css`.

| Property | Value |
|----------|-------|
| Element / class | `<dialog class="app-dialog fitb-definitions-modal">` |
| Shared shell | `.app-dialog` supplies the reusable modal frame, border, radius, padding, shadow, and backdrop |
| Specific class | `.fitb-definitions-modal` supplies FITB-only layout and typography |

**Modal title** (`.fitb-modal-title`): `font-family: var(--font-heading)`, `font-size: 1.3rem`, `font-weight: 700`, `color: var(--color-primary)`, `margin-bottom: var(--space-md)`.

**Definition row** (`.fitb-definition-row`): `margin-bottom: var(--space-md)`; definition text uses `font-size: 0.95rem`, `color: var(--color-text)`, `line-height: 1.5`.

**Definitions text:** definitions are authored directly in `data-files/<slug>.json`; `fitb.js` does not mask or transform the wording at runtime.

**Close button** (`.dialog-close`): shared close button used by both Common Words and FITB dialogs.

### 13.11 Round-End Scoring

When all 10 words in a round are answered, `fitb.js` scores the round by counting **first-guess correct** answers (`state.session.roundSummary.firstGuessCorrectCount`): a word counts only if the player taps the right answer on the first try for that word. A wrong tap disqualifies that word from the score even if they get it right afterward.

Bands are loaded from `data-files/fitb-scoring.json` (shared across all FITB exercises). `getScoreBand(score)` sorts bands by `maxCorrect` ascending and returns the first band where `score <= maxCorrect`.

| Band id | `maxCorrect` | Score range (out of 10) | Sound | Confetti |
|---------|--------------|-------------------------|-------|----------|
| `low` | 4 | 0–4 | none | no |
| `good` | 8 | 5–8 | `applause` | no |
| `excellent` | 10 | 9–10 | `success` | yes |

> **Rule of thumb:** tune celebration intensity in `fitb-scoring.json`, not in page files. Confetti only fires when the matched band has `"confetti": true` (currently the `excellent` band only).

### 13.12 Round-End Actions

Shown once a round finishes (see §14.11 for scoring sounds; §14.13 for confetti). Two buttons: **Take a break** (exit) and **Continue** (start another round). These are deliberately *not* styled the same — Continue is the primary/heavier action, Take a break is a low-emphasis secondary action — so they read as two different choices rather than a coin flip.

| Property | Value |
|----------|-------|
| Container class | `.fitb-round-actions` |
| Container layout | `display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: var(--space-md)` |
| Spacing below question card | Same as answer buttons — only `.fitb-game`'s `gap: var(--space-xl)`; no extra container padding or min-height |
| Shared button shape | `.fitb-round-actions .btn` — pill (`border-radius: 999px`), `min-height: 3rem`, `font-family: var(--font-heading)`, `font-size: 1.05rem`, `font-weight: 600` |

**Primary — Continue** (`.fitb-continue-btn`)

| Property | Value |
|----------|-------|
| Label | "Continue" |
| Background | `var(--color-accent-green)` (matches the correct-answer colour, signals "more success ahead") |
| Color | `#fff` |
| Box shadow | `0 4px 16px rgba(0,206,201,0.35)` |
| Hover | Background `var(--color-accent-green-dark)`, `shadow-pop`, `translateY(-2px) scale(1.04)` |
| Auto-advance fill | `.fitb-continue-btn--filling::before` — a `rgba(255,255,255,0.3)` sweep (not a colour swap) animates `scaleX` `0 → 1` over `8s linear`, matching `ROUND_AUTO_ADVANCE_MS` in `fitb.js` |

**Secondary — Take a break** (`.fitb-break-btn`)

| Property | Value |
|----------|-------|
| Label | "Take a break" (previously "I'm done for today" — shorter, warmer, less like a commitment) |
| Background | `transparent` |
| Color | `var(--color-text-muted)` |
| Border | `2px solid var(--color-border)` |
| Box shadow | `none` |
| Hover | Background `var(--color-bg)`, color `var(--color-text)`, border `var(--color-text-muted)`, `shadow-sm`, `translateY(-1px)` |

> **Rule of thumb:** in any pair of "exit" vs. "keep going" actions, the keep-going action gets the filled/coloured treatment and the exit action gets the ghost/outline treatment. Never give both the same background colour.

### 13.13 Confetti

Uses the shared `Confetti` component — see §8.5 for the full spec. FITB does not implement its own confetti; `fitb.js` just calls it.

| Property | Value |
|----------|-------|
| Trigger | Round finishes and the scoring band from §14.11 has `"confetti": true` (currently **9–10 first-guess correct** out of 10, i.e. the `excellent` band in `fitb-scoring.json`) |
| Container | `.fitb-game` — the whole game wrapper, so the burst covers the question card, progress bar, and round-end actions |
| Options passed | None — FITB uses the shared component's defaults so the celebration looks identical to Common Words' (see §8.5's rule of thumb) |
| Cleanup | `Confetti.stop()` is called when the next round loads (`loadNextRound()`) and when "Take a break" is pressed, so a burst never keeps animating after the user has moved on |

### 13.14 Sound File Convention

All audio lives under `./static/sounds/`.

| Sound | Path |
|-------|------|
| Correct answer | `./static/sounds/correct.ogg` |
| Incorrect answer | `./static/sounds/incorrect.ogg` |
| Word TTS | `./static/sounds/<data-file-name>-tts/<word>.mp3` |

**TTS folder naming:** strip the `.json` extension from the data file name.
Example: `data-files/ending-l.json` → TTS files at `./static/sounds/ending-l-tts/couple.mp3`, `./static/sounds/ending-l-tts/double.mp3`, etc.

Playback is triggered by `fitb.js`; pages do not reference sound paths directly.

### 13.15 Spaced-Repetition Progress

`fitb.js` uses a two-tier storage model: long-lived per-word stats in `localStorage`, and the in-progress 10-word round in `sessionStorage`. Word pools are 30–150 words; rounds are always up to 10 words (fewer only if the pool itself is smaller).

**Slug** — derived from the data file name without `.json` via `getSlugFromDataFile` (e.g. `ending-l`).

#### Persistent stats (`localStorage`)

| Property | Value |
|----------|-------|
| Key | `fitb-stats:<slug>` (e.g. `fitb-stats:ending-l`) |
| Value | `{ roundNumber: number, words: { [word]: { box, lastRound, seen } } }` |
| Helpers | `getStats()`, `saveStats(stats)`, `getWordStats(stats, word)` |

Default when missing/corrupt: `{ roundNumber: 0, words: {} }`. A word with no entry is treated as `{ box: 0, lastRound: 0, seen: 0 }`.

| Field | Meaning |
|-------|---------|
| `roundNumber` | How many rounds have been generated for this slug (incremented in `generateRound()`) |
| `box` | Spaced-repetition stage `0`–`3` |
| `lastRound` | `roundNumber` when the word was last answered correctly |
| `seen` | Times the word has been answered correctly |

#### Current round (`sessionStorage`)

| Property | Value |
|----------|-------|
| Key | `fitb-round:<slug>` (e.g. `fitb-round:ending-l`) |
| Value | `{ words: string[≤10], index: number }` |
| Helpers | `getCurrentRound()`, `saveCurrentRound(round)`, `clearCurrentRound()` |

Survives refresh within the tab; cleared when the tab closes, or when the round finishes (`index` reaches 10).

#### Due intervals (rounds since `lastRound`)

| Box | Due after |
|-----|-----------|
| 0 | Every round (always eligible) |
| 1 | 2 rounds |
| 2 | 4 rounds |
| 3 | 8 rounds |

A word with `seen === 0` is always due, regardless of box.

#### Round generation (`generateRound()`)

1. `getStats()` and increment `roundNumber` by 1.
2. Collect due words; split into **priority** (`box` 0 or 1, or `seen === 0`) and **review** (`box` 2 or 3).
3. Build a 10-word list: up to 6 random from priority, fill from review, then backfill by most-overdue (`roundNumber - lastRound - requiredInterval`, descending) if still short.
4. Fisher–Yates shuffle; `saveStats(stats)`; `saveCurrentRound({ words, index: 0 })`; return the round.

#### In-memory state model

`fitb.js` keeps all non-persisted runtime state under a single `state` object, grouped by ownership:

| Section | Fields | Purpose |
|---------|--------|---------|
| `state.data` | `dataFile`, `wordData`, `scoringData` | Loaded JSON files |
| `state.session` | `roundActive`, `currentPrompt` (`word` / `definitions` / `hiddenLetters`), `roundSummary` (`hadMistakeThisWord` / `firstGuessCorrectCount` / `results`) | The current word and round flow |
| `state.ui` | wiring flags, `advanceTimeout` / `autoAdvanceTimeout`, `definitionsModal`, `currentTtsAudio` | DOM handles and runtime timers |

`currentPrompt` consolidates the previous `currentWord` / `currentDefinitions` / `currentHiddenLetters` trio so the active word is one object. `roundSummary` consolidates the per-round scoring flags and the `results` array that drives the dual-colour progress bar (§14.4). `feedbackSounds` remains a module-level cache outside `state` since it has no per-session lifecycle.

#### Loading a word (`loadRound()`)

1. Reset `state.session.roundSummary.hadMistakeThisWord = false`.
2. `getCurrentRound()`; if `null`, call `generateRound()` (which also resets `state.session.roundSummary = { hadMistakeThisWord: false, firstGuessCorrectCount: 0, results: new Array(ROUND_SIZE).fill(null) }`).
3. Set `state.session.currentPrompt` from `wordData[round.words[round.index]]` and render as before.

#### Answering (`handleAnswerClick`)

- **Incorrect** — play incorrect feedback; set `state.session.roundSummary.hadMistakeThisWord = true` (word stays active).
- **Correct** — update that word’s stats: on mistake this attempt `box = max(0, box - 1)`, else `box = min(3, box + 1)` and increment `state.session.roundSummary.firstGuessCorrectCount`; set `lastRound = stats.roundNumber`; increment `seen`; `saveStats`. Then record `state.session.roundSummary.results[slot]` (`'perfect'` if first-guess, else `'helped'`) using the slot *before* incrementing, advance the round (`index += 1`; if `index < 10`, `saveCurrentRound`; if `index === 10`, `clearCurrentRound`), and call `updateProgress(round.index, true)` so the new segment animates in (§14.4). Existing `ROUND_ADVANCE_MS` timeout still calls `loadRound()`.

Reads/writes are wrapped in `try/catch` so blocked storage never breaks the game. Clearing `fitb-stats:<slug>` resets long-term progress; clearing `fitb-round:<slug>` (or closing the tab) only drops the in-progress round.

---

*Last updated: August 2026 (§14.4 progress bar dual-colour; §14.15 in-memory `state` model)*
