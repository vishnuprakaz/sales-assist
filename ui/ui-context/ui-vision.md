# UI Vision Document

---

## Overview

This document defines the core vision, principles, and patterns for the user interface. It serves as the foundation for all UI development decisions and component design.

---

## Core Philosophy

### Signal Over Noise

The interface exists to amplify what matters and eliminate what doesn't. Every element must justify its presence by adding value, not complexity.

**Principles:**
- Focus on essential information only
- Remove administrative overhead
- Surface insights, not raw data
- Reduce cognitive load at every interaction

### Zero Learning Curve

Users should understand how to use the system within seconds of opening it. No tutorials, no onboarding flows, no user manuals.

**Principles:**
- Intuitive by default
- Self-explanatory components
- Natural language as primary input
- Familiar patterns where traditional UI is used

### Context Awareness

The system understands what the user is doing, what they're looking at, and what they likely need next. This eliminates repetitive inputs and enables natural interaction.

**Principles:**
- Track user selections and focus
- Understand pronouns and references ("this lead", "these 5")
- Predict likely next actions
- Surface relevant information proactively

---

## UI Context Tracking System

### Purpose

Track all user interactions and UI state to provide agents with complete awareness, enabling natural language commands like "research this lead" to work seamlessly.

### What We Track

**User Actions:** Clicks, selections, navigation, search queries, voice commands
**UI State:** Current page, visible components, filters, selected items, panel states
**Visual Context:** Viewport items, scroll position, focus element

### Context Structure

```javascript
{
  page: "leads",
  view: "table",
  selectedItems: [{ type: "lead", id: "123", data: {...} }],
  visibleData: { leads: [...], totalCount: 47 },
  filters: { status: "active" },
  searchQuery: "techcorp",
  recentActions: [...]
}
```

### Implementation

**Client-Side:** In-memory context manager captures events automatically
**Storage:** Session storage backup, optional Redis for history
**Privacy:** Client-side first, user data stays in browser
**Performance:** <1ms event capture, <10ms serialization, <5MB memory

### Agent Integration

Context automatically included with every user message:
```javascript
sendToAgent({
  message: "Research this lead",
  context: contextManager.getCurrentContext()
})
```

Agent understands "this lead" = currently selected lead data.

---

## Interaction Model

### Conversational First, Traditional When Faster

The interface blends two interaction models:

**Natural Language (Primary):**
- User communicates intent through conversation
- AI interprets and executes
- No menu navigation needed
- Commands disappear after execution (effects remain)

**Traditional UI (Supporting):**
- Direct manipulation when it's faster (clicking, dragging)
- Visual scanning of data (tables, lists)
- Immediate actions (buttons for common tasks)
- Fallback when conversation isn't optimal

**Decision Rule:**
- Use conversation for: Complex queries, ambiguous tasks, multi-step operations
- Use traditional UI for: Simple selections, visual comparisons, quick actions

---

## Layout Architecture

### Core Structure

```
┌─────────────────────────────────────────────────────┐
│  Header (Logo, Search, Profile)                    │
├──────┬──────────────────────────────────┬───────────┤
│      │                                  │           │
│ Side │     Main Dynamic Canvas          │  Agent    │
│ Nav  │     (Responsive Grid)            │  Panel    │
│      │                                  │  (Slides  │
│      │                                  │   in/out) │
│      │                                  │           │
│      ├──────────────────────────────────┤           │
│      │  Input Box (Always Visible)     │           │
└──────┴──────────────────────────────────┴───────────┘
```

### Layout Regions

**1. Header Bar (Fixed Top)**
- Logo/branding (left)
- Global search (center, optional)
- User profile/settings (right)
- Minimal height, always visible
- Transparent or subtle background

**2. Side Navigation (Left, Collapsible)**
- Icon-only navigation (collapsed by default)
- 3-5 core sections maximum
- Expand on hover to show labels
- AI can navigate for user via commands
- Responsive: Bottom nav on mobile

**3. Main Canvas (Center, Dynamic)**
- Primary workspace
- Grid-based responsive layout
- Components can be any size
- Each component independently resizable
- AI can add/remove/rearrange components
- Adapts to screen size automatically

**4. Agent Panel (Right, Conditional)**
- Slides in from right when AI is active
- Shows streaming text from agents
- Displays UI elements dynamically added by agents
- Can include charts, cards, buttons, etc.
- Dismissible by user
- Doesn't block main canvas (overlays or pushes content)

**5. Input Box (Bottom, Persistent)**
- Always visible, never hidden
- Floating above content
- Expands on focus
- Visual state changes when agent is processing
- Includes voice input option
- Suggestions appear above input

---

## Component Philosophy

### Dynamic Grid Layout

**Main canvas uses a flexible grid system:**

```
Grid: 12 columns × Auto rows
Gap: 16px (adjustable via design tokens)
Responsive breakpoints: mobile (1 col), tablet (2-3 cols), desktop (3-4 cols)
```

**Components specify their size:**
```javascript
{
  component: LeadTable,
  gridArea: { colSpan: 8, rowSpan: 2 },  // Takes 8 columns, 2 rows
  minSize: { cols: 4, rows: 1 },
  resizable: true
}
```

