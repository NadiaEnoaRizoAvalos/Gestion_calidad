import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { canAttemptQuestion, canPractice, questionAnswer, validateExamCatalog } from "../src/data/examCatalog";
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

it("incorpora fielmente las seis preguntas recibidas y deja las fotografías ausentes pendientes", async () => {
  const value: unknown = JSON.parse(await readFile("public/exams/catalog.json", "utf8"));
  validateExamCatalog(value);
  expect(value.exams.map(group => group.title)).toEqual(["Parcial Tema 1", "Parcial Tema 2", "Preguntas importantes"]);
  expect(value.exams.slice(0, 2).every(group => group.materialPending && group.photos.length === 0)).toBe(true);
  expect(value.questions).toHaveLength(6);
  expect(value.questions.map(q => q.number)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(value.questions.map(q => q.prompt)).toEqual([
    "¿Qué es calidad?", "¿Qué es SGC (Sistema de Gestión de la Calidad)?",
    "¿Cuál es el objetivo de la Ley 27.506?", "¿Cómo se relaciona la Ley 27.506 con los Sistemas de Gestión de Calidad?",
    "¿Cuáles son los requisitos de la Ley 27.506?", "¿Qué beneficios concretos otorga la Ley 27.506?",
  ]);
  for (const q of value.questions) {
    expect(q.examId).toBe("preguntas-importantes");
    expect(q.origin).toBe("Pregunta adicional recopilada para estudiar");
    expect(q.photoId).toBeUndefined(); expect(q.verified).toBe(false); expect(q.correct).toBeNull();
    expect(canAttemptQuestion(q)).toBe(true); expect(canPractice(q)).toBe(false); expect(questionAnswer(q)).toBe("");
  }
});

it("admite tipos y numeración original sin atribuir preguntas adicionales a un parcial", () => {
  for (const type of ["choice", "written", "true-false", "selection"]) {
    const q = type === "written" ? { ...question, type, correct: null, options: [], verified: false, number: 8 } : { ...question, type, number: 8 };
    expect(() => validateExamCatalog({ version: 1, exams: [paper], questions: [q] })).not.toThrow();
  }
  const collection = { ...paper, kind: "collection", photos: [] };
  expect(() => validateExamCatalog({ version: 1, exams: [collection], questions: [question] })).toThrow();
  expect(() => validateExamCatalog({ version: 1, exams: [paper], questions: [{ ...question, number: 1 }, { ...question, id: "duplicada", number: 1 }] })).toThrow();
  expect(() => validateExamCatalog({ version: 1, exams: [{ ...paper, photos: [], materialPending: true }], questions: [question] })).toThrow();
});
