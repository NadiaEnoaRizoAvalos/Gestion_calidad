import type { Question } from "../types";

export const questions: Question[] = [
  {
    id: "q-sgc",
    topic: "introduccion",
    prompt: "¿Qué busca un sistema de gestión de calidad?",
    options: [
      "Inspeccionar solo el producto final",
      "Organizar procesos para cumplir requisitos y mejorar",
      "Eliminar toda documentación",
    ],
    correct: 1,
    explanation:
      "Un SGC coordina procesos, responsabilidades y recursos. Inspeccionar al final puede ser una actividad, pero no representa todo el sistema.",
    difficulty: "Inicial",
    origin: "Pregunta de práctica generada con IA",
    tags: ["SGC", "Objetivos"],
  },
  {
    id: "q-principios",
    topic: "principios",
    prompt:
      "Antes de decidir un cambio, el equipo analiza los reclamos registrados. ¿Qué principio aplica?",
    options: [
      "Decisiones basadas en evidencia",
      "Inspección exclusiva al final",
      "Eliminación de responsables",
    ],
    correct: 0,
    explanation:
      "Los registros aportan evidencia para decidir. Conviene considerar también su calidad, contexto y limitaciones.",
    difficulty: "Inicial",
    origin: "Pregunta de práctica generada con IA",
    tags: ["Principios", "Evidencia"],
  },
  {
    id: "q-iso",
    topic: "iso",
    prompt:
      "¿Qué hace falta para estudiar un requisito específico de ISO 9001?",
    options: [
      "Solo una práctica en esta aplicación",
      "Cualquier resumen sin fecha",
      "Consultar la edición y el material aplicables",
    ],
    correct: 2,
    explanation:
      "Los requisitos se estudian en el contexto de la edición correspondiente. Esta aplicación no reemplaza la norma ni certifica conocimientos.",
    difficulty: "Inicial",
    origin: "Pregunta de práctica generada con IA",
    tags: ["ISO", "Normas"],
  },
  {
    id: "q-phva",
    topic: "phva",
    prompt:
      "Después de probar una mejora, el equipo compara resultados con el objetivo. ¿En qué etapa está?",
    options: ["Planificar", "Verificar", "Hacer"],
    correct: 1,
    explanation:
      "Verificar consiste en evaluar el resultado frente a los objetivos y criterios definidos al planificar.",
    difficulty: "Inicial",
    origin: "Pregunta de práctica generada con IA",
    tags: ["PHVA", "Indicadores"],
  },
  {
    id: "q-proceso",
    topic: "procesos",
    prompt: "En el proceso de préstamo de libros, ¿cuál es una salida?",
    options: [
      "La solicitud del lector",
      "El catálogo disponible",
      "El préstamo registrado y el libro entregado",
    ],
    correct: 2,
    explanation:
      "La salida es el resultado del proceso. La solicitud es una entrada y el catálogo es un recurso para realizar las actividades.",
    difficulty: "Inicial",
    origin: "Pregunta de práctica generada con IA",
    tags: ["Entradas", "Salidas"],
  },
  {
    id: "q-mapa",
    topic: "mapas",
    prompt: "¿Qué proceso suele clasificarse como apoyo en una biblioteca?",
    options: [
      "Mantenimiento del sistema informático",
      "Préstamo de libros",
      "Definición de objetivos institucionales",
    ],
    correct: 0,
    explanation:
      "Mantenimiento aporta un recurso necesario. El préstamo entrega valor principal y la definición de objetivos orienta a la organización.",
    difficulty: "Inicial",
    origin: "Pregunta de práctica generada con IA",
    tags: ["Mapa", "Apoyo"],
  },
  {
    id: "q-bpmn",
    topic: "bpmn",
    prompt: "Una compuerta exclusiva en BPMN representa…",
    options: [
      "La ejecución simultánea de todas las ramas",
      "La elección de una alternativa según una condición",
      "El final obligatorio del proceso",
    ],
    correct: 1,
    explanation:
      "La compuerta exclusiva selecciona una alternativa. La ejecución en paralelo tiene otro símbolo y otro significado.",
    difficulty: "Intermedio",
    origin: "Pregunta de práctica generada con IA",
    tags: ["BPMN", "Compuertas"],
  },
  {
    id: "q-mejora",
    topic: "mejora",
    prompt:
      "¿Qué acción ayuda a prevenir la repetición de un pedido equivocado?",
    options: [
      "Reenviar el pedido sin investigar",
      "Ignorar los reclamos aislados",
      "Investigar la causa y evaluar una mejora en la identificación",
    ],
    correct: 2,
    explanation:
      "Corregir el pedido resuelve el caso puntual. Investigar y tratar la causa ayuda a reducir la repetición; luego debe verificarse la eficacia.",
    difficulty: "Intermedio",
    origin: "Pregunta de práctica generada con IA",
    tags: ["Causa", "Mejora continua"],
  },
];
