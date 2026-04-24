"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Set = {
  setNumber: number;
  reps: number;
  weightKg: string;
};

type WorkoutExercise = {
  id: number;
  exerciseName: string;
  sets: Set[];
};

type Workout = {
  id: number;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
  exercises: WorkoutExercise[];
};

const MOCK_WORKOUTS: Workout[] = [
  {
    id: 1,
    startedAt: new Date(),
    completedAt: new Date(),
    notes: "Felt strong today",
    exercises: [
      {
        id: 1,
        exerciseName: "Squat",
        sets: [
          { setNumber: 1, reps: 5, weightKg: "100.00" },
          { setNumber: 2, reps: 5, weightKg: "100.00" },
          { setNumber: 3, reps: 5, weightKg: "100.00" },
        ],
      },
      {
        id: 2,
        exerciseName: "Bench Press",
        sets: [
          { setNumber: 1, reps: 5, weightKg: "80.00" },
          { setNumber: 2, reps: 5, weightKg: "80.00" },
          { setNumber: 3, reps: 4, weightKg: "80.00" },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const workouts = MOCK_WORKOUTS;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start gap-2">
            <CalendarIcon className="size-4" />
            {format(date, "do MMM yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                setDate(d);
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          workouts.map((workout) => (
            <div
              key={workout.id}
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {format(workout.startedAt, "do MMM yyyy")}
                </span>
                {workout.notes && (
                  <span className="text-sm text-muted-foreground italic">
                    {workout.notes}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {workout.exercises.map((ex) => (
                  <div key={ex.id}>
                    <p className="font-medium mb-1">{ex.exerciseName}</p>
                    <div className="space-y-1">
                      {ex.sets.map((set) => (
                        <div
                          key={set.setNumber}
                          className="flex gap-4 text-sm text-muted-foreground"
                        >
                          <span>Set {set.setNumber}</span>
                          <span>{set.reps} reps</span>
                          <span>{set.weightKg} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
