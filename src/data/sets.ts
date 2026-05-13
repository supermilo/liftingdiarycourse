import { db } from "@/db";
import { sets, workoutExercises, workouts } from "@/db/schema";
import { and, eq, max, sql } from "drizzle-orm";

async function verifyWorkoutExerciseOwnership(
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
}

export async function addSet(
  userId: string,
  workoutExerciseId: number,
  reps: number | null,
  weightKg: string | null
): Promise<{ id: number; setNumber: number }> {
  await verifyWorkoutExerciseOwnership(userId, workoutExerciseId);

  const [{ maxSetNumber }] = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const nextSetNumber = (maxSetNumber ?? 0) + 1;

  const [inserted] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber: nextSetNumber, reps, weightKg })
    .returning({ id: sets.id, setNumber: sets.setNumber });

  return inserted;
}

export async function removeSet(userId: string, setId: number): Promise<void> {
  const rows = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)));

  if (rows.length === 0) throw new Error("Not found");

  await db.delete(sets).where(eq(sets.id, setId));
}
