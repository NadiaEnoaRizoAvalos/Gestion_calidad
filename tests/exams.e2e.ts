import { expect, test } from "@playwright/test";

// Test-only catalog and neutral pixel: never included in public resources.
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
const baseQuestion = { examId: "prueba", topic: "Tema de prueba", origin: "Parcial anterior", explanation: "Explicación exclusiva de prueba", difficulty: "Inicial", tags: ["prueba"] };
const catalog = {
  version: 1, exams: [
    { id: "prueba", title: "Parcial exclusivo de prueba", topic: "Tema de prueba", date: "2026-11-10", photos: [{ id: "a", src: "exams/images/prueba-a.png", alt: "Primera imagen de prueba" }, { id: "b", src: "exams/images/prueba-b.png", alt: "Segunda imagen de prueba" }] },
    { id: "otro", title: "Otro parcial de prueba", topic: "Otro tema", photos: [] },
  ], questions: [
    { ...baseQuestion, id: "real-choice", prompt: "Opción múltiple de prueba", type: "choice", verified: true, options: ["Opción incorrecta de prueba", "Respuesta correcta de prueba"], correct: 1, photoId: "a" },
    { ...baseQuestion, id: "real-pending", prompt: "Pregunta pendiente de prueba", type: "written", verified: false, options: [], correct: null, photoId: "b" },
    { ...baseQuestion, id: "real-written", prompt: "Pregunta escrita de prueba", type: "written", verified: true, options: [], correct: null, modelAnswer: "Modelo exclusivo de prueba" },
  ]
};

test.beforeEach(async ({ page }) => {
  await page.route("**/exams/catalog.json", route => route.fulfill({ json: catalog }));
  await page.route("**/exams/images/*.png", route => route.fulfill({ contentType: "image/png", body: png }));
});

