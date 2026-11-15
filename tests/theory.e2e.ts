import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { RichText, TheoryBlock, TheoryData } from "../src/types/theory";

const id = `notion-${"2".repeat(32)}`;
const text = (value: string): RichText[] => [{ text: value, bold: true, italic: true, strike: false, underline: false, code: false, href: "https://example.org" }];
const block = (value: string): TheoryBlock => ({ id: value, type: "paragraph", text: text(value), children: [] });
const fixture: TheoryData = { version: 1, documents: [
  { id, title: "mapa de procesos", category: "Procesos", blocks: [block("Contenido académico de prueba"), { ...block("Encabezado"), type: "heading_2" }, { ...block("Primero"), type: "numbered_list_item", children: [{ ...block("Anidado"), type: "bulleted_list_item" }] }, { ...block("Segundo"), type: "numbered_list_item" }, { ...block("tabla"), type: "table", columnHeader: true, children: [{ ...block("fila"), type: "table_row", cells: [text("Celda")] }] }, { ...block("Figura"), type: "image", src: `notion-images/${"a".repeat(64)}.png` }] },
  { id: `notion-${"3".repeat(32)}`, title: "normas", category: "General", blocks: [] },
] };

test("lectura, formato, imágenes, búsqueda, categorías y progreso estable", async ({ page }) => {
  await page.route("**/notion-theory.json", route => route.fulfill({ json: fixture }));
  await page.route("**/notion-images/*.png", route => route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") }));
  await page.goto(`/#/teoria?tema=${id}`);
  await expect(page.locator(".document-title")).toHaveText("mapa de procesos");
  await expect(page.locator(".notion-content em strong").first()).toContainText("Contenido académico");
  await expect(page.locator(".notion-content a").first()).toHaveAttribute("href", "https://example.org");
  await expect(page.locator(".notion-content ol > li")).toHaveCount(2);
  await expect(page.locator(".notion-content ol ul li")).toHaveText("Anidado");
  await expect(page.getByRole("columnheader")).toHaveText("Celda");
  await expect.poll(() => page.locator(".notion-content img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Marcar como estudiado", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: /Estudiado · Marcar/ })).toBeVisible();
  await page.getByLabel("Buscar contenido teórico").fill("académico");
  await expect(page.locator(".topic-list button")).toHaveCount(1);
  await page.getByLabel("Buscar contenido teórico").fill("zzzz");
  await expect(page.getByText("No hay temas para esa búsqueda.")).toBeVisible();
  await page.getByLabel("Buscar contenido teórico").fill("");
  await page.getByLabel("Categoría", { exact: true }).selectOption("General");
  await page.locator(".topic-list button").click();
  await expect(page.locator(".document-title")).toHaveText("normas");
  await expect(page.getByText("Este documento todavía no tiene contenido.")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".document-title")).toHaveText("mapa de procesos");
  await page.route("**/notion-theory.json", route => route.fulfill({ json: { ...fixture, documents: [{ ...fixture.documents[0], title: "mapa actualizado" }] } }));
  await page.reload();
  await expect(page.locator(".document-title")).toHaveText("mapa actualizado");
  await expect(page.getByRole("button", { name: /Estudiado · Marcar/ })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("estado vacío y error de carga sin material inventado", async ({ page }) => {
  await page.route("**/notion-theory.json", route => route.fulfill({ json: { version: 1, documents: [] } }));
  await page.goto("/#/teoria");
  await expect(page.getByRole("heading", { name: "Tus resúmenes, en un solo lugar" })).toBeVisible();
  await expect(page.locator(".topic-list button")).toHaveCount(0);
  await page.route("**/notion-theory.json", route => route.fulfill({ status: 500 }));
  await page.reload();
  await expect(page.getByRole("heading", { name: "No pudimos cargar tus resúmenes" })).toBeVisible();
});

test("tres columnas alineadas, portada compacta, índice dinámico y navegación sticky", async ({ page }) => {
  const cover = `notion-images/${"b".repeat(64)}.png`;
  const headings: TheoryBlock[] = [
    { ...block("Gestión"), id: "primero", type: "heading_1" },
    ...Array.from({ length: 8 }, (_, i) => block(`Texto de lectura ${i}. `.repeat(50))),
    { ...block("Gestión"), id: "repetido", type: "heading_2" },
    { ...block("Detalle"), type: "toggle", children: [{ ...block("Análisis"), type: "heading_3" }] },
    ...Array.from({ length: 8 }, (_, i) => block(`Otro párrafo ${i}. `.repeat(50))),
    { ...block("Cierre"), type: "heading_1" }, block("Fin del resumen.".repeat(100)),
  ];
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/notion-theory.json", route => route.fulfill({ json: { ...fixture, documents: [{ ...fixture.documents[0], cover, blocks: headings }, fixture.documents[1]] } }));
  const coverBytes = await readFile("src/assets/03_libro_teoria.png");
  await page.route("**/notion-images/*.png", route => route.fulfill({ contentType: "image/png", body: coverBytes }));
  await page.goto(`/#/teoria?tema=${id}`);
  await expect(page.locator(".document-title")).toHaveText("mapa de procesos");
  for (const width of [1440, 1280, 1180]) {
    await page.setViewportSize({ width, height: 900 });
    const metrics = await page.evaluate(() => {
      const rect = (s: string) => document.querySelector(s)!.getBoundingClientRect().toJSON();
      return { pane: rect(".library"), container: rect(".theory-page"), toolbar: rect(".theory-page .toolbar"), library: rect(".topic-list"), lesson: rect(".lesson"), outline: rect(".document-outline"), cover: rect(".notion-cover") };
    });
    expect(Math.abs(metrics.container.x * 2 + metrics.container.width - metrics.pane.x * 2 - metrics.pane.width)).toBeLessThan(1);
    expect(Math.abs(metrics.library.y - metrics.lesson.y)).toBeLessThan(1);
    expect(Math.abs(metrics.outline.y - metrics.lesson.y)).toBeLessThan(1);
    expect(Math.abs(metrics.toolbar.x - metrics.library.x)).toBeLessThan(1);
    expect(Math.abs(metrics.toolbar.right - metrics.outline.right)).toBeLessThan(1);
    expect(Math.abs(metrics.lesson.x - metrics.library.right - (metrics.outline.x - metrics.lesson.right))).toBeLessThan(1);
    expect(metrics.lesson.width).toBeGreaterThan(500);
    if (width === 1440) expect(metrics.container.width).toBeGreaterThan(1000);
    expect(metrics.cover.width).toBeLessThanOrEqual(96);
    expect(metrics.cover.height).toBeLessThanOrEqual(84);
    await page.screenshot({ path: `test-results/teoria-tres-columnas-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const toc = page.getByRole("navigation", { name: "Secciones del documento" });
  await expect(toc.getByRole("button")).toHaveCount(4);
  await page.getByLabel("Buscar encabezados").fill("GESTION");
  await expect(toc.getByRole("button")).toHaveCount(2);
  await toc.getByRole("button", { name: "Gestión", exact: true }).nth(1).click();
  await expect(toc.getByRole("button", { name: "Gestión", exact: true }).nth(1)).toHaveAttribute("aria-current", "location");
  const repeated = page.locator("#notion-heading-repetido");
  await expect(repeated).toBeFocused();
  expect(Math.abs((await repeated.boundingBox())!.y - 100)).toBeLessThan(1);
  expect((await page.locator(".document-outline").boundingBox())!.y).toBeCloseTo(24, 0);
  await page.getByLabel("Buscar encabezados").fill("analisis");
  await toc.getByRole("button", { name: "Análisis" }).click();
  await expect(page.locator(".notion-content details")).toHaveAttribute("open", "");
  await expect(page.locator('[id="notion-heading-An%C3%A1lisis"]')).toHaveCount(1);
  await page.getByLabel("Buscar encabezados").fill("");
  await page.locator(".topic-list button").filter({ hasText: "normas" }).click();
  await expect(page.getByText("Este resumen no tiene encabezados.")).toBeVisible();
  await expect(toc.getByRole("button")).toHaveCount(0);
  await expect(page.locator(".document-book")).toBeVisible();
  const manyHeadings = Array.from({ length: 40 }, (_, index) => ({ ...block(`Sección ${index}`), type: "heading_2" as const }));
  await page.route("**/notion-theory.json", route => route.fulfill({ json: { ...fixture, documents: [{ ...fixture.documents[0], blocks: manyHeadings }] } }));
  await page.reload();
  await expect(toc.getByRole("button")).toHaveCount(40);
  expect(await page.locator(".outline-links").evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
});

test("biblioteca accesible e índice desplegable en móvil y tablet sin desbordes", async ({ page }) => {
  await page.route("**/notion-theory.json", route => route.fulfill({ json: fixture }));
  await page.route("**/notion-images/*.png", route => route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64") }));
  for (const width of [1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/#/teoria?tema=${id}`);
    await page.reload();
    await expect(page.locator(".document-title")).toHaveText("mapa de procesos");
    await expect(page.getByLabel("Buscar encabezados")).not.toBeVisible();
    await page.locator(".document-outline summary").click();
    await expect(page.getByLabel("Buscar encabezados")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/teoria-responsive-${width}.png`, fullPage: true });
    if (width < 760) {
      await page.getByLabel("Elegir resumen").selectOption(fixture.documents[1].id);
      await expect(page.locator(".document-title")).toHaveText("normas");
      await expect(page.getByLabel("Buscar encabezados")).not.toBeVisible();
    }
  }
});
