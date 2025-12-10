# Tailwind v4 Setup

## Issue
App used Tailwind v4 with v3 syntax. Styles not applying.

## Changes

**src/index.css:**
```css
@import "tailwindcss";
@layer base { /* shadcn design tokens */ }
```

**vite.config.ts:**
```typescript
import tailwindcss from "@tailwindcss/vite"
plugins: [react(), tailwindcss()]
```

**package.json:**
Added `@tailwindcss/vite` and `tailwindcss` v4.1.17

**postcss.config.js:**
```javascript
export default { plugins: {} }
```

## v3 vs v4
- v3: `@tailwind base/components/utilities`
- v4: `@import "tailwindcss"` + Vite plugin

## Result
- CSS: 32.19 kB (5.99 kB gzipped)
- Build: ~1.36s
- All styles working
