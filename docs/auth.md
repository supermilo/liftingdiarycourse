# Authentication

## Rule: Clerk is the Only Auth Provider

**This app uses [Clerk](https://clerk.com) exclusively for authentication.**

- Do NOT use NextAuth, Auth.js, Supabase Auth, or any other auth library.
- Do NOT implement custom session handling, JWTs, or cookies for auth purposes.
- Do NOT use `next-auth` imports — they do not exist in this project.

## Rule: Wrap the App in `<ClerkProvider>`

The root layout (`src/app/layout.tsx`) MUST wrap all children in `<ClerkProvider>`. This is already in place — do not remove it.

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

## Rule: Protect Routes via Middleware

**Route protection MUST be handled by `clerkMiddleware` in `src/middleware.ts`.**

Do NOT add auth guards inside individual page components as a substitute for middleware.

```ts
// src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

To make specific routes require sign-in, use `createRouteMatcher` with `auth.protect()` inside the middleware — do not scatter `redirect` calls across pages.

## Rule: Get the Authenticated User via `auth()`

**In Server Components and Server Actions, obtain the current user's ID using `auth()` from `@clerk/nextjs/server`.**

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- `userId` is `null` when the user is not signed in.
- Always null-check `userId` before passing it to data helpers.
- Never source `userId` from URL params, query strings, or request bodies — always from `auth()`.

```tsx
// CORRECT — userId comes from the verified Clerk session
const { userId } = await auth();
const workouts = userId ? await getUserWorkouts(userId) : [];
```

```tsx
// WRONG — userId from URL params is untrusted and can be spoofed
const workouts = await getUserWorkouts(params.userId);
```

## Rule: UI Auth Components

Use Clerk's built-in components for all sign-in/sign-up/user UI. Do NOT build custom auth forms.

| Use case | Component |
|---|---|
| Sign-in button | `<SignInButton>` |
| Sign-up button | `<SignUpButton>` |
| User avatar / account menu | `<UserButton>` |
| Conditionally show UI by auth state | `<Show when="signed-in">` / `<Show when="signed-out">` |

```tsx
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Summary Checklist

| Concern | Requirement |
|---|---|
| Auth provider | Clerk only |
| Root layout | Wrapped in `<ClerkProvider>` |
| Route protection | `clerkMiddleware` in `src/middleware.ts` |
| Reading current user | `auth()` from `@clerk/nextjs/server` |
| Trusting `userId` | Only from `auth()` — never from URL/params |
| Sign-in / sign-up UI | Clerk components (`SignInButton`, `SignUpButton`) |
| User menu UI | `<UserButton>` |
