import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";

export async function getWorkoutById(
  workoutId: number,
  userId: string
): Promise<WorkoutWithExercises | null> {
  const rows = await db
    .select({
      workoutId: workouts.id,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      workoutNotes: workouts.notes,
      workoutExerciseId: workoutExercises.id,
      exerciseName: exercises.name,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order, sets.setNumber);

  if (rows.length === 0) return null;

  const first = rows[0];
  const workout: WorkoutWithExercises = {
    id: first.workoutId,
    startedAt: first.startedAt,
    completedAt: first.completedAt,
    notes: first.workoutNotes,
    exercises: [],
  };

  for (const row of rows) {
    if (row.workoutExerciseId !== null) {
      let exercise = workout.exercises.find((e) => e.id === row.workoutExerciseId);
      if (!exercise) {
        exercise = { id: row.workoutExerciseId, exerciseName: row.exerciseName!, sets: [] };
        workout.exercises.push(exercise);
      }
      if (row.setNumber !== null) {
        exercise.sets.push({ setNumber: row.setNumber, reps: row.reps, weightKg: row.weightKg });
      }
    }
  }

  return workout;
}

export async function updateWorkout(
  workoutId: number,
  userId: string,
  startedAt: Date,
  notes?: string
) {
  const [updated] = await db
    .update(workouts)
    .set({ startedAt, notes: notes ?? null })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function createWorkout(
  userId: string,
  startedAt: Date,
  notes?: string
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, startedAt, notes })
    .returning();
  return workout;
}

export type WorkoutWithExercises = {
  id: number;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
  exercises: {
    id: number;
    exerciseName: string;
    sets: {
      setNumber: number;
      reps: number | null;
      weightKg: string | null;
    }[];
  }[];
};

export async function getUserWorkoutsForDate(
  userId: string,
  date: Date
): Promise<WorkoutWithExercises[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      workoutNotes: workouts.notes,
      workoutExerciseId: workoutExercises.id,
      exerciseName: exercises.name,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lte(workouts.startedAt, end)
      )
    )
    .orderBy(workouts.startedAt, workoutExercises.order, sets.setNumber);

  const workoutMap = new Map<number, WorkoutWithExercises>();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        notes: row.workoutNotes,
        exercises: [],
      });
    }

    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId !== null) {
      let exercise = workout.exercises.find((e) => e.id === row.workoutExerciseId);
      if (!exercise) {
        exercise = {
          id: row.workoutExerciseId,
          exerciseName: row.exerciseName!,
          sets: [],
        };
        workout.exercises.push(exercise);
      }

      if (row.setNumber !== null) {
        exercise.sets.push({
          setNumber: row.setNumber,
          reps: row.reps,
          weightKg: row.weightKg,
        });
      }
    }
  }

  return Array.from(workoutMap.values());
}
