import { useState } from "react";
import { Bookmark, Check, Search } from "lucide-react";
import { questions } from "../data/questions";
import { topics } from "../data/topics";
import { PageHeading } from "../components/PageHeading";
import { useStudy } from "../hooks/useStudy";
import { Practice } from "../components/Practice";
import { PracticeHistory } from "../components/PracticeHistory";

export function Exams() {
  const { state, toggleBookmark } = useStudy();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("todos");
  const [onlySaved, setOnlySaved] = useState(false);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [practice, setPractice] = useState<string[] | null>(null);
  const filtered = questions.filter(
    (question) =>
      (topic === "todos" || question.topic === topic) &&
      (!onlySaved || state.bookmarked.includes(question.id)) &&
      `${question.prompt} ${question.tags.join(" ")}`
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")),
  );
  return (
    <section className="content-page">
      <PageHeading
        title="Un ensayo antes del parcial"
        description="Explorá preguntas, guardá las que querés repasar y armá tu propia práctica."
        image="exams"
      />
      <p className="example-label">
        Todas las preguntas actuales son ejemplos generados con IA. No son
        preguntas de exámenes reales.
      </p>
      {practice ? (
        <Practice
          questions={questions.filter((question) =>
            practice.includes(question.id),
          )}
          mode="parcial"
          onClose={() => setPractice(null)}
        />
      ) : (
        <>
          <div className="panel toolbar">
            <label className="search-input">
              <Search size={18} />
              <input
                aria-label="Buscar preguntas"
                placeholder="Buscar pregunta o etiqueta…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label>
              Tema
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              >
                <option value="todos">Todos los temas</option>
                {topics.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={onlySaved}
                onChange={(event) => setOnlySaved(event.target.checked)}
              />{" "}
              Solo guardadas
            </label>
          </div>
          <div className="selection-bar">
            <span>{selected.length} preguntas seleccionadas</span>
            <div className="actions">
              <button
                className="secondary"
                disabled={!filtered.length}
                onClick={() =>
                  setSelected([
                    ...new Set([
                      ...selected,
                      ...filtered.map((question) => question.id),
                    ]),
                  ])
                }
              >
                Seleccionar visibles
              </button>
              <button
                className="secondary"
                disabled={!selected.length}
                onClick={() => setSelected([])}
              >
                Limpiar selección
              </button>
              <button
                className="primary"
                disabled={!selected.length}
                onClick={() => setPractice([...selected])}
              >
                Comenzar simulacro
              </button>
            </div>
          </div>
          <div className="question-list">
            {filtered.map((question) => (
              <article className="panel question-card" key={question.id}>
                <div className="lesson-meta">
                  <span className="tag">
                    {topics.find((item) => item.id === question.topic)?.title}
                  </span>
                  <span>{question.difficulty}</span>
                </div>
                <p className="question-source">{question.origin}</p>
                <h2>{question.prompt}</h2>
                <div className="tags">
                  {question.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="question-actions">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selected.includes(question.id)}
                      onChange={(event) =>
                        setSelected(
                          event.target.checked
                            ? [...selected, question.id]
                            : selected.filter((id) => id !== question.id),
                        )
                      }
                    />{" "}
                    Incluir en simulacro
                  </label>
                  <button
                    className="text-button"
                    aria-pressed={state.bookmarked.includes(question.id)}
                    onClick={() => toggleBookmark(question.id)}
                  >
                    <Bookmark
                      size={16}
                      fill={
                        state.bookmarked.includes(question.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                    {state.bookmarked.includes(question.id)
                      ? "Guardada para repasar"
                      : "Guardar para repasar"}
                  </button>
                  <button
                    className="secondary"
                    aria-expanded={revealed.includes(question.id)}
                    onClick={() =>
                      setRevealed(
                        revealed.includes(question.id)
                          ? revealed.filter((id) => id !== question.id)
                          : [...revealed, question.id],
                      )
                    }
                  >
                    {revealed.includes(question.id)
                      ? "Ocultar respuesta"
                      : "Ver respuesta"}
                  </button>
                </div>
                {revealed.includes(question.id) && (
                  <div className="example-box">
                    <h3>
                      <Check size={16} /> {question.options[question.correct]}
                    </h3>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
          {!filtered.length && (
            <p className="panel">
              No hay preguntas que coincidan con los filtros.
            </p>
          )}
        </>
      )}
      <PracticeHistory />
    </section>
  );
}
