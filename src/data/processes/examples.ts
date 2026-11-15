import type {
  ProcessMap,
  ProcessNode,
  ProcessSheet,
  ProcessCategory,
} from "../../types/processLab";
import { categoryHelp } from "./content";
export const emptySheet = (): ProcessSheet => ({
  name: "",
  objective: "",
  scope: "",
  owner: "",
  inputs: "",
  activities: "",
  outputs: "",
  resources: "",
  indicators: "",
  records: "",
  related: "",
});
export function newMap(): ProcessMap {
  return {
    kind: "map",
    id: crypto.randomUUID(),
    name: "Mi mapa de procesos",
    organization: "Organización propia",
    needs: "Necesidades de las partes interesadas",
    result: "Resultados y satisfacción",
    nodes: [],
    relations: [],
    sheet: emptySheet(),
  };
}
const cases = [
  {
    id: "software",
    name: "Empresa de software",
    source:
      "Caso educativo basado en diap. 16–17; descomposición y clasificación propias.",
    needs:
      "Una aplicación que resuelva requisitos acordados y pueda mantenerse.",
    result: "Aplicación probada, instalada y con soporte.",
    operational: [
      "Análisis de necesidades",
      "Diseño",
      "Desarrollo",
      "Pruebas",
      "Entrega",
      "Mantenimiento de aplicaciones",
    ],
    support: ["Gestión de recursos humanos", "Formación técnica", "Sistemas"],
    input: "Requisitos del cliente",
    output: "Aplicación y evidencias de aceptación",
  },
  {
    id: "hospital",
    name: "Hospital",
    source:
      "Caso educativo inspirado en diap. 25 y 30; no es un mapa oficial ni una guía clínica.",
    needs: "Acceso a atención segura y coordinada.",
    result: "Paciente atendido y continuidad de atención.",
    operational: [
      "Urgencias",
      "Consultas externas",
      "Atención al paciente",
      "Gestión de quirófanos",
    ],
    support: [
      "Gestión de recursos",
      "Mantenimiento",
      "Sistemas de información",
    ],
    input: "Solicitud de atención y datos de ingreso",
    output: "Atención realizada y registros del servicio",
  },
  {
    id: "comercial",
    name: "Empresa comercial",
    source:
      "Caso educativo basado en diap. 13–15 y 18; clasificación según el alcance del caso.",
    needs:
      "Productos adecuados, disponibles y entregados en el plazo convenido.",
    result: "Pedido entregado y posventa atendida.",
    operational: [
      "Comercialización",
      "Ventas",
      "Compras",
      "Almacenamiento",
      "Entregas",
      "Posventa",
    ],
    support: ["Gestión financiera", "Gestión de personal", "Sistemas"],
    input: "Solicitud o pedido del cliente",
    output: "Productos entregados y conformidad del cliente",
  },
  {
    id: "optica",
    name: "Óptica",
    source:
      "Ampliación: caso didáctico adicional; no pertenece al PDF ni prescribe prácticas clínicas.",
    needs: "Un pedido óptico acorde con la receta y las condiciones acordadas.",
    result: "Pedido verificado, entregado y con servicio posventa.",
    operational: [
      "Atención al cliente",
      "Recepción de recetas",
      "Asesoramiento",
      "Preparación de pedidos",
      "Control de calidad del pedido",
      "Entrega",
      "Servicio posventa",
    ],
    support: ["Compras", "Inventario", "Gestión administrativa"],
    input: "Receta, necesidades y pedido acordado",
    output: "Pedido conforme y constancia de entrega",
  },
];
export const organizations = cases;
export function exampleMap(id: string): ProcessMap {
  const data = cases.find((item) => item.id === id) ?? cases[0];
  const nodes: ProcessNode[] = [];
  const add = (
    name: string,
    category: ProcessCategory,
    inputs: string,
    outputs: string,
    stages: string[],
  ) => {
    nodes.push({
      id: `${data.id}-${nodes.length}`,
      name,
      category,
      inputs,
      outputs,
      purpose: `${name} contribuye a que ${data.name.toLocaleLowerCase("es")} responda a esta necesidad: ${data.needs}`,
      justification: `${categoryHelp[category]} En este caso, ${name.toLocaleLowerCase("es")} ${category === "Operativos" ? "forma parte de la cadena de servicio que termina en el resultado entregado al cliente" : category === "Estratégicos" ? "orienta las decisiones del conjunto de la organización" : category === "De apoyo" ? "proporciona capacidades a quienes ejecutan la cadena operativa" : "comprueba el desempeño y alimenta decisiones de mejora"}.`,
      example: `${inputs} → ${name} → ${outputs}. La clasificación corresponde a este alcance: una actividad de inspección del pedido puede formar parte de la operación, mientras que la auditoría del sistema se ubica en gestión.`,
      stages: stages.map((stage) => ({
        name: stage,
        activities: [
          `Identificar lo necesario para ${stage.toLocaleLowerCase("es")}`,
          `Realizar y registrar ${stage.toLocaleLowerCase("es")}`,
          "Verificar el resultado y comunicarlo a la etapa siguiente",
        ],
      })),
    });
  };
  add(
    "Planificación estratégica",
    "Estratégicos",
    "Necesidades, contexto y resultados de seguimiento",
    "Políticas, objetivos y prioridades",
    ["Analizar contexto", "Definir objetivos", "Asignar prioridades"],
  );
  add(
    "Planificación y mejora",
    "Estratégicos",
    "Indicadores y oportunidades de mejora",
    "Plan de mejora y recursos autorizados",
    ["Priorizar mejoras", "Planificar cambios", "Revisar resultados"],
  );
  const details: Record<string, { name: string; activities: string[] }[]> = {
    "Análisis de necesidades": [
      {
        name: "Relevar necesidades",
        activities: [
          "Identificar usuarios y uso previsto",
          "Recoger funciones requeridas y restricciones",
          "Registrar dudas para aclararlas con el cliente",
        ],
      },
      {
        name: "Especificar requisitos",
        activities: [
          "Documentar requisitos funcionales",
          "Identificar criterios de aceptación",
          "Acordar prioridades y condiciones de entrega",
        ],
      },
      {
        name: "Validar solicitud",
        activities: [
          "Revisar el alcance con el cliente",
          "Resolver diferencias de interpretación",
          "Entregar requisitos acordados al diseño",
        ],
      },
    ],
    Urgencias: [
      {
        name: "Recibir la solicitud de atención",
        activities: [
          "Registrar los datos de ingreso",
          "Identificar el circuito de atención correspondiente",
          "Comunicar la solicitud al equipo responsable",
        ],
      },
      {
        name: "Coordinar la atención",
        activities: [
          "Verificar disponibilidad de recursos",
          "Registrar el servicio realizado por el equipo competente",
          "Coordinar las interacciones con otras áreas",
        ],
      },
      {
        name: "Registrar la continuidad",
        activities: [
          "Actualizar los registros de atención",
          "Comunicar los resultados al área receptora",
          "Conservar la evidencia de la transferencia",
        ],
      },
    ],
    Comercialización: [
      {
        name: "Recibir consulta",
        activities: [
          "Identificar al cliente y su necesidad",
          "Registrar el producto o servicio solicitado",
          "Recoger condiciones esperadas",
        ],
      },
      {
        name: "Analizar oportunidad",
        activities: [
          "Aclarar requisitos del pedido",
          "Consultar disponibilidad y capacidad",
          "Definir información necesaria para cotizar",
        ],
      },
      {
        name: "Transferir a ventas",
        activities: [
          "Consolidar los datos de la solicitud",
          "Comunicar condiciones y restricciones",
          "Confirmar la recepción por ventas",
        ],
      },
    ],
    "Atención al cliente": [
      {
        name: "Recibir consulta",
        activities: [
          "Escuchar e identificar la necesidad",
          "Registrar datos del pedido",
          "Distinguir qué información debe aportar el cliente",
        ],
      },
      {
        name: "Acordar atención",
        activities: [
          "Verificar que la información del pedido esté completa",
          "Comunicar condiciones del servicio",
          "Registrar lo acordado sin sustituir la evaluación del profesional competente",
        ],
      },
      {
        name: "Transferir pedido",
        activities: [
          "Preparar los datos para la etapa siguiente",
          "Comunicar requisitos y plazos acordados",
          "Conservar constancia de lo recibido",
        ],
      },
    ],
  };
  data.operational.forEach((name, index) => {
    add(
      name,
      "Operativos",
      data.id === "hospital"
        ? "Solicitud de atención y registros necesarios para la coordinación"
        : index === 0
          ? data.input
          : `Resultado de ${data.operational[index - 1]}`,
      data.id === "hospital"
        ? `Registro de ${name.toLocaleLowerCase("es")} e información para la continuidad de atención`
        : index === data.operational.length - 1
          ? data.output
          : `Resultado para ${data.operational[index + 1]}`,
      ["Preparar", "Ejecutar", "Verificar y transferir"],
    );
    const node = nodes[nodes.length - 1];
    node.stages = details[name] ?? [
      {
        name: `Preparar ${name.toLocaleLowerCase("es")}`,
        activities: [
          `Recibir y revisar: ${node.inputs}`,
          "Identificar requisitos y responsable",
          "Comprobar recursos disponibles",
        ],
      },
      {
        name: `Realizar ${name.toLocaleLowerCase("es")}`,
        activities: [
          `Ejecutar el trabajo de ${name.toLocaleLowerCase("es")}`,
          "Registrar las acciones realizadas",
          "Comunicar incidencias al responsable",
        ],
      },
      {
        name: "Verificar y transferir resultado",
        activities: [
          `Comprobar: ${node.outputs}`,
          "Registrar el resultado y posibles desvíos",
          "Entregar información al proceso receptor",
        ],
      },
    ];
  });
  data.support.forEach((name) =>
    add(
      name,
      "De apoyo",
      "Necesidades de recursos de la operación",
      "Recursos disponibles y adecuados",
      ["Detectar necesidad", "Proveer recurso", "Comprobar disponibilidad"],
    ),
  );
  add(
    "Auditorías internas",
    "De gestión",
    "Criterios, registros y evidencia del proceso",
    "Hallazgos y seguimiento",
    ["Planificar auditoría", "Reunir evidencia", "Informar y seguir hallazgos"],
  );
  add(
    "Riesgos, no conformidades y proveedores",
    "De gestión",
    "Incidencias, riesgos y desempeño de proveedores",
    "Evaluaciones y acciones de seguimiento",
    ["Evaluar", "Definir acciones", "Verificar eficacia"],
  );
  const ops = nodes.filter((node) => node.category === "Operativos");
  const relations =
    data.id === "hospital"
      ? [
          {
            id: "urgencia-atencion",
            from: ops[0].id,
            to: ops[2].id,
            label: "Información para continuidad de atención",
          },
          {
            id: "consulta-atencion",
            from: ops[1].id,
            to: ops[2].id,
            label: "Registros de la consulta y coordinación",
          },
          {
            id: "quirofano-atencion",
            from: ops[3].id,
            to: ops[2].id,
            label: "Información de la prestación realizada",
          },
        ]
      : ops.slice(0, -1).map((node, index) => ({
          id: `rel-${index}`,
          from: node.id,
          to: ops[index + 1].id,
          label: node.outputs,
        }));
  relations.push({
    id: "orientacion",
    from: nodes[0].id,
    to: ops[0].id,
    label: "Objetivos y prioridades",
  });
  nodes
    .filter((node) => node.category === "De apoyo")
    .forEach((node, index) =>
      relations.push({
        id: `recurso-${index}`,
        from: node.id,
        to: ops[0].id,
        label: "Recursos para operar",
      }),
    );
  relations.push({
    id: "seguimiento",
    from: nodes[nodes.length - 2].id,
    to: nodes[1].id,
    label: "Hallazgos para mejorar",
  });
  return {
    kind: "map",
    id: crypto.randomUUID(),
    name: `Mapa · ${data.name}`,
    organization: data.name,
    needs: data.needs,
    result: data.result,
    nodes,
    relations,
    sheet: emptySheet(),
  };
}
export const certificateSheet: ProcessSheet = {
  name: "Gestión de Certificados de Calidad",
  objective:
    "Gestionar la recepción de certificados de materiales y su envío a los clientes que los solicitan.",
  scope: "Desde la solicitud del certificado por el cliente hasta su entrega.",
  owner: "Responsable del control de calidad",
  inputs: "Certificados del proveedor; petición del cliente",
  activities:
    "Reclamar certificado al proveedor; recepcionar certificado; archivar certificado; enviar certificado al cliente",
  outputs: "Certificados enviados y archivados; envíos controlados",
  resources: "PC, escáner, impresora, sello de inspección y archivo",
  indicators:
    "Reclamos de certificados de clientes y a proveedores; incidencias detectadas en auditorías",
  records:
    "Registro de certificados enviados; listado de certificados pendientes (REGISTRO-CERT 01 y 02)",
  related: "Control de recepción; Gestión Comercial; Compras de Material",
};
