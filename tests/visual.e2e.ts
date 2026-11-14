import { test, expect } from "@playwright/test";

const sections = [
  "",
  "teoria",
  "simulador",
  "procesos",
  "parciales",
  "apuntes",
  "repaso",
  "ruta",
];

test("el tema permanece claro aunque el dispositivo prefiera oscuro", async ({
  page,
}) => {
  for (const section of sections) {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(`/#/${section}`);
    const surfaces = page.locator(
      "html, body, .library, .panel, .stat-card, .module-card, input, select",
    );
    const lightColors = await surfaces.evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        return [style.backgroundColor, style.backgroundImage, style.color];
      }),
    );
    await page.emulateMedia({ colorScheme: "dark" });
    expect(
      await surfaces.evaluateAll((elements) =>
        elements.map((element) => {
          const style = getComputedStyle(element);
          return [style.backgroundColor, style.backgroundImage, style.color];
        }),
      ),
    ).toEqual(lightColors);
    await expect(page.locator("html")).toHaveCSS("color-scheme", "light only");
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(243, 229, 245)",
    );
    await expect(page.locator(".award")).toHaveCount(0);
  }
});

test("composición y capturas de todas las secciones en distintos tamaños", async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const section of sections) {
      await page.goto(`/#/${section}`);
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        )
        .toBe(true);
      if (section === "") {
        const bunny = await page.locator(".resting-bunny").boundingBox();
        const reading = await page.locator(".reading-bunny").boundingBox();
        const grid = await page.locator(".module-grid").boundingBox();
        const stats = await page.locator(".stats-grid").boundingBox();
        const brand = await page.locator(".brand").boundingBox();
        expect(
          bunny && stats && bunny.y + bunny.height <= stats.y,
        ).toBeTruthy();
        expect(
          reading && grid && reading.y >= grid.y + grid.height,
        ).toBeTruthy();
        expect(bunny!.width).toBeGreaterThanOrEqual(width > 950 ? 300 : 230);
        expect(reading!.width).toBeGreaterThanOrEqual(
          Math.min(290, width - 36),
        );
        expect(
          brand &&
            bunny &&
            (brand.x + brand.width <= bunny.x ||
              brand.y + brand.height <= bunny.y),
        ).toBeTruthy();
        expect(Math.abs(grid!.x + grid!.width / 2 - width / 2)).toBeLessThan(1);
        expect(Math.abs(stats!.x - grid!.x)).toBeLessThan(1);
        expect(Math.abs(stats!.width - grid!.width)).toBeLessThan(1);
        if (width > 950) {
          const indicators = await page
            .locator(".stat-card")
            .evaluateAll((cards) =>
              cards.map((card) => ({
                x: card.getBoundingClientRect().x,
                width: card.getBoundingClientRect().width,
              })),
            );
          const columns = await page
            .locator(".module-card")
            .evaluateAll((cards) =>
              cards.slice(0, 3).map((card) => ({
                x: card.getBoundingClientRect().x,
                width: card.getBoundingClientRect().width,
              })),
            );
          for (let column = 0; column < 3; column++) {
            expect(
              Math.abs(indicators[column].x - columns[column].x),
            ).toBeLessThan(1);
            expect(
              Math.abs(indicators[column].width - columns[column].width),
            ).toBeLessThan(1);
          }
          const titleTops = await page
            .locator(".module-copy h2")
            .evaluateAll((titles) =>
              titles.map((title) => title.getBoundingClientRect().top),
            );
          for (const row of [0, 3]) {
            expect(
              Math.max(...titleTops.slice(row, row + 3)) -
                Math.min(...titleTops.slice(row, row + 3)),
            ).toBeLessThan(1);
          }
        }
        const heights = await page
          .locator(".module-card")
          .evaluateAll((cards) =>
            cards.map((card) =>
              Math.round(card.getBoundingClientRect().height),
            ),
          );
        expect(new Set(heights).size).toBe(1);
      } else {
        await expect(page.locator(".resting-bunny")).toHaveCount(0);
        await expect(page.locator(".reading-bunny")).toHaveCount(0);
      }
      const coveredText = await page
        .locator(".module-card")
        .evaluateAll((cards) =>
          cards.flatMap((card) => {
            const arrow = card
              .querySelector(".circle-arrow")!
              .getBoundingClientRect();
            return [...card.querySelectorAll("h2, p, .module-note")]
              .filter((element) => {
                const range = document.createRange();
                range.selectNodeContents(element);
                return [...range.getClientRects()].some(
                  (rect) =>
                    rect.width > 0 &&
                    rect.left < arrow.right &&
                    rect.right > arrow.left &&
                    rect.top < arrow.bottom &&
                    rect.bottom > arrow.top,
                );
              })
              .map((element) => element.textContent);
          }),
        );
      expect(coveredText).toEqual([]);
      if (
        width === 1440 ||
        width === 390 ||
        section === "teoria" ||
        section === ""
      ) {
        await page.screenshot({
          path: `test-results/visual-${section || "inicio"}-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
    }
  }
});
