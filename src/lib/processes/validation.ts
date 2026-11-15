import type {
  FlowNode,
  FlowEdge,
  ModelIssue,
  ProcessMap,
} from "../../types/processLab";
export function validateMap(map: ProcessMap): ModelIssue[] {
  const issues: ModelIssue[] = [];
  if (!map.nodes.length)
    issues.push({
      severity: "error",
      text: "El mapa no tiene procesos. Agregá procesos en los cuatro grupos.",
    });
  for (const group of ["Estratégicos", "Operativos", "De apoyo", "De gestión"])
    if (!map.nodes.some((node) => node.category === group))
      issues.push({
        severity: "recommendation",
        text: `Revisá si falta representar procesos ${group.toLowerCase()}; justificá el alcance de tu mapa.`,
      });
  for (const node of map.nodes) {
    if (!node.inputs.trim() || !node.outputs.trim())
      issues.push({
        severity: "recommendation",
        text: `${node.name}: identificá entradas y salidas para explicar la transformación.`,
      });
    if (!node.justification.trim())
      issues.push({
        severity: "recommendation",
        text: `${node.name}: justificá su categoría según su propósito, no solo por el nombre.`,
      });
    if (
      !map.relations.some(
        (edge) => edge.from === node.id || edge.to === node.id,
      )
    )
      issues.push({
        severity: "recommendation",
        text: `${node.name}: no tiene relaciones; revisá qué recursos o resultados intercambia.`,
      });
  }
  return issues;
}
export function validateBpmn(
  nodes: FlowNode[],
  edges: FlowEdge[],
): ModelIssue[] {
  const issues: ModelIssue[] = [];
  const flows = nodes.filter((node) =>
    /(?:Event|Task|Gateway|SubProcess)$/.test(node.type),
  );
  const sequence = edges.filter((edge) => edge.type === "bpmn:SequenceFlow");
  const starts = flows.filter((node) => node.type === "bpmn:StartEvent"),
    ends = flows.filter((node) => node.type === "bpmn:EndEvent");
  const add = (text: string, severity: ModelIssue["severity"] = "error") =>
    issues.push({ severity, text });
  if (!starts.length)
    add(
      "Falta un evento de inicio. En este ejercicio debe quedar explícito qué inicia el recorrido.",
    );
  if (!ends.length)
    add(
      "Falta un evento de fin. Indicá el resultado que termina el recorrido.",
    );
  for (const pool of new Set(flows.map((node) => node.pool))) {
    const scoped = flows.filter((node) => node.pool === pool);
    if (
      starts.length &&
      !scoped.some((node) => node.type === "bpmn:StartEvent")
    )
      add(
        "Un participante con actividades no tiene inicio explícito; revisá dónde comienza su proceso.",
        "recommendation",
      );
    if (ends.length && !scoped.some((node) => node.type === "bpmn:EndEvent"))
      add(
        "Un participante con actividades no tiene fin explícito; revisá cómo termina su proceso.",
        "recommendation",
      );
  }
  for (const node of nodes.filter((node) =>
    ["bpmn:DataObjectReference", "bpmn:TextAnnotation"].includes(node.type),
  )) {
    if (!edges.some((edge) => edge.from === node.id || edge.to === node.id))
      add(
        `${node.name || node.id}: símbolo aislado; vinculalo con la actividad que documenta.`,
        "recommendation",
      );
  }
  const reachable = (seeds: string[], reverse = false) => {
    const visited = new Set(seeds);
    let changed = true;
    while (changed) {
      changed = false;
      for (const edge of sequence) {
        const from = reverse ? edge.to : edge.from,
          to = reverse ? edge.from : edge.to;
        if (visited.has(from) && !visited.has(to)) {
          visited.add(to);
          changed = true;
        }
      }
    }
    return visited;
  };
  const fromStart = reachable(starts.map((n) => n.id)),
    toEnd = reachable(
      ends.map((n) => n.id),
      true,
    );
  for (const node of flows) {
    const incoming = sequence.filter((e) => e.to === node.id),
      outgoing = sequence.filter((e) => e.from === node.id);
    if (!incoming.length && !outgoing.length)
      add(
        `${node.name || node.id}: elemento aislado; conectalo con el recorrido.`,
      );
    if (/Task$/.test(node.type) && (!incoming.length || !outgoing.length))
      add(
        `${node.name || node.id}: la tarea necesita entrada y salida de secuencia; un mensaje no reemplaza el recorrido del proceso.`,
        "recommendation",
      );
    if (node.type === "bpmn:StartEvent" && incoming.length)
      add(`${node.name}: un inicio no recibe flujo de secuencia.`);
    if (node.type === "bpmn:EndEvent" && outgoing.length)
      add(`${node.name}: un fin no emite flujo de secuencia.`);
    if (starts.length && !fromStart.has(node.id))
      add(`${node.name || node.id}: no es alcanzable desde un inicio.`);
    if (ends.length && !toEnd.has(node.id))
      add(
        `${node.name || node.id}: no tiene camino hacia un final; revisá salidas y ciclos.`,
      );
    if (
      node.type === "bpmn:ExclusiveGateway" &&
      outgoing.length < 2 &&
      incoming.length < 2
    )
      add(
        `${node.name || node.id}: la decisión necesita alternativas claras o debe justificarse como convergencia.`,
      );
    if (
      node.type === "bpmn:ExclusiveGateway" &&
      outgoing.length > 1 &&
      outgoing.some((e) => !e.label.trim())
    )
      add(
        `${node.name || node.id}: nombrá las condiciones de todas las salidas de la decisión.`,
      );
    if (node.type === "bpmn:ParallelGateway" && outgoing.length > 1)
      add(
        `${node.name || node.id}: revisá la sincronización de las ramas paralelas. Esta comprobación no analiza tokens ni interbloqueos.`,
        "recommendation",
      );
  }
  for (const edge of edges) {
    const from = nodes.find((n) => n.id === edge.from),
      to = nodes.find((n) => n.id === edge.to);
    if (edge.type === "bpmn:MessageFlow" && from && to && from.pool === to.pool)
      add(
        "Un flujo de mensaje no conecta elementos del mismo participante; usá secuencia dentro del pool.",
      );
    if (
      edge.type === "bpmn:SequenceFlow" &&
      from &&
      to &&
      from.pool !== to.pool
    )
      add(
        "Un flujo de secuencia no puede cruzar participantes; la comunicación entre pools usa mensajes.",
      );
  }
  return issues;
}
