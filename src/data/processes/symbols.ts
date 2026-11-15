const basicSymbols = [
  {
    id: "start",
    name: "Evento de inicio",
    use: "Indica dónde comienza el proceso.",
    example: "Solicitud recibida.",
    error: "No recibe flujo de secuencia.",
  },
  {
    id: "intermediate",
    name: "Evento intermedio básico",
    use: "Marca un acontecimiento entre inicio y fin. El evento sin disparador mostrado es de lanzamiento.",
    example: "Hito alcanzado.",
    error:
      "No implica esperar un mensaje; eso requiere un evento de captura tipado.",
  },
  {
    id: "end",
    name: "Evento de fin",
    use: "Termina el recorrido que llega a él.",
    example: "Pedido entregado.",
    error: "No emite flujo de secuencia.",
  },
  {
    id: "task",
    name: "Tarea",
    use: "Representa trabajo dentro del proceso.",
    example: "Verificar pedido.",
    error: "Una tarea no es un evento.",
  },
  {
    id: "subprocess",
    name: "Subproceso",
    use: "Agrupa actividades; el marcador + indica detalle contraído.",
    example: "Gestionar entrega.",
    error: "El + pequeño en una caja no es una compuerta paralela.",
  },
  {
    id: "xor",
    name: "Compuerta exclusiva (XOR)",
    use: "Selecciona una alternativa según condiciones.",
    example: "Pedido disponible: sí o no.",
    error: "No activa todas las ramas.",
  },
  {
    id: "and",
    name: "Compuerta paralela (AND)",
    use: "Abre todas las ramas; al reunirlas sincroniza las entradas.",
    example: "Preparar pedido y emitir documentación.",
    error: "No elige una rama por condición.",
  },
  {
    id: "or",
    name: "Compuerta inclusiva (OR)",
    use: "Puede activar una o más alternativas según sus condiciones.",
    example: "Notificar por correo, SMS o ambos.",
    error: "No es equivalente a XOR ni a AND.",
  },
  {
    id: "sequence",
    name: "Flujo de secuencia",
    use: "Ordena elementos del mismo proceso.",
    example: "Verificar → entregar.",
    error: "No cruza pools.",
  },
  {
    id: "message",
    name: "Flujo de mensaje",
    use: "Comunica participantes diferentes.",
    example: "Cliente envía pedido a empresa.",
    error: "No conecta tareas dentro del mismo pool.",
  },
  {
    id: "association",
    name: "Asociación",
    use: "Vincula información o anotaciones.",
    example: "Una aclaración sobre una tarea.",
    error: "No transporta control de ejecución.",
  },
  {
    id: "pool",
    name: "Pool (participante)",
    use: "Representa un participante en una colaboración.",
    example: "Empresa y proveedor en pools distintos.",
    error: "No se usa como una tarea.",
  },
  {
    id: "lane",
    name: "Lane (carril)",
    use: "Organiza responsabilidades dentro de un proceso.",
    example: "Compras y Almacén dentro de Empresa.",
    error: "Cruzar carriles no exige mensaje si pertenecen al mismo pool.",
  },
  {
    id: "data",
    name: "Objeto de datos",
    use: "Representa información utilizada o producida.",
    example: "Orden de compra.",
    error: "No reemplaza una tarea ni un flujo de secuencia.",
  },
  {
    id: "annotation",
    name: "Anotación",
    use: "Añade una explicación al modelo.",
    example: "Plazo acordado con el cliente.",
    error: "No cambia por sí misma el recorrido.",
  },
];

