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
  /** Texto extra do bloco de cardio (ex.: preferir escada). */
  cardioNotes?: string;
  /** Regras gerais da ficha (salvas em `workouts.notes`); valem para todos os exercícios do dia. */
  workoutNotes?: string;
  /** Nome salvo no treino (programas com título próprio, ex.: Leangains). */
  workoutName?: string;
};

export type SplitKind =
  | "ABC"
  | "ABCD"
  | "ABCDE"
  | "FIVE_PPL"
  | "FIVE_UPPER_LOWER"
  | "FORTY_FIVE_MIN"
  | "LEANGAINS";

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

/** Cinco dias (seg–sex): empurrar / puxar / pernas, depois empurrar e puxar de novo. */
const SPLIT_FIVE_PPL: SplitWorkoutDefinition[] = [
  {
    letter: "1",
    title: "Empurrar (A)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Supino reto", sets: 4, reps: R_FREE },
      { name: "Supino inclinado com halter", sets: 4, reps: R_FREE },
      { name: "Desenvolvimento com halter", sets: 3, reps: R_FREE },
      { name: "Elevação lateral", sets: 4, reps: R_FREE },
      { name: "Tríceps corda", sets: 3, reps: R_FREE },
      { name: "Tríceps testa", sets: 3, reps: R_FREE },
    ],
  },
  {
    letter: "2",
    title: "Puxar (A)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Barra fixa ou puxada assistida", sets: 4, reps: R_FREE },
      { name: "Puxada na frente", sets: 4, reps: R_FREE },
      { name: "Remada curvada", sets: 3, reps: R_FREE },
      {
        name: "Face pull",
        sets: 3,
        reps: R_FREE,
        notes: "Ombro e postura — cotovelos altos, puxar em direção ao rosto.",
      },
      { name: "Rosca direta", sets: 3, reps: R_FREE },
      { name: "Rosca martelo", sets: 3, reps: R_FREE },
    ],
  },
  {
    letter: "3",
    title: "Pernas",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Agachamento livre ou smith", sets: 4, reps: R_FREE },
      { name: "Leg press", sets: 4, reps: R_FREE },
      { name: "Stiff ou levantamento terra romeno", sets: 3, reps: R_FREE },
      { name: "Extensora", sets: 3, reps: R_FREE },
      { name: "Mesa flexora ou flexora em pé", sets: 3, reps: R_FREE },
      { name: "Panturrilha em pé", sets: 4, reps: R_FREE },
    ],
  },
  {
    letter: "4",
    title: "Empurrar (B)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Supino inclinado máquina ou smith", sets: 4, reps: R_FREE },
      { name: "Crucifixo com halter ou máquina", sets: 3, reps: R_FREE },
      { name: "Desenvolvimento máquina", sets: 3, reps: R_FREE },
      { name: "Elevação lateral unilateral", sets: 3, reps: R_FREE },
      { name: "Paralelas ou supino fechado", sets: 3, reps: R_FREE },
      { name: "Tríceps francês", sets: 3, reps: R_FREE },
    ],
  },
  {
    letter: "5",
    title: "Puxar (B)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Remada baixa ou T", sets: 4, reps: R_FREE },
      { name: "Puxada pegada neutra ou supinada", sets: 4, reps: R_FREE },
      { name: "Remada serrote com halter", sets: 3, reps: R_FREE },
      { name: "Face pull", sets: 3, reps: R_FREE },
      { name: "Rosca scott", sets: 3, reps: R_FREE },
      { name: "Rosca concentrada", sets: 3, reps: R_FREE },
    ],
  },
];

