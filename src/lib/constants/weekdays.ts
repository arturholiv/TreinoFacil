export const DAY_OF_WEEK_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type DayOfWeekKey = (typeof DAY_OF_WEEK_KEYS)[number];

export const WEEKDAY_LABELS_PT: Record<DayOfWeekKey, string> = {
  sunday: "Domingo",
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
};

export const WEEKDAY_SELECT_OPTIONS: { value: DayOfWeekKey; label: string }[] =
  DAY_OF_WEEK_KEYS.map((value) => ({
    value,
    label: WEEKDAY_LABELS_PT[value],
  }));
