import { useState } from "react";
import { exercises } from "../../data/processes/exercises";
import { exampleMap } from "../../data/processes/examples";
import { emptyBpmnXml } from "../../data/processes/bpmnExamples";
import type { LabDocument, ProcessMap } from "../../types/processLab";
import { MapEditor } from "./MapEditor";
function exerciseMap(id: string): ProcessMap {
  const map = exampleMap("optica");
  map.name = "Ejercicio · Óptica";
  map.nodes = map.nodes.filter((n) =>
    [
      "Planificación estratégica",
      "Atención al cliente",
      "Compras",
      "Auditorías internas",
    ].includes(n.name),
  );
  map.relations = [];
  if (id === "complete-map")
    map.nodes = map.nodes.filter((n) => n.name !== "Auditorías internas");
  if (id === "wrong-map")
    map.nodes = map.nodes.map((n) =>
      n.name === "Compras" ? { ...n, category: "Operativos" } : n,
    );
  return map;
}
const orderSolution = [
  "Recibir pedido",
  "Analizar requisitos",
  "Preparar pedido",
  "Entregar y registrar recepción",
];
export function ProcessExercises({
  onUse,
}: {
  onUse: (doc: LabDocument) => void;
}) {
  const [id, setId] = useState<string>(exercises[0].id);
  return (
    <section className="panel">
      <h2>Ejercicios progresivos</h2>
      <label>
        Elegir ejercicio
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {exercises.map((item) => (
            <option key={item.id} value={item.id}>
              {item.level} · {item.title}
            </option>
          ))}
        </select>
      </label>
      <Exercise key={id} id={id} onUse={onUse} />
    </section>
  );
}
function Exercise({
  id,
  onUse,
}: {
  id: string;
  onUse: (doc: LabDocument) => void;
}) {
  const exercise = exercises.find((e) => e.id === id)!;
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [order, setOrder] = useState([
    orderSolution[2],
    orderSolution[0],
    orderSolution[3],
    orderSolution[1],
  ]);
  const [map, setMap] = useState(() => exerciseMap(id));
  let feedback: string[] = [];
  if (exercise.kind === "map") {
    const audit = map.nodes.find(
        (n) => n.name.toLocaleLowerCase("es") === "auditorías internas",
      ),
      planning = map.nodes.find((n) => n.name === "Planificación estratégica"),
      buy = map.nodes.find((n) => n.name === "Compras"),
      attention = map.nodes.find((n) => n.name === "Atención al cliente");
    if (id === "complete-map") {
      if (!audit)
        feedback.push(
          "Falta Auditorías internas: agregá un proceso que haga seguimiento del sistema.",
        );
      else if (audit.category !== "De gestión")
        feedback.push(
          "Auditorías internas pertenece a gestión en este caso (diap. 26). Corregí su categoría.",
        );
      if (
        !map.relations.some(
          (r) =>
            r.from === audit?.id && r.to === planning?.id && r.label.trim(),
        )
      )
        feedback.push(
          "Conectá Auditorías internas con Planificación estratégica y nombrá el intercambio de hallazgos.",
        );
    }
    if (id === "wrong-map" && buy?.category !== "De apoyo")
      feedback.push(
        "Compras abastece recursos a la óptica del caso; corresponde a apoyo. En una comercializadora con otro alcance podría formar parte de la cadena operativa.",
      );
    if (
      id === "relate" &&
      !map.relations.some(
        (r) => r.from === buy?.id && r.to === attention?.id && r.label.trim(),
      )
    )
      feedback.push(
        "La relación debe salir de Compras, llegar a Atención al cliente y explicar qué recursos o materiales entrega.",
      );
    if (!feedback.length)
      feedback = [
        "La representación resuelve la consigna del caso. Revisá que la explicación justifique el alcance; no existe una clasificación universal por nombre.",
      ];
  }
  return (
    <div className="lab-exercise">
      <h3>{exercise.title}</h3>
      <p>
        <strong>Objetivo:</strong> {exercise.objective}
      </p>
      <p>
        <strong>Datos del caso:</strong> {exercise.case}
      </p>
      <p>{exercise.prompt}</p>
      {exercise.kind === "quiz" &&
        exercise.questions.map((question, index) => (
          <fieldset key={question.text}>
            <legend>{question.text}</legend>
            {question.options.map((option, i) => (
              <label className="lab-radio" key={option}>
                <input
                  type="radio"
                  name={`exercise-${index}`}
                  checked={answers[index] === String(i)}
                  onChange={() =>
                    setAnswers({ ...answers, [index]: String(i) })
                  }
                />
                {option}
              </label>
            ))}
            {attempted && (
              <p role="status">
                {answers[index] === String(question.answer)
                  ? "Correcto. "
                  : "Revisá tu elección. "}
                {question.explanation}
              </p>
            )}
          </fieldset>
        ))}
      {exercise.kind === "order" && (
        <ol>
          {order.map((item, index) => (
            <li key={item}>
              {item}
              <div className="actions">
                <button
                  className="secondary"
                  aria-label={`Subir ${item}`}
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...order];
                    [next[index - 1], next[index]] = [
                      next[index],
                      next[index - 1],
                    ];
                    setOrder(next);
                  }}
                >
                  Subir
                </button>
                <button
                  className="secondary"
                  aria-label={`Bajar ${item}`}
                  disabled={index === order.length - 1}
                  onClick={() => {
                    const next = [...order];
                    [next[index + 1], next[index]] = [
                      next[index],
                      next[index + 1],
                    ];
                    setOrder(next);
                  }}
                >
                  Bajar
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {exercise.kind === "map" && <MapEditor map={map} onChange={setMap} />}
      {exercise.kind === "bpmn" && (
        <button
          className="primary"
          onClick={() =>
            onUse({
              kind: "bpmn",
              id: crypto.randomUUID(),
              name: "Ejercicio · Verificar pedido",
              xml: emptyBpmnXml,
            })
          }
        >
          Resolver en el editor BPMN
        </button>
      )}
      {exercise.kind === "integrated" && (
        <p>
          El espacio de trabajo está debajo. Guardá el mapa con su ficha y el
          BPMN; después seleccioná ambos en Comparar representaciones. La
          comprobación conceptual es guiada, no una corrección automática del
          significado.
        </p>
      )}
      {["quiz", "order", "map"].includes(exercise.kind) && (
        <button
          className="primary"
          disabled={
            exercise.kind === "quiz" &&
            Object.keys(answers).length < exercise.questions.length
          }
          onClick={() => setAttempted(true)}
        >
          Comprobar ejercicio
        </button>
      )}
      {attempted && exercise.kind === "order" && (
        <p role="status">
          {JSON.stringify(order) === JSON.stringify(orderSolution)
            ? "Orden correcto: cada resultado alimenta la actividad siguiente."
            : "Todavía hay pasos fuera de orden. Primero necesitás recibir y analizar el pedido antes de prepararlo, y solo después podés entregarlo."}
        </p>
      )}
      {attempted && exercise.kind === "map" && (
        <ul role="status">
          {feedback.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      <button
        className="text-button"
        onClick={() => setShowSolution(!showSolution)}
      >
        {showSolution
          ? "Ocultar solución de referencia"
          : "Ver solución de referencia"}
      </button>
      {showSolution && (
        <div className="example-box">
          {exercise.kind === "quiz" ? (
            exercise.questions.map((q) => (
              <p key={q.text}>
                {q.options[q.answer]}: {q.explanation}
              </p>
            ))
          ) : exercise.kind === "order" ? (
            <p>{orderSolution.join(" → ")}</p>
          ) : exercise.kind === "bpmn" ? (
            <p>
              Inicio → tarea Verificar pedido → fin. Dos flujos de secuencia
              dentro del mismo participante. El editor comprueba inicio, fin y
              conexiones; agregá decisiones solo cuando el caso las requiera.
            </p>
          ) : exercise.kind === "integrated" ? (
            <p>
              Referencia: el mapa de Óptica ubica la atención como operación,
              compras como apoyo y auditorías en gestión. Una ficha de atención
              delimita desde la necesidad hasta la conformidad del pedido; su
              BPMN detalla tareas, responsable y alternativas. Compará
              propósito, alcance, entradas, salidas y responsables, no solo
              cantidades de cajas.
            </p>
          ) : (
            <p>
              Compras en apoyo entrega recursos a Atención al cliente.
              Auditorías internas en gestión envía hallazgos a Planificación
              estratégica para decidir mejoras.
            </p>
          )}
        </div>
      )}
      {exercise.kind === "map" && (
        <button
          className="secondary"
          onClick={() => onUse({ ...map, id: crypto.randomUUID() })}
        >
          Continuar y guardar este mapa en el laboratorio
        </button>
      )}
      <button
        className="secondary"
        onClick={() => {
          setAnswers({});
          setOrder([
            orderSolution[2],
            orderSolution[0],
            orderSolution[3],
            orderSolution[1],
          ]);
          setMap(exerciseMap(id));
          setAttempted(false);
          setShowSolution(false);
        }}
      >
        Reiniciar ejercicio
      </button>
    </div>
  );
}
