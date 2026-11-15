export const exercises = [
  {
    id: "io",
    level: "Inicial",
    title: "Identificar entradas y salidas",
    objective:
      "Distinguir lo que se recibe, lo que se transforma y los recursos.",
    case: "Una persona solicita un presupuesto; el equipo consulta costos con una computadora y envía una propuesta.",
    prompt: "Identificá la entrada y la salida del proceso de cotización.",
    kind: "quiz",
    questions: [
      {
        text: "¿Cuál es la entrada?",
        options: [
          "Solicitud del cliente",
          "Computadora",
          "Presupuesto enviado",
        ],
        answer: 0,
        explanation:
          "La solicitud inicia el trabajo; la computadora es un recurso, y el presupuesto es el resultado.",
      },
      {
        text: "¿Cuál es la salida?",
        options: [
          "Computadora",
          "Solicitud del cliente",
          "Presupuesto enviado",
        ],
        answer: 2,
        explanation:
          "La propuesta entregada es la salida que recibe el cliente y puede alimentar la venta.",
      },
    ],
  },
  {
    id: "classify",
    level: "Inicial",
    title: "Clasificar un proceso",
    objective: "Justificar una categoría según el propósito del proceso.",
    case: "Una óptica revisa su SGC mediante auditorías internas para detectar hallazgos y seguir acciones.",
    prompt: "Elegí la categoría que corresponde al alcance descrito.",
    kind: "quiz",
    questions: [
      {
        text: "Auditorías internas del sistema",
        options: ["Estratégicos", "Operativos", "De apoyo", "De gestión"],
        answer: 3,
        explanation:
          "La diapositiva 26 ubica las auditorías internas en gestión porque realizan seguimiento y control. No son la prestación óptica al cliente ni el suministro de un recurso.",
      },
    ],
  },
  {
    id: "symbols",
    level: "Inicial",
    title: "Reconocer símbolos BPMN",
    objective: "Diferenciar decisión, trabajo y acontecimientos.",
    case: "Un pedido se prepara si hay stock; de lo contrario se comunica una alternativa. Solo se toma un camino.",
    prompt: "Elegí la representación adecuada para esta decisión.",
    kind: "quiz",
    questions: [
      {
        text: "¿Qué elemento necesitás?",
        options: [
          "Compuerta paralela AND",
          "Compuerta exclusiva XOR",
          "Evento de fin",
        ],
        answer: 1,
        explanation:
          "XOR elige una alternativa. AND activaría todas las ramas; un evento de fin termina un recorrido.",
      },
    ],
  },
  {
    id: "order",
    level: "Inicial",
    title: "Ordenar actividades",
    objective: "Relacionar cada salida con la entrada del paso siguiente.",
    case: "Un pedido comercial ya fue recibido y debe analizarse, prepararse y entregarse.",
    prompt: "Usá Subir y Bajar para ordenar los pasos.",
    kind: "order",
    questions: [],
  },
  {
    id: "complete-map",
    level: "Intermedio",
    title: "Completar un mapa",
    objective: "Reconocer los cuatro grupos del mapa de la cátedra.",
    case: "El mapa reducido de una óptica muestra planificación, atención al cliente y compras, pero falta el seguimiento del sistema.",
    prompt:
      "Agregá Auditorías internas, clasificalo y vinculalo con Planificación estratégica mediante hallazgos para mejorar.",
    kind: "map",
    questions: [],
  },
  {
    id: "wrong-map",
    level: "Intermedio",
    title: "Detectar una clasificación incorrecta",
    objective: "Corregir según función y no por posición en el dibujo.",
    case: "Compras de la óptica fue situada como proceso operativo, aunque en este caso solo abastece recursos a la atención.",
    prompt:
      "Revisá Compras, justificá su categoría y corregila mediante el selector o arrastrándola.",
    kind: "map",
    questions: [],
  },
  {
    id: "relate",
    level: "Intermedio",
    title: "Relacionar procesos",
    objective: "Explicar el intercambio entre procesos.",
    case: "El mapa muestra procesos pero no comunica cómo compras abastece a la atención al cliente.",
    prompt:
      "Agregá una relación de Compras hacia Atención al cliente y describí qué recurso intercambian.",
    kind: "map",
    questions: [],
  },
  {
    id: "complete-bpmn",
    level: "Intermedio",
    title: "Completar un BPMN",
    objective: "Construir un recorrido conectado con inicio, trabajo y fin.",
    case: "Recibiste un inicio vacío para modelar la verificación de un pedido.",
    prompt:
      "Abrí el editor BPMN. Agregá la tarea Verificar pedido y un fin, conectalos por secuencia y comprobá el modelo.",
    kind: "bpmn",
    questions: [],
  },
  {
    id: "integrated",
    level: "Avanzado",
    title: "Mapa, ficha y BPMN de mi organización",
    objective: "Relacionar tres representaciones del mismo proceso.",
    case: "Elegí software, hospital, comercio, óptica u otra organización. Definí una necesidad y un resultado alcanzable.",
    prompt:
      "Creá y guardá un mapa con los cuatro grupos y relaciones justificadas. Caracterizá un proceso en su ficha y construí su BPMN. Guardá ambos y comparalos en la biblioteca del laboratorio.",
    kind: "integrated",
    questions: [],
  },
] as const;
export function checkClassification(actual: string, expected: string) {
  return actual === expected
    ? "La categoría coincide con el propósito del caso."
    : `En este caso corresponde ${expected}: revisá si el proceso orienta, entrega valor, aporta recursos o realiza seguimiento.`;
}
