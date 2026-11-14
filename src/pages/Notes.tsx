import { useState } from "react";
import { Search } from "lucide-react";
import { notes } from "../data/notes";
import { topics } from "../data/topics";
import { PageHeading } from "../components/PageHeading";

export function Notes() {
  const [search, setSearch] = useState("");
  const filtered = notes.filter((note) =>
    `${note.title} ${note.summary} ${note.concepts.join(" ")}`
      .toLocaleLowerCase("es")
      .includes(search.toLocaleLowerCase("es")),
  );
  return (
    <section className="content-page">
      <PageHeading
        title="Las ideas que te llevás de clase"
        description="Un espacio para tus explicaciones, ejemplos y preguntas importantes."
        image="notes"
      />
      <div className="panel toolbar">
        <label className="search-input">
          <Search size={18} />
          <input
            aria-label="Buscar apuntes"
            placeholder="Buscar en tus apuntes…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <p className="example-label">
        Todavía no se incorporaron apuntes reales. Este registro muestra cómo se
        organizarán.
      </p>
      <div className="note-grid">
        {filtered.map((note) => (
          <article className="panel class-note" key={note.id}>
            <div className="lesson-meta">
              <span className="tag">
                {topics.find((topic) => topic.id === note.topic)?.title}
              </span>
              <span>
                {note.date
                  ? new Date(`${note.date}T12:00:00`).toLocaleDateString(
                      "es-AR",
                    )
                  : "Sin fecha de clase"}
              </span>
            </div>
            <h2>{note.title}</h2>
            {note.demo && (
              <span className="example-label">Apunte de demostración</span>
            )}
            <h3>Resumen</h3>
            <p>{note.summary}</p>
            <h3>Conceptos importantes</h3>
            <div className="tags">
              {note.concepts.map((concept) => (
                <span key={concept} className="tag">
                  {concept}
                </span>
              ))}
            </div>
            <h3>Ejemplos del profesor</h3>
            {note.teacherExamples.length ? (
              <ul>
                {note.teacherExamples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            ) : (
              <p className="muted">
                Aún no se incorporaron ejemplos del profesor.
              </p>
            )}
            <h3>Observaciones</h3>
            <p>{note.observations}</p>
            <div className="example-box">
              <h3>Preguntas destacadas</h3>
              <ul>
                {note.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p className="panel">No encontramos apuntes para esa búsqueda.</p>
      )}
    </section>
  );
}
