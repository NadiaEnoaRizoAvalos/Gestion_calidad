import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import type { Attempt, Question } from "../types";
import { useStudy } from "../hooks/useStudy";
import { topics } from "../data/topics";
import { Link } from "react-router-dom";

export function Practice({
  questions,
  mode,
  onClose,
}: {
  questions: Question[];
  mode: Attempt["mode"];
  onClose: () => void;
}) {
  const { saveAttempt } = useStudy();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Attempt["answers"]>([]);
  const [finished, setFinished] = useState(false);
  const current = questions[index];
  const revealed = answers.length > index;
  const correct = answers.filter((answer) => answer.correct).length;
  function next() {
    if (index === questions.length - 1) {
      saveAttempt({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        mode,
        answers,
      });
      setFinished(true);
    } else {
      setIndex(index + 1);
      setChoice(null);
    }
  }
  if (finished)
    return (
      <section className="panel practice-result" aria-live="polite">
        <span className="eyebrow">CADA INTENTO ES UN APRENDIZAJE</span>
        <h2>¡Práctica completada!</h2>
        <div className="result-score">
          {correct}
          <span> / {questions.length}</span>
        </div>
        <p>
          Respuestas correctas ·{" "}
          {Math.round((correct / questions.length) * 100)}%
        </p>
        <p className="muted">
          El resultado se guardó en tu navegador. Los errores alimentan tus
          recomendaciones de repaso.
        </p>
        <div className="answer-review">
          {answers.map((answer, i) => (
            <div key={answer.questionId}>
              {answer.correct ? <Check size={18} /> : <X size={18} />}
              <div>
                <h3>{questions[i].prompt}</h3>
                <p>Respuesta: {questions[i].options[questions[i].correct]}</p>
                {!answer.correct && (
                  <Link to={`/teoria?tema=${questions[i].topic}`}>
                    Repasar{" "}
                    {
                      topics.find((topic) => topic.id === questions[i].topic)
                        ?.title
                    }{" "}
                    →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="primary" onClick={onClose}>
          Volver a elegir preguntas
        </button>
      </section>
    );
  return (
    <section className="panel practice-panel">
      <div className="lesson-meta">
        <span className="tag">
          {mode === "parcial" ? "Simulacro de práctica" : "Repaso"} ·{" "}
          {index + 1} de {questions.length}
        </span>
        <span>{current.difficulty}</span>
      </div>
      <p className="question-source">{current.origin}</p>
      <h2>{current.prompt}</h2>
      <fieldset className="answer-options">
        <legend className="sr-only">Elegí una respuesta</legend>
        {current.options.map((option, optionIndex) => (
          <label
            key={option}
            className={`answer-option ${choice === optionIndex ? "chosen" : ""} ${revealed && optionIndex === current.correct ? "correct-option" : ""}`}
          >
            <input
              type="radio"
              name="answer"
              checked={choice === optionIndex}
              disabled={revealed}
              onChange={() => setChoice(optionIndex)}
            />
            <span>{String.fromCharCode(65 + optionIndex)}</span>
            {option}
          </label>
        ))}
      </fieldset>
      {revealed ? (
        <div
          className={`feedback ${answers[index].correct ? "success" : ""}`}
          role="status"
        >
          <h3>
            {answers[index].correct
              ? "¡Muy bien!"
              : "Vamos a repasar esta idea"}
          </h3>
          <p>{current.explanation}</p>
          <button className="primary" onClick={next}>
            {index === questions.length - 1
              ? "Guardar y ver resultado"
              : "Siguiente pregunta"}
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <button
          className="primary"
          disabled={choice === null}
          onClick={() =>
            setAnswers([
              ...answers,
              { questionId: current.id, correct: choice === current.correct },
            ])
          }
        >
          Comprobar respuesta
        </button>
      )}
      <div className="practice-exit">
        <button className="text-button" onClick={onClose}>
          Salir sin guardar este intento
        </button>
        <small>Se guarda al finalizar todas las preguntas.</small>
      </div>
    </section>
  );
}
