import { dateToYmd } from "@/lib/utils/checkin-heatmap";

export const SIXTY_DAY_CHALLENGE_TOTAL_DAYS = 60;

export const SIXTY_DAY_STAKE_DEFAULT_REAIS = 2000;

export const SIXTY_DAY_PENALTY_NO_WORKOUT_REAIS = 50;

export const SIXTY_DAY_PENALTY_NO_CARDIO_REAIS = 20;

export const SIXTY_DAY_PENALTY_BAD_DIET_REAIS = 30;

/** Mínimo de dias com registro para avaliar derrota por consistência. */
export const SIXTY_DAY_CONSISTENCY_MIN_ELIGIBLE_DAYS = 14;

/** Taxa mínima de dias de treino OK entre dias já “fechados” (hoje só entra se houver registro). */
export const SIXTY_DAY_LOSE_CONSISTENCY_RATE = 0.7;

/** Vitória: treino OK em pelo menos esta fração dos 60 dias. */
export const SIXTY_DAY_WIN_WORKOUT_RATE = 0.85;

/** Vitória: no máximo este número de dias com treino explicitamente NÃO. */
export const SIXTY_DAY_WIN_MAX_EXPLICIT_WORKOUT_FAILS = 2;

/** Vitória: no máximo dias com dieta ruim (diet_ok === false). */
export const SIXTY_DAY_WIN_MAX_BAD_DIET_DAYS = 3;

export type SixtyDayChallengeStatus = "active" | "won" | "lost" | "abandoned";

export type SixtyDayChallengeDayRow = {
  log_date: string;
  workout_ok: boolean;
  cardio_ok: boolean;
  diet_ok: boolean;
  sleep_ok: boolean;
};

export type SixtyDayEvaluation = {
  outcome: SixtyDayChallengeStatus;
  lostReasons: readonly string[];
  remainingStakeReais: number;
  totalPenaltiesReais: number;
  perfectStreak: number;
  combo7Unlocked: boolean;
  combo14Unlocked: boolean;
  currentDayIndex: number;
  endYmd: string;
  workoutOkInWindow: number;
  explicitWorkoutFails: number;
  badDietDays: number;
};

export function addDaysToYmd(ymd: string, deltaDays: number): string {
  const parts: number[] = ymd.split("-").map((s: string) => Number.parseInt(s, 10));
  const y: number = parts[0] ?? 0;
  const m: number = parts[1] ?? 1;
  const d: number = parts[2] ?? 1;
  const date: Date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return dateToYmd(date);
}

