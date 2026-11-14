import { activities } from "../data/topics";
import type { StudyState } from "../types";

export const storageKey = "gestion-calidad-estudio-v1";
export const emptyState: StudyState = {
  completed: {},
  bookmarked: [],
  nextStudy: "",
  weeklyGoal: 3,
  attempts: [],
};

export function parseStudyState(value: string | null): StudyState {
  if (!value) return { ...emptyState };
  try {
    const data = JSON.parse(value);
    const ids = new Set(activities.map((activity) => activity.id));
    return {
      completed: Object.fromEntries(
        Object.entries(data.completed ?? {}).filter(
          (entry): entry is [string, string] =>
            (ids.has(entry[0]) || /^notion-[a-f0-9]{32}$/.test(entry[0])) &&
            typeof entry[1] === "string" &&
            Number.isFinite(Date.parse(entry[1])),
        ),
      ),
      bookmarked: Array.isArray(data.bookmarked)
        ? data.bookmarked.filter((id: unknown) => typeof id === "string")
        : [],
      nextStudy:
        typeof data.nextStudy === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(data.nextStudy) &&
        Number.isFinite(Date.parse(`${data.nextStudy}T12:00:00`))
          ? data.nextStudy
          : "",
      weeklyGoal:
        Number.isInteger(data.weeklyGoal) &&
        data.weeklyGoal >= 1 &&
        data.weeklyGoal <= 20
          ? data.weeklyGoal
          : 3,
      attempts: Array.isArray(data.attempts)
        ? data.attempts.filter((attempt: unknown) => {
            if (!attempt || typeof attempt !== "object") return false;
            const a = attempt as Record<string, unknown>;
            return (
              typeof a.id === "string" &&
              typeof a.date === "string" &&
              Number.isFinite(Date.parse(a.date)) &&
              (a.mode === "parcial" || a.mode === "repaso") &&
              Array.isArray(a.answers) &&
              a.answers.length > 0 &&
              a.answers.every(
                (answer: unknown) =>
                  !!answer &&
                  typeof answer === "object" &&
                  typeof (answer as Record<string, unknown>).questionId ===
                    "string" &&
                  typeof (answer as Record<string, unknown>).correct ===
                    "boolean",
              )
            );
          })
        : [],
    };
  } catch {
    return { ...emptyState };
  }
}

export function weekCount(state: StudyState, today = new Date()): number {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return Object.values(state.completed).filter(
    (date) => new Date(date) >= start && new Date(date) < end,
  ).length;
}

export function progress(state: StudyState): number {
  return Math.round(
    (activities.filter((activity) => state.completed[activity.id]).length /
      activities.length) *
      100,
  );
}
