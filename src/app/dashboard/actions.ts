"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deleteWorkout } from "@/data/workouts";

const deleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
});

export async function deleteWorkoutAction(
  params: z.infer<typeof deleteWorkoutSchema>
) {
  const { workoutId } = deleteWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await deleteWorkout(workoutId, userId);
  revalidatePath("/dashboard");
}
