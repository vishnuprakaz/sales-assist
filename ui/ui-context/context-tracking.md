# Context Tracking System

## What We Track

**Essential only:**
1. Current page
2. What user is viewing (visible data)
3. What user selected
4. Recent actions (last 5-10)

## Output Format

```json
{
  "page": "leads",
  "view": "table",
  "selectedItems": [
    {"type": "lead", "id": "123", "data": {...}}
  ],
  "visibleData": {
    "items": [...],
    "totalCount": 47,
    "type": "leads"
  },
  "recentActions": [
    {"type": "select", "target": "lead", "timestamp": 1702234567890}
  ],
  "timestamp": 1702234567890
}
```

## Generic Implementation

**All components must:**
1. Call `usePageContext(pageName)` to track page
2. Call `select()` when user selects items
3. Call `useVisibleData(items, type)` to track what's shown
4. Use `recordAction()` for important interactions

**Example:**
```typescript
function LeadTable({ leads }) {
  usePageContext('leads');
  useVisibleData(leads, 'leads');
  const { select } = useSelection();
  
  const handleRowClick = (lead) => {
    select([{ type: 'lead', id: lead.id, data: lead }]);
  };
}
```

**Any new component follows same pattern:**
```typescript
function DealCard({ deal }) {
  const { select } = useSelection();
  
  const handleClick = () => {
    select([{ type: 'deal', id: deal.id, data: deal }]);
  };
}
```

## Rules

1. **Automatic tracking** - Use hooks, no manual context updates
2. **Generic types** - `type: "lead" | "deal" | "contact"` etc.
3. **Consistent API** - All components use same hooks
4. **Minimal data** - Only what agent needs to understand context

## Integration

Context automatically sent with every message to backend:
```typescript
sendToAgent({
  message: "Research this lead",
  context: contextManager.getCurrentContext()
});
```

Agent receives full context, understands "this lead" = selected item.