/** Cinco dias (seg–sex): alternância superior / inferior com foco equilibrado. */
const SPLIT_FIVE_UPPER_LOWER: SplitWorkoutDefinition[] = [
  {
    letter: "1",
    title: "Superior (empurrar)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Supino reto", sets: 4, reps: R_FREE },
      { name: "Supino inclinado", sets: 3, reps: R_FREE },
      { name: "Desenvolvimento com barra ou smith", sets: 4, reps: R_FREE },
      { name: "Elevação lateral", sets: 3, reps: R_FREE },
      { name: "Tríceps corda", sets: 3, reps: R_FREE },
    ],
  },
  {
    letter: "2",
    title: "Inferior (quadríceps e glúteo)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Agachamento livre", sets: 4, reps: R_FREE },
      { name: "Leg press", sets: 4, reps: R_FREE },
      { name: "Avanço ou bulgaro", sets: 3, reps: R_FREE },
      { name: "Extensora", sets: 3, reps: R_FREE },
      { name: "Panturrilha em pé", sets: 4, reps: R_FREE },
    ],
  },
  {
    letter: "3",
    title: "Superior (puxar)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Barra fixa ou puxada", sets: 4, reps: R_FREE },
      { name: "Remada curvada", sets: 4, reps: R_FREE },
      { name: "Puxada unilateral", sets: 3, reps: R_FREE },
      { name: "Rosca direta", sets: 3, reps: R_FREE },
      { name: "Rosca martelo", sets: 3, reps: R_FREE },
    ],
  },
  {
    letter: "4",
    title: "Inferior (posterior e panturrilha)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Stiff ou RDL", sets: 4, reps: R_FREE },
      { name: "Leg press unilateral ou hack", sets: 3, reps: R_FREE },
      { name: "Mesa flexora", sets: 3, reps: R_FREE },
      { name: "Flexora em pé", sets: 3, reps: R_FREE },
      { name: "Panturrilha sentado", sets: 4, reps: R_FREE },
    ],
  },
  {
    letter: "5",
    title: "Superior (ombro e braço)",
    cardioHint: "15–25 min (3–4× na semana)",
    exercises: [
      { name: "Desenvolvimento Arnold ou máquina", sets: 4, reps: R_FREE },
      { name: "Elevação lateral", sets: 4, reps: R_FREE },
      { name: "Elevação posterior ou face pull", sets: 3, reps: R_FREE },
      { name: "Rosca direta", sets: 3, reps: R_FREE },
      { name: "Tríceps testa ou corda", sets: 3, reps: R_FREE },
      {
        name: "Abdômen",
        sets: 3,
        reps: "circuito",
        notes: "3 movimentos à escolha (ex.: prancha, infra, oblíquos).",
      },
    ],
  },
];

const CARDIO_45_HINT = "12–18 min escada";
const CARDIO_45_NOTES: string =
  "Prefira máquina de escada ou subir escadas de forma contínua; ritmo moderado a forte. Sem escada: bike com resistência ou esteira em inclinação. Meta: terminar musculação + cardio em cerca de 40–45 min; se achar \"pouco\", aumente carga ou controle excêntrica — não adicione séries extras.";

