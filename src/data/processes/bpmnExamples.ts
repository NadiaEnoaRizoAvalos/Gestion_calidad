export const bpmnExamples = [
  {
    id: "compra",
    title: "Realizar una compra",
    objective: "Adquirir lo necesario con requisitos y autorización definidos.",
    first: "Revisar necesidad",
    decision: "¿Solicitud completa?",
    yes: "Autorizar compra",
    no: "Pedir aclaraciones",
    final: "Compra tramitada",
    lanes: ["Solicitante", "Compras"],
    slides: "14, 38–41",
  },
  {
    id: "pedido",
    title: "Atender el pedido de un cliente",
    objective:
      "Confirmar si un pedido se puede atender y comunicar el resultado.",
    first: "Analizar pedido",
    decision: "¿Hay disponibilidad?",
    yes: "Preparar pedido",
    no: "Informar alternativa",
    final: "Pedido respondido",
    lanes: ["Atención comercial", "Operación"],
    slides: "13, 18",
  },
  {
    id: "reclamo",
    title: "Gestionar un reclamo",
    objective: "Investigar el reclamo y responder con evidencia.",
    first: "Registrar y analizar reclamo",
    decision: "¿Corresponde una acción?",
    yes: "Aplicar y verificar acción",
    no: "Explicar resultado del análisis",
    final: "Respuesta comunicada",
    lanes: ["Atención al cliente", "Gestión de calidad"],
    slides: "18, 26, 42",
  },
  {
    id: "venta",
    title: "Realizar una venta",
    objective:
      "Acordar condiciones de venta y comunicar una decisión al cliente.",
    first: "Preparar cotización",
    decision: "¿Se acepta la propuesta?",
    yes: "Confirmar venta",
    no: "Registrar propuesta no aceptada",
    final: "Gestión comercial cerrada",
    lanes: ["Comercial", "Administración"],
    slides: "13, 45",
  },
  {
    id: "entrega",
    title: "Entregar un pedido",
    objective:
      "Verificar el pedido y dejar evidencia de su entrega o incidencia.",
    first: "Verificar pedido preparado",
    decision: "¿Pedido conforme?",
    yes: "Entregar y registrar recepción",
    no: "Retener y registrar incidencia",
    final: "Resultado de entrega registrado",
    lanes: ["Almacén", "Entregas"],
    slides: "15, 18",
  },
  {
    id: "software",
    title: "Desarrollar y probar una aplicación informática",
    objective:
      "Construir una solución y decidir su entrega a partir de las pruebas.",
    first: "Desarrollar según requisitos",
    decision: "¿Pruebas satisfactorias?",
    yes: "Entregar aplicación",
    no: "Corregir defectos",
    final: "Aplicación entregada",
    lanes: ["Desarrollo", "Desarrollo y pruebas"],
    slides: "16–17",
  },
];
export type BpmnExample = (typeof bpmnExamples)[number];
export const escapeXml = (text: string) =>
  text.replace(
    /[<>&"']/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );
export function exampleSteps(example: BpmnExample) {
  const nodes = [
    {
      id: "Start",
      type: "bpmn:StartEvent",
      name: "Solicitud recibida",
      description: `Se inicia el caso: ${example.objective}`,
      x: 140,
      y: 110,
      w: 36,
      h: 36,
      lane: 0,
    },
    {
      id: "Task",
      type: "bpmn:Task",
      name: example.first,
      description: `${example.lanes[0]} realiza esta actividad y deja la información necesaria para decidir.`,
      x: 240,
      y: 90,
      w: 160,
      h: 80,
      lane: 0,
    },
    {
      id: "Decision",
      type: "bpmn:ExclusiveGateway",
      name: example.decision,
      description:
        "Compuerta XOR: se evalúa la condición y se toma una sola alternativa. No representa una tarea.",
      x: 470,
      y: 105,
      w: 50,
      h: 50,
      lane: 0,
    },
    {
      id: "Yes",
      type: "bpmn:Task",
      name: example.yes,
      description: `${example.lanes[1]}: ${example.yes.toLocaleLowerCase("es")}.`,
      x: 610,
      y: 260,
      w: 175,
      h: 80,
      lane: 1,
    },
    {
      id: "No",
      type: "bpmn:Task",
      name: example.no,
      description:
        example.id === "software"
          ? "Los defectos se corrigen y se vuelve a probar. La simulación puede recorrer nuevamente la decisión."
          : `Camino alternativo: ${example.no.toLocaleLowerCase("es")}. No se ejecuta simultáneamente con el camino Sí.`,
      x: 610,
      y: 370,
      w: 175,
      h: 80,
      lane: 1,
    },
    {
      id: "Merge",
      type: "bpmn:ExclusiveGateway",
      name: "Convergencia",
      description:
        "Las alternativas exclusivas se reúnen sin esperar dos ramas paralelas.",
      x: 850,
      y: 105,
      w: 50,
      h: 50,
      lane: 0,
    },
    {
      id: "End",
      type: "bpmn:EndEvent",
      name: example.final,
      description:
        "Finaliza este recorrido con el resultado indicado. El evento de fin no tiene flujo de salida.",
      x: 960,
      y: 110,
      w: 36,
      h: 36,
      lane: 0,
    },
  ];
  if (example.id === "software") {
    for (const node of nodes)
      if (!["Start", "Task"].includes(node.id)) node.x += 170;
    const decision = nodes.find((n) => n.id === "Decision")!;
    decision.y = 275;
    decision.lane = 1;
    nodes.splice(2, 0, {
      id: "Review",
      type: "bpmn:Task",
      name: "Ejecutar pruebas",
      description:
        "El equipo ejecuta casos de prueba y registra evidencia antes de evaluar el resultado. La compuerta posterior usa esa evidencia; no realiza las pruebas.",
      x: 425,
      y: 260,
      w: 160,
      h: 80,
      lane: 1,
    });
  }
  return nodes;
}
export function exampleEdges(example: BpmnExample) {
  return [
    { id: "Flow1", from: "Start", to: "Task", label: "" },
    {
      id: "Flow2",
      from: "Task",
      to: example.id === "software" ? "Review" : "Decision",
      label: "",
    },
    ...(example.id === "software"
      ? [
          {
            id: "FlowReview",
            from: "Review",
            to: "Decision",
            label: "Resultados de pruebas",
          },
        ]
      : []),
    { id: "FlowYes", from: "Decision", to: "Yes", label: "Sí" },
    { id: "FlowNo", from: "Decision", to: "No", label: "No" },
    { id: "Flow3", from: "Yes", to: "Merge", label: "" },
    {
      id: "Flow4",
      from: "No",
      to: example.id === "software" ? "Review" : "Merge",
      label: example.id === "software" ? "Volver a probar" : "",
    },
    { id: "Flow5", from: "Merge", to: "End", label: "" },
  ];
}
export function exampleXml(example: BpmnExample): string {
  const nodes = exampleSteps(example),
    edges = exampleEdges(example);
  const element = (type: string) =>
    type.replace(/:([A-Z])/, (_, letter: string) => `:${letter.toLowerCase()}`);
  return `<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions" targetNamespace="https://gestion-calidad.example/educacion"><bpmn:collaboration id="Collaboration"><bpmn:participant id="Pool" name="Caso educativo" processRef="Process"/></bpmn:collaboration><bpmn:process id="Process" isExecutable="false"><bpmn:laneSet id="Lanes">${example.lanes
    .map(
      (lane, i) =>
        `<bpmn:lane id="Lane${i}" name="${escapeXml(lane)}">${nodes
          .filter((n) => n.lane === i)
          .map((n) => `<bpmn:flowNodeRef>${n.id}</bpmn:flowNodeRef>`)
          .join("")}</bpmn:lane>`,
    )
    .join("")}</bpmn:laneSet>${nodes
    .map(
      (node) =>
        `<${element(node.type)} id="${node.id}" name="${escapeXml(node.name)}">${edges
          .filter((e) => e.to === node.id)
          .map((e) => `<bpmn:incoming>${e.id}</bpmn:incoming>`)
          .join("")}${edges
          .filter((e) => e.from === node.id)
          .map((e) => `<bpmn:outgoing>${e.id}</bpmn:outgoing>`)
          .join("")}</${element(node.type)}>`,
    )
    .join(
      "",
    )}${edges.map((e) => `<bpmn:sequenceFlow id="${e.id}" sourceRef="${e.from}" targetRef="${e.to}" name="${escapeXml(e.label)}"/>`).join("")}</bpmn:process><bpmndi:BPMNDiagram id="Diagram"><bpmndi:BPMNPlane id="Plane" bpmnElement="Collaboration"><bpmndi:BPMNShape id="Pool_di" bpmnElement="Pool" isHorizontal="true"><dc:Bounds x="40" y="40" width="${example.id === "software" ? 1220 : 1050}" height="470"/></bpmndi:BPMNShape>${example.lanes.map((_, i) => `<bpmndi:BPMNShape id="Lane${i}_di" bpmnElement="Lane${i}" isHorizontal="true"><dc:Bounds x="70" y="${40 + i * 190}" width="${example.id === "software" ? 1190 : 1020}" height="${i === 0 ? 190 : 280}"/></bpmndi:BPMNShape>`).join("")}${nodes.map((n) => `<bpmndi:BPMNShape id="${n.id}_di" bpmnElement="${n.id}" ${n.type === "bpmn:ExclusiveGateway" ? 'isMarkerVisible="true"' : ""}><dc:Bounds x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}"/></bpmndi:BPMNShape>`).join("")}${edges
    .map((e) => {
      const from = nodes.find((n) => n.id === e.from)!,
        to = nodes.find((n) => n.id === e.to)!;
      const points =
        from.lane === to.lane
          ? to.x < from.x
            ? [
                [from.x, from.y + from.h / 2],
                [from.x - 30, from.y + from.h / 2],
                [from.x - 30, Math.max(from.y + from.h, to.y + to.h) + 35],
                [to.x + to.w / 2, Math.max(from.y + from.h, to.y + to.h) + 35],
                [to.x + to.w / 2, to.y + to.h],
              ]
            : [
                [from.x + from.w, from.y + from.h / 2],
                [(from.x + from.w + to.x) / 2, from.y + from.h / 2],
                [(from.x + from.w + to.x) / 2, to.y + to.h / 2],
                [to.x, to.y + to.h / 2],
              ]
          : from.lane === 0
            ? [
                [from.x + from.w / 2, from.y + from.h],
                [from.x + from.w / 2, to.y + to.h / 2],
                [to.x, to.y + to.h / 2],
              ]
            : [
                [to.x < from.x ? from.x : from.x + from.w, from.y + from.h / 2],
                [to.x - 25, from.y + from.h / 2],
                [to.x - 25, to.y + to.h / 2],
                [to.x, to.y + to.h / 2],
              ];
      return `<bpmndi:BPMNEdge id="${e.id}_di" bpmnElement="${e.id}">${points.map(([x, y]) => `<di:waypoint x="${x}" y="${y}"/>`).join("")}</bpmndi:BPMNEdge>`;
    })
    .join("")}</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>`;
}
export const emptyBpmnXml = `<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_empty" targetNamespace="https://gestion-calidad.example/educacion"><bpmn:process id="Process_empty" isExecutable="false"><bpmn:startEvent id="Start_empty" name="Inicio"/></bpmn:process><bpmndi:BPMNDiagram id="Diagram_empty"><bpmndi:BPMNPlane id="Plane_empty" bpmnElement="Process_empty"><bpmndi:BPMNShape id="Start_empty_di" bpmnElement="Start_empty"><dc:Bounds x="150" y="150" width="36" height="36"/></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>`;
