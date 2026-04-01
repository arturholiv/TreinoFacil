/**
 * Catálogo fixo de divisões ABC / ABCD / ABCDE (fichas enviadas pelo produto).
 * Não são linhas no banco compartilhado: ao gerar treinos, o app copia estes dados
 * para `workouts` e `exercises` do usuário logado — que pode editar tudo depois.
 */
import type { DayOfWeekKey } from "@/lib/constants/weekdays";

export type TemplateExercise = {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
};

export type SplitWorkoutDefinition = {
  letter: string;
  title: string;
  exercises: TemplateExercise[];
  cardioHint?: string;
  /** Nome salvo no treino (programas com título próprio, ex.: Leangains). */
  workoutName?: string;
};

export type SplitKind = "ABC" | "ABCD" | "ABCDE" | "LEANGAINS";

export type AbcFrequency = 3 | 6;

/** Reps quando a ficha indica só “4x”, “3x”, etc. */
const R_FREE = "—";

const ABC_3_DAYS: DayOfWeekKey[] = ["monday", "wednesday", "friday"];
const ABC_6_DAYS: DayOfWeekKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const ABCD_4_DAYS: DayOfWeekKey[] = ["monday", "tuesday", "thursday", "friday"];
const ABCDE_5_DAYS: DayOfWeekKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

/** DIVISÃO ABC — 3× ou 6× na semana */
export const SPLIT_ABC: SplitWorkoutDefinition[] = [
  {
    letter: "A",
    title: "Peito + Tríceps",
    cardioHint: "15–20 min pós treino",
    exercises: [
      { name: "Supino reto", sets: 4, reps: "6-10" },
      { name: "Supino inclinado halter", sets: 4, reps: "8-12" },
      { name: "Crucifixo máquina ou halter", sets: 3, reps: "10-12" },
      { name: "Paralelas", sets: 3, reps: "até falha" },
      { name: "Tríceps corda", sets: 3, reps: "10-12" },
      { name: "Tríceps testa", sets: 3, reps: "8-10" },
    ],
  },
  {
    letter: "B",
    title: "Costas + Bíceps",
    cardioHint: "15 min",
    exercises: [
      { name: "Barra fixa", sets: 4, reps: "até falha" },
      { name: "Puxada na frente", sets: 4, reps: "8-12" },
      { name: "Remada curvada", sets: 3, reps: "8-10" },
      { name: "Remada baixa", sets: 3, reps: "10-12" },
      { name: "Rosca direta", sets: 3, reps: "8-10" },
      { name: "Rosca alternada", sets: 3, reps: "10-12" },
    ],
  },
  {
    letter: "C",
    title: "Perna + Ombro",
    cardioHint: "20 min",
    exercises: [
      { name: "Agachamento livre", sets: 4, reps: "6-10" },
      { name: "Leg press", sets: 4, reps: "10-12" },
      { name: "Extensora", sets: 3, reps: "12" },
      { name: "Flexora", sets: 3, reps: "12" },
      { name: "Desenvolvimento", sets: 4, reps: "8-10" },
      { name: "Elevação lateral", sets: 3, reps: "12-15" },
      { name: "Panturrilha", sets: 4, reps: "12-15" },
    ],
  },
];

/** DIVISÃO ABCD — 4× na semana */
export const SPLIT_ABCD: SplitWorkoutDefinition[] = [
  {
    letter: "A",
    title: "Peito",
    cardioHint: "15–25 min (3–4x semana)",
    exercises: [
      { name: "Supino reto", sets: 4, reps: "6-10" },
      { name: "Supino inclinado", sets: 4, reps: "8-12" },
      { name: "Crucifixo", sets: 3, reps: "10-12" },
      { name: "Cross over", sets: 3, reps: "12-15" },
    ],
  },
  {
    letter: "B",
    title: "Costas",
    cardioHint: "15–25 min (3–4x semana)",
    exercises: [
      { name: "Barra fixa", sets: 4, reps: R_FREE },
      { name: "Puxada frente", sets: 4, reps: "8-12" },
      { name: "Remada curvada", sets: 3, reps: "8-10" },
      { name: "Remada cavalinho", sets: 3, reps: "10" },
    ],
  },
  {
    letter: "C",
    title: "Pernas",
    cardioHint: "15–25 min (3–4x semana)",
    exercises: [
      { name: "Agachamento", sets: 4, reps: R_FREE },
      { name: "Leg press", sets: 4, reps: R_FREE },
      { name: "Extensora", sets: 3, reps: R_FREE },
      { name: "Flexora", sets: 3, reps: R_FREE },
      { name: "Panturrilha", sets: 4, reps: R_FREE },
    ],
  },
  {
    letter: "D",
    title: "Ombro + Braço",
    cardioHint: "15–25 min (3–4x semana)",
    exercises: [
      { name: "Desenvolvimento", sets: 4, reps: R_FREE },
      { name: "Elevação lateral", sets: 3, reps: R_FREE },
      { name: "Rosca direta", sets: 3, reps: R_FREE },
      { name: "Rosca alternada", sets: 3, reps: R_FREE },
      { name: "Tríceps corda", sets: 3, reps: R_FREE },
      { name: "Tríceps testa", sets: 3, reps: R_FREE },
    ],
  },
];

