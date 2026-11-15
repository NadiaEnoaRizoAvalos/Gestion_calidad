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
  correct: number | null;
  type?: "choice" | "written";
  examId?: string;
  photoId?: string;
  modelAnswer?: string;
  verified?: boolean;
  explanation: string;
  difficulty?: "Inicial" | "Intermedio" | "Avanzado";
  origin:
    | "Parcial anterior"
    | "Pregunta del profesor"
    | "Apunte de clase"
    | "Pregunta de práctica generada con IA";
  tags: string[];
}

export interface Attempt {
  id: string;
  date: string;
  mode: "parcial" | "repaso";
  answers: { questionId: string; correct: boolean; selfAssessed?: boolean }[];
}

export interface StudyState {
  completed: Record<string, string>;
  bookmarked: string[];
  examDate: string;
  attempts: Attempt[];
}
