"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddSetForm } from "./add-set-form";
import { removeExerciseFromWorkoutAction, removeSetAction } from "../actions";
import type { WorkoutWithExercises } from "@/data/workouts";

type Props = {
  workoutExerciseId: number;
  exerciseName: string;
  sets: WorkoutWithExercises["exercises"][number]["sets"];
};

export function ExerciseCard({ workoutExerciseId, exerciseName, sets }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRemoveExercise() {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction({ workoutExerciseId });
      router.refresh();
    });
  }

  function handleRemoveSet(setId: number) {
    startTransition(async () => {
      await removeSetAction({ setId });
      router.refresh();
    });
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{exerciseName}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleRemoveExercise}
          disabled={isPending}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {sets.length > 0 && (
        <div className="space-y-1">
          {sets.map((set) => (
            <div key={set.id} className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="w-12">Set {set.setNumber}</span>
              <span>{set.reps ?? "—"} reps</span>
              <span>{set.weightKg ?? "—"} kg</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemoveSet(set.id)}
                disabled={isPending}
                className="ml-auto text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AddSetForm workoutExerciseId={workoutExerciseId} />
    </div>
  );
}
