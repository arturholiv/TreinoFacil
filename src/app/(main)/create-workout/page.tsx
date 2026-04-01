import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { WorkoutEditor } from "@/components/workout-editor";

export default function CreateWorkoutPage() {
  return (
    <>
      <PageHeader title="Novo treino" subtitle="Defina o dia e os exercícios." />
      <p className="mb-6 text-center text-sm text-[var(--muted-foreground)]">
        <Link
          href="/gerar-treinos"
          className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Sem ideia? Gerar meus treinos com inteligência artificial
        </Link>
      </p>
      <WorkoutEditor />
    </>
  );
}
