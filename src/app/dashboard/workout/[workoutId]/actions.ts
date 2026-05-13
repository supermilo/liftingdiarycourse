"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";
import { addExerciseToWorkout, removeExerciseFromWorkout } from "@/data/exercises";
import { addSet, removeSet } from "@/data/sets";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  startedAt: z.coerce.date(),
  notes: z.string().max(500).optional(),
  name: z.string().max(100).optional(),
});

export async function updateWorkoutAction(
  params: z.infer<typeof updateWorkoutSchema>
) {
  const { workoutId, startedAt, notes, name } = updateWorkoutSchema.parse(params);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return updateWorkout(workoutId, userId, startedAt, notes, name);
}

const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseName: z.string().min(1).max(100),
  category: z.string().max(50).optional(),
});

export async function addExerciseToWorkoutAction(
  params: z.infer<typeof addExerciseSchema>
) {
  const { workoutId, exerciseName, category } = addExerciseSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return addExerciseToWorkout(userId, workoutId, exerciseName, category);
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
});

export async function removeExerciseFromWorkoutAction(
  params: z.infer<typeof removeExerciseSchema>
) {
  const { workoutExerciseId } = removeExerciseSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return removeExerciseFromWorkout(userId, workoutExerciseId);
}

const addSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().min(1).nullable(),
  weightKg: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable(),
});

export async function addSetAction(params: z.infer<typeof addSetSchema>) {
  const { workoutExerciseId, reps, weightKg } = addSetSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  const result = await addSet(userId, workoutExerciseId, reps, weightKg);
  revalidatePath("/dashboard");
  return result;
}

const removeSetSchema = z.object({
  setId: z.number().int().positive(),
});

export async function removeSetAction(params: z.infer<typeof removeSetSchema>) {
  const { setId } = removeSetSchema.parse(params);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  await removeSet(userId, setId);
  revalidatePath("/dashboard");
}
