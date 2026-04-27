# Server Components

## Rule: `params` and `searchParams` Are Promises — Always Await Them

**In Next.js 15+, `params` and `searchParams` are `Promise` objects. They MUST be awaited before accessing any property.**

Do NOT destructure or read properties from `params` or `searchParams` synchronously.

```tsx
// CORRECT — await params before destructuring
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  ...
}
```

```tsx
// WRONG — synchronous destructure, will fail at runtime
export default async function Page({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params; // ← params is a Promise, this is undefined
  ...
}
```

The same rule applies to `searchParams`:

```tsx
// CORRECT
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  ...
}
```

## Rule: Type `params` as `Promise<{ ... }>`

Always type the prop as `Promise<{ slug: string }>`, not as a plain object. This matches the actual runtime type and keeps TypeScript accurate.

```tsx
// CORRECT
type Props = {
  params: Promise<{ workoutId: string }>;
};
```

```tsx
// WRONG — incorrect type, misleads the type checker
type Props = {
  params: { workoutId: string };
};
```

## Rule: Server Components Must Be `async`

Any page or layout that reads `params`, `searchParams`, or fetches data must be an `async` function. There is no synchronous alternative.

```tsx
// CORRECT
export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();
  const workout = await getWorkoutById(Number(workoutId), userId!);
  ...
}
```

## Summary Checklist

| Concern | Requirement |
|---|---|
| `params` type | `Promise<{ slug: string }>` |
| `searchParams` type | `Promise<{ key?: string }>` |
| Accessing `params` values | `await params` first |
| Accessing `searchParams` values | `await searchParams` first |
| Page / layout function | Must be `async` |