/** DIVISÃO ABCDE — 5× na semana (mais estética) */
export const SPLIT_ABCDE: SplitWorkoutDefinition[] = [
  {
    letter: "A",
    title: "Peito",
    cardioHint: "20–30 min (quase todos os dias)",
    exercises: [
      { name: "Supino inclinado", sets: 4, reps: R_FREE },
      { name: "Supino reto", sets: 4, reps: R_FREE },
      { name: "Crucifixo", sets: 3, reps: R_FREE },
      { name: "Cross", sets: 3, reps: R_FREE },
    ],
  },
  {
    letter: "B",
    title: "Costas",
    cardioHint: "20–30 min (quase todos os dias)",
    exercises: [
      { name: "Barra fixa", sets: 4, reps: R_FREE },
      { name: "Puxada", sets: 4, reps: R_FREE },
      { name: "Remada", sets: 4, reps: R_FREE },
      { name: "Pullover", sets: 3, reps: R_FREE },
    ],
  },
  {
    letter: "C",
    title: "Pernas",
    cardioHint: "20–30 min (quase todos os dias)",
    exercises: [
      { name: "Agachamento", sets: 4, reps: R_FREE },
      { name: "Leg press", sets: 4, reps: R_FREE },
      { name: "Stiff", sets: 3, reps: R_FREE },
      { name: "Extensora", sets: 3, reps: R_FREE },
      { name: "Panturrilha", sets: 5, reps: R_FREE },
    ],
  },
  {
    letter: "D",
    title: "Ombro",
    cardioHint: "20–30 min (quase todos os dias)",
    exercises: [
      { name: "Desenvolvimento", sets: 4, reps: R_FREE },
      { name: "Elevação lateral", sets: 4, reps: R_FREE },
      { name: "Elevação frontal", sets: 3, reps: R_FREE },
      { name: "Posterior", sets: 3, reps: R_FREE },
    ],
  },
  {
    letter: "E",
    title: "Braços + Abdômen",
    cardioHint: "20–30 min (quase todos os dias)",
    exercises: [
      { name: "Rosca direta", sets: 4, reps: R_FREE },
      { name: "Rosca martelo", sets: 3, reps: R_FREE },
      { name: "Tríceps corda", sets: 4, reps: R_FREE },
      { name: "Tríceps banco", sets: 3, reps: R_FREE },
      {
        name: "Abdômen",
        sets: 4,
        reps: "4 exercícios",
        notes: "Monte um circuito com 4 movimentos à sua escolha.",
      },
    ],
  },
];

const LEANGAINS_WEEK_DAYS: DayOfWeekKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Leangains — 7 dias (seg–dom): musculação + postura/alongamentos; domingo recuperação leve.
 */
