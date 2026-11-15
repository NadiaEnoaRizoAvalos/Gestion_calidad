import { symbols, type SymbolGroup } from "./symbols";
export interface BpmnElementSpec {
  id: string;
  type: string;
  label: string;
  symbolId: string;
  group: SymbolGroup;
  eventDefinitionType?: string;
}
export const bpmnElements: BpmnElementSpec[] = [
  {
    id: "bpmn:StartEvent",
    type: "bpmn:StartEvent",
    label: "Inicio",
    symbolId: "start",
    group: "Eventos",
  },
  {
    id: "start-message",
    type: "bpmn:StartEvent",
    eventDefinitionType: "bpmn:MessageEventDefinition",
    label: "Inicio por mensaje",
    symbolId: "start-message",
    group: "Eventos",
  },
  {
    id: "bpmn:IntermediateThrowEvent",
    type: "bpmn:IntermediateThrowEvent",
    label: "Evento intermedio",
    symbolId: "intermediate",
    group: "Eventos",
  },
  {
    id: "intermediate-message",
    type: "bpmn:IntermediateCatchEvent",
    eventDefinitionType: "bpmn:MessageEventDefinition",
    label: "Intermedio por mensaje",
    symbolId: "intermediate-message",
    group: "Eventos",
  },
  {
    id: "intermediate-timer",
    type: "bpmn:IntermediateCatchEvent",
    eventDefinitionType: "bpmn:TimerEventDefinition",
    label: "Intermedio temporizador",
    symbolId: "intermediate-timer",
    group: "Eventos",
  },
  {
    id: "bpmn:EndEvent",
    type: "bpmn:EndEvent",
    label: "Fin",
    symbolId: "end",
    group: "Eventos",
  },
  {
    id: "end-message",
    type: "bpmn:EndEvent",
    eventDefinitionType: "bpmn:MessageEventDefinition",
    label: "Fin por mensaje",
    symbolId: "end-message",
    group: "Eventos",
  },
  ...(
    [
      ["Task", "Tarea", "task"],
      ["ManualTask", "Tarea manual", "manual-task"],
      ["UserTask", "Tarea de usuario", "user-task"],
      ["ServiceTask", "Tarea de servicio / sistema", "service-task"],
      ["SendTask", "Tarea de envío", "send-task"],
      ["ReceiveTask", "Tarea de recepción", "receive-task"],
      ["SubProcess", "Subproceso", "subprocess"],
    ] as const
  ).map(([type, label, symbolId]) => ({
    id: `bpmn:${type}`,
    type: `bpmn:${type}`,
    label,
    symbolId,
    group: "Actividades" as const,
  })),
  ...(
    [
      ["ExclusiveGateway", "Compuerta XOR", "xor"],
      ["ParallelGateway", "Compuerta AND", "and"],
      ["InclusiveGateway", "Compuerta OR", "or"],
    ] as const
  ).map(([type, label, symbolId]) => ({
    id: `bpmn:${type}`,
    type: `bpmn:${type}`,
    label,
    symbolId,
    group: "Compuertas" as const,
  })),
  {
    id: "bpmn:DataObjectReference",
    type: "bpmn:DataObjectReference",
    label: "Objeto de datos",
    symbolId: "data",
    group: "Datos",
  },
  {
    id: "bpmn:TextAnnotation",
    type: "bpmn:TextAnnotation",
    label: "Anotación",
    symbolId: "annotation",
    group: "Datos",
  },
];
export function describeBpmnElement(
  type: string,
  eventDefinitions: readonly string[] = [],
) {
  const spec = bpmnElements.find(
    (item) =>
      item.type === type &&
      (item.eventDefinitionType
        ? eventDefinitions.includes(item.eventDefinitionType)
        : eventDefinitions.length === 0),
  );
  const definition = eventDefinitions.includes("bpmn:MessageEventDefinition")
    ? "Mensaje"
    : eventDefinitions.includes("bpmn:TimerEventDefinition")
      ? "Temporizador"
      : eventDefinitions.length
        ? "Otra definición"
        : "Ninguno";
  return {
    spec,
    help: symbols.find((item) => item.id === spec?.symbolId),
    kind: /Event$/.test(type)
      ? "Evento"
      : /Task$/.test(type)
        ? "Tarea"
        : "Elemento BPMN",
    subtype:
      type === "bpmn:StartEvent"
        ? "Inicio"
        : type === "bpmn:EndEvent"
          ? "Fin"
          : /Intermediate/.test(type)
            ? "Intermedio"
            : type === "bpmn:Task"
              ? "Genérica"
              : (spec?.label ?? type.replace("bpmn:", "")),
    definition,
  };
}
export const validTimerDuration = (value: string) =>
  /^P(?=\d|T\d)(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/.test(
    value,
  );
