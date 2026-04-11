/**
 * URLs públicas de ilustração por nome do exercício (PT-BR).
 * Fonte principal: wger.de (CC BY-SA). Texto do usuário é normalizado e casado por substring (mais longo primeiro).
 */
const BENCH = "https://wger.de/media/exercise-images/192/Bench-press-1.png";
const INCLINE_BENCH = "https://wger.de/media/exercise-images/61/Incline-bench-press-1.png";
const INCLINE_PRESS = "https://wger.de/media/exercise-images/16/Incline-press-1.png";
const DB_BENCH = "https://wger.de/media/exercise-images/97/Dumbbell-bench-press-1.png";
const CABLE_CROSS = "https://wger.de/media/exercise-images/71/Cable-crossover-2.png";
const INCLINE_CABLE_FLY = "https://wger.de/media/exercise-images/122/Incline-cable-flyes-1.png";
const BUTTERFLY = "https://wger.de/media/exercise-images/98/Butterfly-machine-2.png";
const BENCH_DIP = "https://wger.de/media/exercise-images/83/Bench-dips-1.png";
const TRICEPS_SKULL = "https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-1.png";
const ROPE_CURL = "https://wger.de/media/exercise-images/138/Hammer-curls-with-rope-1.png";
const CHIN_UP = "https://wger.de/media/exercise-images/181/Chin-ups-2.png";
const CABLE_ROW = "https://wger.de/media/exercise-images/143/Cable-seated-rows-2.png";
const T_BAR = "https://wger.de/media/exercise-images/106/T-bar-row-1.png";
const BB_ROW_REVERSE = "https://wger.de/media/exercise-images/70/Reverse-grip-bent-over-rows-1.png";
const REAR_DELT_ROW = "https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png";
const GOOD_MORNING = "https://wger.de/media/exercise-images/116/Good-mornings-2.png";
const FRONT_SQUAT = "https://wger.de/media/exercise-images/191/Front-squat-1-857x1024.png";
const HACK_SQUAT = "https://wger.de/media/exercise-images/130/Narrow-stance-hack-squats-1-1024x721.png";
const WALKING_LUNGE = "https://wger.de/media/exercise-images/113/Walking-lunges-1.png";
const LEG_CURL_SEATED = "https://wger.de/media/exercise-images/117/seated-leg-curl-large-1.png";
const LEG_CURL_LYING = "https://wger.de/media/exercise-images/154/lying-leg-curl-machine-large-1.png";
const LEG_RAISE = "https://wger.de/media/exercise-images/125/Leg-raises-2.png";
const CRUNCH = "https://wger.de/media/exercise-images/91/Crunches-1.png";
const BB_CURL = "https://wger.de/media/exercise-images/129/Standing-biceps-curl-1.png";
const DB_CURL = "https://wger.de/media/exercise-images/81/Biceps-curl-1.png";
const HAMMER_CURL = "https://wger.de/media/exercise-images/86/Bicep-hammer-curl-1.png";
const DB_SHOULDER_PRESS = "https://wger.de/media/exercise-images/123/dumbbell-shoulder-press-large-1.png";
const BB_SHOULDER_PRESS = "https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png";
const SHOULDER_MACHINE = "https://wger.de/media/exercise-images/53/Shoulder-press-machine-2.png";
const LATERAL_RAISE = "https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png";
const HYPEREXT = "https://wger.de/media/exercise-images/128/Hyperextensions-1.png";
const REAR_CABLE_FLY = "https://wger.de/media/exercise-images/822/74affc0d-03b6-4f33-b5f4-a822a2615f68.png";
const LEG_PRESS_MACHINE =
  "https://wger.de/media/exercise-images/371/d2136f96-3a43-4d4c-9944-1919c4ca1ce1.webp";
const DIP_STATION =
  "https://wger.de/media/exercise-images/194/34600351-8b0b-4cb0-8daa-583537be15b0.png";
const CALF_STANDING =
  "https://wger.de/media/exercise-images/622/9a429bd0-afd3-4ad0-8043-e9beec901c81.jpeg";
const CALF_SEATED =
  "https://wger.de/media/exercise-images/1620/edd40e39-e337-4460-a8dd-6127d40ddd16.jpeg";
