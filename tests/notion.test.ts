import { describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, readFile, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Client } from "@notionhq/client";
import { collectTheory, downloadImage, syncTheory } from "../scripts/sync-notion";
import { blockText, validateTheory } from "../src/types/theory";
import { parseStudyState } from "../src/hooks/studyStorage";

const sourceId = "11111111-1111-1111-1111-111111111111";
const pageId = "22222222-2222-2222-2222-222222222222";
const rich = (text: string) => [{ plain_text: text, annotations: { bold: true, italic: true }, href: "https://example.org" }];
const page = (status = "Publicado", type = "status", id = pageId) => ({ object: "page", id, parent: { data_source_id: sourceId }, properties: { internal: { id: "s%3A", type, [type]: { name: status } }, title: { id: "title", type: "title", title: rich("mapa de procesos") } }, cover: null });
const batch = (results: unknown[], more = false) => ({ results: results.map(value => {
  const row = value as Record<string, unknown>;
  return row.type ? { has_children: false, ...row } : row;
}), has_more: more, next_cursor: more ? "next" : null });
function mock(type = "status") {
  return {
    dataSources: { retrieve: vi.fn().mockResolvedValue({ properties: { Estado: { id: "s%3A", type } } }), query: vi.fn().mockResolvedValue(batch([page("Publicado", type)])) },
    databases: { retrieve: vi.fn() },
    blocks: { children: { list: vi.fn().mockResolvedValue(batch([{ id: "block", type: "paragraph", has_children: false, paragraph: { rich_text: rich("Texto académico intacto") } }])) } },
  };
}
const client = (value: ReturnType<typeof mock>) => value as unknown as Client;
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
const fetchImage = vi.fn<typeof fetch>(async () => new Response(png, { headers: { "content-type": "image/png" } }));

