"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  startedAt: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

export async function updateWorkoutAction(
  params: z.infer<typeof updateWorkoutSchema>
) {
  const { workoutId, startedAt, notes } = updateWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return updateWorkout(workoutId, userId, startedAt, notes);
}