export const SPLIT_LEANGAINS: SplitWorkoutDefinition[] = [
  {
    letter: "Seg",
    title: "Peito superior + ombro lateral + tríceps + postura",
    workoutName:
      "Leangains — Segunda: peito superior, ombro lateral, tríceps e postura",
    cardioHint: "15–20 min leve (após treino)",
    exercises: [
      { name: "Supino inclinado com barra", sets: 4, reps: "6-8" },
      { name: "Supino reto com halter", sets: 3, reps: "8-10" },
      { name: "Crossover (baixo para cima)", sets: 3, reps: "10-12" },
      { name: "Elevação lateral", sets: 4, reps: "12-15" },
      { name: "Paralelas", sets: 3, reps: "até falha" },
      { name: "Tríceps corda", sets: 3, reps: "10-12" },
      {
        name: "Face pull",
        sets: 3,
        reps: "12-15",
        notes: "Postura — ombro saudável, evitar ombro caído.",
      },
      { name: "Retração escapular", sets: 3, reps: "10" },
      { name: "Alongamento de peitoral", sets: 2, reps: "30s" },
    ],
  },
  {
    letter: "Ter",
    title: "Costas (largura) + bíceps + postura",
    workoutName: "Leangains — Terça: costas largas, bíceps e postura",
    cardioHint: "Opcional leve 10–15 min",
    exercises: [
      { name: "Barra fixa", sets: 4, reps: "até falha" },
      { name: "Puxada aberta na frente", sets: 4, reps: "8-10" },
      { name: "Pulldown unilateral", sets: 3, reps: "10-12" },
      { name: "Remada baixa", sets: 3, reps: "10" },
      { name: "Rosca direta", sets: 3, reps: "8-10" },
      { name: "Rosca alternada", sets: 3, reps: "10-12" },
      {
        name: "Face pull",
        sets: 3,
        reps: "12-15",
        notes: "Postura.",
      },
      { name: "Y-raise", sets: 3, reps: "12" },
      { name: "Alongamento dorsal", sets: 2, reps: "30s" },
    ],
  },
  {
    letter: "Qua",
    title: "Pernas + core",
    workoutName: "Leangains — Quarta: pernas e core",
    cardioHint: "Opcional leve ou omitir",
    exercises: [
      { name: "Agachamento livre", sets: 4, reps: "6-8" },
      { name: "Leg press", sets: 3, reps: "10" },
      { name: "Stiff", sets: 3, reps: "8-10" },
      { name: "Cadeira extensora", sets: 3, reps: "12" },
      { name: "Cadeira flexora", sets: 3, reps: "12" },
      { name: "Panturrilha", sets: 4, reps: "12-15" },
      { name: "Prancha", sets: 3, reps: "30-60s" },
      { name: "Abdominal infra", sets: 3, reps: "12-15" },
    ],
  },
  {
    letter: "Qui",
    title: "Ombro completo + peito leve + postura",
    workoutName: "Leangains — Quinta: ombro, peito leve e postura",
    cardioHint: "15–20 min leve",
    exercises: [
      { name: "Elevação lateral", sets: 4, reps: "12-15" },
      { name: "Desenvolvimento com halter", sets: 4, reps: "6-8" },
      { name: "Elevação lateral na máquina", sets: 3, reps: "12-15" },
      { name: "Crucifixo inverso", sets: 3, reps: "12-15" },
      { name: "Supino inclinado leve", sets: 3, reps: "10" },
      {
        name: "Face pull",
        sets: 3,
        reps: "12-15",
        notes: "Postura.",
      },
      { name: "Retração escapular", sets: 3, reps: "10" },
      { name: "Alongamento de peitoral", sets: 2, reps: "30s" },
    ],
  },
  {
    letter: "Sex",
    title: "Costas (espessura) + bíceps + postura",
    workoutName: "Leangains — Sexta: costas densas, bíceps e postura",
    cardioHint: "HIIT 10–15 min",
    exercises: [
      { name: "Remada curvada", sets: 4, reps: "6-8" },
      { name: "Remada cavalinho", sets: 3, reps: "8-10" },
      { name: "Puxada neutra", sets: 3, reps: "10" },
      { name: "Remada unilateral", sets: 3, reps: "10" },
      { name: "Rosca direta", sets: 3, reps: "8-10" },
      { name: "Rosca martelo", sets: 3, reps: "10-12" },
      {
        name: "Face pull",
        sets: 3,
        reps: "12-15",
        notes: "Postura.",
      },
      { name: "Y-raise", sets: 3, reps: "12" },
    ],
  },
  {
    letter: "Sáb",
    title: "Posterior + glúteo + core",
    workoutName: "Leangains — Sábado: posterior de perna, glúteo e core",
    cardioHint: "Opcional leve",
    exercises: [
      { name: "Stiff", sets: 4, reps: "8-10" },
      { name: "Mesa flexora", sets: 3, reps: "12" },
      { name: "Avanço (passada)", sets: 3, reps: "10 c/ perna" },
      { name: "Leg press", sets: 3, reps: "10" },
      { name: "Panturrilha", sets: 4, reps: "12-15" },
      { name: "Prancha", sets: 3, reps: "30-60s" },
      { name: "Abdominal infra", sets: 3, reps: "12-15" },
    ],
  },
  {
    letter: "Dom",
    title: "Recuperação + postura e mobilidade",
    workoutName: "Leangains — Domingo: recuperação leve e postura",
    exercises: [
      {
        name: "Caminhada ou bike",
        sets: 1,
        reps: "20-30 min",
        notes: "Ritmo leve — foco em recuperação.",
      },
      { name: "Alongamento de peitoral", sets: 3, reps: "30s" },
      { name: "Alongamento posterior de coxa", sets: 3, reps: "30s" },
      { name: "Mobilidade coluna (cat-cow)", sets: 2, reps: "10" },
      { name: "Retração escapular", sets: 3, reps: "12" },
      {
        name: "Regras e lembretes Leangains",
        sets: 1,
        reps: "—",
        notes:
          "Progressão semanal (+1 kg ou +1 rep). Descida controlada. Proteína alta. Não pular treino de elevação lateral. Postura no dia a dia: peito aberto, ombros levemente para trás. Cardio ajuda, não substitui dieta. Resumo: ombro lateral + costas = estética; peito superior = torso mais cheio; posterior = harmonia; postura = impacto visual.",
      },
    ],
  },
];