describe("Sincronización de Notion", () => {
  it.each(["status", "select"])("usa el ID interno de Estado %s y excluye borradores", async type => {
    const m = mock(type);
    m.dataSources.query.mockResolvedValue(batch([page("Publicado", type), page("Borrador", type, "33333333-3333-3333-3333-333333333333")]));
    const { data } = await collectTheory(client(m), sourceId);
    expect(data.documents).toHaveLength(1);
    expect(m.dataSources.query).toHaveBeenCalledWith(expect.objectContaining({ filter: { property: "s%3A", [type]: { equals: "Publicado" } } }));
    expect(data.documents[0].category).toBe("General");
    expect(blockText(data.documents[0].blocks)).toContain("Texto académico intacto");
    expect(data.documents[0].blocks[0].text[0]).toMatchObject({ bold: true, italic: true });
    expect(m.blocks.children.list).toHaveBeenCalledTimes(1);
  });
  it("resuelve una base con una única data source", async () => {
    const m = mock();
    m.dataSources.retrieve.mockRejectedValueOnce({ code: "object_not_found" });
    m.databases.retrieve.mockResolvedValue({ data_sources: [{ id: sourceId }] });
    await collectTheory(client(m), sourceId);
    expect(m.databases.retrieve).toHaveBeenCalled();
  });
  it("pagina páginas y bloques anidados en orden", async () => {
    const m = mock();
    m.dataSources.query.mockResolvedValueOnce(batch([page()], true)).mockResolvedValueOnce(batch([]));
    m.blocks.children.list.mockResolvedValueOnce(batch([{ id: "parent", type: "bulleted_list_item", has_children: true, bulleted_list_item: { rich_text: rich("Primero") } }], true)).mockResolvedValueOnce(batch([{ id: "tail", type: "paragraph", paragraph: { rich_text: rich("Segundo") } }])).mockResolvedValueOnce(batch([{ id: "child", type: "heading_2", heading_2: { rich_text: rich("Anidado") } }]));
    const { data } = await collectTheory(client(m), sourceId);
    expect(m.dataSources.query.mock.calls[1][0].start_cursor).toBe("next");
    expect(data.documents[0].blocks.map(b => b.id)).toEqual(["parent", "tail"]);
    expect(data.documents[0].blocks[0].children[0].text[0].text).toBe("Anidado");
  });
  it("copia portada e imágenes con nombres estables y conserva tablas", async () => {
    const m = mock(), p = { ...page(), cover: { type: "file", file: { url: "https://example.org/cover?signature=private" } } };
    m.dataSources.query.mockResolvedValue(batch([p]));
    m.blocks.children.list.mockResolvedValueOnce(batch([{ id: "img", type: "image", image: { type: "external", external: { url: "https://example.org/picture" }, caption: rich("Figura") } }, { id: "table", type: "table", has_children: true, table: { has_column_header: true } }])).mockResolvedValueOnce(batch([{ id: "row", type: "table_row", table_row: { cells: [rich("Dato")] } }]));
    const { data, assets } = await collectTheory(client(m), sourceId, fetchImage);
    expect(assets.size).toBe(1);
    expect(data.documents[0].cover).toBe(data.documents[0].blocks[0].src);
    expect(JSON.stringify(data)).not.toContain("signature");
    expect(data.documents[0].blocks[1].children[0].cells?.[0][0].text).toBe("Dato");
  });
  it("acepta páginas vacías y ninguna publicación sin inventar contenido", async () => {
    const m = mock(); m.blocks.children.list.mockResolvedValue(batch([]));
    expect((await collectTheory(client(m), sourceId)).data.documents[0].blocks).toEqual([]);
    m.dataSources.query.mockResolvedValue(batch([]));
    expect((await collectTheory(client(m), sourceId)).data.documents).toEqual([]);
  });
  it("rechaza esquemas inválidos, páginas ajenas, cursores incompletos y bloques no soportados", async () => {
    const m = mock();
    m.dataSources.retrieve.mockResolvedValueOnce({ properties: { Estado: { type: "checkbox" } } });
    await expect(collectTheory(client(m), sourceId)).rejects.toThrow();
    m.dataSources.query.mockResolvedValueOnce(batch([{ ...page(), parent: { data_source_id: "other" } }]));
    await expect(collectTheory(client(m), sourceId)).rejects.toThrow();
    m.dataSources.query.mockResolvedValueOnce({ results: [], has_more: true, next_cursor: null });
    await expect(collectTheory(client(m), sourceId)).rejects.toThrow();
    m.blocks.children.list.mockResolvedValueOnce(batch([{ id: "private", type: "child_page", has_children: true, child_page: { title: "Privado" } }]));
    await expect(collectTheory(client(m), sourceId)).rejects.toThrow("child_page");
    m.blocks.children.list.mockResolvedValueOnce(batch([{ id: "partial", type: "paragraph", paragraph: {} }]));
    await expect(collectTheory(client(m), sourceId)).rejects.toThrow("incompleto");
  });
  it("no cambia archivos idénticos, preserva el snapshot ante errores y retira borradores tras éxito", async () => {
    const root = await mkdtemp(join(tmpdir(), "notion-test-"));
    try {
      const m = mock(), file = join(root, "public/notion-theory.json");
      await mkdir(join(root, "public"), { recursive: true });
      await writeFile(file, "anterior");
      m.dataSources.query.mockRejectedValueOnce(new Error("conexión"));
      await expect(syncTheory(client(m), sourceId, root)).rejects.toThrow();
      expect(await readFile(file, "utf8")).toBe("anterior");
      expect(await syncTheory(client(m), sourceId, root)).toBe(true);
      const previous = await readFile(file, "utf8"), time = (await stat(file)).mtimeMs;
      expect(await syncTheory(client(m), sourceId, root)).toBe(false);
      expect((await stat(file)).mtimeMs).toBe(time);
      m.blocks.children.list.mockRejectedValueOnce(new Error("bloques"));
      await expect(syncTheory(client(m), sourceId, root)).rejects.toThrow();
      expect(await readFile(file, "utf8")).toBe(previous);
      m.blocks.children.list.mockResolvedValueOnce(batch([{ id: "img", type: "image", image: { type: "file", file: { url: "https://example.org/image" } } }]));
      await expect(syncTheory(client(m), sourceId, root, async () => { throw new Error("descarga"); })).rejects.toThrow();
      expect(await readFile(file, "utf8")).toBe(previous);
      const stale = join(root, "public/notion-images", `${"a".repeat(64)}.png`);
      await writeFile(stale, png);
      m.dataSources.query.mockResolvedValue(batch([page("Borrador")]));
      await syncTheory(client(m), sourceId, root);
      expect(JSON.parse(await readFile(file, "utf8")).documents).toEqual([]);
      await expect(readFile(stale)).rejects.toMatchObject({ code: "ENOENT" });
    } finally { await rm(root, { recursive: true, force: true }); }
  });
  it("valida formatos, tamaño y HTTPS de imágenes", async () => {
    expect((await downloadImage("https://example.org/image", fetchImage)).extension).toBe("png");
    await expect(downloadImage("http://example.org/image", fetchImage)).rejects.toThrow();
    await expect(downloadImage("https://example.org/image", async () => new Response("<svg/>", { headers: { "content-type": "image/png" } }))).rejects.toThrow();
    await expect(downloadImage("https://example.org/image", async () => new Response(png, { headers: { "content-type": "image/png", "content-length": "20000000" } }))).rejects.toThrow();
    await expect(downloadImage("https://example.org/image", async () => new Response(png, { status: 403 }))).rejects.toThrow();
  });
  it("rechaza JSON inseguro y conserva progreso estable y previo aunque un documento se retire", () => {
    expect(() => validateTheory({ version: 1, documents: [{ id: "x" }] })).toThrow();
    const id = `notion-${pageId.replaceAll("-", "")}`, date = "2026-11-14T12:00:00Z";
    expect(parseStudyState(JSON.stringify({ completed: { [id]: date, phva: date } })).completed).toEqual({ [id]: date, phva: date });
  });
});
