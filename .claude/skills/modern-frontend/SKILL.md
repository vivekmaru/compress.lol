---
name: modern-frontend
description: Create modern, beautiful React components with Tailwind CSS and shadcn/ui that follow 2025 design trends. Use when implementing UI components, building frontend interfaces, creating card-based layouts, or when users request "modern UI", "clean design", "responsive interface", "design this page", "make this look good", or similar frontend development tasks. Specializes in card-based clean UIs, intelligent use of white space, responsive design, softer colors, dark mode support, and purposefully avoids default blue color schemes in favor of more modern accent colors like violet, teal, amber, rose, or emerald.
---

# Modern Frontend

Build beautiful, modern React components using Tailwind CSS and shadcn/ui that follow current design trends.

## Overview

This skill provides comprehensive guidance for creating production-ready React components with modern design patterns, proper spacing, responsive layouts, and cohesive color systems. It specifically addresses the common issue of AI defaulting to blue color schemes by providing diverse, modern alternatives.

## When to Use This Skill

Use this skill when:
- Building new UI components or pages
- Translating design requirements into React code
- Creating card-based, clean interfaces
- Implementing responsive layouts
- Adding dark mode support
- Modernizing existing UI code

## Design Philosophy

### Core Principles

1. **Card-Based Clean UI**: Use cards as primary containers with generous padding and soft shadows
2. **Intelligent White Space**: Don't fear empty space - it creates premium, breathable designs
3. **Responsive by Default**: Mobile-first approach with smooth breakpoint transitions
4. **Softer Colors**: Avoid harsh blacks (#000) and pure whites, use softer neutral alternatives
5. **Dark Mode Native**: Design with both light and dark modes from the start
6. **No Default Blue**: Purposefully choose from modern accent colors (violet, teal, amber, rose, emerald)

## Workflow

### Step 1: Choose Your Color Accent

**CRITICAL**: Before writing any component code, explicitly choose a non-blue accent color. Ask the user if they have a preference, or if not, recommend one based on the use case:

- **Violet/Purple**: Modern, tech-forward, creative
- **Teal/Cyan**: Fresh, clean, trustworthy
- **Amber/Orange**: Warm, friendly, energetic
- **Rose/Pink**: Elegant, modern, distinctive
- **Emerald/Green**: Fresh, growth-oriented, calming

**Example:**
```
"For your RSVP app, I recommend a violet accent color for a modern, elegant feel. 
This pairs beautifully with soft gray neutrals and works great in both light and 
dark modes. Does that work for you, or would you prefer teal, amber, rose, or emerald?"
```

### Step 2: Read Design References

Before implementing components, read the relevant reference files:

**For color palettes and spacing:**
```bash
view /mnt/skills/[current-skill-path]/references/design-system.md
```

**For component patterns:**
```bash
view /mnt/skills/[current-skill-path]/references/component-patterns.md
```

### Step 3: Implement Components

Write production-ready React components following these guidelines:

**Component Structure:**
```jsx
// 1. Imports
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// 2. Component with proper TypeScript/PropTypes
export function ComponentName({ prop1, prop2 }) {
  // 3. State and hooks
  const [state, setState] = useState()
  
  // 4. Handlers
  const handleAction = () => {
    // Logic here
  }
  
  // 5. Render with proper Tailwind classes
  return (
    <Card className="overflow-hidden">
      {/* Content */}
    </Card>
  )
}
```

**Essential Tailwind Class Patterns:**

```jsx
// Spacing (generous padding/gaps)
className="p-6 space-y-6"  // Desktop
className="p-4 space-y-4"  // Mobile

// Responsive text
className="text-base md:text-lg lg:text-xl"

// Cards with hover effects
className="transition-all hover:shadow-lg hover:-translate-y-1"

// Soft shadows (avoid heavy shadows)
className="shadow-sm hover:shadow-md"

// Rounded corners (modern, generous)
className="rounded-xl"  // Cards
className="rounded-lg"  // Buttons, inputs

// Colors using CSS variables (adapts to chosen accent)
className="text-primary"  // Accent color
className="bg-primary"    // Accent background
className="text-muted-foreground"  // Secondary text
```

### Step 4: Ensure Responsiveness

Every component must be fully responsive:

```jsx
// Mobile-first approach
<div className="
  grid grid-cols-1           // Mobile: 1 column
  md:grid-cols-2             // Tablet: 2 columns  
  lg:grid-cols-3             // Desktop: 3 columns
  gap-4 md:gap-6             // Responsive gaps
">
```

**Common Responsive Patterns:**
- Text: `text-base md:text-lg lg:text-xl`
- Padding: `p-4 md:p-6 lg:p-8`
- Flex direction: `flex flex-col md:flex-row`
- Hide/show: `hidden md:block`

### Step 5: Implement Dark Mode

All components must support dark mode using Tailwind's dark: prefix:

```jsx
// Background colors
className="bg-background dark:bg-slate-900"

// Text colors  
className="text-foreground dark:text-slate-100"

// Borders
className="border-border dark:border-slate-700"

// Cards automatically adapt via CSS variables
<Card className="...">
```

## Component Creation Guidelines

### Do's ✅

- **DO** use shadcn/ui components as base (Card, Button, Input, etc.)
- **DO** apply generous spacing (p-6 for cards, gap-6 for grids)
- **DO** use softer neutral colors from the design system
- **DO** include hover states and transitions
- **DO** make everything responsive with mobile-first approach
- **DO** support dark mode from the start
- **DO** use the chosen accent color consistently
- **DO** add proper accessibility attributes (aria-labels, semantic HTML)
- **DO** include loading and empty states

### Don'ts ❌

- **DON'T** use blue as the default accent color
- **DON'T** use harsh black (#000) or pure white (#FFF)
- **DON'T** create heavy shadows (shadow-xl, shadow-2xl)
- **DON'T** use tight spacing (avoid p-1, p-2, gap-1, gap-2)
- **DON'T** use sharp corners (avoid rounded-sm, rounded)
- **DON'T** forget responsive breakpoints
- **DON'T** hard-code colors (use CSS variables or Tailwind classes)
- **DON'T** skip dark mode implementation

## Common UI Patterns

### Landing Page Hero

```jsx
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Headline
            <span className="text-primary"> With Accent</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Clear value proposition
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Primary Action</Button>
            <Button size="lg" variant="outline">Secondary</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### Feature Grid

```jsx
export function Features() {
  const features = [
    { icon: Zap, title: "Fast", description: "Lightning quick performance" },
    { icon: Shield, title: "Secure", description: "Bank-level security" },
    { icon: Sparkles, title: "Modern", description: "Latest technologies" },
  ]
  
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Dashboard Card

```jsx
export function StatsCard({ title, value, change, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {trend === 'up' ? (
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-rose-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${
          trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {change} from last period
        </p>
      </CardContent>
    </Card>
  )
}
```

## Setup Files

When creating a new React project, use these configuration files:

**Tailwind Config:**
Located in `assets/react-tailwind-template/tailwind.config.js`

**Global CSS with Theme Variables:**
Located in `assets/react-tailwind-template/globals.css`
- Includes CSS variables for chosen accent color
- Supports both light and dark modes
- Contains alternatives for different accent colors (commented)

**App Structure:**
Located in `assets/react-tailwind-template/App.jsx`
- Shows proper ThemeProvider setup
- Demonstrates basic structure

## Quality Checklist

Before delivering a component, verify:

- [ ] Non-blue accent color is used consistently
- [ ] Generous spacing (minimum p-4, prefer p-6)
- [ ] Soft shadows (shadow-sm or shadow, not shadow-xl)
- [ ] Rounded corners (rounded-xl for cards, rounded-lg for buttons)
- [ ] Responsive across all breakpoints (mobile, tablet, desktop)
- [ ] Dark mode fully implemented
- [ ] Proper semantic HTML
- [ ] Accessibility attributes included
- [ ] Hover and focus states defined
- [ ] Loading states handled
- [ ] Empty states designed

## Example Usage

```
User: "Create a dashboard for my RSVP app showing event stats"

Claude: "I'll create a modern dashboard with clean card-based UI. First, let me 
choose a color scheme - for an RSVP app, I recommend violet as the accent color 
for an elegant, modern feel. This pairs beautifully with soft gray neutrals.

[Reads design-system.md and component-patterns.md]

Now I'll create the dashboard components with:
- Generous white space and card-based layout
- Soft violet accents (not blue!)
- Full responsive design (mobile-first)
- Dark mode support built-in
- Modern rounded corners and subtle shadows

[Creates components with all modern design patterns applied]

Here's your dashboard with:
- Stats cards showing key metrics with trend indicators
- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- Violet accent color throughout
- Full dark mode support
- Clean, breathable design with generous spacing"
```

## Resources

### Reference Files
- `design-system.md` - Complete color palettes, spacing, typography, shadows
- `component-patterns.md` - Production-ready component examples

### Template Files  
- `react-tailwind-template/` - Boilerplate configuration files
  - `tailwind.config.js` - Tailwind configuration with shadcn/ui
  - `globals.css` - CSS variables for themes with accent color alternatives
  - `App.jsx` - Basic app structure with theme provider