**AI can modify layout:**
- Add component: "Show me a chart of deal pipeline"
- Remove component: "Hide the activity feed"
- Resize component: "Make the table bigger"
- Rearrange: "Move that to the top"

### Component Registry

All components are registered and can be enabled/disabled:

```javascript
componentRegistry = {
  'lead-table': {
    component: LeadTable,
    enabled: true,
    defaultSize: { colSpan: 8, rowSpan: 2 },
    position: 'auto'  // or specific { x, y }
  },
  'agent-panel': {
    component: AgentPanel,
    enabled: false,  // Shows only when AI is active
    defaultSize: { colSpan: 4, rowSpan: 3 },
    position: 'right'
  }
}
```

### Responsive Components

Each component handles its own responsiveness:
- Desktop: Full feature set
- Tablet: Simplified layout, core features
- Mobile: Minimal UI, essential actions only

Components use container queries where possible to adapt based on available space, not just screen size.

---

## Design System

### Design Token Structure

All visual properties use design tokens (CSS variables):

```css
/* Colors */
--color-primary
--color-secondary
--color-background
--color-foreground
--color-border
--color-muted
--color-accent
--color-success
--color-warning
--color-error

/* Spacing */
--spacing-xs    /* 4px */
--spacing-sm    /* 8px */
--spacing-md    /* 16px */
--spacing-lg    /* 24px */
--spacing-xl    /* 32px */

/* Typography */
--font-sans
--font-mono
--font-size-xs
--font-size-sm
--font-size-base
--font-size-lg
--font-size-xl
--font-weight-normal
--font-weight-medium
--font-weight-semibold
--font-weight-bold

/* Border Radius */
--radius-sm
--radius-md
--radius-lg
--radius-full

/* Shadows */
--shadow-sm
--shadow-md
--shadow-lg

/* Transitions */
--transition-fast    /* 150ms */
--transition-base    /* 200ms */
--transition-slow    /* 300ms */
```

### Theme Switching

Themes are implemented via data attributes:

```html
<!-- Light theme (default) -->
<html data-theme="light">

<!-- Dark theme -->
<html data-theme="dark">

<!-- Custom theme -->
<html data-theme="custom">
```

Each theme defines its own token values. Switching is instant (no reload required).

**AI can change themes:**
- "Switch to dark mode"
- "Make everything purple"
- "Use a warmer color palette"

---

## Interaction Patterns

### Selection and Context

**Single Selection:**
- Click item to select
- Visual highlight appears
- Context tracked: `selectedItem = item`
- Actions appear based on selection

**Multiple Selection:**
- Shift+click or Cmd/Ctrl+click
- All selected items highlighted
- Context tracked: `selectedItems = [item1, item2, ...]`
- Bulk actions available

**Selection Memory:**
- System remembers last selection
- Relevant for "this", "that", "these" references
- Cleared on navigation or explicit deselection

### Real-Time Feedback

**Loading States:**
- Skeleton loaders for content
- Progress indicators for operations
- Streaming text for AI responses
- Never block UI entirely

**State Changes:**
- Smooth transitions (200ms default)
- Visual confirmation of actions
- Toast notifications for background tasks
- No silent failures

**Processing Indicators:**
- Input box shows "thinking" state
- Agent panel displays progress
- Components show loading state inline
- Clear when operation completes

### Agent Panel Behavior

**When to Show:**
- User asks a question
- AI performs research
- Complex operation in progress
- AI has suggestions/insights

**What it Shows:**
- Streaming text from agents
- Progress indicators
- Dynamically added UI components
- Action buttons for quick tasks
- Charts, cards, or visualizations

**Dismissal:**
- Auto-dismiss after completion (optional)
- User can manually close
- Minimizes to bottom corner (still accessible)
- Reopens if new AI activity

---

## Input Box Design

### States

**Idle:**
- Placeholder: "Ask anything or add a lead..."
- Voice button visible
- Minimal height

**Focused:**
- Expands slightly
- Suggestions may appear above
- Autocomplete if available

**Processing:**
- Visual indicator (pulsing border, spinner)
- Text: "AI is thinking..."
- Voice button disabled during processing

**Error:**
- Red border
- Error message displayed
- Retry option available

### Features

**Natural Language Input:**
- Full sentence parsing
- Context-aware interpretation
- No rigid commands required

**Voice Input:**
- Click microphone icon
- Speech-to-text
- Visual indicator when listening

**Suggestions:**
- Based on context
- Recent commands
- Common actions
- Can be accepted with tab or click

**Keyboard Shortcuts:**
- Cmd/Ctrl + K: Focus input from anywhere
- Escape: Clear input or dismiss suggestions
- Enter: Submit

---

## Navigation Philosophy

### Minimal Navigation

**Primary Sections (3-5 maximum):**
- Dashboard/Home
- Leads/Contacts
- Pipeline/Deals (future)
- Settings

**Icon-Based:**
- Icons only when collapsed (default)
- Labels appear on hover
- No nested menus
- Flat structure