export const symbolGroups = [
  "Eventos",
  "Actividades",
  "Compuertas",
  "Conexiones",
  "Participantes",
  "Datos",
] as const;
export type SymbolGroup = (typeof symbolGroups)[number];
const additions = [
  {
    id: "start-message",
    name: "Inicio por mensaje",
    use: "Inicia un proceso al recibir un mensaje de otro participante. Se usa cuando esa recepción dispara un nuevo caso.",
    example: "Llega una solicitud de compra.",
    error:
      "El sobre es hueco: captura un mensaje. El evento representa la recepción; el flujo de mensaje representa la comunicación entre participantes.",
  },
  {
    id: "intermediate-message",
    name: "Intermedio por mensaje",
    use: "Espera un mensaje durante un proceso que ya comenzó. El doble borde indica que es intermedio y el sobre hueco indica captura.",
    example: "Esperar la confirmación del proveedor.",
    error:
      "No inicia una instancia nueva ni sustituye el flujo de mensaje que llega desde otro participante.",
  },
  {
    id: "intermediate-timer",
    name: "Intermedio temporizador",
    use: "Espera una fecha, duración o ciclo. Aquí se practica una duración; el reloj y el doble borde lo distinguen de otros eventos.",
    example: "Esperar una hora antes de recordar un pedido.",
    error:
      "Es una espera temporal, no una compuerta que elige caminos. El editor modela el plazo; no ejecuta una cuenta regresiva.",
  },
  {
    id: "end-message",
    name: "Fin por mensaje",
    use: "Envía un mensaje al terminar el recorrido. El borde grueso indica fin y el sobre relleno indica lanzamiento.",
    example: "Enviar la confirmación final de un pedido.",
    error:
      "No recibe mensajes ni tiene salida de secuencia. El flujo de mensaje comunica con el receptor de otro participante.",
  },
  {
    id: "manual-task",
    name: "Tarea manual",
    use: "Trabajo de una persona sin asistencia de un motor de procesos ni de una aplicación. La mano identifica el tipo.",
    example: "Embalar físicamente un pedido.",
    error:
      "Una tarea de usuario también es humana, pero se realiza con asistencia de software; una tarea de servicio es automatizada.",
  },
  {
    id: "user-task",
    name: "Tarea de usuario",
    use: "Trabajo humano realizado con asistencia de una aplicación; el marcador de persona aparece arriba a la izquierda.",
    example: "Una persona revisa una solicitud en el sistema.",
    error:
      "No equivale a una tarea manual sin asistencia de software ni a una tarea automática de servicio.",
  },
  {
    id: "service-task",
    name: "Tarea de servicio / sistema",
    use: "Trabajo realizado automáticamente por una aplicación o servicio. Los engranajes distinguen este tipo de tarea.",
    example: "Consultar automáticamente el stock.",
    error:
      "El engranaje no representa una persona. Dibujarlo no configura ni ejecuta una conexión real con un sistema.",
  },
  {
    id: "send-task",
    name: "Tarea de envío",
    use: "Actividad que envía un mensaje a otro participante; el sobre relleno se ubica en la esquina superior izquierda.",
    example: "Enviar una orden al proveedor.",
    error:
      "Es una actividad, no un evento. Se diferencia de recepción por el sobre relleno; la comunicación usa un flujo de mensaje.",
  },
  {
    id: "receive-task",
    name: "Tarea de recepción",
    use: "Actividad que espera un mensaje de otro participante. Su sobre hueco distingue recepción de envío.",
    example: "Recibir la confirmación de despacho.",
    error:
      "No es una tarea de envío ni un evento de captura: la recepción se modela aquí como actividad con su propio alcance.",
  },
];
export const symbols = [...basicSymbols, ...additions]
  .map((symbol) => ({
    ...symbol,
    group: ([
      "start",
      "intermediate",
      "end",
      "start-message",
      "intermediate-message",
      "intermediate-timer",
      "end-message",
    ].includes(symbol.id)
      ? "Eventos"
      : [
            "task",
            "subprocess",
            "manual-task",
            "user-task",
            "service-task",
            "send-task",
            "receive-task",
          ].includes(symbol.id)
        ? "Actividades"
        : ["xor", "and", "or"].includes(symbol.id)
          ? "Compuertas"
          : ["sequence", "message", "association"].includes(symbol.id)
            ? "Conexiones"
            : ["pool", "lane"].includes(symbol.id)
              ? "Participantes"
              : "Datos") as SymbolGroup,
  }))
  .sort(
    (a, b) => symbolGroups.indexOf(a.group) - symbolGroups.indexOf(b.group),
  );
