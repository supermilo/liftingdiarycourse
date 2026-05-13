"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSetAction } from "../actions";

type Props = {
  workoutExerciseId: number;
};

export function AddSetForm({ workoutExerciseId }: Props) {
  const repsRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const repsVal = repsRef.current?.value.trim() ?? "";
    const weightVal = weightRef.current?.value.trim() ?? "";
    const parsedReps = repsVal ? parseInt(repsVal, 10) : null;
    const parsedWeight = weightVal || null;

    if (!parsedReps || parsedReps < 1) return;

    setError("");
    startTransition(async () => {
      try {
        await addSetAction({ workoutExerciseId, reps: parsedReps, weightKg: parsedWeight });
        if (repsRef.current) repsRef.current.value = "";
        if (weightRef.current) weightRef.current.value = "";
        router.refresh();
      } catch {
        setError("Failed to add set. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="pt-2 space-y-2">
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor={`reps-${workoutExerciseId}`} className="text-xs">Reps</Label>
          <Input
            ref={repsRef}
            id={`reps-${workoutExerciseId}`}
            type="number"
            min={1}
            step={1}
            placeholder="12"
            className="w-20"
            disabled={isPending}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`weight-${workoutExerciseId}`} className="text-xs">Weight (kg)</Label>
          <Input
            ref={weightRef}
            id={`weight-${workoutExerciseId}`}
            type="number"
            min={0}
            step={0.01}
            placeholder="60"
            className="w-24"
            disabled={isPending}
          />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding..." : "Add Set"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
