# Data Fetching

## Rule: Server Components Only

**ALL data fetching MUST be done exclusively via React Server Components.**

Do NOT fetch data via:
- Route handlers (`app/api/...`)
- Client components (`"use client"`)
- `useEffect` / `fetch` on the client
- SWR, React Query, or any client-side data-fetching library

There are no exceptions. If you are tempted to fetch data in a client component, restructure the tree so a server component fetches the data and passes it down as props.

## Rule: All Database Queries via `/data` Helpers

**ALL database queries MUST go through helper functions in the `/data` directory.**

- Never query the database directly in a page, layout, or component file.
- Every `/data` helper MUST use **Drizzle ORM**. Raw SQL (`db.execute(sql`...`)`) is forbidden.
- Name helpers descriptively after what they return, e.g. `getUserWorkouts`, `getWorkoutById`.

```
src/
  data/
    workouts.ts      ← Drizzle queries for workouts
    exercises.ts     ← Drizzle queries for exercises
    ...
```

Example of a correct helper:

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

## Rule: User Data Isolation — Critical

**A logged-in user MUST only ever be able to access their own data.**

Every `/data` helper that returns user-owned records MUST:

1. Accept `userId` as a parameter (sourced from the authenticated session, never from user input or URL params alone).
2. Include a `where` clause filtering by that `userId`.
3. Never expose a variant that fetches all rows without a user filter.

```ts
// CORRECT — always scoped to the authenticated user
export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return workout ?? null;
}
```

```ts
// WRONG — no userId filter, exposes all users' data
export async function getWorkoutById(workoutId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId));
  return workout ?? null;
}
```

The server component that calls these helpers is responsible for obtaining `userId` from the authenticated session (e.g. via Auth.js `auth()` or equivalent) and passing it to the helper. Never trust `userId` values that come from the URL, query params, or request body — always derive it from the verified session.

## Summary Checklist

| Concern | Requirement |
|---|---|
| Where to fetch data | Server components only |
| How to query the DB | Drizzle ORM via `/data` helpers |
| Raw SQL | Forbidden |
| Route handler data fetching | Forbidden |
| Client-side data fetching | Forbidden |
| User data isolation | Every query filtered by authenticated `userId` |