/** Regras gerais da ficha 45 min (salvas no treino; valem para todos os exercícios do dia). */
const FORTY_FIVE_WORKOUT_NOTES: string = [
  "Filosofia: menos volume, mais intensidade — fazer menos (bem feito) pode render mais hipertrofia. Em quase todos os movimentos, vá até a falha ou muito perto; o peso certo é o que coloca você na faixa alvo de repetições.",
  "",
  "1) Carga ideal: nem leve demais nem pesado a ponto de destruir a técnica. Meta: falhar entre 6 e 10 repetições com forma boa. Falhou na 4ª? Peso alto demais para foco em hipertrofia — reduza um pouco. Chegou na 12ª ainda fácil? Leve demais — aumente na próxima série.",
  "",
  "2) Falha: série 1 até falha técnica (velocidade cai forte, sticking point, ou mais uma repetição roubaria a forma). Série 2: já fadigado — mantenha o peso ou reduza só ~10% para falhar de novo na mesma faixa (6–10).",
  "",
  "3) Por que não leve com 20 reps até a falha? Gasta muita energia e cardio antes de recrutar bem as fibras que mais respondem a crescimento. Alvo: carga moderada/alta + poucas reps + falha = máximo estímulo no mínimo de tempo na academia.",
  "",
  "4) Quando NÃO ir até a falha: agachamento livre e supino com barra sem spotter ou sem barras de segurança — pare cerca de 1 repetição antes (RPE ~9). Em máquinas e com halteres o risco é menor; aí pode buscar o limite com mais segurança.",
  "",
  "Rotina desta ficha: antes de cada exercício, 1 a 2 séries de aquecimento leves (sem falha). Depois, 2 séries de trabalho. Descanso 2 a 3 minutos entre séries de trabalho. Excêntrica controlada (2–3 s). Anote cargas; progrida com +1 rep ou um pouco mais de peso quando possível. Concentração antes de cada série pesada.",
  "",
  "Resumo: escolha peso que te \"trave\" entre a 6ª e a 10ª repetição; execução limpa até o músculo parar de subir = treino bem feito.",
].join("\n");

/**
 * 45 min — 5 dias (seg–sex): upper/lower + full body leve na sexta; 2 séries de trabalho por exercício.
 */
