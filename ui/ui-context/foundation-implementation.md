# Foundation Implementation

## T005: UI Context Manager

**Files:**
- `/src/types/context.ts` - Type definitions
- `/src/lib/context-manager.ts` - Context manager singleton
- `/src/hooks/useUIContext.ts` - React hooks

**Tracks:**
- Current page and view
- Selected items (generic: leads, deals, contacts, etc.)
- Visible data on screen
- Recent user actions (last 10)

**Generic implementation:**
All components use same hooks. Works with any data type.

```typescript
function AnyComponent({ items, type }) {
  usePageContext('pageName');
  useVisibleData(items, type);
  const { select } = useSelection();
  
  const handleClick = (item) => {
    select([{ type, id: item.id, data: item }]);
  };
}
```

**Sent to backend:**
```json
{
  "message": "user command",
  "context": {
    "page": "leads",
    "selectedItems": [...],
    "visibleData": {...},
    "recentActions": [...]
  }
}
```

---

## T010: Core Layout Structure

**Files:**
- `/src/components/layout/Header.tsx` - Fixed top header (56px)
- `/src/components/layout/Sidebar.tsx` - Collapsible sidebar (64px/200px)
- `/src/components/layout/MainCanvas.tsx` - Scrollable content area
- `/src/components/layout/InputBox.tsx` - Floating input (bottom)
- `/src/components/layout/AppLayout.tsx` - Layout wrapper

**Layout:**
- Header: Fixed top, backdrop blur
- Sidebar: Fixed left, expands on hover (300ms transition)
- Main: Scrollable, responsive grid
- Input: Fixed bottom, max-width 768px

**Keyboard Shortcuts:**
- Cmd+K / Ctrl+K: Focus input
- Enter: Submit
- Escape: Clear

**Responsive:**
- Desktop (>1024px): Multi-column
- Tablet (640-1024px): 2-3 columns
- Mobile (<640px): Single column

**Usage:**
```typescript
<AppLayout pageName="dashboard">
  {/* content */}
</AppLayout>
```

---

## Next Tasks

- T007: Agent Response Panel
- T008: Message Service
- T009: Navigation Manager
- T011: Component Registry
- T012: Theme Switcher
- T013: Input Suggestions

