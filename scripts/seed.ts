import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { exercises, workouts, workoutExercises, sets } from "../src/db/schema";

const USER_ID = "user_3CXtMUcaFhPrdehP0AMBmJANHrp";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Exercise IDs already in DB for this user:
// 1=Bench Press, 2=Squat, 3=Deadlift, 4=Overhead Press, 5=Barbell Row, 6=Pull Up
const EX = { benchPress: 1, squat: 2, deadlift: 3, overheadPress: 4, pullUp: 6 };

async function main() {
  // --- workouts ---
  const workoutData = [
    {
      userId: USER_ID,
      startedAt: new Date("2026-04-20T09:00:00"),
      completedAt: new Date("2026-04-20T10:15:00"),
      notes: "Felt strong today",
    },
    {
      userId: USER_ID,
      startedAt: new Date("2026-04-22T07:30:00"),
      completedAt: new Date("2026-04-22T08:45:00"),
      notes: null,
    },
    {
      userId: USER_ID,
      startedAt: new Date("2026-04-24T18:00:00"),
      completedAt: null,
      notes: "Leg day — heavy",
    },
  ];

  console.log("Seeding workouts...");
  const insertedWorkouts = await db.insert(workouts).values(workoutData).returning();
  const [w1, w2, w3] = insertedWorkouts;

  // --- workout exercises ---
  const workoutExerciseData = [
    { workoutId: w1.id, exerciseId: EX.benchPress, order: 1, notes: null },
    { workoutId: w1.id, exerciseId: EX.overheadPress, order: 2, notes: null },
    { workoutId: w2.id, exerciseId: EX.pullUp, order: 1, notes: null },
    { workoutId: w2.id, exerciseId: EX.deadlift, order: 2, notes: "Romanian deadlift" },
    { workoutId: w3.id, exerciseId: EX.squat, order: 1, notes: "Paused squats" },
  ];

  console.log("Seeding workout exercises...");
  const insertedWE = await db.insert(workoutExercises).values(workoutExerciseData).returning();
  const [we1, we2, we3, we4, we5] = insertedWE;

  // --- sets ---
  const setData = [
    // Bench Press
    { workoutExerciseId: we1.id, setNumber: 1, reps: 8, weightKg: "80.00" },
    { workoutExerciseId: we1.id, setNumber: 2, reps: 8, weightKg: "80.00" },
    { workoutExerciseId: we1.id, setNumber: 3, reps: 6, weightKg: "85.00" },
    // Overhead Press
    { workoutExerciseId: we2.id, setNumber: 1, reps: 10, weightKg: "50.00" },
    { workoutExerciseId: we2.id, setNumber: 2, reps: 10, weightKg: "50.00" },
    { workoutExerciseId: we2.id, setNumber: 3, reps: 8, weightKg: "52.50" },
    // Pull-up
    { workoutExerciseId: we3.id, setNumber: 1, reps: 10, weightKg: null },
    { workoutExerciseId: we3.id, setNumber: 2, reps: 9, weightKg: null },
    { workoutExerciseId: we3.id, setNumber: 3, reps: 8, weightKg: null },
    // Deadlift
    { workoutExerciseId: we4.id, setNumber: 1, reps: 5, weightKg: "120.00" },
    { workoutExerciseId: we4.id, setNumber: 2, reps: 5, weightKg: "130.00" },
    { workoutExerciseId: we4.id, setNumber: 3, reps: 3, weightKg: "140.00" },
    // Squat
    { workoutExerciseId: we5.id, setNumber: 1, reps: 5, weightKg: "100.00" },
    { workoutExerciseId: we5.id, setNumber: 2, reps: 5, weightKg: "105.00" },
    { workoutExerciseId: we5.id, setNumber: 3, reps: 5, weightKg: "110.00" },
    { workoutExerciseId: we5.id, setNumber: 4, reps: 3, weightKg: "115.00" },
  ];

  console.log("Seeding sets...");
  await db.insert(sets).values(setData);

  console.log("\nDone! Workout IDs created:");
  insertedWorkouts.forEach((w) =>
    console.log(`  /dashboard/workout/${w.id}  (${w.startedAt.toDateString()})`)
  );
}

main().catch((e) => { console.error(e); process.exit(1); });