const SPLIT_FORTY_FIVE_MIN: SplitWorkoutDefinition[] = [
  {
    letter: "Seg",
    title: "Superior — foco em empurrar",
    workoutName: "45 min — Segunda: superior (empurrar)",
    cardioHint: CARDIO_45_HINT,
    cardioNotes: CARDIO_45_NOTES,
    workoutNotes: FORTY_FIVE_WORKOUT_NOTES,
    exercises: [
      {
        name: "Supino inclinado (halteres ou barra)",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Banco ~30–45°; cotovelos ligeiramente fechados em relação à barra; peitoral superior e deltoide anterior. Com barra livre e sem fiscal/rack: pare ~1 rep antes da falha (ver regras da ficha).",
      },
      {
        name: "Desenvolvimento de ombros (sentado)",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Costas apoiadas; sem impulso de pernas; subida controlada; não travar agressivo os cotovelos no topo.",
      },
      {
        name: "Mergulho (paralelas) ou tríceps testa",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Paralelas: tronco levemente inclinado para enfatizar peito/tríceps; amplitude completa. Tríceps testa: cotovelos fixos, carga moderada, técnica impecável.",
      },
      {
        name: "Elevação lateral",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Cotovelos com leve flexão fixa; eleve em arco até altura de ombro; sem balançar o tronco.",
      },
    ],
  },
  {
    letter: "Ter",
    title: "Inferior — foco em quadríceps",
    workoutName: "45 min — Terça: inferior (quadríceps)",
    cardioHint: CARDIO_45_HINT,
    cardioNotes: CARDIO_45_NOTES,
    workoutNotes: FORTY_FIVE_WORKOUT_NOTES,
    exercises: [
      {
        name: "Agachamento (barra ou Smith)",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Profundidade controlada; joelhos alinhados com dedos; peito alto; core firme. Agachamento livre com barra sem rack de segurança: não vá até a falha absoluta (RPE ~9).",
      },
      {
        name: "Leg press 45°",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Pés onde sinta mais quadríceps; não deixe a lombar desgrudar do encosto; amplitude sem perder forma.",
      },
      {
        name: "Extensora",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Segure ~1 s no pico; volta lenta; foco na contração do quadríceps.",
      },
      {
        name: "Panturrilha em pé",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Amplitude completa (calcanhar desce, sobe alto); pausa curta no alongamento se for seguro.",
      },
    ],
  },
  {
    letter: "Qua",
    title: "Superior — foco em puxar",
    workoutName: "45 min — Quarta: superior (puxar)",
    cardioHint: CARDIO_45_HINT,
    cardioNotes: CARDIO_45_NOTES,
    workoutNotes: FORTY_FIVE_WORKOUT_NOTES,
    exercises: [
      {
        name: "Barra fixa ou pulldown",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Escápulas estabilizadas antes de puxar; peito erguido; amplitude controlada; pegada segura.",
      },
      {
        name: "Remada curvada ou remada baixa",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Quadris atrás, coluna neutra; puxe em direção ao quadril; evite arquear a lombar ao falhar.",
      },
      {
        name: "Crucifixo inverso (posterior de ombro)",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Cotovelos abertos; abra o peito e aperte as omoplatas; sem impulso.",
      },
      {
        name: "Rosca direta (barra ou halteres)",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Cotovelos fixos ao lado do corpo; supinação completa com barra reta; sem balançar o quadril.",
      },
    ],
  },
  {
    letter: "Qui",
    title: "Inferior — posterior e glúteo",
    workoutName: "45 min — Quinta: inferior (posterior)",
    cardioHint: CARDIO_45_HINT,
    cardioNotes: CARDIO_45_NOTES,
    workoutNotes: FORTY_FIVE_WORKOUT_NOTES,
    exercises: [
      {
        name: "Stiff ou levantamento terra romeno",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Barra perto das pernas; quadril para trás; joelhos levemente flexionados e estáveis; sentir posterior de coxa.",
      },
      {
        name: "Cadeira flexora",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Encosto ajustado; fase negativa controlada; quadril colado ao banco.",
      },
      {
        name: "Afundo ou passada",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Passo longo o bastante para o joelho de trás quase tocar o chão; tronco ereto; peso no calcanhar da frente.",
      },
      {
        name: "Panturrilha sentado",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Alongar no fundo, contrair no topo; descida devagar — bom para soléu.",
      },
    ],
  },
  {
    letter: "Sex",
    title: "Full body — ajuste e fraquezas",
    workoutName: "45 min — Sexta: full body (ajuste)",
    cardioHint: CARDIO_45_HINT,
    cardioNotes: CARDIO_45_NOTES,
    workoutNotes: FORTY_FIVE_WORKOUT_NOTES,
    exercises: [
      {
        name: "Supino reto",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Sexta: priorize se peito for fraco. Pés firmes; escápulas retraídas; barra na linha dos mamilos. Barra sem spotter: RPE ~9.",
      },
      {
        name: "Remada unilateral",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Sexta: priorize se costas forem fracas. Apoio estável; cotovelo rente ao corpo; mínima rotação de tronco.",
      },
      {
        name: "Prensa de ombros",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Sexta: priorize se ombro for fraco. Trajeto completo; sem bloquear agressivo no topo.",
      },
      {
        name: "Agachamento búlgaro",
        sets: 2,
        reps: "6-10 (falha técnica)",
        notes:
          "Sexta: priorize se perna unilateral ou glúteo forem fracos. Pé da frente firme; joelho alinhado; pé de trás no banco; profundidade controlada.",
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
  FIVE_PPL: SPLIT_FIVE_PPL,
  FIVE_UPPER_LOWER: SPLIT_FIVE_UPPER_LOWER,
  FORTY_FIVE_MIN: SPLIT_FORTY_FIVE_MIN,
  LEANGAINS: SPLIT_LEANGAINS,
};

/** Título curto para listagens (ex.: resumo de exercícios). */
export const SPLIT_KIND_LABELS_PT: Record<SplitKind, string> = {
  ABC: "ABC",
  ABCD: "ABCD",
  ABCDE: "ABCDE",
  FIVE_PPL: "5 dias — empurrar, puxar e pernas",
  FIVE_UPPER_LOWER: "5 dias — superior e inferior",
  FORTY_FIVE_MIN: "45 min — intensidade (5 dias)",
  LEANGAINS: "Leangains (7 dias)",
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
      notes:
        def.cardioNotes ??
        "Após o treino com peso, se couber na sua rotina.",
    });
  }
  return rows;
}
