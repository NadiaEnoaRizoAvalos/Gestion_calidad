import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Clock, Search } from "lucide-react";
import { blockText, validateTheory } from "../types/theory";
import type { TheoryDocument } from "../types/theory";
import { NotionContent } from "../components/NotionContent";
import "../styles/notion.css";

import { useStudy } from "../hooks/useStudy";
import { PageHeading } from "../components/PageHeading";

const readingMinutes = (document: TheoryDocument) => Math.max(1, Math.ceil(blockText(document.blocks).split(/\s+/).length / 200));

export function Theory() {
  const [topics, setTopics] = useState<TheoryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}notion-theory.json`, { signal: controller.signal, cache: "no-cache" })
      .then(response => { if (!response.ok) throw new Error("No se pudo leer teoría"); return response.json(); })
      .then((data: unknown) => { validateTheory(data); setTopics(data.documents); })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const { state, toggleComplete } = useStudy();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const topic =
    topics.find((item) => item.id === params.get("tema")) ?? topics[0];
  const filtered = topics.filter(
    (item) =>
      (category === "Todos" || item.category === category) &&
      `${item.title} ${item.category} ${blockText(item.blocks)}`
        .toLocaleLowerCase("es")
        .includes(search.toLocaleLowerCase("es")),
  );
  return (
    <section className="content-page theory-page">
      <PageHeading
        title="Un lugar para entender"
        description="Explorá los conceptos, conectá las ideas y avanzá a tu ritmo."
        image="theory"
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
            aria-label="Categoría"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {["Todos", ...new Set(topics.map(item => item.category))].map((item) => (
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
          <h2 className="topic-list-title">Índice de temas</h2>
          {filtered.map((item) => (
            <button
              key={item.id}
              className={item.id === topic?.id ? "selected" : ""}
              aria-current={item.id === topic?.id ? "page" : undefined}
              onClick={() => setParams({ tema: item.id })}
            >
              <span>
                {item.title}
                <small>
                  {item.category} · {readingMinutes(item)} min
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
          {topic ? <>
          <div className="lesson-meta">
            <span className="tag">{topic.category}</span>
            <span><Clock size={14} /> {readingMinutes(topic)} min de lectura</span>
          </div>
          <h2>{topic.title}</h2>
          {topic.cover && <img className="notion-cover" src={`${import.meta.env.BASE_URL}${topic.cover}`} alt="" />}
          <div className="notion-content">
            {topic.blocks.length ? <NotionContent blocks={topic.blocks} /> : <p>Este documento todavía no tiene contenido.</p>}
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
          </> : <><h2>{loading ? "Cargando resúmenes…" : loadError ? "No pudimos cargar tus resúmenes" : "Tus resúmenes, en un solo lugar"}</h2><p>{loadError ? "Volvé a intentar recargando la página." : !loading && "Cuando publiques tus resúmenes en Notion y se sincronicen, aparecerán acá para acompañar tu estudio."}</p></>}
        </article>
      </div>
    </section>
  );
}
