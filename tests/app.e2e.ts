import { test, expect } from "@playwright/test";
import { activities } from "../src/data/topics";

test("portada, navegación, imágenes y preferencias", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.setFixedTime(new Date(2026, 10, 14, 12));
  await page.goto("/");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(page.locator(".module-card")).toHaveCount(4);
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
  await page.getByRole("button", { name: /Fecha del parcial/ }).click();
  await page.getByLabel("Fecha del próximo parcial").fill("2026-11-20");
  await page.getByRole("button", { name: "Guardar fecha" }).click();
  await page.reload();
  await expect(page.locator(".schedule-card")).toContainText("20");
  await expect(page.locator(".schedule-card")).toContainText("Faltan 6 días");
  await expect(page.locator(".stat-card")).toHaveCount(2);
  await expect(page.locator(".settings-dialog")).not.toBeVisible();
  await expect(page.locator(".schedule-card")).not.toContainText("actividades");
  await expect(page.locator(".stats-grid .stat-card").first()).toContainText(`${activities.length} pendientes`);
  const heights = await page.locator(".stat-card").evaluateAll(cards => cards.map(card => card.getBoundingClientRect().height));
  expect(new Set(heights).size).toBe(1);
  await expect(page.getByText("Meta semanal", {exact:true})).toHaveCount(0);
  for (const path of [
    "/teoria",
    "/procesos",
    "/parciales",
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
  await page.getByRole("button", { name: `Completar: ${activities[0].title}`, exact: true }).click();
  await page.reload();
  await page.goto("/#/ruta");
  await expect(
    page.getByRole("button", {
      name: `Marcar pendiente: ${activities[0].title}`,
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    String(Math.round(100 / activities.length)),
  );
  await expect(page.locator(".stats-grid .stat-card").first()).toContainText(`1 de ${activities.length} actividades completadas`);
});

test("mapa interactivo", async ({ page }) => {
  await page.goto("/#/procesos");
  await page.getByRole("button", { name: "Mapas de procesos", exact: true }).click();
  await page.getByLabel("Organización del caso").selectOption("comercial");
  await page.getByRole("button", { name: "Proceso: Compras", exact: true }).click();
  await expect(page.locator(".lab-process-detail")).toContainText("Compras");
  await expect(page.locator(".lab-process-detail")).toContainText("Operativos");
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
  await page.getByLabel("Tema de pregunta").selectOption("phva");
  await page
    .getByRole("button", { name: "Guardar para repasar", exact: true })
    .click();
  await page.getByLabel("Incluir en simulacro").check();
  await page.getByRole("button", { name: "Comenzar simulacro" }).click();
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "Finalizar simulacro" }).click();
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
    "/procesos",
    "/parciales",
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

test("las secciones retiradas no conservan rutas ni accesos", async ({page}) => {
  await page.goto("/");
  await expect(page.locator('.module-card')).toHaveCount(4);
  await expect(page.locator('a[href="#/simulador"], a[href="#/apuntes"]')).toHaveCount(0);
  for(const path of ["simulador","apuntes"]){
    await page.goto(`/#/${path}`);
    await expect(page.getByRole("heading",{name:"Esta página no está en la biblioteca"})).toBeVisible();
    await expect(page.locator('.module-nav a')).toHaveCount(6);
  }
});


test("navegación horizontal activa y accesible también en móvil", async ({ page }) => {
  await page.goto("/#/");
  const nav = page.getByRole("navigation", { name: "Secciones de estudio" });
  await expect(nav.getByRole("link")).toHaveCount(6);
  await expect(nav.getByRole("link", { name: "Inicio", exact: true })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Apoyo inteligente" }).click();
  await expect(page).toHaveURL(/#\/repaso$/);
  await expect(nav.getByRole("link", { name: "Apoyo inteligente" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("main")).toBeFocused();
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(nav).toBeVisible();
  await expect(page.locator(".sidebar, .sidebar-menu")).toHaveCount(0);
  await nav.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(nav).toBeVisible();
  await expect(page.locator(".module-card").filter({ hasText: "Apoyo inteligente" })).toHaveCount(1);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(nav).toBeVisible();
  await page.getByText("Saltar al contenido", { exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page).toHaveURL(/#\/$/);
});
