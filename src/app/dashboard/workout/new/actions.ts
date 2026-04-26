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
