import { auth } from "@clerk/nextjs/server";
import { format, parseISO } from "date-fns";
import { DatePicker } from "./_components/date-picker";
import { getUserWorkoutsForDate } from "@/data/workouts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const date = dateParam ? parseISO(dateParam) : new Date();
  const workouts = userId ? await getUserWorkoutsForDate(userId, date) : [];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <DatePicker selected={date} />

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
            <div key={workout.id} className="border rounded-lg p-4 space-y-4">
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
