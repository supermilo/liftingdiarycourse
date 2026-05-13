import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import { getUserExercises } from "@/data/exercises";
import { EditWorkoutForm } from "./_components/edit-workout-form";
import { ExerciseList } from "./_components/exercise-list";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId: workoutIdParam } = await params;
  const workoutId = Number(workoutIdParam);

  if (!Number.isInteger(workoutId) || workoutId <= 0) notFound();

  const { userId } = await auth();

  const [workout, userExercises] = await Promise.all([
    getWorkoutById(workoutId, userId!),
    getUserExercises(userId!),
  ]);
  if (!workout) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        initialName={workout.name}
        initialStartedAt={workout.startedAt.toISOString().slice(0, 10)}
        initialNotes={workout.notes}
      />

      <hr />

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Exercises</h2>
        <ExerciseList
          workoutId={workout.id}
          exercises={workout.exercises}
          userExercises={userExercises}
        />
      </section>
    </div>
  );
}
