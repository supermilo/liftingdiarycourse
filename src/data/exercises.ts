import { db } from "@/db";
import { exercises, workoutExercises, workouts } from "@/db/schema";
import { and, asc, count, eq, sql } from "drizzle-orm";

export async function getUserExercises(
  userId: string
): Promise<{ id: number; name: string; category: string | null }[]> {
  return db
    .select({ id: exercises.id, name: exercises.name, category: exercises.category })
    .from(exercises)
    .where(eq(exercises.userId, userId))
    .orderBy(asc(exercises.name));
}

export async function addExerciseToWorkout(
  userId: string,
  workoutId: number,
  exerciseName: string,
  category?: string
): Promise<{ workoutExerciseId: number }> {
  const [exercise] = await db
    .insert(exercises)
    .values({ userId, name: exerciseName, category: category ?? null })
    .onConflictDoUpdate({
      target: [exercises.userId, exercises.name],
      set: { name: sql`excluded.name` },
    })
    .returning({ id: exercises.id });

  const [{ nextOrder }] = await db
    .select({ nextOrder: count(workoutExercises.id) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const [inserted] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId: exercise.id, order: Number(nextOrder) + 1 })
    .returning({ id: workoutExercises.id });

  return { workoutExerciseId: inserted.id };
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: number
): Promise<void> {
  const rows = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    );

  if (rows.length === 0) throw new Error("Not found");

  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}
