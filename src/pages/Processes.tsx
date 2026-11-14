import { useState } from "react";
import { Check } from "lucide-react";
import { PageHeading } from "../components/PageHeading";
import { useStudy } from "../hooks/useStudy";

const processGroups = [
  {
    category: "Estratégicos",
    description: "Orientan a la organización y definen sus prioridades.",
    items: [
      {
        title: "Planificación",
        description:
          "Define objetivos y recursos para mejorar el servicio de la biblioteca.",
        flow: [
          "Analizar necesidades",
          "Definir objetivos",
          "Asignar recursos",
          "Revisar avances",
        ],
      },
      {
        title: "Gestión de calidad",
        description:
          "Coordina el seguimiento de resultados y las oportunidades de mejora.",
        flow: [
          "Reunir indicadores",
          "Analizar resultados",
          "Proponer mejoras",
          "Dar seguimiento",
        ],
      },
    ],
  },
  {
    category: "Operativos",
    description: "Entregan el valor principal a las personas usuarias.",
    items: [
      {
        title: "Atención al lector",
        description:
          "Recibe consultas y orienta a cada persona hacia los recursos que necesita.",
        flow: [
          "Recibir consulta",
          "Comprender necesidad",
          "Orientar búsqueda",
          "Confirmar atención",
        ],
      },
      {
        title: "Préstamo de libros",
        description:
          "Gestiona la entrega temporal y la devolución de los libros.",
        flow: [
          "Recibir solicitud",
          "Verificar disponibilidad",
          "Registrar préstamo",
          "Entregar libro",
        ],
      },
      {
        title: "Devoluciones",
        description:
          "Recibe libros y actualiza su disponibilidad para el próximo lector.",
        flow: [
          "Recibir libro",
          "Revisar estado",
          "Registrar devolución",
          "Ubicar en estante",
        ],
      },
    ],
  },
  {
    category: "De apoyo",
    description: "Proporcionan recursos para que los demás procesos funcionen.",
    items: [
      {
        title: "Sistemas",
        description:
          "Mantiene el catálogo y el sistema de registro disponibles.",
        flow: [
          "Recibir incidencia",
          "Diagnosticar",
          "Resolver",
          "Verificar servicio",
        ],
      },
      {
        title: "Compras",
        description:
          "Adquiere materiales según necesidades y criterios definidos.",
        flow: [
          "Identificar necesidad",
          "Evaluar opciones",
          "Comprar",
          "Verificar recepción",
        ],
      },
      {
        title: "Formación del equipo",
        description:
          "Ayuda al personal a desarrollar las capacidades que necesita.",
        flow: [
          "Detectar necesidad",
          "Preparar formación",
          "Practicar",
          "Evaluar aprendizaje",
        ],
      },
    ],
  },
];