test("biblioteca, filtros, fotos ampliables y preguntas pendientes", async ({ page }) => {
  await page.goto("/#/parciales");
  await expect(page.locator(".exam-paper")).toHaveCount(2);
  await page.getByLabel("Buscar parciales").fill("Otro");
  await expect(page.locator(".exam-paper")).toHaveCount(1);
  await page.getByLabel("Buscar parciales").fill("");
  await page.getByLabel("Tema del parcial").selectOption("Tema de prueba");
  await expect(page.locator(".exam-paper")).toHaveCount(1);
  await page.getByRole("button", { name: "Ver parcial: Parcial exclusivo de prueba" }).click();
  await expect(page.locator(".question-card")).toHaveCount(3);
  const pending = page.locator(".question-card").filter({ hasText: "Pregunta pendiente de prueba" });
  await expect(pending.getByRole("link", { name: "Ver fotografía original de esta pregunta" })).toHaveAttribute("href", "./exams/images/prueba-b.png");
  await expect(pending.getByText("Respuesta pendiente de revisión")).toBeVisible();
  await expect(pending.getByLabel("Incluir en simulacro")).toBeEnabled();
  await expect(pending.getByRole("button", { name: "Ver respuesta" })).toBeDisabled();
  await page.getByRole("button", { name: "Ampliar fotografía 1" }).click();
  const dialog = page.getByRole("dialog", { name: "Visor de fotografías" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Anterior", exact: true })).toBeDisabled();
  const before = await dialog.locator(".photo-canvas img").boundingBox();
  await dialog.getByRole("button", { name: "Ampliar imagen", exact: true }).click();
  const enlarged = (await dialog.locator(".photo-canvas img").boundingBox())!;
  expect(enlarged.width).toBeGreaterThan(before!.width);
  expect(enlarged.width / enlarged.height).toBeCloseTo(before!.width / before!.height, 2);
  await dialog.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(dialog.getByText("Fotografía 2 de 2")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Reducir imagen" })).toBeDisabled();
  await expect(dialog.getByRole("link", { name: "Abrir original" })).toHaveAttribute("href", "./exams/images/prueba-b.png");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Ampliar fotografía 2" }).click();
  await page.getByRole("button", { name: "Cerrar visor" }).click();
  await expect(dialog).not.toBeVisible();
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("button", { name: "Ampliar fotografía 1" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/visor-parcial-prueba-movil.png" });
});

test("preguntas de parciales alimentan el repaso y guardan desarrollo sin corrección automática", async ({ page }) => {
  await page.goto("/#/parciales?parcial=prueba");
  const choice = page.locator(".question-card").filter({ hasText: "Opción múltiple de prueba" });
  await choice.getByRole("button", { name: "Ver respuesta" }).click();
  await expect(choice.locator(".example-box")).toContainText("Respuesta correcta de prueba");
  await choice.getByRole("button", { name: "Ocultar respuesta" }).click();
  await choice.getByLabel("Incluir en simulacro").check();
  await page.getByRole("button", { name: "Comenzar simulacro" }).click();
  await page.getByRole("radio").first().check();
  await expect(page.getByText("Explicación exclusiva de prueba", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Finalizar simulacro" }).click();
  await page.goto("/#/repaso");
  await expect(page.locator(".recommendation-list")).toContainText("Tema de prueba");
  await page.locator(".recommendation-list button").click();
  await expect(page.getByRole("button", { name: "Practicar 2 preguntas", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Elegir temas recomendados" }).click();
  await expect(page.getByRole("button", { name: "Practicar 2 preguntas", exact: true })).toBeEnabled();
  await page.goto("/#/parciales?parcial=prueba");
  const written = page.locator(".question-card").filter({ hasText: "Pregunta escrita de prueba" });
  await written.getByLabel("Incluir en simulacro").check();
  await page.getByRole("button", { name: "Comenzar simulacro" }).click();
  await page.getByLabel("Tu respuesta").fill("Mi respuesta de prueba");
  await expect(page.getByText("Modelo exclusivo de prueba", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Finalizar simulacro" }).click();
  await expect(page.getByText("Modelo exclusivo de prueba", { exact: true })).toBeVisible();
  await expect(page.getByText("Tu respuesta: Mi respuesta de prueba", { exact: true })).toBeVisible();
  await expect(page.locator(".history-panel")).toContainText("respuesta guardada para revisión manual");
  await page.reload();
  await expect(page.locator(".history-panel")).toContainText("respuesta guardada para revisión manual");
});

test("no inventa parciales si el catálogo está vacío o falla", async ({ page }) => {
  await page.route("**/exams/catalog.json", route => route.fulfill({ json: { version: 1, exams: [], questions: [] } }));
  await page.goto("/#/parciales");
  await expect(page.getByText("Tus parciales anteriores, en un solo lugar")).toBeVisible();
  await expect(page.locator(".exam-paper")).toHaveCount(0);
  await page.route("**/exams/catalog.json", route => route.fulfill({ status: 500 }));
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("No pudimos cargar la biblioteca");
  await expect(page.locator(".question-card")).toHaveCount(8);
});

test("el simulacro no revela respuestas de ninguna pregunta hasta finalizar", async ({ page }) => {
  await page.goto("/#/parciales?parcial=prueba");
  await page.getByRole("button", { name: "Seleccionar visibles", exact: true }).click();
  await expect(page.getByText("3 preguntas seleccionadas")).toBeVisible();
  await page.getByRole("button", { name: "Comenzar simulacro" }).click();
  await page.getByRole("radio").last().check();
  await page.getByRole("button", { name: "Guardar respuesta y continuar" }).click();
  await expect(page.getByText("Explicación exclusiva de prueba", { exact: true })).toHaveCount(0);
  await page.getByLabel("Tu respuesta").fill("Respuesta pendiente de prueba");
  await page.getByRole("button", { name: "Guardar respuesta y continuar" }).click();
  await page.getByLabel("Tu respuesta").fill("Desarrollo de prueba");
  await expect(page.getByText("Modelo exclusivo de prueba", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Finalizar simulacro" }).click();
  await expect(page.locator(".result-score")).toContainText("1 / 1");
  await expect(page.getByText("Modelo exclusivo de prueba", { exact: true })).toBeVisible();
  await expect(page.locator(".practice-result").getByText("Respuesta pendiente de revisión", { exact: true })).toHaveCount(1);
  await expect(page.locator(".history-panel")).toContainText("2 respuestas guardadas para revisión manual");
});

test("las seis preguntas adicionales se estudian sin inventar las dieciséis preguntas de las fotografías pendientes", async ({ page }) => {
  await page.unroute("**/exams/catalog.json");
  await page.goto("/#/parciales");
  await expect(page.locator(".exam-paper")).toHaveCount(3);
  await expect(page.getByText("Material pendiente de incorporar", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Ver parcial: Preguntas importantes", exact: true }).click();
  await expect(page.locator(".question-card")).toHaveCount(6);
  await expect(page.locator(".question-card h2").first()).toHaveText("1. ¿Qué es calidad?");
  await expect(page.locator(".question-card h2").last()).toHaveText("6. ¿Qué beneficios concretos otorga la Ley 27.506?");
  await page.getByLabel("Buscar preguntas").fill("beneficios");
  await expect(page.locator(".question-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Guardar para repasar", exact: true }).click();
  await page.getByLabel("Incluir en simulacro").check();
  await page.getByRole("button", { name: "Comenzar simulacro" }).click();
  await page.getByLabel("Tu respuesta").fill("Respuesta de prueba, sin verificar.");
  await page.getByRole("button", { name: "Finalizar simulacro" }).click();
  await expect(page.locator(".practice-result")).toContainText("Sin calificación:");
  await expect(page.locator(".practice-result")).toContainText("Respuesta pendiente de revisión");
  await expect(page.locator(".result-score")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".history-panel")).toContainText("1 respuesta guardada para revisión manual");
  await page.getByLabel("Solo guardadas").check();
  await expect(page.locator(".question-card")).toHaveCount(1);
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
