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

*Last updated: July 2026*
