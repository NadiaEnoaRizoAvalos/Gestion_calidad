import { questions } from "./questions";
import { topics } from "./topics";
import type { StudyState } from "../types";

export function recommendTopics(state: StudyState) {
  const latest = new Map<string, boolean>();
  for (const attempt of state.attempts) {
    for (const answer of attempt.answers)
      latest.set(answer.questionId, answer.correct);
  }
  return topics
    .map((topic) => ({
      topic,
      errors: questions.filter(
        (question) =>
          question.topic === topic.id && latest.get(question.id) === false,
      ).length,
    }))
    .filter((item) => item.errors > 0)
    .sort((a, b) => b.errors - a.errors);
}
