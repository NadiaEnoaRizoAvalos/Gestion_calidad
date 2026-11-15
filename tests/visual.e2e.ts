import { test, expect } from "@playwright/test";

const sections = [
  "",
  "teoria",
  "procesos",
  "parciales",
  "repaso",
  "ruta",
];

test("el tema permanece claro aunque el dispositivo prefiera oscuro", async ({
  page,
}) => {
  for (const section of sections) {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(`/#/${section}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/^(Cargando parciales…|Cargando resúmenes…)$/)).toHaveCount(0);
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
  for (const width of [1440, 1280, 1180, 1024, 768, 720, 651, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const section of sections) {
      await page.goto(`/#/${section}`);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => image.decode()));
      });
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
        const lower = await page.locator(".bottom-grid").boundingBox();
        const route = await page.locator(".route-card").boundingBox();
        const tip = await page.locator(".daily-tip").boundingBox();
        const routeCopy = await page.locator(".route-copy").boundingBox();
        const header = await page.locator(".site-header").boundingBox();
        const nav = await page.locator(".module-nav").boundingBox();
        const window = await page.locator(".home-room .window").boundingBox();
        await expect(page.locator(".sidebar, .sidebar-menu, .tip-card, .site-footer")).toHaveCount(0);
        await expect(page.getByText("Un poquito cada día, un gran paso en tu aprendizaje.", { exact: true })).toHaveCount(0);
        expect(Math.abs(brand!.x + brand!.width / 2 - width / 2)).toBeLessThan(1);
        for (const block of [header, nav, stats, route, tip]) {
          expect(Math.abs(block!.x - grid!.x)).toBeLessThan(1);
          expect(Math.abs(block!.width - grid!.width)).toBeLessThan(1);
        }
        expect(Math.abs(grid!.x + grid!.width / 2 - width / 2)).toBeLessThan(1);
        expect(window!.y).toBeLessThan(bunny!.y);
        expect(window!.x).toBeLessThan(bunny!.x + bunny!.width);
        expect(window!.x + window!.width).toBeGreaterThan(bunny!.x);
        await expect(page.locator(".daily-tip")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(page.locator(".daily-tip")).toHaveCSS("box-shadow", "none");
        expect(Math.abs(lower!.x - grid!.x)).toBeLessThan(1);
        expect(Math.abs(lower!.width - grid!.width)).toBeLessThan(1);
        expect(reading!.x).toBeGreaterThanOrEqual(route!.x);
        expect(reading!.x + reading!.width).toBeLessThanOrEqual(route!.x + route!.width);
        expect(reading!.y).toBeGreaterThan(route!.y);
        expect(reading!.y + reading!.height).toBeLessThan(route!.y + route!.height);
        expect(
          reading!.x + reading!.width <= routeCopy!.x ||
          reading!.y + reading!.height <= routeCopy!.y,
        ).toBeTruthy();
        expect(route!.y + route!.height).toBeLessThan(tip!.y);
        for (const selector of [".leaves-upper-left", ".leaves-lower-right"]) {
          const leaf = await page.locator(selector).boundingBox();
          expect(leaf!.width).toBeGreaterThan(130);
          expect(leaf!.x < grid!.x || leaf!.x + leaf!.width > grid!.x + grid!.width).toBeTruthy();
          await expect(page.locator(selector)).toHaveCSS(
            "pointer-events",
            "none",
          );
        }
        expect(
          bunny && stats && bunny.y + bunny.height <= stats.y,
        ).toBeTruthy();
        expect(
          reading && grid && reading.y >= grid.y + grid.height,
        ).toBeTruthy();
        expect(bunny!.width).toBeGreaterThanOrEqual(230);
        expect(reading!.width).toBeGreaterThanOrEqual(
          width > 950 ? 200 : width > 650 ? 160 : width > 360 ? 112 : 96,
        );
        expect(
          brand &&
            bunny &&
            (brand.x + brand.width <= bunny.x ||
              brand.y + brand.height <= bunny.y),
        ).toBeTruthy();
        expect(Math.abs(stats!.x - grid!.x)).toBeLessThan(1);
        expect(Math.abs(stats!.width - grid!.width)).toBeLessThan(1);
        if (width > 650) {
          const indicators = await page
            .locator(".stat-card")
            .evaluateAll((cards) =>
              cards.map((card) => ({
                x: card.getBoundingClientRect().x,
                width: card.getBoundingClientRect().width,
              })),
            );
          expect(indicators[1].width).toBeGreaterThanOrEqual(220);
          expect(indicators[0].width).toBeGreaterThan(indicators[1].width);
          if (width > 950) {
            expect(indicators[0].width / (indicators[0].width + indicators[1].width)).toBeCloseTo(.75, 2);
          }
          const titleTops = await page
            .locator(".module-copy h2")
            .evaluateAll((titles) =>
              titles.map((title) => title.getBoundingClientRect().top),
            );
          for (const row of [0, 2]) {
            expect(
              Math.max(...titleTops.slice(row, row + 2)) -
                Math.min(...titleTops.slice(row, row + 2)),
            ).toBeLessThan(1);
          }
        }
        const statsHeights = await page.locator(".stat-card").evaluateAll(cards=>cards.map(card=>Math.round(card.getBoundingClientRect().height)));
        expect(new Set(statsHeights).size).toBe(1);
        const moduleRects = await page.locator(".module-card").evaluateAll(cards=>cards.map(card=>card.getBoundingClientRect().toJSON()));
        expect(moduleRects).toHaveLength(4);
        if(width>650){
          expect(moduleRects[0].y).toBe(moduleRects[1].y);
          expect(moduleRects[2].y).toBe(moduleRects[3].y);
          expect(moduleRects[0].x).toBe(moduleRects[2].x);
        }else{
          expect(new Set(moduleRects.map(rect=>rect.x)).size).toBe(1);
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
