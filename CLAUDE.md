# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Non-standard Next.js version

This project uses **Next.js 16.2.4**, which has breaking changes from prior versions. APIs, conventions, and file structure may differ from training data. Before writing any Next.js-specific code, consult `node_modules/next/dist/docs/` and heed all deprecation notices.

## Commands

All commands run from `liftingdiarycourse/`:

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

No test runner is configured yet.

## Architecture

- **Framework**: Next.js 16.2.4 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4 (via PostCSS) with CSS custom properties for theming; dark mode via `prefers-color-scheme`
- **Path alias**: `@/*` resolves to `./src/*`
- **Entry point**: `src/app/page.tsx`; root layout at `src/app/layout.tsx` (sets Geist font, applies theme vars)
- **Fonts**: Geist loaded via `next/font`
