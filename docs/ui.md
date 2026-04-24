# UI Coding Standards

## Component Library

**All UI components must use shadcn/ui exclusively.**

- Do NOT create custom components.
- Do NOT use raw HTML elements for UI (buttons, inputs, dialogs, etc.) when a shadcn/ui equivalent exists.
- Do NOT use any other component library (MUI, Chakra, Radix primitives directly, etc.).
- Install new shadcn/ui components via: `npx shadcn@latest add <component>`
- Available components are listed in `components.json` and installed under `src/components/ui/`.

If a use case cannot be satisfied by an existing shadcn/ui component, combine or compose existing shadcn/ui components rather than writing a custom one.

## Date Formatting

All date formatting must use **date-fns**.

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use `format` with the `do MMM yyyy` format string:

```ts
import { format } from "date-fns";

format(new Date("2025-09-01"), "do MMM yyyy"); // "1st Sep 2025"
```

Do not use `Date.toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting utility.
