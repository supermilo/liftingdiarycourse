"use client";

import type { WorkoutWithExercises } from "@/data/workouts";
import { AddExerciseForm } from "./add-exercise-form";
import { ExerciseCard } from "./exercise-card";

type Props = {
  workoutId: number;
  exercises: WorkoutWithExercises["exercises"];
  userExercises: { id: number; name: string }[];
};

export function ExerciseList({ workoutId, exercises, userExercises }: Props) {
  return (
    <div className="space-y-4">
      <AddExerciseForm workoutId={workoutId} userExercises={userExercises} />

      {exercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">No exercises yet. Add one above.</p>
      ) : (
        exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            workoutExerciseId={ex.id}
            exerciseName={ex.exerciseName}
            sets={ex.sets}
          />
        ))
      )}
    </div>
  );
}