export const SPLIT_DEFINITIONS: Record<SplitKind, SplitWorkoutDefinition[]> = {
  ABC: SPLIT_ABC,
  ABCD: SPLIT_ABCD,
  ABCDE: SPLIT_ABCDE,
  LEANGAINS: SPLIT_LEANGAINS,
};

export type PlannedWorkout = {
  dayOfWeek: DayOfWeekKey;
  definition: SplitWorkoutDefinition;
};

/**
 * Monta o calendário semanal (dia → treino) conforme divisão e frequência.
 */
export function buildWeeklyPlan(kind: SplitKind, abcFrequency: AbcFrequency): PlannedWorkout[] {
  if (kind === "LEANGAINS") {
    return LEANGAINS_WEEK_DAYS.map((dayOfWeek, i) => ({
      dayOfWeek,
      definition: SPLIT_LEANGAINS[i] as SplitWorkoutDefinition,
    }));
  }
  const defs: SplitWorkoutDefinition[] = SPLIT_DEFINITIONS[kind];
  if (kind === "ABC") {
    const days: DayOfWeekKey[] = abcFrequency === 6 ? ABC_6_DAYS : ABC_3_DAYS;
    const cycle: number[] =
      abcFrequency === 6 ? [0, 1, 2, 0, 1, 2] : [0, 1, 2];
    return days.map((dayOfWeek, i) => ({
      dayOfWeek,
      definition: defs[cycle[i] as number] as SplitWorkoutDefinition,
    }));
  }
  if (kind === "ABCD") {
    return ABCD_4_DAYS.map((dayOfWeek, i) => ({
      dayOfWeek,
      definition: defs[i] as SplitWorkoutDefinition,
    }));
  }
  return ABCDE_5_DAYS.map((dayOfWeek, i) => ({
    dayOfWeek,
    definition: defs[i] as SplitWorkoutDefinition,
  }));
}

export function workoutDisplayName(def: SplitWorkoutDefinition): string {
  if (def.workoutName !== undefined && def.workoutName.length > 0) {
    return def.workoutName;
  }
  return `Treino ${def.letter} — ${def.title}`;
}

export function exercisesForInsert(
  def: SplitWorkoutDefinition,
): { name: string; sets: number; reps: string; notes: string }[] {
  const rows: { name: string; sets: number; reps: string; notes: string }[] =
    def.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      notes: ex.notes ?? "",
    }));
  if (def.cardioHint) {
    rows.push({
      name: "Cardio (recomendado)",
      sets: 1,
      reps: def.cardioHint,
      notes: "Após o treino com peso, se couber na sua rotina.",
    });
  }
  return rows;
}
