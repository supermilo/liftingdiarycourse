import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";
import { DatePicker } from "./_components/date-picker";
import { DeleteWorkoutButton } from "./_components/delete-workout-button";
import { getUserWorkoutsForDate } from "@/data/workouts";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const dateStr = dateParam ?? format(new Date(), "yyyy-MM-dd");
  const displayDate = new Date(dateStr + "T12:00:00");
  const workouts = await getUserWorkoutsForDate(userId!, dateStr);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <DatePicker selected={displayDate} />

      <Button asChild>
        <Link href="/dashboard/workout/new">Log New Workout</Link>
      </Button>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">
          Workouts for {format(displayDate, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No workouts logged for this date.
          </p>
        ) : (
          workouts.map((workout) => (
            <div key={workout.id} className="relative border rounded-lg">
              <Link
                href={`/dashboard/workout/${workout.id}`}
                className="block p-4 space-y-4 hover:bg-muted/50 transition-colors rounded-lg"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {workout.name ?? "Workout"}
                    </span>
                    <span className="text-sm text-muted-foreground pr-7">
                      {format(workout.startedAt, "do MMM yyyy")}
                    </span>
                  </div>
                  {workout.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {workout.notes}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {workout.exercises.map((ex) => (
                    <div key={ex.id}>
                      <p className="font-medium mb-1">{ex.exerciseName}</p>
                      <div className="space-y-1">
                        {ex.sets.map((set) => (
                          <div
                            key={set.id}
                            className="flex gap-4 text-sm text-muted-foreground"
                          >
                            <span>Set {set.setNumber}</span>
                            <span>{set.reps ?? "—"} reps</span>
                            <span>{set.weightKg ?? "—"} kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Link>
              <div className="absolute top-3 right-3">
                <DeleteWorkoutButton workoutId={workout.id} />
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
