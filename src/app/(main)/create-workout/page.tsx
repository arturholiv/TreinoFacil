import { PageHeader } from "@/components/page-header";
import { WorkoutEditor } from "@/components/workout-editor";

export default function CreateWorkoutPage() {
  return (
    <>
      <PageHeader title="Novo treino" subtitle="Defina o dia e os exercícios." />
      <WorkoutEditor />
    </>
  );
}
