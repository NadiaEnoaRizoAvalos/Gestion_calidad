import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { canPractice, questionAnswer, validateExamCatalog } from "../src/data/examCatalog";
import { recommendTopics } from "../src/data/recommendations";
import { emptyState } from "../src/hooks/studyStorage";
import type { Question } from "../src/types";

const question: Question = { id: "prueba", examId: "examen", topic: "Tema de prueba", prompt: "Pregunta exclusiva de prueba", type: "choice", options: ["a", "b"], correct: 1, verified: true, explanation: "Explicación de prueba", tags: [], origin: "Parcial anterior" };
const paper = { id: "examen", title: "Examen de prueba", topic: "Tema de prueba", photos: [{ id: "foto", src: "exams/images/prueba.png", alt: "Fotografía exclusiva de prueba" }] };

it("valida el catálogo real y sus archivos sin agregar parciales inventados", async () => {
  const value: unknown = JSON.parse(await readFile("public/exams/catalog.json", "utf8"));
  validateExamCatalog(value);
  for (const exam of value.exams) for (const photo of exam.photos) expect((await readFile(`public/${photo.src}`)).length).toBeGreaterThan(0);
});
it("acepta opciones verificadas, modelos y preguntas pendientes sin atribuirles respuestas", () => {
  const written = { ...question, id: "escrita", type: "written" as const, options: [], correct: null, modelAnswer: "Modelo de prueba" };
  const pending = { ...question, id: "pendiente", verified: false, correct: null, photoId: "foto" };
  expect(() => validateExamCatalog({ version: 1, exams: [paper], questions: [question, written, pending] })).not.toThrow();
  expect(canPractice(written)).toBe(true);
  expect(questionAnswer(written)).toBe("Modelo de prueba");
  expect(canPractice(pending)).toBe(false);
  expect(questionAnswer(pending)).toBe("");
  expect(canPractice({ ...question, verified: false })).toBe(false);
  expect(questionAnswer({ ...question, verified: false })).toBe("");
});
it("rechaza rutas inseguras, referencias rotas, respuestas inválidas y IDs duplicados", () => {
  for (const src of ["../privado.png", "https://example.org/private.png", "exams/images/../privado.png", "exams/images/a.svg"]) {
    expect(() => validateExamCatalog({ version: 1, exams: [{ ...paper, photos: [{ ...paper.photos[0], src }] }], questions: [] })).toThrow();
  }
  for (const q of [{ ...question, examId: "inexistente" }, { ...question, photoId: "otra" }, { ...question, correct: 99 }, { ...question, verified: true, correct: null }]) {
    expect(() => validateExamCatalog({ version: 1, exams: [paper], questions: [q] })).toThrow();
  }
  expect(() => validateExamCatalog({ version: 1, exams: [paper], questions: [question, question] })).toThrow();
  expect(() => validateExamCatalog({ version: 1, exams: [{ ...paper, date: "2026-02-30" }], questions: [] })).toThrow();
});
it("repasa preguntas reales y retira la recomendación tras un nuevo acierto", () => {
  const state = { ...emptyState, attempts: [{ id: "a", date: "2026-11-14", mode: "parcial" as const, answers: [{ questionId: question.id, correct: false }] }] };
  const topics = [{ id: question.topic, title: question.topic }];
  expect(recommendTopics(state, [question], topics)).toHaveLength(1);
  expect(recommendTopics(state, [{ ...question, verified: false }], topics)).toHaveLength(0);
  state.attempts.push({ id: "b", date: "2026-11-15", mode: "parcial", answers: [{ questionId: question.id, correct: true }] });
  expect(recommendTopics(state, [question], topics)).toHaveLength(0);
});
