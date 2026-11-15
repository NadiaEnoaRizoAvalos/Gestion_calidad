export const pdfUrl = `${import.meta.env.BASE_URL}processes/presentacion-procesos-2026.pdf`;
export const omgUrl = "https://www.omg.org/spec/BPMN/2.0.2/PDF";
export const lessons = [
  {
    title: "A · De los departamentos a los procesos",
    slides: "2–10",
    paragraphs: [
      "Una organización necesita coordinar decisiones sobre mercado, capacidad, personas, tecnología, fabricación, finanzas y clientes. Los procesos permiten relacionar esas decisiones con resultados concretos y asignar responsabilidades sobre el trabajo completo.",
      "El organigrama muestra jerarquías y funciones, pero no explica por sí solo cómo una necesidad se convierte en un producto o servicio. Tampoco hace visibles las entradas, los recursos, los controles, los pasos ni las partes interesadas. Para resolver un pedido suelen intervenir varios departamentos: la comunicación exclusivamente vertical puede introducir esperas, pérdidas de información y tareas repetidas.",
      "Cuando cada área optimiza solo su propia tarea, el resultado global puede empeorar. Un cuello de botella, una responsabilidad indefinida o una revisión duplicada afectan al cliente aunque un departamento cumpla su meta. El relato de Todos, Alguien, Cualquiera y Nadie ilustra por qué una responsabilidad compartida sin dueño puede terminar sin ejecución.",
      "La gestión por procesos considera la organización como una red de procesos interrelacionados. BPM (Business Process Management) es la gestión de procesos de negocio: orienta el trabajo hacia la misión y las expectativas de clientes, proveedores, personal y otras partes interesadas, además de considerar las funciones departamentales.",
      "En la presentación, el enfoque a procesos de ISO 9001:2015 relaciona la definición y gestión de los procesos y sus interacciones con los resultados previstos, la política de calidad y la dirección estratégica. Mejorar la eficacia del SGC busca cumplir los requisitos y aumentar la satisfacción del cliente. La estructura funcional puede mantenerse; lo que cambia es la mirada sobre el recorrido completo.",
    ],
  },
  {
    title: "B · Los elementos de un proceso",
    slides: "11–20",
    paragraphs: [
      "Un proceso reúne actividades relacionadas que utilizan entradas para obtener un resultado previsto. Ese resultado puede ser una salida, un producto o un servicio: por ejemplo, una orden de trabajo, una aplicación entregada o una persona atendida. La salida de un proceso suele ser la entrada de otro; varios procesos conectados también pueden estudiarse como un proceso mayor.",
      "La entrada es aquello que el proceso necesita transformar o utilizar: materiales, energía, información y requisitos. Conviene indicar su origen: un proveedor, otro proceso o una parte interesada. La salida es el resultado entregado y debe tener un destinatario definido. No alcanza con listar tareas si no se sabe qué reciben y qué producen.",
      "Las actividades realizan la transformación. Los recursos la hacen posible: personas competentes, equipos, sistemas, infraestructura y ambiente. Los controles permiten verificar que el trabajo se realiza como se previó; los indicadores aportan medidas para seguir el desempeño. El alcance delimita dónde comienza y termina el proceso y qué trabajo incluye.",
      "En el ejemplo de ventas, una solicitud de cotización requiere coordinar materiales, costos, diseño, revisión legal, inventario, plazos y precio; la salida es un contrato u orden de pedido. Compras toma esa necesidad y recorre la búsqueda de proveedores, cotizaciones, selección, orden, recepción y verificación de calidad. Almacenamiento identifica e inspecciona lo recibido, lo registra, controla caducidades y lo entrega al solicitante.",
      "El ejemplo informático enlaza análisis de requisitos, diseño y construcción, pruebas, entrega y mantenimiento. La formación interna sostiene esas actividades. Los cinco grandes momentos operativos descritos son comercialización, análisis de la solicitud, producción, entrega y posventa. La asignación departamental puede cambiar sin perder la identidad del proceso.",
    ],
  },
  {
    title: "C · Cuatro grupos con funciones diferentes",
    slides: "21–28",
    paragraphs: [
      "El mapa resume los grandes procesos antes de detallar sus actividades. Esta cátedra distingue cuatro grupos: estratégicos, operativos o clave, de apoyo y de gestión. No hay que fusionar los dos últimos solo porque aparezcan próximos en el dibujo.",
      "Los estratégicos establecen directrices para los demás procesos: misión, visión, valores, políticas, objetivos y metas. Intervienen la dirección y las restricciones del entorno normativo. La planificación estratégica define el rumbo; la organización establece relaciones y responsabilidades; la planificación operativa concreta recursos y tareas; la mejora continua orienta acciones de mejora de alcance general.",
      "Los operativos o clave generan el producto o servicio que recibe el cliente y forman la cadena de valor. Incluyen comprender la necesidad, prestar el servicio o producir, entregar y atender la posventa. Su identidad depende de la organización: urgencias y consultas externas en un hospital no equivalen a diseño y desarrollo en una empresa informática.",
      "Los de apoyo aportan capacidades y recursos al trabajo operativo. Recursos humanos, formación, mantenimiento, sistemas de información, administración y gestión económico-financiera hacen posible la prestación. Su destinatario inmediato suele ser interno; eso no significa que sean prescindibles.",
      "Los de gestión realizan seguimiento y control: riesgos y oportunidades, evaluación de proveedores, no conformidades, acciones correctivas y auditorías internas. La mejora estratégica define prioridades; el seguimiento de una acción correctiva concreta puede ubicarse en gestión. La clasificación depende del propósito y alcance que se declaren, no solo del nombre.",
      "El mapa de la diapositiva 28 ubica estratégicos arriba, operativos en el centro y apoyo y gestión abajo. Las partes interesadas aparecen a ambos lados y la comunicación vincula todos los grupos. Las flechas representan interrelaciones; el mapa no es un organigrama ni necesariamente la secuencia detallada de una tarea.",
    ],
  },
  {
    title: "D · Leer y construir mapas por niveles",
    slides: "25, 28–32",
    paragraphs: [
      "Primero se identifica qué hace la organización, para quién y qué necesidades debe satisfacer. Después se enumeran sus procesos, se justifica la clasificación y se dibujan las relaciones: quién proporciona cada entrada y quién recibe cada salida. Las flechas deben tener un significado, como requisitos, recursos o resultados de seguimiento.",
      "En el primer nivel se ven los procesos generales. En el segundo se abren sus etapas o subprocesos. En el tercero se describen las actividades de esas etapas. Cada descenso agrega detalle conservando la relación con el propósito inicial; no crea automáticamente un nuevo departamento.",
      "La diapositiva 30 muestra un hospital con urgencias, consultas, atención y recursos que se relacionan para prestar asistencia sanitaria. La 31 descompone procesos de un ayuntamiento, incluyendo planificación, servicios y soporte. La 32 presenta la referencia institucional UTN-FRT, pero no desarrolla allí un mapa legible con procesos que podamos transcribir. Los casos interactivos de este módulo son construcciones educativas propias, no mapas oficiales de esas organizaciones.",
      "Para revisar un mapa, preguntate si cubre desde las necesidades hasta los resultados, si separa bien las cuatro funciones, si las relaciones tienen entradas y salidas identificables y si cada proceso tiene un responsable. Un mapa se mejora contrastándolo con el trabajo real.",
    ],
  },
  {
    title: "E · Caracterizar y controlar un proceso",
    slides: "33–37, 42",
    paragraphs: [
      "Caracterizar es analizar el proceso más allá de sus pasos: qué lo inicia, qué resultado lo termina, cuál es su misión y cómo se controla. La ficha reúne información útil para ejecutar, seguir y revisar el proceso; la organización decide su contenido según lo que necesita gestionar.",
      "El objetivo expresa para qué y para quién existe. El alcance delimita el marco de actuación. El responsable debe asegurar los resultados. Entradas y salidas identifican los intercambios con proveedores, clientes y procesos relacionados. Las actividades muestran el trabajo; recursos, indicadores y registros permiten ejecutarlo y conservar evidencia.",
      "La presentación utiliza Gestión de Certificados de Calidad: recibe certificados de proveedores y solicitudes de clientes; entrega certificados, los archiva y controla envíos. El responsable es control de calidad; intervienen compras, gestión comercial y control de recepción. Se necesitan equipos de oficina, escáner, impresora y archivo. Los indicadores consideran reclamos e incidencias, y los registros evidencian envíos y certificados pendientes.",
      "No confundas recursos con entradas: el escáner permite trabajar pero no es el certificado que se transforma o gestiona. Un indicador debe tener una medida e interpretación: por ejemplo, reclamos de certificados por período. Un registro conserva evidencia de lo ocurrido. El alcance no es una meta de desempeño; la diapositiva 35 utiliza además la palabra límites al hablar de variación estadística bajo control.",
      "Caracterizar ayuda a detectar riesgos, tareas omitidas, esperas y oportunidades de automatización. Antes de incorporar un control nuevo conviene explicar qué riesgo aborda, quién lo ejecuta y qué evidencia deja.",
    ],
  },
  {
    title: "F · Proceso, procedimiento y representación",
    slides: "38–48",
    paragraphs: [
      "El proceso explica qué transformación se realiza y para qué resultado. El procedimiento detalla cómo ejecutarla: quién interviene, cuándo, con qué documentos y dónde deja los registros. No son sinónimos. Por ejemplo, el proceso comercial puede incluir visitar, tomar datos y comunicar necesidades; su procedimiento especifica qué persona visita, qué formulario completa y a quién envía la información.",
      "Un diagrama de flujo representa los pasos desde el inicio hasta el fin. La presentación muestra operaciones, límites de inicio y fin, decisiones, movimientos, conectores, documentos, listados y bases de datos. Esa simbología de flujogramas no debe confundirse con los símbolos específicos de BPMN.",
      "El diagrama por bloques muestra pasos sin asignar puestos; el funcional agrega quién ejecuta cada paso. El ejemplo de recepción y pago de facturas distingue proveedor, administración, gerencia y contabilidad. Comprender las responsabilidades y las alternativas de pago ayuda luego a interpretar carriles y decisiones de BPMN.",
      "La ficha de procedimiento de las diapositivas 47 y 48 contempla objetivo, alcance, versión y modificaciones, normativas, responsables, usuarios, desarrollo por etapas, medios, plazos, registros, cambios de revisión y modelado del negocio. Documentar sirve para que la ejecución pueda consultarse y verificarse. El mapa sitúa el proceso en la organización; la ficha lo caracteriza; el diagrama detalla un recorrido.",
    ],
  },
  {
    title: "G · Analizar para mejorar",
    slides: "49–52",
    paragraphs: [
      "Analizar un proceso implica separar sus pasos, observar cómo se realizan y contrastarlos con el funcionamiento esperado. Antes de evaluar, hay que conocer el objetivo y los criterios del proceso: de otro modo no se puede distinguir un desvío de una decisión prevista.",
      "El análisis permite detectar diferencias entre lo realizado y lo planificado, debilidades y riesgos de fallo. A partir de evidencia se pueden proponer cambios: acortar esperas, eliminar duplicaciones, automatizar tareas o reforzar controles. Medir eficiencia no equivale a acelerar un paso si eso perjudica el resultado global.",
      "El ciclo de revisión del material conecta objetivos, auditoría de procesos y comprobación del cumplimiento. Para practicar: elegí un proceso, registrá entradas, actividades y salidas, contrastá su ejecución con lo previsto y proponé una mejora acompañada de un indicador. La última diapositiva reconoce el aporte de Consultora IVE a parte del material; las explicaciones de esta página son una elaboración didáctica propia.",
    ],
  },
];
export const categoryHelp = {
  Estratégicos:
    "Fijan el rumbo, políticas y objetivos para el conjunto de la organización (diap. 22–23).",
  Operativos:
    "Transforman las necesidades en el producto o servicio que recibe el cliente (diap. 24–25).",
  "De apoyo":
    "Aportan personas, tecnología e infraestructura al trabajo operativo (diap. 26–27).",
  "De gestión":
    "Siguen resultados, riesgos, proveedores, no conformidades y auditorías (diap. 26).",
};
export const sheetFields = [
  ["name", "Nombre"],
  ["objective", "Objetivo o misión"],
  ["scope", "Alcance"],
  ["owner", "Responsable"],
  ["inputs", "Entradas"],
  ["activities", "Actividades"],
  ["outputs", "Salidas"],
  ["resources", "Recursos"],
  ["indicators", "Indicadores"],
  ["records", "Registros"],
  ["related", "Procesos relacionados"],
] as const;
