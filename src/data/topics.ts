import type { Topic } from "../types";

// Material introductorio de ejemplo; no corresponde a apuntes de la cátedra.
export const topics: Topic[] = [
  {
    id: "introduccion",
    title: "Introducción a los SGC",
    category: "Fundamentos",
    minutes: 8,
    description: "Una primera mirada a la calidad como forma de trabajar.",
    definition:
      "Un sistema de gestión de calidad (SGC) organiza procesos, responsabilidades y recursos para cumplir requisitos y mejorar de forma continua. La calidad se construye a lo largo del trabajo, desde comprender una necesidad hasta evaluar el resultado.",
    example:
      "Una biblioteca registra solicitudes, acuerda tiempos de préstamo y revisa los reclamos para mejorar su atención.",
    concepts: [
      "Calidad",
      "Requisitos",
      "Satisfacción del cliente",
      "Sistema de gestión",
    ],
  },
  {
    id: "principios",
    title: "Principios de gestión de calidad",
    category: "Fundamentos",
    minutes: 10,
    description: "Las ideas que orientan una cultura de calidad.",
    definition:
      "El enfoque al cliente, el liderazgo, el compromiso de las personas, el enfoque a procesos, la mejora, las decisiones basadas en evidencia y la gestión de las relaciones orientan la gestión de la calidad. Son ideas para guiar decisiones, no una lista de tareas aisladas.",
    example:
      "Antes de cambiar el horario de atención, una organización analiza consultas y conversa con usuarios y personal.",
    concepts: ["Enfoque al cliente", "Liderazgo", "Evidencia", "Relaciones"],
  },
  {
    id: "iso",
    title: "Normas ISO",
    category: "Fundamentos",
    minutes: 8,
    description: "Para qué sirven las normas y cómo estudiarlas.",
    definition:
      "Las normas proporcionan acuerdos y criterios compartidos. La familia ISO 9000 se relaciona con la gestión de la calidad; ISO 9001 establece requisitos para un SGC. Para estudiar un requisito concreto es necesario consultar la edición y el material aplicables.",
    example:
      "Una empresa compara sus prácticas con la norma que decidió adoptar. Leer un resumen o completar esta aplicación no equivale a obtener una certificación.",
    concepts: ["Norma", "Requisitos", "Edición aplicable", "Certificación"],
  },
  {
    id: "phva",
    title: "Ciclo PHVA",
    category: "Mejora",
    minutes: 10,
    description: "Planificar, hacer, verificar y actuar.",
    definition:
      "PHVA propone planificar una mejora y sus objetivos, hacer una prueba, verificar los resultados frente a lo esperado y actuar con lo aprendido. El ciclo se repite: una mejora necesita seguimiento.",
    example:
      "Para reducir entregas tardías se mide el problema, se prueba una nueva preparación, se comparan los plazos y se ajusta o se estandariza la solución.",
    concepts: ["Planificar", "Hacer", "Verificar", "Actuar"],
  },
  {
    id: "procesos",
    title: "Enfoque basado en procesos",
    category: "Procesos",
    minutes: 10,
    description: "Conectar entradas, actividades y resultados.",
    definition:
      "Un proceso transforma entradas en salidas mediante actividades relacionadas. Analizarlo implica reconocer su objetivo, responsables, recursos, destinatarios e indicadores, además de sus vínculos con otros procesos.",
    example:
      "En un pedido, la entrada es la solicitud del cliente; las actividades incluyen preparar y despachar; la salida es el pedido entregado.",
    concepts: ["Entrada", "Actividad", "Salida", "Indicador"],
  },
  {
    id: "mapas",
    title: "Mapas de procesos",
    category: "Procesos",
    minutes: 8,
    description: "Ver la organización como un conjunto conectado.",
    definition:
      "Un mapa representa los procesos y sus relaciones. Puede agruparlos en estratégicos (orientan), operativos (producen el valor principal) y de apoyo (aportan recursos). La clasificación depende del propósito de la organización.",
    example:
      "En una biblioteca: planificación del servicio es estratégica, préstamo es operativo y mantenimiento del sistema es apoyo.",
    concepts: ["Estratégicos", "Operativos", "Apoyo", "Relaciones"],
  },
  {
    id: "bpmn",
    title: "Introducción a BPMN",
    category: "Procesos",
    minutes: 12,
    description: "Un lenguaje visual para describir procesos.",
    definition:
      "BPMN permite representar procesos de negocio. Un evento se dibuja como un círculo; una actividad como un rectángulo redondeado; una compuerta como un rombo y un flujo de secuencia como una línea con flecha. Una compuerta exclusiva elige una alternativa según una condición.",
    example:
      "Se recibe un pedido, se revisa el stock y se elige entre preparar el envío o informar que no hay disponibilidad. Las alternativas no se ejecutan simultáneamente.",
    concepts: [
      "Evento",
      "Actividad",
      "Compuerta exclusiva",
      "Flujo de secuencia",
    ],
  },
  {
    id: "mejora",
    title: "Mejora continua",
    category: "Mejora",
    minutes: 8,
    description: "Pequeños cambios, aprendizaje constante.",
    definition:
      "Mejorar continuamente implica revisar resultados, detectar oportunidades y evaluar cambios. Corregir un resultado puntual no es lo mismo que investigar y tratar la causa de un problema para evitar que se repita.",
    example:
      "Reenviar un pedido equivocado corrige el caso; investigar por qué se confundió y probar una identificación más clara ayuda a evitar repeticiones.",
    concepts: ["Corrección", "Causa", "Acción de mejora", "Seguimiento"],
  },
];

export const extraActivities = [
  { id: "simulador", title: "Recorrer el simulador PHVA", path: "/simulador" },
  { id: "mapa", title: "Explorar el mapa de procesos", path: "/procesos" },
  {
    id: "practica",
    title: "Completar una práctica de preguntas",
    path: "/parciales",
  },
];

export const activities = [
  ...topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    path: `/teoria?tema=${topic.id}`,
  })),
  ...extraActivities,
];
