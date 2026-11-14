# Gestión de Calidad

Una biblioteca de estudio interactiva, en español, para aprender Sistemas de Gestión de Calidad. La interfaz se inspira en una biblioteca kawaii en tonos lavanda, rosa y crema, con las nueve ilustraciones PNG originales guardadas en `src/assets/`.

## Qué podés hacer

- Consultar ocho temas introductorios, buscar conceptos, filtrar categorías y marcar temas estudiados.
- Recorrer un caso ficticio de una papelería mediante las cuatro etapas PHVA, tomar decisiones y leer la devolución de cada una.
- Explorar un mapa de procesos de una biblioteca y un diagrama BPMN con dos alternativas de disponibilidad.
- Buscar ocho preguntas de demostración, filtrar por tema, mostrar respuestas, guardar preguntas y seleccionar un simulacro.
- Practicar por temas y recibir recomendaciones según el error más reciente de cada pregunta. Un acierto posterior elimina esa recomendación.
- Consultar la estructura de apuntes de clase, con un registro de demostración que no atribuye contenido a un profesor.
- Organizar una ruta de once actividades, configurar el próximo estudio y una meta semanal, y consultar los resultados de las prácticas.

El progreso, las preguntas guardadas, las preferencias y los resultados se guardan en `localStorage` con la clave `gestion-calidad-estudio-v1`. La semana empieza el lunes según la hora local del navegador. La meta cuenta actividades distintas completadas esa semana; repetir un cuestionario no suma de nuevo la misma actividad. Si se bloquea el almacenamiento, la aplicación lo informa. Borrar los datos del navegador elimina el progreso; no hay sincronización entre dispositivos.

## Ejecutar el proyecto

Requiere Node.js 22.12 o superior (se verificó con Node 24) y npm. Desde la raíz de este repositorio:

```sh
npm ci
npm run dev
```

Abrí la dirección local indicada por Vite. La aplicación se instala en esta misma raíz; no requiere otra carpeta ni servicios externos.

```sh
npm run lint       # ESLint
npm test           # Pruebas de progreso, persistencia, datos y recomendaciones
npm run build     # TypeScript y compilación de producción en dist/
npm run preview   # Vista previa de esa compilación
npm run test:e2e  # Compila y ejecuta las pruebas de navegación en Chrome
```

Las pruebas de navegador usan Google Chrome instalado, sin ventana visible, y un servidor de producción en el puerto 4173. Verifican las rutas, imágenes, preferencias, progreso al recargar, simulador, mapa, cuestionarios, recomendaciones, almacenamiento bloqueado y ausencia de desbordes en móvil. Las capturas se generan en `test-results/`, excluido de Git.

## Tecnologías y estructura

React, TypeScript, Vite, React Router, CSS y Lucide React. Vitest y Playwright se usan para comprobaciones. La navegación con `HashRouter` permite alojar el resultado en un servidor estático sin reglas de redirección.

```text
src/
  assets/       Ilustraciones originales con transparencia
  components/   Diseño compartido, prácticas e historial
  pages/        Inicio, teoría, simulador, procesos, parciales, apuntes, repaso y ruta
  data/         Temas, preguntas, apuntes, caso PHVA y recomendaciones
  hooks/        Estado compartido y persistencia local
  types/        Tipos del contenido y del progreso
  styles/       Estilos y adaptaciones responsive
tests/          Pruebas de lógica y de navegador
```

## Agregar material

- **Teoría:** agregá un `Topic` a `src/data/topics.ts`. Su ID debe ser único y estable; se utiliza para guardar el progreso y vincular preguntas. La ruta y el porcentaje incorporan automáticamente los nuevos temas.
- **Preguntas:** agregá un `Question` a `src/data/questions.ts`, con un tema existente, opciones y el índice de la respuesta correcta (desde cero). Indicá dificultad, explicación, etiquetas y origen real: parcial anterior, pregunta del profesor, apunte de clase o práctica generada con IA.
- **Apuntes:** agregá un `ClassNote` a `src/data/notes.ts`. Incluí fecha (`AAAA-MM-DD`), tema, resumen, conceptos, ejemplos del profesor, observaciones y preguntas; usá `demo: false` solo para material real. Un contenido exportado de Notion se puede adaptar manualmente a esta estructura; no hay importador ni integración con su API.
- **Simulación:** el caso y las decisiones están en `src/data/simulation.ts`. Los requisitos normativos específicos se incorporarán según la edición y el material de la materia.

## Estado y uso de IA

Primera aplicación funcional con datos de demostración. Se utilizó IA para desarrollar la interfaz, la lógica y el material introductorio. Los ejemplos no se presentan como apuntes de la cátedra ni como exámenes reales y requieren revisión académica antes de usarlos como material de evaluación. El simulador no certifica ni evalúa cumplimiento normativo; sus métricas pertenecen a un caso ficticio.

Pendiente: incorporar tus apuntes y parciales reales y ampliar las simulaciones con el material aplicable. Los apuntes se editan en archivos, no desde la interfaz. No hay backend, autenticación, editor BPMN, API de IA ni integración de Notion. La fuente Nunito se carga desde Google Fonts; sin conexión se usa la fuente local de respaldo. Las ilustraciones se sirven siempre desde el proyecto.

La dependencia de desarrollo `minimatch` de `typescript-eslint` tiene una versión corregida indicada mediante `overrides`; los controles de lint y pruebas deben seguir pasando al actualizarla.
