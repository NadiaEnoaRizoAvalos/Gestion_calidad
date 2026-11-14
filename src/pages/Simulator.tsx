import { useState } from "react";
import { Check, ChevronRight, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { simulationSteps } from "../data/simulation";
import { useStudy } from "../hooks/useStudy";
import { PageHeading } from "../components/PageHeading";

export function Simulator() {
  const { complete } = useStudy();
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const current = simulationSteps[step];
  const choice = choices[step];
  const finished = step === simulationSteps.length;
  const score = choices.filter(
    (answer, index) => simulationSteps[index].options[answer].good,
  ).length;
  return (
    <section className="content-page">
      <PageHeading
        title="Tu pequeño laboratorio de calidad"
        description="Tomá decisiones, observá lo que pasa y aprendé con el ciclo PHVA."
        image="simulator"
      />
      <p className="example-label">
        Caso ficticio · Simulación educativa, sin evaluación normativa ni
        certificación
      </p>
      <ol className="phva-steps">
        {simulationSteps.map((item, index) => (
          <li
            key={item.name}
            className={
              index === step
                ? "current"
                : index < choices.length
                  ? "complete"
                  : ""
            }
          >
            <span>
              {index < choices.length ? <Check size={17} /> : index + 1}
            </span>
            {item.name}
          </li>
        ))}
      </ol>
      {finished ? (
        <article className="panel simulation-result">
          <span className="result-flower" aria-hidden="true">
            ✧
          </span>
          <h2>¡Un ciclo completo, mucho por aprender!</h2>
          <p>Elegiste acciones fundamentadas en {score} de las 4 etapas.</p>
          <div className="metric-strip">
            <div>
              <strong>12%</strong>
              <span>Errores iniciales</span>
            </div>
            <ChevronRight />
            <div>
              <strong>4%</strong>
              <span>Resultado del piloto del caso</span>
            </div>
          </div>
          <p className="muted">
            Los valores pertenecen al caso ficticio. Tus decisiones se evalúan a
            continuación; no predicen resultados de una empresa real.
          </p>
          <div className="decision-summary">
            {simulationSteps.map((item, index) => (
              <div key={item.name}>
                <h3>
                  {item.name} ·{" "}
                  {item.options[choices[index]].good
                    ? "Acción fundamentada"
                    : "Para revisar"}
                </h3>
                <p>Tu decisión: {item.options[choices[index]].title}</p>
                <small>{item.options[choices[index]].feedback}</small>
              </div>
            ))}
          </div>
          <div className="actions">
            <button
              className="secondary"
              onClick={() => {
                setStep(0);
                setChoices([]);
              }}
            >
              <RotateCcw size={16} /> Volver a experimentar
            </button>
            <Link className="primary" to="/teoria?tema=phva">
              Repasar PHVA
            </Link>
          </div>
        </article>
      ) : (
        <div className="simulation-layout">
          <aside className="panel case-card">
            <span className="eyebrow">CONOCÉ EL CASO</span>
            <h2>Papelería Lila</h2>
            <p>
              Un pequeño negocio prepara pedidos de útiles escolares. Los
              reclamos por artículos equivocados preocupan al equipo.
            </p>
            <div className="case-metric">
              <strong>12 de 100</strong>
              <span>pedidos con errores al comenzar</span>
            </div>
            <p className="muted">
              Cada etapa continúa el mismo caso de ejemplo. Podés aprender
              también de las decisiones menos adecuadas.
            </p>
          </aside>
          <article className="panel">
            <span className="tag">Etapa {step + 1} de 4</span>
            <h2 className="section-title">{current.name}</h2>
            <p className="lead">{current.concept}</p>
            <div className="example-box">
              <p>{current.situation}</p>
            </div>
            <h3>{current.prompt}</h3>
            <div className="answer-options">
              {current.options.map((option, index) => (
                <button
                  key={option.title}
                  disabled={choice !== undefined}
                  className={`answer-option ${choice === index ? "chosen" : ""}`}
                  onClick={() => setChoices((previous) => [...previous, index])}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option.title}
                </button>
              ))}
            </div>
            {choice !== undefined && (
              <div
                className={`feedback ${current.options[choice].good ? "success" : ""}`}
                role="status"
              >
                <h3>
                  {current.options[choice].good
                    ? "¡Bien pensado!"
                    : "Una oportunidad para aprender"}
                </h3>
                <p>{current.options[choice].feedback}</p>
                <button
                  className="primary"
                  onClick={() => {
                    if (step === 3) complete("simulador");
                    setStep((previous) => previous + 1);
                  }}
                >
                  {step === 3 ? "Ver mi recorrido" : "Siguiente etapa"}
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </article>
        </div>
      )}
    </section>
  );
}