**AI-Driven Navigation:**
- User: "Show my leads" → AI navigates to Leads section
- User: "Go to settings" → AI opens Settings
- User: "Back to dashboard" → AI navigates back

No need to click through menus when you can just ask.

### Breadcrumbs (Contextual)

Only show breadcrumbs when deep in a specific item:
```
Home > Leads > Sarah Chen (TechCorp)
```

Breadcrumbs are:
- Minimal (2-3 levels max)
- Clickable
- Show only when relevant
- Hidden on main views

---

## Accessibility Standards

### Keyboard Navigation

**All interactive elements must:**
- Be keyboard accessible (Tab, Enter, Space)
- Have visible focus indicators
- Follow logical tab order
- Support keyboard shortcuts

**Focus Management:**
- Focus moves logically through interface
- Modal/panel opened: Focus moves to first element
- Modal closed: Focus returns to trigger
- Skip links for screen readers

### Screen Reader Support

**ARIA Labels:**
- All interactive elements labeled
- Complex widgets have proper roles
- Live regions for dynamic content
- Status announcements for background tasks

**Semantic HTML:**
- Use proper HTML elements (`<button>`, `<nav>`, etc.)
- Heading hierarchy maintained
- Lists for list content
- Tables for tabular data

### Visual Accessibility

**Color Contrast:**
- WCAG 2.1 AA minimum (4.5:1 for text)
- Not relying on color alone for meaning
- Focus indicators clearly visible

**Text:**
- Minimum 16px base font size
- Line height 1.5 for body text
- Resizable without breaking layout

---

## Performance Guidelines

### Optimization for Micro-Interactions

**Target Response Times:**
- UI actions: <100ms
- Simple queries: <500ms
- AI responses: <2s first token, then stream
- Component renders: <16ms (60fps)

**Lazy Loading:**
- Components load on demand
- Images lazy loaded
- Route-based code splitting
- Large lists virtualized

**State Management:**
- Minimize re-renders
- Local state when possible
- Global state for shared data only
- Memoization for expensive computations

---

## Responsive Design

### Breakpoints

```
Mobile:  < 640px   (1 column layout)
Tablet:  640-1024px (2-3 column layout)
Desktop: > 1024px   (3-4 column layout)
```

### Adaptive Patterns

**Mobile:**
- Bottom navigation instead of sidebar
- Single column layout
- Simplified components
- Touch-optimized targets (44px minimum)
- Input box fixed at bottom

**Tablet:**
- Sidebar may collapse
- 2-column grid
- Some components hide/simplify
- Hybrid touch and mouse

**Desktop:**
- Full feature set
- Multi-column grid
- All components visible
- Keyboard shortcuts prominent

---

## Anti-Patterns (What to Avoid)

**Navigation:**
- Deep menu hierarchies
- Hidden navigation
- Unclear current location
- Too many options at once

**Interaction:**
- Modal overload
- Confirmation dialogs for non-destructive actions
- Multi-step wizards
- Complex forms with many fields

**Visual:**
- Cluttered interfaces
- Inconsistent spacing
- Too many colors
- Unclear visual hierarchy
- Animations without purpose

**Performance:**
- Blocking UI operations
- No loading states
- Janky animations
- Slow initial load

**Content:**
- Jargon or technical language
- Verbose explanations
- Unhelpful error messages
- Missing empty states

---

## Component Standards

### Every Component Must

**Functionality:**
- Work standalone (independent)
- Handle loading state
- Handle error state
- Handle empty state
- Be keyboard accessible

**Styling:**
- Use design tokens exclusively
- Support light/dark themes
- Be responsive
- Have consistent spacing

**Code Quality:**
- TypeScript types (or PropTypes)
- Clear prop interface
- Documented with examples
- Tested for accessibility

---

## Future Considerations

### Extensibility

The system should support:
- Custom component development
- Third-party integrations
- Plugin architecture
- Webhook connections

### Scalability

As features grow:
- Component registry can expand
- New navigation sections can be added
- Grid layout accommodates more components
- Performance remains optimized

### Personalization

Eventually support:
- User-customized layouts
- Saved views/filters
- Personal themes
- Workflow preferences

---

## Implementation Checklist

When building any UI component, verify:

- [ ] Uses design tokens (no hardcoded values)
- [ ] Supports light/dark themes
- [ ] Keyboard accessible
- [ ] Screen reader support
- [ ] Loading/error/empty states
- [ ] Responsive design
- [ ] Performance optimized
- [ ] Follows naming conventions
- [ ] Documented in ui-context/
- [ ] Added to component registry

---

## Summary

This UI vision prioritizes:

1. **Simplicity** - Zero learning curve, intuitive interactions
2. **Intelligence** - Context-aware, predictive, proactive
3. **Flexibility** - Dynamic, customizable, adaptable
4. **Speed** - Optimized for quick interactions
5. **Accessibility** - Inclusive, keyboard-friendly, screen-reader compatible
6. **Quality** - Polished, smooth, professional

The interface should feel like having an intelligent assistant who can see your screen and manipulate it for you, while still providing direct controls when they're faster.

---

**This document is the north star for all UI development decisions. When in doubt, refer back to these principles.**