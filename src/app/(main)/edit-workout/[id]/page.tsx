import { PageHeader } from "@/components/page-header";
import { WorkoutEditor } from "@/components/workout-editor";

type EditWorkoutPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Editar treino" subtitle="Atualize nome, dia ou exercícios." />
      <WorkoutEditor editingWorkoutId={id} />
    </>
  );
}
