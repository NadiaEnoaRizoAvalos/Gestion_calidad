import { test, expect } from "@playwright/test";
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
  await expect(page.locator(".lesson > h2")).toHaveText("mapa de procesos");
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
  await expect(page.locator(".lesson > h2")).toHaveText("normas");
  await expect(page.getByText("Este documento todavía no tiene contenido.")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".lesson > h2")).toHaveText("mapa de procesos");
  await page.route("**/notion-theory.json", route => route.fulfill({ json: { ...fixture, documents: [{ ...fixture.documents[0], title: "mapa actualizado" }] } }));
  await page.reload();
  await expect(page.locator(".lesson > h2")).toHaveText("mapa actualizado");
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