const BULGARIAN_SPLIT_SQUAT =
  "https://wger.de/media/exercise-images/988/6283b258-a4d7-4833-84f7-a38987022d3d.png";
const HIP_THRUST =
  "https://wger.de/media/exercise-images/1614/7f3cfae2-e062-4211-9a6b-5a10851ce7f4.jpg";
const AB_WHEEL =
  "https://wger.de/media/exercise-images/1573/a9ab402b-61ef-4d60-b91a-df52bf7f41a9.jpg";
const SIDE_PLANK =
  "https://wger.de/media/exercise-images/458/b7bd9c28-9f1d-4647-bd17-ab6a3adf5770.png";
const HIP_ABDUCTION_MACHINE =
  "https://wger.de/media/exercise-images/1748/923a3ff7-c269-49bd-9f03-697151a40f06.jpg";

type IllustrationRule = {
  readonly needle: string;
  readonly url: string;
};

/** Ordem: frases mais específicas primeiro. */
const ILLUSTRATION_RULES: readonly IllustrationRule[] = [
  { needle: "hip thrust leve", url: HIP_THRUST },
  { needle: "hip thrust", url: HIP_THRUST },
  { needle: "ab wheel", url: AB_WHEEL },
  { needle: "back extension", url: HYPEREXT },
  { needle: "prancha lateral", url: SIDE_PLANK },
  { needle: "cable crunch", url: CRUNCH },
  { needle: "elevação de pernas", url: LEG_RAISE },
  { needle: "abdução", url: HIP_ABDUCTION_MACHINE },
  { needle: "puxada alta aberta", url: CHIN_UP },
  { needle: "leg press (pe alto", url: LEG_PRESS_MACHINE },
  { needle: "mesa flexora unilateral", url: LEG_CURL_LYING },
  { needle: "step-up", url: WALKING_LUNGE },
  { needle: "bridge", url: HIP_THRUST },
  { needle: "rosca biceps", url: BB_CURL },
  { needle: "rosca + triceps", url: BB_CURL },
  { needle: "mobilidade de quadril", url: WALKING_LUNGE },
  { needle: "agachamento búlgaro", url: BULGARIAN_SPLIT_SQUAT },
  { needle: "prensa de ombros", url: SHOULDER_MACHINE },
  { needle: "panturrilha sentado", url: CALF_SEATED },
  { needle: "panturrilha em pé", url: CALF_STANDING },
  { needle: "leg press 45", url: LEG_PRESS_MACHINE },
  { needle: "mergulho (paralelas", url: DIP_STATION },
  { needle: "mergulho", url: DIP_STATION },
  { needle: "levantamento terra romeno", url: GOOD_MORNING },
  { needle: "desenvolvimento de ombros", url: BB_SHOULDER_PRESS },
  { needle: "supino inclinado (halteres", url: INCLINE_PRESS },
  { needle: "supino inclinado com barra", url: INCLINE_BENCH },
  { needle: "supino inclinado halter", url: INCLINE_PRESS },
  { needle: "supino inclinado leve", url: INCLINE_BENCH },
  { needle: "supino reto com halter", url: DB_BENCH },
  { needle: "supino inclinado", url: INCLINE_BENCH },
  { needle: "supino reto", url: BENCH },
  { needle: "crossover (baixo", url: CABLE_CROSS },
  { needle: "cross over", url: CABLE_CROSS },
  { needle: "cross", url: CABLE_CROSS },
  { needle: "crucifixo inverso (posterior", url: REAR_CABLE_FLY },
  { needle: "crucifixo inverso", url: REAR_CABLE_FLY },
  { needle: "crucifixo máquina", url: BUTTERFLY },
  { needle: "crucifixo", url: INCLINE_CABLE_FLY },
  { needle: "paralelas", url: BENCH_DIP },
  { needle: "tríceps corda", url: ROPE_CURL },
  { needle: "tríceps testa", url: TRICEPS_SKULL },
  { needle: "tríceps banco", url: BENCH_DIP },
  { needle: "barra fixa ou pulldown", url: CHIN_UP },
  { needle: "barra fixa", url: CHIN_UP },
  { needle: "puxada aberta", url: CHIN_UP },
  { needle: "puxada neutra", url: BB_ROW_REVERSE },
  { needle: "pulldown unilateral", url: CHIN_UP },
  { needle: "puxada na frente", url: CHIN_UP },
  { needle: "puxada frente", url: CHIN_UP },
  { needle: "puxada", url: CHIN_UP },
  { needle: "remada cavalinho", url: T_BAR },
  { needle: "remada unilateral", url: CABLE_ROW },
  { needle: "remada curvada ou remada baixa", url: BB_ROW_REVERSE },
  { needle: "remada curvada", url: BB_ROW_REVERSE },
  { needle: "remada baixa", url: CABLE_ROW },
  { needle: "remada", url: CABLE_ROW },
  { needle: "pullover", url: INCLINE_CABLE_FLY },
  { needle: "desenvolvimento com halter", url: DB_SHOULDER_PRESS },
  { needle: "desenvolvimento", url: BB_SHOULDER_PRESS },
  { needle: "elevação lateral na máquina", url: SHOULDER_MACHINE },
  { needle: "elevação lateral", url: LATERAL_RAISE },
  { needle: "elevação frontal", url: LATERAL_RAISE },
  { needle: "posterior", url: REAR_CABLE_FLY },
  { needle: "rosca martelo", url: HAMMER_CURL },
  { needle: "rosca alternada", url: DB_CURL },
  { needle: "rosca direta (barra", url: BB_CURL },
  { needle: "rosca direta", url: BB_CURL },
  { needle: "agachamento (barra", url: FRONT_SQUAT },
  { needle: "agachamento livre", url: FRONT_SQUAT },
  { needle: "agachamento", url: FRONT_SQUAT },
  { needle: "leg press", url: LEG_PRESS_MACHINE },
  { needle: "cadeira extensora", url: HACK_SQUAT },
  { needle: "extensora", url: HACK_SQUAT },
  { needle: "mesa flexora", url: LEG_CURL_LYING },
  { needle: "cadeira flexora", url: LEG_CURL_SEATED },
  { needle: "flexora", url: LEG_CURL_SEATED },
  { needle: "stiff", url: GOOD_MORNING },
  { needle: "afundo ou passada", url: WALKING_LUNGE },
  { needle: "avanço (passada)", url: WALKING_LUNGE },
  { needle: "panturrilha", url: CALF_STANDING },
  { needle: "abdômen", url: CRUNCH },
  { needle: "abdominal infra", url: LEG_RAISE },
  { needle: "prancha", url: HYPEREXT },
  { needle: "face pull", url: REAR_CABLE_FLY },
  { needle: "y-raise", url: LATERAL_RAISE },
  { needle: "retração escapular", url: REAR_DELT_ROW },
  { needle: "alongamento dorsal", url: HYPEREXT },
  { needle: "alongamento de peitoral", url: INCLINE_CABLE_FLY },
  { needle: "alongamento posterior", url: LEG_CURL_LYING },
  { needle: "mobilidade coluna", url: HYPEREXT },
  { needle: "supino", url: BENCH },
  { needle: "rosca", url: BB_CURL },
  { needle: "tríceps", url: TRICEPS_SKULL },
  { needle: "perna", url: HACK_SQUAT },
];

const SKIP_PATTERN =
  /cardio|caminhada|bike|recupera|hiit|opcional|omitir|^\s*—\s*$/i;

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function normalizeExerciseIllustrationKey(name: string): string {
  return stripDiacritics(name).toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Retorna URL de ilustração quando houver regra conhecida; senão null.
 */
export function getExerciseIllustrationUrl(exerciseName: string): string | null {
  const key: string = normalizeExerciseIllustrationKey(exerciseName);
  if (key.length < 2 || SKIP_PATTERN.test(exerciseName)) {
    return null;
  }
  for (const rule of ILLUSTRATION_RULES) {
    const needleKey: string = normalizeExerciseIllustrationKey(rule.needle);
    if (needleKey.length >= 2 && key.includes(needleKey)) {
      return rule.url;
    }
  }
  return null;
}
