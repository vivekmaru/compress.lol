# Design System Reference

## Modern Color Palettes for 2025

### Neutral Palettes (Softer, Less Harsh)
These palettes avoid harsh blacks and pure whites in favor of softer alternatives.

**Warm Neutrals:**
```
Background Light: #FAFAF9 (stone-50)
Background: #F5F5F4 (stone-100)
Card Background: #FFFFFF with shadow
Surface: #E7E5E4 (stone-200)
Border: #D6D3D1 (stone-300)
Muted: #A8A29E (stone-400)
Text Secondary: #78716C (stone-500)
Text Primary: #44403C (stone-700)
Text Strong: #292524 (stone-800)
```

**Cool Neutrals:**
```
Background Light: #F8FAFC (slate-50)
Background: #F1F5F9 (slate-100)
Card Background: #FFFFFF with shadow
Surface: #E2E8F0 (slate-200)
Border: #CBD5E1 (slate-300)
Muted: #94A3B8 (slate-400)
Text Secondary: #64748B (slate-500)
Text Primary: #334155 (slate-700)
Text Strong: #1E293B (slate-800)
```

### Accent Colors (Avoid Default Blue!)

**Modern Accent Options:**

**Purple/Violet (Recommended Alternative to Blue):**
```
Primary Light: #F5F3FF (violet-50)
Primary: #8B5CF6 (violet-500)
Primary Hover: #7C3AED (violet-600)
Primary Dark: #6D28D9 (violet-700)
```

**Teal/Cyan (Fresh, Modern):**
```
Primary Light: #ECFEFF (cyan-50)
Primary: #06B6D4 (cyan-500)
Primary Hover: #0891B2 (cyan-600)
Primary Dark: #0E7490 (cyan-700)
```

**Amber/Orange (Warm, Friendly):**
```
Primary Light: #FFFBEB (amber-50)
Primary: #F59E0B (amber-500)
Primary Hover: #D97706 (amber-600)
Primary Dark: #B45309 (amber-700)
```

**Rose/Pink (Elegant, Modern):**
```
Primary Light: #FFF1F2 (rose-50)
Primary: #F43F5E (rose-500)
Primary Hover: #E11D48 (rose-600)
Primary Dark: #BE123C (rose-700)
```

**Emerald/Green (Fresh, Trustworthy):**
```
Primary Light: #ECFDF5 (emerald-50)
Primary: #10B981 (emerald-500)
Primary Hover: #059669 (emerald-600)
Primary Dark: #047857 (emerald-700)
```

### Dark Mode Colors

**Dark Neutral Base:**
```
Background: #0F172A (slate-900)
Surface: #1E293B (slate-800)
Card: #334155 (slate-700)
Border: #475569 (slate-600)
Muted: #64748B (slate-500)
Text Secondary: #94A3B8 (slate-400)
Text Primary: #E2E8F0 (slate-200)
Text Strong: #F1F5F9 (slate-100)
```

**Dark Mode Accent (adjust based on chosen color):**
```
Primary: Lighter shade of chosen accent (e.g., violet-400 instead of violet-500)
Primary Hover: Even lighter (e.g., violet-300)
```

## Spacing System

### Base Unit: 4px

```
0: 0px
1: 4px (0.25rem)
2: 8px (0.5rem)
3: 12px (0.75rem)
4: 16px (1rem)
5: 20px (1.25rem)
6: 24px (1.5rem)
8: 32px (2rem)
10: 40px (2.5rem)
12: 48px (3rem)
16: 64px (4rem)
20: 80px (5rem)
24: 96px (6rem)
```

### Recommended Spacing Usage

**Cards:**
- Padding: `p-6` (24px) on desktop, `p-4` (16px) on mobile
- Gap between cards: `gap-6` (24px) on desktop, `gap-4` (16px) on mobile

**Sections:**
- Vertical spacing between sections: `space-y-12` (48px) on desktop, `space-y-8` (32px) on mobile
- Container max-width: `max-w-7xl` (1280px) or `max-w-6xl` (1152px)

**Components:**
- Button padding: `px-6 py-3` (24px x 12px) for large, `px-4 py-2` for medium
- Input padding: `px-4 py-3` (16px x 12px)
- Form field spacing: `space-y-4` (16px)

**White Space Philosophy:**
- More white space = more premium feel
- Generous padding inside cards (at least 24px)
- Breathing room around elements (use `gap-` utilities liberally)

## Typography

### Font Families

**Modern Sans-Serif (Recommended):**
```
font-sans: Inter, "SF Pro Display", -apple-system, system-ui, sans-serif
```

**Alternative Modern Options:**
```
font-sans: "Plus Jakarta Sans", Inter, sans-serif
font-sans: "DM Sans", Inter, sans-serif
font-sans: Manrope, Inter, sans-serif
```

### Font Sizes & Line Heights

```
text-xs: 0.75rem (12px) / line-height: 1rem (16px)
text-sm: 0.875rem (14px) / line-height: 1.25rem (20px)
text-base: 1rem (16px) / line-height: 1.5rem (24px)
text-lg: 1.125rem (18px) / line-height: 1.75rem (28px)
text-xl: 1.25rem (20px) / line-height: 1.75rem (28px)
text-2xl: 1.5rem (24px) / line-height: 2rem (32px)
text-3xl: 1.875rem (30px) / line-height: 2.25rem (36px)
text-4xl: 2.25rem (36px) / line-height: 2.5rem (40px)
text-5xl: 3rem (48px) / line-height: 1
text-6xl: 3.75rem (60px) / line-height: 1
```

### Typography Scale Usage

```
H1: text-4xl lg:text-5xl font-bold
H2: text-3xl lg:text-4xl font-bold
H3: text-2xl lg:text-3xl font-semibold
H4: text-xl lg:text-2xl font-semibold
Body: text-base
Small: text-sm
Caption: text-xs
```

### Font Weights

```
font-normal: 400 (body text)
font-medium: 500 (slightly emphasized)
font-semibold: 600 (subheadings, buttons)
font-bold: 700 (headings)
```

## Shadows & Depth

### Modern Shadow System

**Subtle Shadows (Preferred for 2025):**
```
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
```

**Usage:**
- Cards: `shadow-sm` or `shadow` (avoid heavy shadows)
- Elevated elements: `shadow-md`
- Hover states: Increase shadow slightly (e.g., `shadow` → `shadow-md`)

### Border Radius

**Modern Rounded Corners:**
```
rounded-sm: 0.125rem (2px)
rounded: 0.25rem (4px)
rounded-md: 0.375rem (6px)
rounded-lg: 0.5rem (8px)
rounded-xl: 0.75rem (12px)
rounded-2xl: 1rem (16px)
rounded-3xl: 1.5rem (24px)
```

**Recommended Usage:**
- Cards: `rounded-xl` or `rounded-2xl`
- Buttons: `rounded-lg` or `rounded-xl`
- Input fields: `rounded-lg`
- Images: `rounded-xl` or `rounded-2xl`

## Responsive Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```jsx
// Mobile first (default)
<div className="p-4 text-base">

// Tablet and up
<div className="p-4 md:p-6 text-base md:text-lg">

// Desktop
<div className="p-4 md:p-6 lg:p-8 text-base md:text-lg lg:text-xl">
```
