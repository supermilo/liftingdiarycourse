# Data Mutations

## Rule: All DB Writes via `/data` Helpers

**ALL database mutations MUST go through helper functions in the `/data` directory.**

- Never write to the database directly in a Server Action, page, or component.
- Every `/data` mutation helper MUST use **Drizzle ORM**. Raw SQL is forbidden.
- Name helpers descriptively after what they do, e.g. `createWorkout`, `deleteSet`, `updateExerciseName`.

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(userId: string, startedAt: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, startedAt })
    .returning();
  return workout;
}
```

## Rule: Mutations are Triggered via Server Actions Only

**ALL data mutations MUST be initiated from Server Actions.**

- Do NOT call `/data` mutation helpers from Client Components, Route Handlers, or `useEffect`.
- Server Actions MUST live in colocated `actions.ts` files next to the page or feature they belong to.
- Every `actions.ts` file MUST have `"use server"` as its first line.

```
src/app/
  dashboard/
    actions.ts          ← Server Actions for the dashboard feature
    page.tsx
  workouts/
    [id]/
      actions.ts        ← Server Actions scoped to a single workout
      page.tsx
```

## Rule: No `FormData` Parameters

**Server Action parameters MUST be typed TypeScript values. Do NOT use `FormData`.**

```ts
// CORRECT — typed parameters
export async function createWorkout(params: { startedAt: Date; notes?: string }) { ... }
```

```ts
// WRONG — FormData is untyped and bypasses validation
export async function createWorkout(formData: FormData) { ... }
```

## Rule: Validate All Arguments with Zod

**ALL Server Actions MUST validate their arguments with Zod before doing anything else.**

- Define a Zod schema at the top of each action.
- Call `schema.parse(params)` as the first statement in the action body.
- Use the parsed (typed) output for all subsequent logic — never the raw input.

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  startedAt: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export async function createWorkoutAction(
  params: z.infer<typeof createWorkoutSchema>
) {
  const { startedAt, notes } = createWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return createWorkout(userId, startedAt, notes);
}
```

## Rule: Always Authenticate Inside the Server Action

**Every mutating Server Action MUST verify the user's identity via `auth()` from `@clerk/nextjs/server`.**

- Obtain `userId` from `auth()` — never from params or client-supplied values.
- Throw or return an error immediately if `userId` is `null`.
- Pass `userId` to the `/data` helper so the mutation is always scoped to the authenticated user.

```ts
// CORRECT — userId from the session, checked before mutating
const { userId } = await auth();
if (!userId) throw new Error("Unauthenticated");
await createWorkout(userId, startedAt);
```

```ts
// WRONG — userId supplied by the caller is untrusted
export async function createWorkoutAction({ userId, startedAt }) { ... }
```

## Rule: No `redirect()` Inside Server Actions

**Do NOT call `redirect()` from `next/navigation` inside a Server Action.**

- Server Actions MUST return data (or nothing) and let the caller decide what to do next.
- Redirects MUST be handled client-side by the component that called the Server Action, using `useRouter` from `next/navigation`.

```ts
// CORRECT — action returns, client redirects
// actions.ts
export async function createWorkoutAction(params: ...) {
  // validate, auth, mutate...
  return createWorkout(userId, startedAt);
}

// form.tsx (client component)
const router = useRouter();
const result = await createWorkoutAction(params);
router.push("/dashboard");
```

```ts
// WRONG — redirect inside the server action couples navigation to the mutation
export async function createWorkoutAction(params: ...) {
  await createWorkout(userId, startedAt);
  redirect("/dashboard"); // ← do not do this
}
```

## Anatomy of a Correct Server Action

```ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { someDataHelper } from "@/data/something";

// 1. Zod schema defined at module level
const schema = z.object({
  field: z.string().min(1),
});

export async function myAction(params: z.infer<typeof schema>) {
  // 2. Validate first
  const validated = schema.parse(params);

  // 3. Authenticate
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // 4. Delegate to /data helper
  return someDataHelper(userId, validated.field);
}
```

## Summary Checklist

| Concern | Requirement |
|---|---|
| Where DB mutations live | `/data` helpers using Drizzle ORM |
| Where mutations are triggered | Server Actions only |
| Server Action file location | Colocated `actions.ts` next to the feature |
| Server Action file directive | `"use server"` as the first line |
| Parameter types | Typed TypeScript — no `FormData` |
| Input validation | Zod schema, parsed as the first step |
| Authentication | `auth()` from `@clerk/nextjs/server`, checked before every mutation |
| `userId` source | Always from `auth()` — never from params |
| Raw SQL | Forbidden |
| `redirect()` in Server Actions | Forbidden — redirect client-side via `useRouter` after the action resolves |
