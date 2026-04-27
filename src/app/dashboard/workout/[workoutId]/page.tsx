import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./_components/edit-workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId: workoutIdParam } = await params;
  const workoutId = Number(workoutIdParam);

  if (!Number.isInteger(workoutId) || workoutId <= 0) notFound();

  const { userId } = await auth();
  if (!userId) notFound();

  const workout = await getWorkoutById(workoutId, userId);
  if (!workout) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        initialStartedAt={workout.startedAt}
        initialNotes={workout.notes}
      />
    </div>
  );
}
