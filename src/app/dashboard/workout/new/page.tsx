import { NewWorkoutForm } from "./_components/new-workout-form";

export default function NewWorkoutPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">New Workout</h1>
      <NewWorkoutForm />
    </div>
  );
}
