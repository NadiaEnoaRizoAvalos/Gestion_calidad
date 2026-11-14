import { test, expect } from "@playwright/test";

test("portada, navegación, imágenes y preferencias", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(page.locator(".module-card")).toHaveCount(6);
  await page.locator(".module-card img").first().waitFor();
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await page.screenshot({
    path: "test-results/inicio-escritorio.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Próximo estudio/ }).click();
  await page.getByLabel("Próximo día de estudio").fill("2026-11-20");
  await page.getByLabel("Actividades por semana").fill("4");
  await page.getByRole("button", { name: "Guardar preferencias" }).click();
  await page.reload();
  await expect(page.locator(".schedule-card")).toContainText("20");
  await expect(page.locator(".goal-card")).toContainText("0 de 4");
  for (const path of [
    "/teoria",
    "/simulador",
    "/procesos",
    "/parciales",
    "/apuntes",
    "/repaso",
    "/ruta",
  ]) {
    await page.goto(`/#${path}`);
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("estudio persistente, búsqueda y ruta", async ({ page }) => {
  await page.goto("/#/ruta");
  await page.getByRole("button", { name: "Completar: Ciclo PHVA", exact: true }).click();
  await page.reload();
  await page.goto("/#/ruta");
  await expect(
    page.getByRole("button", {
      name: "Marcar pendiente: Ciclo PHVA",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "9",
  );
  await expect(page.locator(".goal-card")).toContainText("1 de 3");
});

test("simulador completo y mapa interactivo", async ({ page }) => {
  await page.goto("/#/simulador");
  for (const answer of [
    "Registrar y analizar errores",
    "Probar en un turno",
    "El resultado inicial es favorable",
    "Ajustar las etiquetas",
  ]) {
    await page.getByRole("button", { name: new RegExp(answer) }).click();
    await expect(page.getByRole("status")).toBeVisible();
    await page
      .getByRole("button", { name: /Siguiente etapa|Ver mi recorrido/ })
      .click();
  }
  await expect(page.locator(".simulation-result")).toContainText(
    "4 de las 4 etapas",
  );
  await page.goto("/#/procesos");
  await page.getByRole("button", { name: "Compras", exact: true }).click();
  await expect(page.locator(".map-panel .example-box")).toContainText(
    "Evaluar opciones",
  );
  await page
    .getByRole("button", { name: "Sin disponibilidad", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Sin disponibilidad", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Marcar exploración como completada" })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Exploración completada" }),
  ).toBeDisabled();
});

test("simulacro, errores, recomendaciones y nuevo acierto", async ({
  page,
}) => {
  await page.goto("/#/parciales");
  await page.getByRole("combobox").selectOption("phva");
  await page
    .getByRole("button", { name: "Guardar para repasar", exact: true })
    .click();
  await page.getByLabel("Incluir en simulacro").check();
  await page.getByRole("button", { name: "Comenzar simulacro" }).click();
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await expect(page.getByRole("status")).toContainText("Vamos a repasar");
  await page.getByRole("button", { name: "Guardar y ver resultado" }).click();
  await expect(page.locator(".result-score")).toContainText("0 / 1");
  await page.goto("/#/repaso");
  await expect(page.locator(".recommendation-list")).toContainText(
    "Ciclo PHVA",
  );
  await page.getByRole("button", { name: "Elegir temas recomendados" }).click();
  await page
    .getByRole("button", { name: "Practicar 1 pregunta", exact: true })
    .click();
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Comprobar respuesta" }).click();
  await page.getByRole("button", { name: "Guardar y ver resultado" }).click();
  await page.getByRole("button", { name: "Volver a elegir preguntas" }).click();
  await expect(page.locator(".recommendations")).toContainText(
    "No tenés errores pendientes",
  );
  await page.reload();
  await expect(page.locator(".learning-stats").first()).toContainText("2");
  await page.goto("/#/parciales");
  await page.getByLabel("Solo guardadas").check();
  await expect(page.locator(".question-card")).toHaveCount(1);
});

test("móvil sin desbordes en todas las secciones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/",
    "/teoria",
    "/simulador",
    "/procesos",
    "/parciales",
    "/apuntes",
    "/repaso",
    "/ruta",
  ]) {
    await page.goto(`/#${path}`);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    if (path === "/")
      await page.screenshot({
        path: "test-results/inicio-movil.png",
        fullPage: true,
      });
    else await expect(page.locator("h1")).toBeVisible();
  }
});

test("avisa cuando el navegador bloquea el almacenamiento", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Bloqueado", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("No se pudo guardar");
});
