# Modern Component Patterns

## Card-Based UI Components

### Basic Card Pattern

```jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BasicCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Supporting description text</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Card content goes here with proper spacing and typography.
        </p>
      </CardContent>
    </Card>
  )
}
```

### Feature Card with Icon

```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "lucide-react" // Use appropriate icon

export function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
```

### Stats Card

```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

export function StatsCard({ title, value, change, trend }) {
  const isPositive = trend === 'up'
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-rose-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {change} from last period
        </p>
      </CardContent>
    </Card>
  )
}
```

### Interactive Card with Hover Effect

```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export function InteractiveCard({ title, description, href }) {
  return (
    <Card className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
```

## Modern Layout Patterns

### Hero Section with Clean Design

```jsx
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Compelling Headline
            <span className="text-primary"> Goes Here</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A clear, concise description that explains the value proposition
            in simple terms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-base">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### Grid Layout with Responsive Cards

```jsx
export function FeaturesGrid({ features }) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold lg:text-4xl">Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

### Dashboard Layout

```jsx
export function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r bg-card">
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {/* Sidebar content */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="container mx-auto p-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

## Form Patterns

### Modern Form with shadcn/ui

```jsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ModernForm() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password"
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

## Data Display Patterns

### Modern Table

```jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"

export function DataTable({ data }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800">
                  {item.status}
                </span>
              </TableCell>
              <TableCell className="text-right">{item.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
```

### Empty State

```jsx
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      {actionLabel && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
```

## Navigation Patterns

### Modern Navbar

```jsx
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold">Logo</a>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button>Get Started</Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

## Dark Mode Implementation

### Dark Mode Toggle

```jsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Dark Mode Color Classes

Always use Tailwind's dark mode utility:

```jsx
// Background
className="bg-background dark:bg-slate-900"

// Text
className="text-foreground dark:text-slate-100"

// Card
className="bg-card dark:bg-slate-800"

// Border
className="border-border dark:border-slate-700"
```

## Animation & Interaction Patterns

### Hover Transitions

```jsx
// Card hover effect
className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1"

// Button hover effect
className="transition-colors duration-200 hover:bg-primary/90"

// Link hover effect
className="text-muted-foreground hover:text-foreground transition-colors duration-200"
```

### Loading States

```jsx
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LoadingButton({ loading, children, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
```

## Accessibility Best Practices

```jsx
// Always include proper labels
<Label htmlFor="input-id">Label Text</Label>
<Input id="input-id" />

// Use semantic HTML
<nav>, <main>, <article>, <section>

// Proper button states
<Button aria-label="Close dialog" disabled={loading}>

// Focus states
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"

// Alt text for images
<img src="..." alt="Descriptive text" />
```
