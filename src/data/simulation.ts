export const simulationSteps = [
  {
    name: "Planificar",
    concept:
      "Primero comprendemos el problema y definimos un objetivo medible.",
    situation:
      "En Papelería Lila, 12 de cada 100 pedidos llegan con artículos equivocados. Las etiquetas se escriben a mano y no se registra dónde aparece el error.",
    prompt: "¿Por dónde empezarías?",
    options: [
      {
        title: "Registrar y analizar errores antes de decidir",
        feedback:
          "¡Buen comienzo! Registrar el tipo y el origen del error ayuda a investigar causas. El objetivo del piloto será bajar de 12 a 5 errores por cada 100 pedidos.",
        good: true,
      },
      {
        title: "Pedir que todos trabajen más rápido",
        feedback:
          "La velocidad no explica las causas. Para planificar necesitamos datos sobre los errores y un objetivo concreto.",
        good: false,
      },
      {
        title: "Comprar equipos sin analizar el problema",
        feedback:
          "Una compra puede consumir recursos sin resolver la causa. Conviene analizar primero dónde y cómo se producen los errores.",
        good: false,
      },
    ],
  },
  {
    name: "Hacer",
    concept: "Probamos una acción a pequeña escala y registramos qué ocurre.",
    situation:
      "El análisis del caso muestra confusiones entre artículos similares. El equipo propone etiquetas claras y una lista de verificación.",
    prompt: "¿Cómo aplicarías la mejora?",
    options: [
      {
        title: "Cambiar todo sin avisar ni registrar resultados",
        feedback:
          "Sin preparación ni registros será difícil entender qué funcionó. Una prueba controlada permite aprender antes de ampliar el cambio.",
        good: false,
      },
      {
        title: "Probar en un turno, capacitar y registrar",
        feedback:
          "¡Exacto! Un piloto con instrucciones claras permite observar el efecto del cambio y detectar dificultades.",
        good: true,
      },
      {
        title: "Guardar la propuesta para otro momento",
        feedback:
          "Sin poner a prueba la acción no obtenemos evidencia de su funcionamiento. Hacer implica ejecutar lo planificado.",
        good: false,
      },
    ],
  },
  {
    name: "Verificar",
    concept: "Comparamos resultados con la situación inicial y el objetivo.",
    situation:
      "El piloto registró 4 pedidos equivocados entre 100 pedidos revisados. Antes había 12; la meta era como máximo 5.",
    prompt: "¿Qué conclusión está respaldada por los datos del piloto?",
    options: [
      {
        title: "El resultado inicial es favorable; conviene seguir midiendo",
        feedback:
          "¡Bien! El 4% está por debajo de la meta del 5%. Un solo piloto no demuestra que el resultado se mantendrá: necesitamos seguimiento.",
        good: true,
      },
      {
        title: "Ya nunca habrá pedidos equivocados",
        feedback:
          "Todavía hubo errores. Los datos del piloto no garantizan un resultado permanente ni la ausencia futura de fallas.",
        good: false,
      },
      {
        title: "No es necesario comparar con el objetivo",
        feedback:
          "Comparar contra una meta definida permite evaluar la mejora con un criterio y no solo con una impresión.",
        good: false,
      },
    ],
  },
  {
    name: "Actuar",
    concept:
      "Usamos lo aprendido para ajustar o estandarizar y comenzar otro ciclo.",
    situation:
      "La prueba resultó favorable, aunque el equipo detectó que algunas etiquetas se despegan con humedad.",
    prompt: "¿Cuál sería el siguiente paso?",
    options: [
      {
        title: "Dejar de registrar porque la meta se cumplió",
        feedback:
          "El seguimiento sigue siendo necesario. Las condiciones pueden cambiar y aparecen nuevas oportunidades de mejora.",
        good: false,
      },
      {
        title: "Descartar todos los resultados del piloto",
        feedback:
          "El piloto aportó evidencia útil. Podemos aprovechar lo que funcionó y ajustar el material de las etiquetas.",
        good: false,
      },
      {
        title: "Ajustar las etiquetas, documentar y dar seguimiento",
        feedback:
          "¡Muy bien! Conservamos el aprendizaje, ajustamos la solución y verificamos que funcione en otros turnos. Así comienza un nuevo ciclo.",
        good: true,
      },
    ],
  },
];