export function compareYmd(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function minYmd(a: string, b: string): string {
  return compareYmd(a, b) <= 0 ? a : b;
}

export function getSixtyDayChallengeEndYmd(startYmd: string): string {
  return addDaysToYmd(startYmd, SIXTY_DAY_CHALLENGE_TOTAL_DAYS - 1);
}

export function getSixtyDayChallengeDayIndex(startYmd: string, todayYmd: string): number {
  if (compareYmd(todayYmd, startYmd) < 0) {
    return 0;
  }
  const endYmd: string = getSixtyDayChallengeEndYmd(startYmd);
  const clamped: string = minYmd(todayYmd, endYmd);
  let idx = 1;
  let ymd: string = startYmd;
  while (ymd !== clamped) {
    ymd = addDaysToYmd(ymd, 1);
    idx++;
  }
  return idx;
}

export function buildSixtyDayMap(
  rows: readonly SixtyDayChallengeDayRow[],
): Map<string, SixtyDayChallengeDayRow> {
  const map: Map<string, SixtyDayChallengeDayRow> = new Map();
  for (const row of rows) {
    map.set(row.log_date, row);
  }
  return map;
}

export function computeSixtyDayPenaltyForDay(day: SixtyDayChallengeDayRow): number {
  let total = 0;
  if (!day.workout_ok) {
    total += SIXTY_DAY_PENALTY_NO_WORKOUT_REAIS;
  }
  if (!day.cardio_ok) {
    total += SIXTY_DAY_PENALTY_NO_CARDIO_REAIS;
  }
  if (!day.diet_ok) {
    total += SIXTY_DAY_PENALTY_BAD_DIET_REAIS;
  }
  return total;
}

export function computeSixtyDayTotalPenaltiesReais(
  rows: readonly SixtyDayChallengeDayRow[],
): number {
  return rows.reduce((acc: number, row: SixtyDayChallengeDayRow) => {
    return acc + computeSixtyDayPenaltyForDay(row);
  }, 0);
}

export function computeSixtyDayPerfectStreak(
  dayMap: ReadonlyMap<string, SixtyDayChallengeDayRow>,
  startYmd: string,
  anchorYmd: string,
): number {
  let streak = 0;
  for (
    let ymd: string = anchorYmd;
    compareYmd(ymd, startYmd) >= 0;
    ymd = addDaysToYmd(ymd, -1)
  ) {
    const row: SixtyDayChallengeDayRow | undefined = dayMap.get(ymd);
    if (
      !row ||
      !row.workout_ok ||
      !row.cardio_ok ||
      !row.diet_ok ||
      !row.sleep_ok
    ) {
      break;
    }
    streak++;
  }
  return streak;
}

function hasThreeConsecutiveWorkoutFailure(input: {
  dayMap: ReadonlyMap<string, SixtyDayChallengeDayRow>;
  startYmd: string;
  lastYmdInclusive: string;
  todayYmd: string;
}): boolean {
  let streak = 0;
  for (
    let ymd: string = input.startYmd;
    compareYmd(ymd, input.lastYmdInclusive) <= 0;
    ymd = addDaysToYmd(ymd, 1)
  ) {
    const row: SixtyDayChallengeDayRow | undefined = input.dayMap.get(ymd);
    let isWorkoutOk: boolean;
    if (compareYmd(ymd, input.todayYmd) < 0) {
      isWorkoutOk = row?.workout_ok === true;
    } else if (ymd === input.todayYmd) {
      if (!row) {
        streak = 0;
        continue;
      }
      isWorkoutOk = row.workout_ok === true;
    } else {
      break;
    }
    if (!isWorkoutOk) {
      streak++;
      if (streak >= 3) {
        return true;
      }
    } else {
      streak = 0;
    }
  }
  return false;
}

function computeClosedDayWorkoutConsistency(input: {
  dayMap: ReadonlyMap<string, SixtyDayChallengeDayRow>;
  startYmd: string;
  todayYmd: string;
  windowEndYmd: string;
}): { eligible: number; hits: number } {
  let eligible = 0;
  let hits = 0;
  const last: string = minYmd(input.windowEndYmd, addDaysToYmd(input.todayYmd, -1));
  if (compareYmd(last, input.startYmd) < 0) {
    return { eligible: 0, hits: 0 };
  }
  for (
    let ymd: string = input.startYmd;
    compareYmd(ymd, last) <= 0;
    ymd = addDaysToYmd(ymd, 1)
  ) {
    eligible++;
    if (input.dayMap.get(ymd)?.workout_ok === true) {
      hits++;
    }
  }
  const todayRow: SixtyDayChallengeDayRow | undefined = input.dayMap.get(input.todayYmd);
  if (
    compareYmd(input.todayYmd, input.startYmd) >= 0 &&
    compareYmd(input.todayYmd, input.windowEndYmd) <= 0 &&
    todayRow !== undefined
  ) {
    eligible++;
    if (todayRow.workout_ok) {
      hits++;
    }
  }
  return { eligible, hits };
}

function countWindowStats(input: {
  dayMap: ReadonlyMap<string, SixtyDayChallengeDayRow>;
  startYmd: string;
  endYmd: string;
}): { workoutOk: number; explicitWorkoutFail: number; badDiet: number } {
  let workoutOk = 0;
  let explicitWorkoutFail = 0;
  let badDiet = 0;
  for (
    let ymd: string = input.startYmd;
    compareYmd(ymd, input.endYmd) <= 0;
    ymd = addDaysToYmd(ymd, 1)
  ) {
    const row: SixtyDayChallengeDayRow | undefined = input.dayMap.get(ymd);
    if (row?.workout_ok === true) {
      workoutOk++;
    } else if (row && row.workout_ok === false) {
      explicitWorkoutFail++;
    }
    if (row && row.diet_ok === false) {
      badDiet++;
    }
  }
  return { workoutOk, explicitWorkoutFail, badDiet };
}

export function evaluateSixtyDayChallenge(input: {
  status: SixtyDayChallengeStatus;
  startYmd: string;
  stakeReais: number;
  stoppedCardio: boolean;
  todayYmd: string;
  dayRows: readonly SixtyDayChallengeDayRow[];
}): SixtyDayEvaluation {
  const endYmd: string = getSixtyDayChallengeEndYmd(input.startYmd);
  const dayMap: Map<string, SixtyDayChallengeDayRow> = buildSixtyDayMap(input.dayRows);
  const totalPenalties: number = computeSixtyDayTotalPenaltiesReais(input.dayRows);
  const remainingStake: number = Math.max(0, input.stakeReais - totalPenalties);
  const perfectStreak: number = computeSixtyDayPerfectStreak(
    dayMap,
    input.startYmd,
    minYmd(input.todayYmd, endYmd),
  );
  const currentDayIndex: number = getSixtyDayChallengeDayIndex(input.startYmd, input.todayYmd);
  const lostReasons: string[] = [];
  if (input.status === "abandoned") {
    return {
      outcome: "abandoned",
      lostReasons: ["Plano abandonado."],
      remainingStakeReais: remainingStake,
      totalPenaltiesReais: totalPenalties,
      perfectStreak,
      combo7Unlocked: perfectStreak >= 7,
      combo14Unlocked: perfectStreak >= 14,
      currentDayIndex,
      endYmd,
      workoutOkInWindow: 0,
      explicitWorkoutFails: 0,
      badDietDays: 0,
    };
  }
  if (input.status === "won" || input.status === "lost") {
    const stats = countWindowStats({
      dayMap,
      startYmd: input.startYmd,
      endYmd: endYmd,
    });
    return {
      outcome: input.status,
      lostReasons,
      remainingStakeReais: remainingStake,
      totalPenaltiesReais: totalPenalties,
      perfectStreak,
      combo7Unlocked: perfectStreak >= 7,
      combo14Unlocked: perfectStreak >= 14,
      currentDayIndex,
      endYmd,
      workoutOkInWindow: stats.workoutOk,
      explicitWorkoutFails: stats.explicitWorkoutFail,
      badDietDays: stats.badDiet,
    };
  }
  const windowStats = countWindowStats({
    dayMap,
    startYmd: input.startYmd,
    endYmd: endYmd,
  });
  if (input.stoppedCardio) {
    lostReasons.push("Cardio interrompido (declarado).");
  }
  if (
    hasThreeConsecutiveWorkoutFailure({
      dayMap,
      startYmd: input.startYmd,
      lastYmdInclusive: minYmd(input.todayYmd, endYmd),
      todayYmd: input.todayYmd,
    })
  ) {
    lostReasons.push("3 dias seguidos sem treino.");
  }
  const consistency = computeClosedDayWorkoutConsistency({
    dayMap,
    startYmd: input.startYmd,
    todayYmd: input.todayYmd,
    windowEndYmd: endYmd,
  });
  if (
    consistency.eligible >= SIXTY_DAY_CONSISTENCY_MIN_ELIGIBLE_DAYS &&
    consistency.hits / consistency.eligible < SIXTY_DAY_LOSE_CONSISTENCY_RATE
  ) {
    lostReasons.push("Consistência de treino abaixo de 70%.");
  }
  const afterEnd: boolean = compareYmd(input.todayYmd, endYmd) > 0;
  if (afterEnd) {
    const minWorkoutDays: number = Math.ceil(
      SIXTY_DAY_CHALLENGE_TOTAL_DAYS * SIXTY_DAY_WIN_WORKOUT_RATE,
    );
    const streakLossFullWindow: boolean = hasThreeConsecutiveWorkoutFailure({
      dayMap,
      startYmd: input.startYmd,
      lastYmdInclusive: endYmd,
      todayYmd: input.todayYmd,
    });
    const baseClear: boolean =
      lostReasons.length === 0 && !input.stoppedCardio && !streakLossFullWindow;
    const meetsWorkoutRate: boolean = windowStats.workoutOk >= minWorkoutDays;
    const meetsExplicitFails: boolean =
      windowStats.explicitWorkoutFail <= SIXTY_DAY_WIN_MAX_EXPLICIT_WORKOUT_FAILS;
    const meetsDiet: boolean = windowStats.badDiet <= SIXTY_DAY_WIN_MAX_BAD_DIET_DAYS;
    const winOk: boolean =
      baseClear && meetsWorkoutRate && meetsExplicitFails && meetsDiet;
    if (winOk) {
      return {
        outcome: "won",
        lostReasons: [],
        remainingStakeReais: remainingStake,
        totalPenaltiesReais: totalPenalties,
        perfectStreak,
        combo7Unlocked: perfectStreak >= 7,
        combo14Unlocked: perfectStreak >= 14,
        currentDayIndex,
        endYmd,
        workoutOkInWindow: windowStats.workoutOk,
        explicitWorkoutFails: windowStats.explicitWorkoutFail,
        badDietDays: windowStats.badDiet,
      };
    }
    const finalReasons: string[] = [...lostReasons];
    if (
      input.stoppedCardio &&
      !finalReasons.some((r: string) => r.includes("Cardio interrompido"))
    ) {
      finalReasons.push("Cardio interrompido (declarado).");
    }
    if (
      streakLossFullWindow &&
      !finalReasons.some((r: string) => r.includes("3 dias seguidos sem treino"))
    ) {
      finalReasons.push("3 dias seguidos sem treino.");
    }
    if (!meetsWorkoutRate) {
      finalReasons.push(
        `Menos de ${Math.round(SIXTY_DAY_WIN_WORKOUT_RATE * 100)}% dos dias com treino OK (mín. ${minWorkoutDays} de ${SIXTY_DAY_CHALLENGE_TOTAL_DAYS}).`,
      );
    }
    if (!meetsExplicitFails) {
      finalReasons.push(
        `Mais de ${SIXTY_DAY_WIN_MAX_EXPLICIT_WORKOUT_FAILS} treinos marcados como não feitos.`,
      );
    }
    if (!meetsDiet) {
      finalReasons.push(
        `Mais de ${SIXTY_DAY_WIN_MAX_BAD_DIET_DAYS} dias com dieta ruim.`,
      );
    }
    return {
      outcome: "lost",
      lostReasons: finalReasons,
      remainingStakeReais: remainingStake,
      totalPenaltiesReais: totalPenalties,
      perfectStreak,
      combo7Unlocked: perfectStreak >= 7,
      combo14Unlocked: perfectStreak >= 14,
      currentDayIndex,
      endYmd,
      workoutOkInWindow: windowStats.workoutOk,
      explicitWorkoutFails: windowStats.explicitWorkoutFail,
      badDietDays: windowStats.badDiet,
    };
  }
  if (lostReasons.length > 0) {
    return {
      outcome: "lost",
      lostReasons,
      remainingStakeReais: remainingStake,
      totalPenaltiesReais: totalPenalties,
      perfectStreak,
      combo7Unlocked: perfectStreak >= 7,
      combo14Unlocked: perfectStreak >= 14,
      currentDayIndex,
      endYmd,
      workoutOkInWindow: windowStats.workoutOk,
      explicitWorkoutFails: windowStats.explicitWorkoutFail,
      badDietDays: windowStats.badDiet,
    };
  }
  return {
    outcome: "active",
    lostReasons,
    remainingStakeReais: remainingStake,
    totalPenaltiesReais: totalPenalties,
    perfectStreak,
    combo7Unlocked: perfectStreak >= 7,
    combo14Unlocked: perfectStreak >= 14,
    currentDayIndex,
    endYmd,
    workoutOkInWindow: windowStats.workoutOk,
    explicitWorkoutFails: windowStats.explicitWorkoutFail,
    badDietDays: windowStats.badDiet,
  };
}
