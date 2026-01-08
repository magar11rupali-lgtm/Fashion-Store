# Day 0: Setting Up shadcn/ui (Professional UI Components)

## 🎯 Overview

Before starting the main tutorial, we'll set up **shadcn/ui** - a collection of beautifully designed, accessible components that will make your e-commerce site look professional and polished.

## ⏱️ Estimated Time: 30 minutes

---

## 📝 What is shadcn/ui?

shadcn/ui is NOT a component library. It's a collection of re-usable components that you can copy and paste into your apps. Built with:
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - For styling
- **TypeScript** - Type safety (optional)

**Benefits:**
- ✅ Beautiful, professional design
- ✅ Fully accessible (WCAG compliant)
- ✅ Customizable
- ✅ Copy-paste, you own the code
- ✅ Dark mode support

---

## 🚀 Installation Steps

### Step 1: Initialize shadcn/ui

After creating your Next.js project (Day 1), run:

```bash
cd frontend
npx shadcn-ui@latest init
```

### Step 2: Configuration

You'll be asked several questions. Use these answers:

```
✔ Would you like to use TypeScript? … no
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … app/globals.css
✔ Would you like to use CSS variables for colors? … yes
✔ Are you using a custom tailwind prefix? … no
✔ Where is your tailwind.config.js located? … tailwind.config.js
✔ Configure the import alias for components: … @/components
✔ Configure the import alias for utils: … @/lib/utils
✔ Are you using React Server Components? … yes
```

This will:
- Configure `components.json`
- Update `tailwind.config.js`
- Add CSS variables to `globals.css`
- Create `lib/utils.ts`

---

## 📦 Installing Components

Install the components we'll use throughout the tutorial:

```bash
# Essential components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
```

Each component will be added to `components/ui/`

---

## 🎨 Updated globals.css

Your `app/globals.css` should now look like this:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 🧩 Component Examples

### Button Component

```jsx
import { Button } from "@/components/ui/button"

// Variants
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Card Component

```jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

### Input Component

```jsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>
```

### Badge Component

```jsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

---

## 📁 Project Structure After Setup

```
frontend/
├── app/
│   ├── globals.css          # Updated with CSS variables
│   ├── layout.js
│   └── page.js
├── components/
│   └── ui/                  # shadcn/ui components
│       ├── button.jsx
│       ├── card.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── badge.jsx
│       ├── dialog.jsx
│       ├── sheet.jsx
│       ├── table.jsx
│       └── ... (more components)
├── lib/
│   └── utils.js             # Utility functions
├── components.json          # shadcn/ui config
└── tailwind.config.js       # Updated config
```

---

## ✅ Verification

Test that shadcn/ui is working:

Create a test page `app/test/page.js`:

```jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function TestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold">shadcn/ui Test Page</h1>
      
      {/* Buttons */}
      <div className="space-x-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      {/* Card */}
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a test card</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <div className="space-x-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </div>
  )
}
```

Visit `http://localhost:3000/test` to see the components!

---

## 🎨 Customization

### Changing Colors

Edit `app/globals.css` to change the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Blue */
  /* Change to: */
  --primary: 142.1 76.2% 36.3%;  /* Green */
  --primary: 346.8 77.2% 49.8%;  /* Pink */
}
```

### Adding More Components

As you need them:

```bash
npx shadcn-ui@latest add [component-name]
```

Available components:
- accordion, alert, alert-dialog, aspect-ratio
- avatar, calendar, checkbox, collapsible
- command, context-menu, data-table, date-picker
- form, hover-card, menubar, navigation-menu
- popover, progress, radio-group, scroll-area
- slider, switch, textarea, toggle, tooltip

---

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Component Examples](https://ui.shadcn.com/examples)
- [Radix UI Docs](https://www.radix-ui.com)
- [Tailwind CSS Docs](https://tailwindcss.com)

---

## 🎉 You're Ready!

Now you have:
- ✅ Professional UI components installed
- ✅ Accessible, beautiful design system
- ✅ Customizable color scheme
- ✅ Ready to build your e-commerce site

**Next:** Proceed to [Day 1: Introduction & Environment Setup](./day-01-setup.md) and start building with these professional components!

---

## 💡 Tips

1. **Always import from `@/components/ui/`**
   ```jsx
   import { Button } from "@/components/ui/button"
   ```

2. **Customize components freely**
   - They're in your codebase
   - Modify them as needed
   - No breaking updates

3. **Use className for additional styling**
   ```jsx
   <Button className="w-full">Full Width</Button>
   ```

4. **Combine with Tailwind**
   ```jsx
   <Card className="hover:shadow-lg transition-shadow">
   ```

---

[Back to Overview](./README.md) | [Day 1: Setup →](./day-01-setup.md)