export function Processes() {
  const [selected, setSelected] = useState(processGroups[1].items[1]);
  const [stock, setStock] = useState<"si" | "no">("si");
  const { state, complete } = useStudy();
  return (
    <section className="content-page">
      <PageHeading
        title="Todo está conectado"
        description="Descubrí cómo los procesos transforman necesidades en resultados."
        image="processes"
        example
      />
      <div className="panel process-intro">
        <h2>¿Qué es un proceso?</h2>
        <p>
          Es un conjunto de actividades relacionadas que transforma entradas en
          salidas. En esta biblioteca ficticia, una solicitud se transforma en
          un préstamo registrado y un libro entregado.
        </p>
      </div>
      <div className="panel map-panel">
        <span className="eyebrow">MAPA DE PROCESOS · BIBLIOTECA LILA</span>
        <h2>Una mirada a la organización</h2>
        <p className="muted">
          Seleccioná un proceso para explorar su propósito y un ejemplo de
          flujo.
        </p>
        <div className="process-map">
          <div className="map-side">
            Necesidades
            <br />
            del lector <span>→</span>
          </div>
          <div className="process-groups">
            {processGroups.map((group, index) => (
              <div
                className={`process-group group-${index}`}
                key={group.category}
              >
                <div>
                  <h3>{group.category}</h3>
                  <p>{group.description}</p>
                </div>
                <div className="process-buttons">
                  {group.items.map((item) => (
                    <button
                      aria-pressed={selected.title === item.title}
                      className={
                        selected.title === item.title ? "selected" : ""
                      }
                      key={item.title}
                      onClick={() => setSelected(item)}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="map-side">
            <span>→</span>Satisfacción
            <br />
            del lector
          </div>
        </div>
        <div className="example-box" aria-live="polite">
          <h3>{selected.title}</h3>
          <p>{selected.description}</p>
          <ol className="flow-list">
            {selected.flow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>
      <article className="panel bpmn-panel">
        <span className="eyebrow">INTRODUCCIÓN A BPMN</span>
        <h2>¿Podemos preparar el préstamo?</h2>
        <p>
          Una compuerta exclusiva elige un camino según la disponibilidad.
          Cambiá la condición para seguir cada alternativa.
        </p>
        <div
          className="segmented"
          role="group"
          aria-label="Disponibilidad del libro"
        >
          <button
            aria-pressed={stock === "si"}
            className={stock === "si" ? "selected" : ""}
            onClick={() => setStock("si")}
          >
            Hay disponibilidad
          </button>
          <button
            aria-pressed={stock === "no"}
            className={stock === "no" ? "selected" : ""}
            onClick={() => setStock("no")}
          >
            Sin disponibilidad
          </button>
        </div>
        <div className="bpmn-scroll">
          <svg
            className="bpmn-diagram"
            viewBox="0 0 800 260"
            role="img"
            aria-labelledby="bpmn-title bpmn-desc"
          >
            <title id="bpmn-title">Proceso de solicitud de un libro</title>
            <desc id="bpmn-desc">
              Inicio, revisar disponibilidad y compuerta exclusiva. Si hay
              libro, registrar préstamo; si no, informar al lector. Las ramas
              convergen antes del evento final.
            </desc>
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#9b69b4" />
              </marker>
            </defs>
            <g
              fill="none"
              stroke="#9b69b4"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            >
              <path d="M 70 130 H 110" />
              <path d="M 255 130 H 306" />
              <path
                opacity={stock === "si" ? 1 : 0.25}
                d="M 340 96 V 60 H 420"
              />
              <path
                opacity={stock === "no" ? 1 : 0.25}
                d="M 340 164 V 200 H 420"
              />
              <path
                opacity={stock === "si" ? 1 : 0.25}
                d="M 570 60 H 650 V 96"
              />
              <path
                opacity={stock === "no" ? 1 : 0.25}
                d="M 570 200 H 650 V 164"
              />
              <path d="M 684 130 H 727" />
            </g>
            <circle
              cx="50"
              cy="130"
              r="20"
              fill="#f0e5f8"
              stroke="#9b69b4"
              strokeWidth="2"
            />
            <rect
              x="110"
              y="101"
              width="145"
              height="58"
              rx="12"
              fill="#f5e2f3"
              stroke="#9b69b4"
              strokeWidth="2"
            />
            <path
              d="M340 96 L374 130 L340 164 L306 130Z"
              fill="#fff0c5"
              stroke="#b89561"
              strokeWidth="2"
            />
            <text x="340" y="136" textAnchor="middle" fontSize="22">
              ×
            </text>
            <rect
              x="420"
              y="31"
              width="150"
              height="58"
              rx="12"
              fill={stock === "si" ? "#e3d0f2" : "#faf5f7"}
              stroke="#9b69b4"
              strokeWidth="2"
            />
            <rect
              x="420"
              y="171"
              width="150"
              height="58"
              rx="12"
              fill={stock === "no" ? "#e3d0f2" : "#faf5f7"}
              stroke="#9b69b4"
              strokeWidth="2"
            />
            <path
              d="M650 96 L684 130 L650 164 L616 130Z"
              fill="#fff0c5"
              stroke="#b89561"
              strokeWidth="2"
            />
            <text x="650" y="136" textAnchor="middle" fontSize="22">
              ×
            </text>
            <circle
              cx="750"
              cy="130"
              r="20"
              fill="#efdef5"
              stroke="#9b69b4"
              strokeWidth="4"
            />
            <g textAnchor="middle" fontSize="14" fill="#63377b">
              <text x="50" y="172">
                Inicio
              </text>
              <text x="182" y="126">
                Revisar
              </text>
              <text x="182" y="146">
                disponibilidad
              </text>
              <text x="280" y="188">
                ¿Disponible?
              </text>
              <text x="382" y="50">
                Sí
              </text>
              <text x="382" y="190">
                No
              </text>
              <text x="495" y="65">
                Registrar préstamo
              </text>
              <text x="495" y="205">
                Informar al lector
              </text>
              <text x="750" y="172">
                Fin
              </text>
            </g>
          </svg>
        </div>
        <div className="symbol-legend">
          <span>
            <i className="event-symbol" />
            Evento: algo ocurre
          </span>
          <span>
            <i className="activity-symbol" />
            Actividad: trabajo realizado
          </span>
          <span>
            <i className="gateway-symbol" />
            Compuerta: decisión
          </span>
          <span>
            <i className="sequence-symbol">→</i>Flujo: orden de ejecución
          </span>
        </div>
        <button
          className="primary"
          onClick={() => complete("mapa")}
          disabled={!!state.completed.mapa}
        >
          <Check size={16} />
          {state.completed.mapa
            ? "Exploración completada"
            : "Marcar exploración como completada"}
        </button>
      </article>
    </section>
  );
}
