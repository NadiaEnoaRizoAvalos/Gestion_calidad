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
        const grid = await page.locator(".module-grid").boundingBox();
        expect(bunny && grid && bunny.y >= grid.y + grid.height).toBeTruthy();
        expect(bunny!.width).toBeGreaterThanOrEqual(Math.min(300, width - 36));
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
