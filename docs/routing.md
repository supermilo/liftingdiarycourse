# Routing

## Rule: All App Routes Live Under `/dashboard`

**Every page in this application MUST be nested under the `/dashboard` path.**

- Do NOT create top-level routes (e.g. `/workouts`, `/profile`) outside of `/dashboard`.
- The file system structure must reflect this: all page files live inside `src/app/dashboard/`.

```
src/app/dashboard/
  page.tsx                        # /dashboard
  workout/
    page.tsx                      # /dashboard/workout
    [workoutId]/
      page.tsx                    # /dashboard/workout/[workoutId]
```

## Rule: All `/dashboard` Routes Are Protected

**Every route under `/dashboard` MUST require an authenticated user.**

- Do NOT add per-page auth guards (e.g. `if (!userId) redirect(...)`) as a substitute for middleware protection.
- Middleware is the single enforced gate — individual pages may assume the user is signed in.

## Rule: Route Protection via Next.js Middleware Only

**Protection of `/dashboard` routes MUST be implemented in `src/middleware.ts` using Clerk's `clerkMiddleware` and `createRouteMatcher`.**

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- `createRouteMatcher(["/dashboard(.*)"])` matches `/dashboard` and all sub-routes.
- `auth.protect()` redirects unauthenticated users to the Clerk sign-in flow automatically.
- Do NOT call `auth.protect()` in individual page components or layouts.

## Rule: No Redirects to `/dashboard` Sub-routes from Public Pages

Public pages (e.g. the landing page at `/`) should not hard-code navigation to specific `/dashboard` sub-routes. Link to `/dashboard` only — let the user's session and the dashboard's own navigation handle routing from there.

## Summary Checklist

| Concern | Requirement |
|---|---|
| Route location | All app pages under `src/app/dashboard/` |
| Public routes | Only the root (`/`) and Clerk auth routes |
| Route protection | `clerkMiddleware` + `createRouteMatcher` in `src/middleware.ts` |
| Per-page auth guards | Not used — middleware is the sole enforcement point |
| Unauthenticated access | Clerk handles redirect to sign-in automatically via `auth.protect()` |
