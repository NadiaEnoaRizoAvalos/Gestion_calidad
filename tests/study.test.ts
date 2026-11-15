import { describe, expect, it } from "vitest";
import {
  emptyState,
  parseStudyState,
  progress,
  daysUntilExam,
  validCalendarDate,
} from "../src/hooks/studyStorage";
import { activities, topics } from "../src/data/topics";
import { questions } from "../src/data/questions";
import { recommendTopics } from "../src/data/recommendations";
import type { StudyState } from "../src/types";

describe("Persistencia y progreso", () => {
  it("recupera un estado inicial ante datos dañados", () => {
    for (const value of [
      null,
      "no json",
      "null",
      '{"completed":null,"attempts":[null,{}]}',
    ]) {
      expect(parseStudyState(value)).toEqual(emptyState);
    }
  });
  it("conserva solo actividades y resultados válidos", () => {
    const state = parseStudyState(
      JSON.stringify({
        completed: {
          phva: "2026-11-14T12:00:00Z",
          inventada: "2026-11-14",
          iso: "sin fecha",
        },
        weeklyGoal: -3,
        attempts: [
          {
            id: "a",
            date: "2026-11-14",
            mode: "repaso",
            answers: [{ questionId: "q-phva", correct: false }],
          },
          { id: "bad", date: "ayer", answers: [] },
        ],
      }),
    );
    expect(Object.keys(state.completed)).toEqual(["phva"]);
    expect(state.attempts).toHaveLength(1);
    expect(state.examDate).toBe("");
    expect(progress(state)).toBe(0);
  });
  it("calcula días de calendario y valida fechas reales", () => {
    const today = new Date(2026, 10, 14, 23, 59);
    expect(daysUntilExam("2026-11-25", today)).toBe(11);
    expect(daysUntilExam("2026-11-14", today)).toBe(0);
    expect(daysUntilExam("2026-11-13", today)).toBe(-1);
    expect(daysUntilExam("", today)).toBeNull();
    expect(validCalendarDate("2026-02-30")).toBe(false);
    expect(validCalendarDate("2028-02-29")).toBe(true);
    expect(daysUntilExam("2026-03-09", new Date(2026, 2, 7, 23, 59))).toBe(2);
  });
  it("conserva los avances vigentes y la fecha sin contar secciones retiradas", () => {
    const state = parseStudyState(JSON.stringify({ completed: { simulador: "2026-11-14", mapa: "2026-11-14", phva: "2026-11-14" }, examDate: "2026-11-25", weeklyGoal: 3, nextStudy: "2026-11-20" }));
    expect(state.examDate).toBe("2026-11-25");
    expect(state.completed).toEqual({ mapa: "2026-11-14", phva: "2026-11-14" });
    expect(progress(state)).toBe(Math.round(100 / activities.length));
    expect(activities.some(activity => activity.path === "/simulador" || activity.path === "/apuntes")).toBe(false);
  });
  it("alcanza 100% solo con todas las actividades", () => {
    expect(progress(emptyState)).toBe(0);
    expect(
      progress({
        ...emptyState,
        completed: Object.fromEntries(
          activities.map((a) => [a.id, new Date().toISOString()]),
        ),
      }),
    ).toBe(100);
  });
});

describe("Recomendaciones basadas en respuestas reales", () => {
  it("no inventa recomendaciones si no hay intentos", () =>
    expect(recommendTopics(emptyState)).toEqual([]));
  it("recomienda un error y lo retira después de un acierto", () => {
    const state: StudyState = {
      ...emptyState,
      attempts: [
        {
          id: "1",
          date: "2026-11-14",
          mode: "repaso",
          answers: [{ questionId: "q-phva", correct: false }],
        },
      ],
    };
    expect(recommendTopics(state).map((item) => item.topic.id)).toEqual([
      "phva",
    ]);
    state.attempts.push({
      id: "2",
      date: "2026-11-14",
      mode: "repaso",
      answers: [{ questionId: "q-phva", correct: true }],
    });
    expect(recommendTopics(state)).toEqual([]);
  });
});

describe("Coherencia del material educativo", () => {
  it("mantiene IDs únicos, temas existentes y respuestas dentro de las opciones", () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const question of questions) {
      expect(topics.some((topic) => topic.id === question.topic)).toBe(true);
      expect(question.correct !== null && question.options[question.correct]).toBeTruthy();
      expect(question.origin).toBe("Pregunta de práctica generada con IA");
    }
  });
});
