export interface Topic {
  id: string;
  title: string;
  category: string;
  minutes: number;
  description: string;
  definition: string;
  example: string;
  concepts: string[];
}

export interface Question {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: "Inicial" | "Intermedio";
  origin:
    | "Parcial anterior"
    | "Pregunta del profesor"
    | "Apunte de clase"
    | "Pregunta de práctica generada con IA";
  tags: string[];
}

export interface ClassNote {
  id: string;
  topic: string;
  date: string | null;
  title: string;
  summary: string;
  concepts: string[];
  teacherExamples: string[];
  observations: string;
  questions: string[];
  demo: boolean;
}

export interface Attempt {
  id: string;
  date: string;
  mode: "parcial" | "repaso";
  answers: { questionId: string; correct: boolean }[];
}

export interface StudyState {
  completed: Record<string, string>;
  bookmarked: string[];
  nextStudy: string;
  weeklyGoal: number;
  attempts: Attempt[];
}
