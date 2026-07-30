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
| `--gradient-hero` | `135deg, #A29BFE → #FD79A8 → #FDCB6E` | Page header / hero section |
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
├── .card-image-wrapper     (aspect-ratio: 16/10, overflow hidden, gradient bg)
│   └── .card-image         (object-fit: cover, hover zoom)
└── .card-body              (padding: var(--space-lg))
    ├── .card-title         (font-heading, color: accent per card)
    └── .card-description   (font-body, muted color)
```

- Background: `--gradient-card`
- Border: `2px solid --color-border`
- Border radius: `--radius-lg`
- Six colour variations cycle via `:nth-child(6n+N)` selectors

### 8.2 Hero Header

Use the `learning-header` custom element on every page. Set its content with
the `title` and `subtitle` attributes:

```html
<learning-header
  title="Learning Exercises"
  subtitle="Pick a fun activity and start learning!"
></learning-header>
```

The component lives in `components/learning-header.js` and includes the
collapsible interaction, keyboard controls, and decorative bubbles.

```
.hero
├── .hero-bubbles           (absolute positioned decorative circles)
│   └── .bubble             (animated float, various sizes)
├── .hero-title             (large, bold, white)
└── .hero-subtitle          (medium, white, 92% opacity)
```

- Background: `--gradient-hero`
- Bottom rounded corners: `radius-lg`

### 8.3 Buttons (for future pages)

```css
.btn {
  font-family: var(--font-heading);
  font-weight: 600;
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
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

Use `.btn--pink`, `.btn--green`, `.btn--yellow` modifier classes for accent variations.

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

---

## 9. Image Conventions

| Rule | Detail |
|------|--------|
| **Format** | SVG preferred (scales cleanly). PNG/JPG fallback acceptable. |
| **Directory** | All card images go in `.images/card-img/` |
| **Naming** | `kebab-case.svg` matching the exercise slug |
| **Aspect ratio** | Display at 16:10 via `aspect-ratio` CSS property |
| **Background** | Each card gets a soft gradient tint behind the image area (set in CSS) |

---

## 10. Responsive Breakpoints

| Breakpoint | Columns | Notes |
|------------|---------|-------|
| ≤ 640 px | 1 | Stack cards vertically, reduce hero padding |
| 641–960 px | 2 | Medium layout |
| ≥ 961 px | 3+ | Full desktop grid, auto-fill |

Use `clamp()` for font sizes to scale smoothly between breakpoints.

---

## 11. Accessibility

- Minimum contrast ratio **4.5:1** for body text (all muted text meets this on white).
- All images require meaningful `alt` text.
- Interactive cards should be reachable and activatable via keyboard.
- Animations respect `prefers-reduced-motion` (add a media query when enhancing).
- Font sizes never go below `0.85rem`.

---

## 12. Adding a New Page

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
        └── card-img/
            └── *.svg
    └── sounds/
        └── *.ogg
```

---

## 13. Fill-in-the-Blanks Category

Shared components for every exercise page under `fill-in-the-blanks/`. Page files (e.g. `ending-l.html`) contain only a page shell and a small config object — no category-specific logic.

### 13.1 File Layout

```
learning-site/
├── components/
│   └── fill-in-the-blanks/
│       ├── fitb.css          ← shared styles (header area, question card, word display,
│       │                        loading skeleton, hint buttons, answer buttons, modal,
│       │                        correct message)
│       └── fitb.js           ← shared logic (load JSON, pick word, render UI, sounds,
│                                check answers, game loop)
├── data-files/
│   └── ending-l.json         ← word data (one file per exercise)
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
| `fitb.css` | All visual styles for the game UI |
| `fitb.js` | All reusable game logic; exposes `FITB.init({ dataFile, options })` |
| `data-files/<slug>.json` | Words, hidden-letter count, definitions exactly as they should appear in the modal (no answer options) |
| `fill-in-the-blanks/<slug>.html` | Page shell (`learning-header`, game container, loading skeleton in `#word-display`, definitions modal shell), links to `style.css` + `fitb.css`, script tag for `fitb.js`, and a one-line `FITB.init()` call with `dataFile` path and hardcoded `options` array |
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

### 13.4 Word Display

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
| Blank underline | `3px solid var(--color-primary)` |
| Blank min width | `1.4ch` per hidden letter |
| Blank color (unfilled) | `var(--color-primary-light)` |

**Loading skeleton** (shown in the page shell until `FITB.init()` fetches and renders the word)

| Property | Value |
|----------|-------|
| Loading modifier | `.fitb-word-display--loading` on `#word-display` |
| Skeleton blank class | `.fitb-skeleton-blank` |
| Default skeleton | Five `<span class="fitb-skeleton-blank">_</span>` children (renders as `_____`) |
| Skeleton blank min width | `1.4ch` (matches `.fitb-blank`) |
| Skeleton underline | `3px solid var(--color-primary-light)` |
| Skeleton color | `var(--color-primary-light)` on the container |
| Animation | `fitb-skeleton-pulse` — opacity pulse `1.2s ease-in-out infinite` |
| Stagger | `animation-delay` of `0.15s` per child (`nth-child(2)` through `nth-child(5)`) |
| Accessibility | `aria-busy="true"` and `aria-label="Loading word"` on `#word-display` while loading; removed when the word is rendered |
| Page shell | Every FITB page HTML includes the skeleton markup; `fitb.js` removes `.fitb-word-display--loading` when the word is ready |

### 13.5 Hint Buttons

Two hint buttons per round: **Listen** (TTS) and **Definitions** (opens modal).

| Property | Value |
|----------|-------|
| Container class | `.fitb-hint-buttons` |
| Container layout | `display: flex; flex-wrap: nowrap; width: 100%; gap: var(--space-md)` |
| Button class | `.fitb-hint-btn` |
| Button layout | `flex: 1 1 0` (equal-width, single row) |
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

### 13.6 Parts-of-Speech Colour Palette

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

### 13.7 Answer Buttons

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

An incorrect click does **not** disable any answer button. Instead, `fitb.js` plays `./static/sounds/incorrect.ogg` and applies a `fitb-shake` animation to `.fitb-word-display`.

**Disabled state** (class `.fitb-answer-btn--disabled`)

| Property | Value |
|----------|-------|
| Opacity | `0.45` |
| Pointer events | `none` |

### 13.8 Correct-Answer Message

Shown after a correct answer, above the answer buttons.

| Property | Value |
|----------|-------|
| Class | `.fitb-correct-message` |
| Font family | `var(--font-heading)` |
| Font size | `1.25rem` |
| Font weight | `700` |
| Color | `var(--color-accent-green)` |
| Text align | `center` |
| Padding | `var(--space-md) 0` |
| Animation | `fadeInUp 0.4s var(--ease-bounce)` |

Default text: **"Great job! ✨"**

### 13.9 Definitions Modal

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

### 13.10 Sound File Convention

All audio lives under `./static/sounds/`.

| Sound | Path |
|-------|------|
| Correct answer | `./static/sounds/correct.ogg` |
| Incorrect answer | `./static/sounds/incorrect.ogg` |
| Word TTS | `./static/sounds/<data-file-name>-tts/<word>.mp3` |

**TTS folder naming:** strip the `.json` extension from the data file name.  
Example: `data-files/ending-l.json` → TTS files at `./static/sounds/ending-l-tts/couple.mp3`, `./static/sounds/ending-l-tts/double.mp3`, etc.

Playback is triggered by `fitb.js`; pages do not reference sound paths directly.

---

*Last updated: July 2026*
