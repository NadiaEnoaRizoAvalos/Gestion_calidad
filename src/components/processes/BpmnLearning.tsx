import { lazy, Suspense, useMemo, useState } from "react";
import {
  bpmnExamples,
  exampleEdges,
  exampleSteps,
  exampleXml,
} from "../../data/processes/bpmnExamples";
import {
  symbols,
  symbolGroups,
  type SymbolGroup,
} from "../../data/processes/symbols";
import { omgUrl } from "../../data/processes/content";
import type { BpmnDocument } from "../../types/processLab";
import { BpmnSymbol } from "./BpmnSymbol";
const BpmnCanvas = lazy(() => import("./BpmnCanvas"));
export function BpmnLearning({
  active,
  onUse,
}: {
  active: boolean;
  onUse: (doc: BpmnDocument) => void;
}) {
  const [symbolGroup, setSymbolGroup] = useState<SymbolGroup | "Todos">(
    "Todos",
  );
  const [symbol, setSymbol] = useState(symbols[0]);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [current, setCurrent] = useState("Start");
  const [route, setRoute] = useState("Sí");
  const [history, setHistory] = useState<string[]>(["Start"]);
  const example = bpmnExamples[exampleIndex];
  const steps = exampleSteps(example),
    edges = exampleEdges(example);
  const step = steps.find((n) => n.id === current)!;
  const document = useMemo<BpmnDocument>(
    () => ({
      kind: "bpmn",
      id: `ejemplo-${example.id}`,
      name: example.title,
      xml: exampleXml(example),
    }),
    [example],
  );
  const next = () => {
    const options = edges.filter((edge) => edge.from === current);
    const edge =
      current === "Decision"
        ? options.find((edge) => edge.label === route)
        : options[0];
    if (edge) {
      setCurrent(edge.to);
      setHistory([...history, edge.to]);
    }
  };
  return (
    <div className="lab-stack">
      <article className="panel">
        <h2>BPM, mapa, flujo y BPMN</h2>
        <p>
          BPM es gestionar procesos de negocio; BPMN significa Business Process
          Model and Notation y ofrece una notación estandarizada para
          modelarlos. El mapa da una vista de la organización; el flujograma
          muestra pasos; BPMN agrega significados precisos para eventos,
          actividades, decisiones, participantes y comunicación.
        </p>
        <p>
          Modelar consiste en seleccionar qué representar y con qué detalle, no
          en ejecutar un proceso real. La presentación introduce flujos por
          bloques y funcionales (diap. 38–41) y distingue proceso y
          procedimiento (43–48). La simbología BPMN de este apartado es una
          ampliación técnica, no contenido atribuido a esas diapositivas.
        </p>
        <p className="lab-source">
          Ampliación verificada:{" "}
          <a href={omgUrl} target="_blank" rel="noreferrer">
            OMG · BPMN 2.0.2, secciones 7.3–7.6, 9 y 10
          </a>
          . Apoyo de lectura:{" "}
          <a
            href="https://camunda.com/bpmn/reference/"
            target="_blank"
            rel="noreferrer"
          >
            referencia de símbolos de Camunda
          </a>
          .
        </p>
      </article>
      <section className="panel">
        <h2>Simbología para explorar</h2>
        <div
          className="lab-symbol-filters"
          role="group"
          aria-label="Categorías de simbología"
        >
          {(["Todos", ...symbolGroups] as const).map((group) => (
            <button
              key={group}
              className="secondary"
              aria-pressed={symbolGroup === group}
              onClick={() => setSymbolGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
        <div className="lab-symbol-grid">
          {symbols
            .filter(
              (item) => symbolGroup === "Todos" || item.group === symbolGroup,
            )
            .map((item) => (
              <button
                key={item.id}
                aria-label={item.name}
                className="secondary"
                aria-pressed={symbol.id === item.id}
                onClick={() => setSymbol(item)}
              >
                <BpmnSymbol type={item.id} />
                <span>{item.name}</span>
                <small>{item.group}</small>
              </button>
            ))}
        </div>
        <article className="example-box" aria-live="polite">
          <h3>{symbol.name}</h3>
          <BpmnSymbol type={symbol.id} />
          <p>
            <strong>Función y uso:</strong> {symbol.use}
          </p>
          <p>
            <strong>Ejemplo:</strong> {symbol.example}
          </p>
          <p>
            <strong>Diferencias y errores frecuentes:</strong> {symbol.error}
          </p>
        </article>
      </section>
      <section className="panel">
        <h2>Seis recorridos para practicar</h2>
        <label>
          Ejemplo BPMN
          <select
            value={exampleIndex}
            onChange={(e) => {
              setExampleIndex(Number(e.target.value));
              setCurrent("Start");
              setHistory(["Start"]);
              setRoute("Sí");
            }}
          >
            {bpmnExamples.map((item, i) => (
              <option key={item.id} value={i}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <p>
          <strong>Objetivo:</strong> {example.objective}
        </p>
        <p>
          Responsables: {example.lanes.join(" y ")}. Caso didáctico propio
          basado en los conceptos de las diapositivas {example.slides},
          representado con BPMN como ampliación. No es un proceso ejecutable.
        </p>
        <Suspense fallback={<p>Cargando diagrama BPMN…</p>}>
          <BpmnCanvas
            initial={document}
            active={active}
            readOnly
            highlight={current}
          />
        </Suspense>
        <div className="example-box" aria-live="polite">
          <span className="eyebrow">RECORRIDO PASO A PASO</span>
          <h3>{step.name}</h3>
          <p>{step.description}</p>
          {current === "Decision" && (
            <label>
              Alternativa del recorrido
              <select value={route} onChange={(e) => setRoute(e.target.value)}>
                <option>Sí</option>
                <option>No</option>
              </select>
            </label>
          )}
          <div className="actions">
            <button
              className="secondary"
              disabled={history.length < 2}
              onClick={() => {
                setCurrent(history[history.length - 2]);
                setHistory(history.slice(0, -1));
              }}
            >
              Paso anterior
            </button>
            <button
              className="primary"
              disabled={current === "End"}
              onClick={next}
            >
              Siguiente paso
            </button>
            <button
              className="secondary"
              onClick={() => {
                setCurrent("Start");
                setHistory(["Start"]);
              }}
            >
              Reiniciar recorrido
            </button>
          </div>
          <p className="muted">
            Recorrido:{" "}
            {history
              .map((id) => steps.find((s) => s.id === id)?.name)
              .join(" → ")}
          </p>
        </div>
        <button
          className="primary"
          onClick={() => onUse({ ...document, id: crypto.randomUUID() })}
        >
          Editar este BPMN en el laboratorio
        </button>
      </section>
    </div>
  );
}
