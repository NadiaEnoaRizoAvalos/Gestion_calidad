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

it("conserva fielmente las seis preguntas importantes sin atribuirlas a los parciales", async () => {
  const value: unknown = JSON.parse(await readFile("public/exams/catalog.json", "utf8"));
  validateExamCatalog(value);
  expect(value.exams.map(group => group.title)).toEqual(["Parcial Tema 1", "Parcial Tema 2", "Preguntas importantes"]);
  const additional = value.questions.filter(q => q.examId === "preguntas-importantes");
  expect(additional).toHaveLength(6);
  expect(additional.map(q => q.number)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(additional.map(q => q.prompt)).toEqual([
    "¿Qué es calidad?", "¿Qué es SGC (Sistema de Gestión de la Calidad)?",
    "¿Cuál es el objetivo de la Ley 27.506?", "¿Cómo se relaciona la Ley 27.506 con los Sistemas de Gestión de Calidad?",
    "¿Cuáles son los requisitos de la Ley 27.506?", "¿Qué beneficios concretos otorga la Ley 27.506?",
  ]);
  for (const q of additional) {
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


it("completa ambos parciales con ocho preguntas numeradas, fotos originales y respuestas pendientes", async () => {
  const value: unknown = JSON.parse(await readFile("public/exams/catalog.json", "utf8"));
  validateExamCatalog(value);
  expect(value.exams).toHaveLength(3);
  expect(value.questions).toHaveLength(22);
  expect(new Set(value.questions.map(q => q.id)).size).toBe(22);
  for (const id of ["parcial-tema-1", "parcial-tema-2"]) {
    const exam = value.exams.find(exam => exam.id === id)!;
    const questions = value.questions.filter(q => q.examId === id);
    expect(exam.materialPending).not.toBe(true);
    expect(exam.photos).toHaveLength(1);
    expect(questions).toHaveLength(8);
    expect(questions.map(q => q.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const q of questions) {
      expect(q.photoId).toBe(exam.photos[0].id);
      expect(q.origin).toBe("Parcial anterior");
      expect(q.verified).toBe(false);
      expect(q.correct).toBeNull();
      expect(q.modelAnswer).toBeUndefined();
      expect(q.explanation).toBe("");
      expect(canAttemptQuestion(q)).toBe(true);
      expect(canPractice(q)).toBe(false);
      expect(questionAnswer(q)).toBe("");
    }
  }
  const q = (tema: number, number: number) => value.questions.find(q => q.examId === `parcial-tema-${tema}` && q.number === number)!;
  expect(q(1, 7).options).toEqual([
    "Explicación de los términos y definición de un SGC", "Requisitos para la mejora continua",
    "Establece los requisitos para un SGC", "Requisitos para las auditorías internas",
  ]);
  expect(q(1, 8).type).toBe("true-false");
  expect(q(1, 8).options).toEqual(["VERDADERO", "FALSO"]);
  expect(q(2, 6).options).toEqual([
    "PREVENIR-ACCIONAR-VERIFICAR-HACER", "PLANEAR-HACER-VERIFICAR-ACTUAR", "HACER-ACTUAR-VERIFICAR-PLANEAR",
  ]);
  expect(q(2, 7).options).toEqual([
    "No participar en el SGC , dejarlo todo a los responsables asignados", "Demostrar liderazgo y compromiso con respecto al SGC",
    "Ser Jefe", "Difundir la política de calidad",
  ]);
  expect(q(1, 5).prompt).toContain("Enfoque en los procesos");
  expect(q(2, 1).prompt).toContain("Enfoque en el cliente");
  expect(q(2, 2).prompt).toContain("ISO 9000:2015");
  expect(q(1, 2).prompt).toContain("ACCION CORRECTIVO (10.2)");
  expect(q(1, 6).prompt).toContain("9.2.1 y 9.2.2");
  expect(q(2, 3).prompt).toContain("DIRECCIÓN (9.3)");
  expect(q(2, 8).prompt).toContain("8.4.3 Información para los proveedores externos");
});
