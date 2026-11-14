import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Clock, Search } from "lucide-react";
import { topics } from "../data/topics";
import { useStudy } from "../hooks/useStudy";
import { PageHeading } from "../components/PageHeading";

export function Theory() {
  const { state, toggleComplete } = useStudy();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const topic =
    topics.find((item) => item.id === params.get("tema")) ?? topics[0];
  const filtered = topics.filter(
    (item) =>
      (category === "Todos" || item.category === category) &&
      `${item.title} ${item.definition} ${item.concepts.join(" ")}`
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")),
  );
  return (
    <section className="content-page">
      <PageHeading
        title="Un lugar para entender"
        description="Explorá los conceptos, conectá las ideas y avanzá a tu ritmo."
        image="theory"
        example
      />
      <div className="panel toolbar">
        <label className="search-input">
          <Search size={18} />
          <input
            placeholder="Buscar un concepto…"
            aria-label="Buscar contenido teórico"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label>
          Categoría
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {["Todos", "Fundamentos", "Procesos", "Mejora"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <span className="muted">
          {topics.filter((item) => state.completed[item.id]).length}/
          {topics.length} estudiados
        </span>
      </div>
      <div className="reading-layout">
        <aside className="panel topic-list" aria-label="Temas de teoría">
          {filtered.map((item) => (
            <button
              key={item.id}
              className={item.id === topic.id ? "selected" : ""}
              onClick={() => setParams({ tema: item.id })}
            >
              <span>
                {item.title}
                <small>
                  {item.category} · {item.minutes} min
                </small>
              </span>
              {state.completed[item.id] && (
                <Check size={17} aria-label="Estudiado" />
              )}
            </button>
          ))}
          {!filtered.length && <p>No hay temas para esa búsqueda.</p>}
        </aside>
        <article className="panel lesson">
          <div className="lesson-meta">
            <span className="tag">{topic.category}</span>
            <span>
              <Clock size={14} /> {topic.minutes} min de lectura
            </span>
          </div>
          <h2>{topic.title}</h2>
          <p className="lead">{topic.description}</p>
          <h3>La idea principal</h3>
          <p>{topic.definition}</p>
          <div className="example-box">
            <h3>Un ejemplo cotidiano</h3>
            <p>{topic.example}</p>
          </div>
          <h3>Conceptos para recordar</h3>
          <div className="tags">
            {topic.concepts.map((concept) => (
              <span className="tag" key={concept}>
                {concept}
              </span>
            ))}
          </div>
          <button
            className={state.completed[topic.id] ? "secondary" : "primary"}
            onClick={() => toggleComplete(topic.id)}
          >
            <Check size={16} />
            {state.completed[topic.id]
              ? "Estudiado · Marcar como pendiente"
              : "Marcar como estudiado"}
          </button>
        </article>
      </div>
    </section>
  );
}
