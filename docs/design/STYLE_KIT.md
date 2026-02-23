# 🎨 FinMate Style Kit — Bộ Design System Tái Sử Dụng

> **Design Philosophy:** Glassmorphism Premium · Vibrant Green/Gold · Motion-first · Dark Mode Native
>
> Extracted from FinMate v0.3.2 — Production-tested

---

## 📋 Mục Lục

1. [Color System](#1-color-system)
2. [Typography](#2-typography)
3. [Glassmorphism Effects](#3-glassmorphism-effects)
4. [Animations & Motion](#4-animations--motion)
5. [Component Patterns](#5-component-patterns)
6. [Page Layout Patterns](#6-page-layout-patterns)
7. [Dark Mode Strategy](#7-dark-mode-strategy)
8. [Quick Reference Cheatsheet](#8-quick-reference-cheatsheet)

---

## 1. Color System

### 🟢 Primary — Green (Brand Identity)

Sử dụng cho CTA buttons, active states, brand elements.

| Token | Hex | Sử dụng |
| --- | --- | --- |
| `primary-50` | `#f0fdf4` | Badge background |
| `primary-100` | `#dcfce7` | Hover states (light) |
| `primary-200` | `#bbf7d0` | Selection highlight |
| `primary-300` | `#86efac` | Progress bars |
| `primary-400` | `#4ade80` | Active indicators |
| `primary-500` | `#22c55e` | **Main brand color** — CTAs, active nav |
| `primary-600` | `#16a34a` | Hover on primary buttons |
| `primary-700` | `#15803d` | Strong accent |
| `primary-800` | `#166534` | Dark context emphasis |
| `primary-900` | `#14532d` | Very dark accent |
| `primary-950` | `#052e16` | Background tint (dark mode) |

### 🟡 Accent — Gold

Sử dụng cho highlights, secondary emphasis, decorative elements.

| Token | Hex | Sử dụng |
| --- | --- | --- |
| `accent-50` | `#fefce8` | Light banner bg |
| `accent-400` | `#facc15` | Gold accent highlight |
| `accent-500` | `#eab308` | **Main accent** — decorations, chart highlights |
| `accent-600` | `#ca8a04` | Hover on accent |

### ⚫ Surface — Neutral (UI Foundation)

Sử dụng cho backgrounds, borders, text colors.

| Token | Hex | Light Mode | Dark Mode |
| --- | --- | --- | --- |
| `surface-50` | `#fafafa` | Card backgrounds | — |
| `surface-100` | `#f4f4f5` | Hover backgrounds | — |
| `surface-200` | `#e4e4e7` | Borders | — |
| `surface-300` | `#d4d4d8` | Dividers | — |
| `surface-400` | `#a1a1aa` | Placeholder text | Icon colors |
| `surface-500` | `#71717a` | Secondary text | Secondary text |
| `surface-600` | `#52525b` | Body text | — |
| `surface-700` | `#3f3f46` | Headings (secondary) | — |
| `surface-800` | `#27272a` | — | Card backgrounds |
| `surface-900` | `#18181b` | Headings (primary) | Card backgrounds |
| `surface-950` | `#09090b` | — | **Page background** |

### 🔴🟡🟢 Semantic Colors

| Token | Hex | Sử dụng |
| --- | --- | --- |
| `success` | `#10b981` | Success states, income |
| `success-light` | `#d1fae5` | Success background |
| `warning` | `#f59e0b` | Warning states |
| `warning-light` | `#fef3c7` | Warning background |
| `danger` | `#ef4444` | Error states, expense |
| `danger-light` | `#fee2e2` | Error background |

### CSS Variables (Light/Dark)

```css
:root {
    --background: #f8fafc;
    --foreground: #0f172a;
}

.dark {
    --background: #0a0a0b;
    --foreground: #fafafa;
}
```

---

## 2. Typography

### Font Stack

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

### Setup (Next.js)

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-inter',
    display: 'swap',
});

// In layout.tsx
<body className={`${inter.variable} antialiased`}>
```

### Heading Hierarchy

| Level | Class | Ví dụ |
| --- | --- | --- |
| Hero | `text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight` | Landing page title |
| Page Title | `text-3xl font-black tracking-tight` | Dashboard headers |
| Section | `text-xl font-black` | Modal titles |
| Card Title | `text-lg font-semibold leading-none tracking-tight` | Card headers |
| Label | `text-sm font-bold uppercase tracking-wider` | Category labels |
| Body | `text-sm font-medium` | Normal text |
| Caption | `text-xs font-bold tracking-widest uppercase` | Badges, tags |
| Helper | `text-sm text-surface-500` | Helper text |

### Text Colors

```
Light mode headings:  text-surface-900
Light mode body:      text-surface-600
Light mode muted:     text-surface-500
Light mode subtle:    text-surface-400

Dark mode headings:   text-white
Dark mode body:       text-surface-300
Dark mode muted:      text-surface-400
Dark mode subtle:     text-surface-500
```

---

## 3. Glassmorphism Effects

### Glass Card (Core Pattern)

```css
/* Light Mode */
.glass, .glass-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    transition: all 300ms;
}

/* Dark Mode */
.dark .glass, .dark .glass-card {
    background: rgba(18, 18, 20, 0.6);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}
```

### Glow Mesh Background

Dùng cho page backgrounds tạo hiệu ứng ambient glow.

```css
/* Light Mode */
.glow-mesh {
    background-image:
        radial-gradient(at 0% 0%, rgba(34, 197, 94, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(234, 179, 8, 0.05) 0px, transparent 50%);
}

/* Dark Mode — Tăng cường độ */
.dark .glow-mesh {
    background-image:
        radial-gradient(at 0% 0%, rgba(34, 197, 94, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(234, 179, 8, 0.1) 0px, transparent 50%);
}
```

### Border Glow (Gradient Border)

```css
.border-glow {
    position: relative;
}

.border-glow::after {
    content: "";
    position: absolute;
    inset: -1px;
    background: linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(234, 179, 8, 0.2));
    z-index: -1;
    border-radius: inherit;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
}

.dark .border-glow::after {
    background: linear-gradient(to right, rgba(34, 197, 94, 0.4), rgba(234, 179, 8, 0.4));
}
```

### Gradient Text

```html
<span class="bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 bg-clip-text text-transparent">
    Gradient Text
</span>
```

---

## 4. Animations & Motion

### Tailwind Keyframes

```typescript
// tailwind.config.ts
animation: {
    "fade-in": "fadeIn 0.5s ease-out",
    "slide-up": "slideUp 0.5s ease-out",
    "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
},
keyframes: {
    fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
    },
    slideUp: {
        "0%": { opacity: "0", transform: "translateY(20px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
    },
},
```

### Framer Motion Patterns

#### Page Entry

```tsx
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
>
```

#### Modal

```tsx
// Backdrop
<motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-surface-950/40 backdrop-blur-sm"
/>

// Dialog
<motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 20 }}
/>
```

#### List Items (Staggered)

```tsx
{items.map((item, i) => (
    <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
    />
))}
```

#### Hover Icon Rotation

```html
<Icon class="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
```

### Micro-interactions

```
Button press:    active:scale-95
Button hover:    hover:scale-105 hover:-translate-y-1
Card hover:      hover:shadow-2xl hover:shadow-primary-500/10
Nav active:      scale-[1.02]
Focus ring:      focus:ring-4 focus:ring-primary-500/10
```

---

## 5. Component Patterns

### Button Variants

```
Default:      bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md
Destructive:  bg-danger text-white hover:bg-red-600 shadow-sm
Outline:      border border-surface-200 bg-transparent hover:bg-surface-50
              dark:border-white/10 dark:hover:bg-white/5
Secondary:    bg-surface-100 text-surface-900 hover:bg-surface-200
              dark:bg-surface-800 dark:text-surface-100
Ghost:        hover:bg-surface-100 dark:hover:bg-surface-800
Link:         text-primary-500 underline-offset-4 hover:underline

CTA (Large):  h-14 rounded-2xl shadow-lg shadow-primary-500/25 font-black
```

### Input Style

```
Base:         h-11 rounded-xl border border-surface-200 bg-white/70 px-4
Focus:        focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10
Dark:         dark:border-white/10 dark:bg-white/5 dark:text-white
Error:        border-danger focus:border-danger focus:ring-danger/20
Label:        text-sm font-medium text-surface-700 dark:text-surface-300
```

### Card Variants

```
Default:      bg-white rounded-xl shadow-sm dark:bg-surface-900
Glass:        glass rounded-xl shadow-lg (sử dụng CSS .glass)
Bordered:     border border-surface-200 bg-white rounded-xl
              dark:border-surface-800 dark:bg-surface-900
```

### Modal Pattern

```
Overlay:      bg-surface-950/40 backdrop-blur-sm
Container:    rounded-[2.5rem] shadow-2xl border overflow-hidden
              dark: bg-surface-900 border-white/10
              light: bg-white border-surface-200
Header:       p-8 border-b border-surface-100 dark:border-white/5
Close btn:    h-10 w-10 rounded-xl hover:bg-surface-100 dark:hover:bg-white/5
```

### Sidebar Navigation

```
Active:       bg-primary-500 text-white shadow-lg shadow-primary-500/25 scale-[1.02]
Inactive:     text-surface-600 hover:bg-surface-100 hover:text-surface-900
              dark: text-surface-400 hover:bg-white/5 hover:text-white
Container:    w-72 border-r bg-white/80 backdrop-blur-2xl
              dark: bg-surface-950/80 border-white/5
```

### Badge/Chip

```html
<span class="inline-flex items-center gap-2 rounded-full
    border border-primary-200 bg-primary-50 px-4 py-2
    text-sm font-semibold text-primary-700
    dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-400
    shadow-sm">
    <Sparkles class="h-4 w-4" />
    Badge text
</span>
```

### Skeleton Loader

```
bg-surface-200 animate-pulse rounded-md dark:bg-white/5
```

### Error Alert

```html
<div class="rounded-2xl bg-red-50 p-4 flex items-center gap-3 text-red-600">
    <div class="bg-red-100 p-1.5 rounded-full">
        <AlertIcon class="w-3.5 h-3.5" />
    </div>
    <span class="text-sm font-bold">Error message</span>
</div>
```

### Divider with Label

```html
<div class="relative">
    <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t border-surface-100" />
    </div>
    <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-white px-4 text-surface-400 font-bold tracking-widest">
            Label text
        </span>
    </div>
</div>
```

---

## 6. Page Layout Patterns

### Dashboard Layout

```
┌─────────────────────────────────────┐
│ Sidebar (w-72, fixed left)          │
│ ┌─────────┐ ┌─────────────────────┐ │
│ │ Logo    │ │ Main Content        │ │
│ │ Nav     │ │ (lg:pl-72, min-h-   │ │
│ │ Items   │ │  screen, p-6 lg:p-8)│ │
│ │         │ │                     │ │
│ │ ---     │ │ glow-mesh bg        │ │
│ │ Settings│ │                     │ │
│ │ Profile │ │                     │ │
│ └─────────┘ └─────────────────────┘ │
└─────────────────────────────────────┘
```

```html
<div class="flex min-h-screen">
    <Sidebar /> <!-- fixed left w-72 -->
    <main class="flex-1 lg:pl-72 min-h-screen bg-surface-50 dark:bg-surface-950 glow-mesh">
        <div class="p-6 lg:p-8">
            <!-- Page header -->
            <div class="mb-8">
                <h1 class="text-3xl font-black text-surface-900 dark:text-white">Title</h1>
                <p class="text-surface-500 mt-1">Subtitle</p>
            </div>
            <!-- Content -->
        </div>
    </main>
</div>
```

### Landing Page Background

```html
<div class="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
    from-primary-100/40 via-surface-50 to-white
    dark:from-primary-950/20 dark:via-surface-950 dark:to-black">

    <!-- Animated blurred circles -->
    <div class="absolute -top-40 -right-40 h-[500px] w-[500px]
        rounded-full bg-primary-500/10 blur-[120px] animate-pulse" />
    <div class="absolute top-60 -left-40 h-[500px] w-[500px]
        rounded-full bg-accent-400/10 blur-[120px] animate-pulse-slow" />
</div>
```

### Auth Layout

```
Split layout or centered card with clean white/glass background.
Form container: max-w-lg, glass card, rounded-[2.5rem], p-8
```

---

## 7. Dark Mode Strategy

### Approach: Class-based (`darkMode: "class"`)

```typescript
// tailwind.config.ts
darkMode: "class",
```

### Toggle Method (Zustand Store)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'system',
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'dark' ? 'light' : 'dark'
            })),
        }),
        { name: 'app-ui', partialize: (state) => ({ theme: state.theme }) }
    )
);
```

### CSS Pattern: Consistent Dual-mode Classes

| Component | Light | Dark |
| --- | --- | --- |
| Page bg | `bg-surface-50` | `dark:bg-surface-950` |
| Card bg | `bg-white` | `dark:bg-surface-900` |
| Card border | `border-surface-200` | `dark:border-surface-800` or `dark:border-white/10` |
| Heading | `text-surface-900` | `dark:text-white` |
| Body text | `text-surface-600` | `dark:text-surface-300` |
| Muted text | `text-surface-500` | `dark:text-surface-400` |
| Hover bg | `hover:bg-surface-100` | `dark:hover:bg-white/5` |
| Input bg | `bg-white/70` | `dark:bg-white/5` |
| Input border | `border-surface-200` | `dark:border-white/10` |
| Divider | `border-surface-100` | `dark:border-white/5` |
| Skeleton | `bg-surface-200` | `dark:bg-white/5` |

### Key Rule

> Trong dark mode, sử dụng `white/[opacity]` thay vì màu cố định cho borders, hover states, và subtle backgrounds. Đây là pattern chính tạo ra giao diện tối thanh lịch.

---

## 8. Quick Reference Cheatsheet

### Border Radius Scale

```
Input/Button:   rounded-xl (0.75rem)
Card:           rounded-xl (0.75rem) hoặc rounded-[2.5rem]
Badge:          rounded-full
Modal:          rounded-[2.5rem]
Nav item:       rounded-xl
Avatar:         rounded-full
Logo icon:      rounded-xl hoặc rounded-2xl
```

### Shadow Scale

```
Card default:   shadow-sm
Card hover:     shadow-lg hoặc shadow-2xl
Glass card:     shadow-lg
Primary button: shadow-sm → hover:shadow-md
CTA button:     shadow-lg shadow-primary-500/25
Active nav:     shadow-lg shadow-primary-500/25
Modal:          shadow-2xl
Logo:           shadow-lg shadow-primary-500/20
```

### Spacing Patterns

```
Page padding:   p-6 lg:p-8
Card padding:   p-4 (sm), p-6 (md), p-8 (lg)
Modal content:  p-8
Section gap:    space-y-6
Nav items gap:  space-y-1.5
Button gap:     gap-3 (icon + text)
```

### Z-Index Scale

```
Sidebar:        z-50
Modal overlay:  z-[100]
Mobile overlay: z-40
Toast:          z-[200]
```

### Transition Defaults

```
All elements:   transition-all duration-300
Color only:     transition-colors
Transform:      transition-transform duration-300
```

---

## 📦 Dependencies

| Package | Purpose | Required |
| --- | --- | --- |
| `tailwindcss@4` | CSS framework | ✅ |
| `class-variance-authority` | Component variants | ✅ |
| `clsx` | Class merging | ✅ |
| `tailwind-merge` | TW class deduplication | ✅ |
| `framer-motion` | Animations | ✅ |
| `lucide-react` | Icons | ✅ |
| `zustand` | State management (theme) | ✅ |
| `next/font/google` (Inter) | Typography | ✅ |

---

*Last updated: 2026-02-12 · FinMate v0.3.2*
