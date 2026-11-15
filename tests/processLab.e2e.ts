import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
const key = "gestion-calidad.process-lab.v1";
test.beforeEach(async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/#/procesos");
});
test("teoría, cuatro casos y niveles enlazados con la presentación", async ({
  page,
}) => {
  await expect(
    page.getByRole("link", { name: /Abrir presentación original/ }),
  ).toHaveAttribute("href", "./processes/presentacion-procesos-2026.pdf");
  await page.getByRole("button", { name: "Salida", exact: true }).click();
  await expect(page.locator(".lab-input-output + .example-box")).toContainText(
    "presupuesto enviado",
  );
  await page
    .getByText("C · Cuatro grupos con funciones diferentes", { exact: true })
    .click();
  await expect(
    page.getByText(/Los de gestión realizan seguimiento/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mapas de procesos", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Sector: De gestión", exact: true })
    .press("Enter");
  await expect(page.locator(".lab-sector-detail")).toContainText(
    "Auditorías internas",
  );
  await page
    .getByRole("button", {
      name: "Sector: Partes interesadas y necesidades",
      exact: true,
    })
    .click();
  await expect(page.locator(".lab-sector-detail")).toContainText("aplicación");
  for (const [id, name] of [
    ["software", "Análisis de necesidades"],
    ["hospital", "Urgencias"],
    ["comercial", "Comercialización"],
    ["optica", "Atención al cliente"],
  ]) {
    await page
      .getByRole("combobox", { name: "Organización del caso", exact: true })
      .selectOption(id);
    await page
      .getByRole("button", { name: `Proceso: ${name}`, exact: true })
      .click();
    await expect(page.locator(".lab-process-detail")).toContainText(
      "Por qué se clasifica así",
    );
    await page
      .getByRole("button", {
        name:
          id === "software"
            ? "Relevar necesidades"
            : id === "hospital"
              ? "Recibir la solicitud de atención"
              : "Recibir consulta",
        exact: true,
      })
      .click();
    await expect(page.locator(".lab-process-detail ol li")).toHaveCount(3);
  }
  await page
    .locator(".lab-diagram")
    .screenshot({ path: "test-results/procesos-mapa-ejemplo-1440.png" });
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/procesos-mapas-320.png",
    fullPage: true,
  });
});
test("constructor de mapas, ficha, relaciones, respaldo y persistencia", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await page
    .getByLabel("Nombre del trabajo", { exact: true })
    .fill("Mapa de prueba");
  for (const [category, name] of [
    ["Operativos", "Atender pedido"],
    ["De apoyo", "Compras"],
  ]) {
    await page
      .getByRole("button", { name: `Agregar: ${category}`, exact: true })
      .click();
    await page.getByLabel("Nombre del proceso", { exact: true }).fill(name);
    await page
      .getByLabel("Justificación", { exact: true })
      .fill("Propósito y alcance del caso.");
  }
  await page
    .getByRole("combobox", { name: "Categoría", exact: true })
    .selectOption("De gestión");
  await expect(
    page.getByRole("button", { name: "Proceso: Compras" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Categoría", exact: true })
    .selectOption("De apoyo");
  const diagram = page.locator(".lab-diagram-scroll");
  await diagram.scrollIntoViewIfNeeded();
  const source = (await page
    .getByRole("button", { name: "Proceso: Compras", exact: true })
    .boundingBox())!;
  const target = (await diagram
    .locator("text")
    .filter({ hasText: /^Estratégicos$/ })
    .boundingBox())!;
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(target.x + 60, target.y + 5, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByRole("combobox", { name: "Categoría", exact: true }),
  ).toHaveValue("Estratégicos");
  await page
    .getByRole("combobox", { name: "Categoría", exact: true })
    .selectOption("De apoyo");

  await page
    .getByText("Editar relaciones entre procesos", { exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Origen", exact: true })
    .selectOption({ label: "Compras" });
  await page
    .getByRole("combobox", { name: "Destino", exact: true })
    .selectOption({ label: "Atender pedido" });
  await page.getByLabel("Qué intercambian").fill("Materiales recibidos");
  await page
    .getByRole("button", { name: "Agregar relación", exact: true })
    .click();
  await page
    .getByText("Caracterización · Ficha de proceso editable", { exact: true })
    .click();
  await page
    .getByLabel("Objetivo o misión", { exact: true })
    .fill("Entregar pedidos conformes");
  await page
    .getByRole("button", { name: "Guardar trabajo", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Trabajo guardado");
  const original = await page.evaluate((key) => localStorage.getItem(key), key);
  expect(JSON.parse(original!).documents[0].sheet.objective).toBe(
    "Entregar pedidos conformes",
  );
  await page
    .getByRole("button", { name: "Duplicar trabajo", exact: true })
    .click();
  await expect(
    page
      .getByRole("combobox", { name: "Trabajos guardados", exact: true })
      .locator("option"),
  ).toHaveCount(3);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar JSON", exact: true }).click(),
  ]);
  const exported = await readFile((await download.path())!, "utf8");
  expect(JSON.parse(exported).relations[0].label).toBe("Materiales recibidos");
  const [svg] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar SVG", exact: true }).click(),
  ]);
  expect(await readFile((await svg.path())!, "utf8")).toContain("<svg");
  await page.reload();
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Trabajos guardados", exact: true })
    .selectOption({ label: "Mapa de prueba · Mapa" });
  await page
    .getByRole("button", { name: "Recuperar trabajo", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Proceso: Atender pedido", exact: true }),
  ).toBeVisible();
  await page.locator(".lab-file input").setInputFiles({
    name: "roto.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"kind":"map"}'),
  });
  await expect(page.getByRole("status")).toContainText("No se importó");
  await expect(
    page.getByLabel("Nombre del trabajo", { exact: true }),
  ).toHaveValue("Mapa de prueba");
  await page.locator(".lab-file input").setInputFiles({
    name: "respaldo.json",
    mimeType: "application/json",
    buffer: Buffer.from(exported),
  });
  await expect(
    page.getByRole("button", { name: "Proceso: Compras", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/procesos-editor-mapa-390.png",
    fullPage: true,
  });
});
test("editor BPMN: crear, conectar, validar, mover, exportar y recuperar XML real", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await page.getByRole("button", { name: "Nuevo BPMN", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Agregar símbolo", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Comprobar BPMN", exact: true })
    .click();
  await expect(page.getByText(/Falta un evento de fin/)).toBeVisible();
  await page
    .getByRole("combobox", { name: "Símbolo", exact: true })
    .selectOption("bpmn:Task");
  await page
    .getByRole("button", { name: "Agregar símbolo", exact: true })
    .click();
  await page
    .getByLabel("Etiqueta del elemento", { exact: true })
    .fill("Verificar pedido");
  await page
    .getByRole("button", { name: "Aplicar etiqueta", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Símbolo", exact: true })
    .selectOption("bpmn:EndEvent");
  await page
    .getByRole("button", { name: "Agregar símbolo", exact: true })
    .click();
  for (const [from, to] of [
    ["Inicio", "Verificar pedido"],
    ["Verificar pedido", "Fin"],
  ]) {
    await page
      .getByRole("combobox", { name: "Desde", exact: true })
      .selectOption({ label: from });
    await page
      .getByRole("combobox", { name: "Hasta", exact: true })
      .selectOption({ label: to });
    await page
      .getByRole("button", { name: "Conectar elementos", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Comprobar BPMN", exact: true })
    .click();
  await expect(
    page.getByText("No se detectaron errores en estas comprobaciones.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Conexión", exact: true })
    .selectOption("bpmn:MessageFlow");
  await page
    .getByRole("button", { name: "Conectar elementos", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Operación no permitida");
  await page.getByRole("button", { name: "Derecha", exact: true }).click();
  await page
    .getByLabel("Nombre del trabajo", { exact: true })
    .fill("BPMN de prueba");
  await page
    .getByRole("button", { name: "Guardar trabajo", exact: true })
    .click();
  const [xml] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("button", { name: "Exportar BPMN 2.0 XML", exact: true })
      .click(),
  ]);
  const content = await readFile((await xml.path())!, "utf8");
  expect(content).toContain("bpmn:definitions");
  expect(content).toContain("Verificar pedido");
  const [svg] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("button", { name: "Exportar SVG BPMN", exact: true })
      .click(),
  ]);
  expect(await readFile((await svg.path())!, "utf8")).toContain("<svg");
  await page.reload();
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Trabajos guardados", exact: true })
    .selectOption({ label: "BPMN de prueba · BPMN" });
  await page
    .getByRole("button", { name: "Recuperar trabajo", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Agregar símbolo", exact: true }),
  ).toBeEnabled();
  await expect(
    page
      .locator(".lab-bpmn-canvas .djs-label")
      .filter({ hasText: "Verificar pedido" }),
  ).toBeVisible();
  await page.locator(".lab-file input").setInputFiles({
    name: "corrupto.bpmn",
    mimeType: "application/xml",
    buffer: Buffer.from("<bad/>"),
  });
  await expect(page.getByRole("status")).toContainText("No se importó");
  const stored = await page.evaluate((key) => localStorage.getItem(key), key);
  await page.locator(".lab-file input").setInputFiles({
    name: "xml-incompleto.bpmn",
    mimeType: "application/xml",
    buffer: Buffer.from(
      '<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"><bpmn:process',
    ),
  });
  await expect(page.getByRole("alert")).toContainText("borrador anterior");
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    stored,
  );
  await page
    .getByRole("button", {
      name: "Restaurar último borrador BPMN válido",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Agregar símbolo", exact: true }),
  ).toBeEnabled();
  await expect(
    page
      .locator(".lab-bpmn-canvas .djs-label")
      .filter({ hasText: "Verificar pedido" }),
  ).toBeVisible();
  await page
    .locator(".lab-bpmn-widget")
    .screenshot({ path: "test-results/procesos-editor-bpmn-1440.png" });
  await page.setViewportSize({ width: 390, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("main").focus();
  await page.screenshot({
    path: "test-results/procesos-editor-bpmn-390.png",
    fullPage: true,
  });
});
test("los seis BPMN se abren y los recorridos cambian al elegir una alternativa", async ({
  page,
}) => {
  await page.getByRole("button", { name: "BPMN", exact: true }).click();
  for (let i = 0; i < 6; i++) {
    await page
      .getByRole("combobox", { name: "Ejemplo BPMN", exact: true })
      .selectOption(String(i));
    await expect(
      page.locator(".lab-bpmn-canvas [data-element-id=Decision].djs-shape"),
    ).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
  }
  await page
    .getByRole("combobox", { name: "Ejemplo BPMN", exact: true })
    .selectOption("1");
  await page
    .getByRole("button", { name: "Siguiente paso", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Siguiente paso", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Alternativa del recorrido", exact: true })
    .selectOption("No");
  await page
    .getByRole("button", { name: "Siguiente paso", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Informar alternativa", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Compuerta paralela (AND)", exact: true })
    .click();
  await expect(
    page.getByText(/No elige una rama por condición\./),
  ).toBeVisible();
  await page
    .locator(".lab-bpmn-widget")
    .screenshot({ path: "test-results/procesos-bpmn-ejemplo-1440.png" });
  await page.setViewportSize({ width: 390, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/procesos-bpmn-recorrido-390.png",
    fullPage: true,
  });
});
test("ejercicios con corrección explicada y solución a pedido; tema claro permanente", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await expect(
    page.getByText("La solicitud inicia el trabajo", { exact: false }),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Elegir ejercicio", exact: true })
    .selectOption("classify");
  await page.getByLabel("Operativos", { exact: true }).check();
  await page
    .getByRole("button", { name: "Comprobar ejercicio", exact: true })
    .click();
  await expect(page.getByRole("status").first()).toContainText(
    "Revisá tu elección",
  );
  await page.getByLabel("De gestión", { exact: true }).check();
  await page
    .getByRole("button", { name: "Comprobar ejercicio", exact: true })
    .click();
  await expect(page.getByRole("status").first()).toContainText("Correcto");
  await page
    .getByRole("combobox", { name: "Elegir ejercicio", exact: true })
    .selectOption("wrong-map");
  await page
    .getByRole("button", { name: "Proceso: Compras", exact: true })
    .first()
    .click();
  await page
    .getByRole("combobox", { name: "Categoría", exact: true })
    .selectOption("De apoyo");
  await page
    .getByRole("button", { name: "Comprobar ejercicio", exact: true })
    .click();
  await expect(
    page.getByText(/La representación resuelve la consigna/),
  ).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator(".process-lab")).toHaveCSS(
    "color-scheme",
    "light only",
  );
});

test("participantes, carriles y eliminaciones mediante controles accesibles", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await page.getByRole("button", { name: "Nuevo BPMN", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Agregar participante", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Agregar participante", exact: true })
    .click();
  await expect(
    page.getByLabel("Etiqueta del elemento", { exact: true }),
  ).toHaveValue("Mi organización");
  await page
    .getByRole("button", {
      name: "Agregar carril al seleccionado",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Seleccionar elemento", exact: true }),
  ).toContainText("Carril 1");
  await page
    .getByRole("button", { name: "Agregar participante", exact: true })
    .click();
  await expect(
    page.getByLabel("Etiqueta del elemento", { exact: true }),
  ).toHaveValue("Participante 2");
  await page
    .getByLabel("Etiqueta del elemento", { exact: true })
    .fill("Proveedor");
  await page
    .getByRole("button", { name: "Aplicar etiqueta", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Seleccionar elemento", exact: true }),
  ).toContainText("Proveedor");
  await page
    .getByRole("button", { name: "Eliminar elemento o conexión", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Seleccionar elemento", exact: true }),
  ).not.toContainText("Proveedor");
  await page.getByRole("button", { name: "Deshacer", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Seleccionar elemento", exact: true }),
  ).toContainText("Proveedor");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("subtipos BPMN: XML, duración, edición, iconos y recuperación sin pérdida", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await page.getByRole("button", { name: "Nuevo BPMN", exact: true }).click();
  const types = [
    "bpmn:StartEvent",
    "start-message",
    "bpmn:IntermediateThrowEvent",
    "intermediate-message",
    "intermediate-timer",
    "bpmn:EndEvent",
    "end-message",
    "bpmn:Task",
    "bpmn:ManualTask",
    "bpmn:UserTask",
    "bpmn:ServiceTask",
    "bpmn:SendTask",
    "bpmn:ReceiveTask",
    "bpmn:InclusiveGateway",
    "bpmn:DataObjectReference",
    "bpmn:TextAnnotation",
  ];
  let timerId = "";
  for (const type of types) {
    await page
      .getByRole("combobox", { name: "Símbolo", exact: true })
      .selectOption(type);
    await page
      .getByRole("button", { name: "Agregar símbolo", exact: true })
      .click();
    if (type === "intermediate-timer") {
      timerId = await page
        .getByRole("combobox", { name: "Seleccionar elemento", exact: true })
        .inputValue();
      await expect(page.locator(".lab-element-info")).toContainText(
        "Temporizador",
      );
      await page
        .getByLabel("Duración del temporizador (ISO 8601)", { exact: true })
        .fill("30 minutos");
      await page
        .getByRole("button", { name: "Aplicar duración", exact: true })
        .click();
      await expect(page.getByRole("alert")).toContainText(
        "Usá una duración ISO 8601",
      );
      await page
        .getByLabel("Duración del temporizador (ISO 8601)", { exact: true })
        .fill("PT30M");
      await page
        .getByRole("button", { name: "Aplicar duración", exact: true })
        .click();
    }
  }
  await page
    .getByLabel("Etiqueta del elemento", { exact: true })
    .fill("Nota de estudio");
  await page
    .getByRole("button", { name: "Aplicar etiqueta", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Seleccionar elemento", exact: true }),
  ).toContainText("Nota de estudio");
  await page
    .getByLabel("Nombre del trabajo", { exact: true })
    .fill("Subtipos completos");
  await page
    .getByRole("button", { name: "Guardar trabajo", exact: true })
    .click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("button", { name: "Exportar BPMN 2.0 XML", exact: true })
      .click(),
  ]);
  const xml = await readFile((await download.path())!, "utf8");
  const definitions = await page.evaluate((xml) => {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(
      doc.getElementsByTagNameNS(
        "http://www.omg.org/spec/BPMN/20100524/MODEL",
        "*",
      ),
    ).map((el) => ({
      type: el.localName,
      id: el.id,
      children: Array.from(el.children).map((child) => child.localName),
      text: el.textContent,
    }));
  }, xml);
  for (const type of [
    "manualTask",
    "userTask",
    "serviceTask",
    "sendTask",
    "receiveTask",
    "inclusiveGateway",
    "dataObjectReference",
    "textAnnotation",
  ])
    expect(definitions.some((el) => el.type === type)).toBe(true);
  for (const [type, definition] of [
    ["startEvent", "messageEventDefinition"],
    ["intermediateCatchEvent", "messageEventDefinition"],
    ["intermediateCatchEvent", "timerEventDefinition"],
    ["endEvent", "messageEventDefinition"],
  ])
    expect(
      definitions.some(
        (el) => el.type === type && el.children.includes(definition),
      ),
    ).toBe(true);
  expect(xml).toContain("PT30M");
  expect(xml).toContain("Nota de estudio");
  await page.reload();
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Trabajos guardados", exact: true })
    .selectOption({ label: "Subtipos completos · BPMN" });
  await page
    .getByRole("button", { name: "Recuperar trabajo", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Agregar símbolo", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("combobox", { name: "Seleccionar elemento", exact: true })
    .selectOption(timerId);
  await expect(
    page.getByLabel("Duración del temporizador (ISO 8601)", { exact: true }),
  ).toHaveValue("PT30M");
  for (const type of [
    "manualTask",
    "userTask",
    "serviceTask",
    "sendTask",
    "receiveTask",
  ]) {
    const id = definitions.find((el) => el.type === type)!.id;
    const visual = page.locator(
      `.lab-bpmn-canvas [data-element-id="${id}"].djs-shape > .djs-visual`,
    );
    expect(await visual.locator("path").count()).toBeGreaterThan(0);
    // Native task markers must remain in the upper-left corner after XML import.
    const marker = await visual
      .locator("path")
      .first()
      .evaluate((node) => {
        const box = (node as SVGGraphicsElement).getBBox();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      });
    expect(marker.x).toBeLessThan(40);
    expect(marker.y).toBeLessThan(40);
    expect(marker.width).toBeLessThan(40);
  }
  const manualId = definitions.find((el) => el.type === "manualTask")!.id;
  await page
    .getByRole("combobox", { name: "Seleccionar elemento", exact: true })
    .selectOption(manualId);
  await expect(page.locator(".lab-element-info")).toContainText("Tarea manual");
  const before = await page
    .locator(`.djs-shape[data-element-id="${manualId}"]`)
    .getAttribute("transform");
  await page.getByRole("button", { name: "Derecha", exact: true }).click();
  expect(
    await page
      .locator(`.djs-shape[data-element-id="${manualId}"]`)
      .getAttribute("transform"),
  ).not.toBe(before);
  await page
    .getByRole("button", { name: "Eliminar elemento o conexión", exact: true })
    .click();
  await expect(
    page.locator(`.djs-shape[data-element-id="${manualId}"]`),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Deshacer", exact: true }).click();
  await expect(
    page.locator(`.djs-shape[data-element-id="${manualId}"]`),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Ajustar vista", exact: true })
    .click();
  await page
    .locator(".lab-bpmn-layout")
    .screenshot({ path: "test-results/bpmn-subtipos-1440.png" });
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .locator(".lab-bpmn-layout")
    .screenshot({ path: "test-results/bpmn-subtipos-320.png" });
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("paleta agrupada: arrastre, inserción por teclado y conexiones en el lienzo", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Laboratorio práctico", exact: true })
    .click();
  await page.getByRole("button", { name: "Nuevo BPMN", exact: true }).click();
  const manual = page.getByRole("button", {
    name: "Insertar: Tarea manual",
    exact: true,
  });
  await expect(manual).toBeEnabled();
  await manual.scrollIntoViewIfNeeded();
  const source = (await manual.boundingBox())!;
  const canvas = (await page.locator(".lab-bpmn-canvas").boundingBox())!;
  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + 180, {
    steps: 15,
  });
  await page.mouse.up();
  // bpmn-js suppresses ghost clicks for 400 ms after a drag finishes.
  await page.waitForTimeout(450);
  const selected = page.getByRole("combobox", {
    name: "Seleccionar elemento",
    exact: true,
  });
  await expect(selected).toContainText("ManualTask");
  await page
    .getByRole("button", { name: "Insertar: Fin por mensaje", exact: true })
    .press("Enter");
  await expect(selected).toContainText("Fin por mensaje");
  const taskId = await selected
    .locator("option")
    .filter({ hasText: /ManualTask/ })
    .getAttribute("value");
  const endId = await selected.inputValue();
  await page
    .getByRole("button", { name: "Ajustar vista", exact: true })
    .click();
  await page
    .locator(".lab-bpmn-palette")
    .getByRole("button", { name: "Flujo de secuencia", exact: true })
    .click();
  await page
    .locator(`.djs-shape[data-element-id="${taskId}"] .djs-hit`)
    .click();
  await page.locator(`.djs-shape[data-element-id="${endId}"] .djs-hit`).click();
  await expect(selected).toContainText("SequenceFlow");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("simbología ampliada: grupos equilibrados, marcadores y explicaciones", async ({
  page,
}) => {
  await page.getByRole("button", { name: "BPMN", exact: true }).click();
  const filters = page.getByRole("group", { name: "Categorías de simbología" });
  for (const [group, count] of [
    ["Eventos", 7],
    ["Actividades", 7],
    ["Compuertas", 3],
    ["Conexiones", 3],
    ["Participantes", 2],
    ["Datos", 2],
  ] as const) {
    await filters.getByRole("button", { name: group, exact: true }).click();
    await expect(page.locator(".lab-symbol-grid button")).toHaveCount(count);
  }
  await filters.getByRole("button", { name: "Eventos", exact: true }).click();
  await page
    .getByRole("button", { name: "Intermedio temporizador", exact: true })
    .click();
  await expect(
    page.locator(".lab-symbol-grid [data-marker=timer]"),
  ).toHaveCount(1);
  await expect(
    page.getByText(/Es una espera temporal, no una compuerta/),
  ).toBeVisible();
  await filters
    .getByRole("button", { name: "Actividades", exact: true })
    .click();
  for (const marker of ["manual", "user", "service", "send", "receive"])
    await expect(
      page.locator(`.lab-symbol-grid [data-marker=${marker}]`),
    ).toHaveCount(1);
  await filters.getByRole("button", { name: "Todos", exact: true }).click();
  await page
    .locator(".lab-symbol-grid")
    .screenshot({ path: "test-results/bpmn-simbolos-1440.png" });
  await page.setViewportSize({ width: 768, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .locator(".lab-symbol-grid")
    .screenshot({ path: "test-results/bpmn-simbolos-320.png" });
});
