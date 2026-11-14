import { describe, expect, it } from "vitest";
import {
  emptyState,
  parseStudyState,
  progress,
  weekCount,
} from "../src/hooks/studyStorage";
import { activities, topics } from "../src/data/topics";
import { questions } from "../src/data/questions";
import { recommendTopics } from "../src/data/recommendations";
import { simulationSteps } from "../src/data/simulation";
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
    expect(state.weeklyGoal).toBe(3);
    expect(progress(state)).toBe(Math.round(100 / activities.length));
  });
  it("cuenta desde el lunes local y excluye otra semana", () => {
    const state = {
      ...emptyState,
      completed: {
        phva: new Date(2026, 10, 9, 0).toISOString(),
        iso: new Date(2026, 10, 8, 23).toISOString(),
        procesos: new Date(2026, 10, 15, 23).toISOString(),
        mapas: new Date(2026, 10, 16, 0).toISOString(),
      },
    };
    expect(weekCount(state, new Date(2026, 10, 14, 12))).toBe(2);
    expect(weekCount(state, new Date(2026, 10, 15, 12))).toBe(2);
    expect(weekCount(state, new Date(2026, 10, 16, 12))).toBe(1);
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
      expect(question.options[question.correct]).toBeTruthy();
      expect(question.origin).toBe("Pregunta de práctica generada con IA");
    }
    for (const step of simulationSteps)
      expect(step.options.filter((option) => option.good)).toHaveLength(1);
  });
});
