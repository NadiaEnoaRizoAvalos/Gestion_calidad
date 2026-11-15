import { useState } from "react";
import { lessons, pdfUrl } from "../../data/processes/content";
export function LearnProcesses() {
  const [part, setPart] = useState("Entrada");
  const examples: Record<string, string> = {
    Entrada:
      "Es lo que recibe el proceso y de quién lo recibe. En cotización: la solicitud del cliente, sus requisitos y condiciones esperadas.",
    Proceso:
      "Las actividades transforman la entrada usando recursos y controles. En cotización: analizar requisitos, consultar costos y plazos y preparar la propuesta.",
    Salida:
      "Es el resultado previsto y su destinatario. En cotización: el presupuesto enviado al cliente. Ese presupuesto puede alimentar el proceso de venta.",
  };
  return (
    <div className="lab-stack">
      <div className="panel">
        <h2>Una ruta para comprender los procesos</h2>
        <p>
          Explicaciones propias basadas en las 52 diapositivas de la
          presentación de la cátedra. Abrí cada unidad para estudiar sus
          conceptos y consultá las referencias del material original.
        </p>
        <a
          className="text-button"
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
        >
          Abrir presentación original · 52 diapositivas
        </a>
      </div>
      <section className="panel">
        <h2>Entrada → Proceso → Salida</h2>
        <p>
          Seleccioná cada parte para identificar qué representa (diap. 11–14, 20
          y 34).
        </p>
        <div
          className="lab-input-output"
          role="group"
          aria-label="Elementos de un proceso"
        >
          {Object.keys(examples).map((name) => (
            <button
              className="secondary"
              key={name}
              aria-pressed={part === name}
              onClick={() => setPart(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <p className="example-box" aria-live="polite">
          {examples[part]}
        </p>
      </section>
      {lessons.map((lesson, index) => (
        <details
          className="panel lab-lesson"
          key={lesson.title}
          open={undefined}
        >
          <summary>{lesson.title}</summary>
          <p className="lab-source">
            <a
              href={`${pdfUrl}#page=${lesson.slides.match(/\d+/)?.[0] ?? 1}`}
              target="_blank"
              rel="noreferrer"
            >
              Presentación · diap. {lesson.slides}
            </a>
          </p>
          {lesson.paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
          {index === 0 && (
            <p className="muted">
              Para continuar: identificá una necesidad, quién la recibe y quién
              asegura el resultado del recorrido completo.
            </p>
          )}
        </details>
      ))}
    </div>
  );
}
