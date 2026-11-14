import { Client, LogLevel } from "@notionhq/client";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { blockTypes, safeLink, validateTheory } from "../src/types/theory.ts";
import type { RichText, TheoryBlock, TheoryData } from "../src/types/theory.ts";

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("Respuesta incompleta de Notion");
  return v as Raw;
};
const str = (v: unknown): string => {
  if (typeof v !== "string") throw new Error("Texto incompleto de Notion");
  return v;
};
const list = (v: unknown): unknown[] => {
  if (!Array.isArray(v)) throw new Error("Lista incompleta de Notion");
  return v;
};
const uuid = (v: string) => {
  const id = v.replaceAll("-", "").toLowerCase();
  if (!/^[a-f0-9]{32}$/.test(id)) throw new Error("ID de Notion inválido");
  return id;
};
function rich(value: unknown): RichText[] {
  return list(value).map(item => {
    const r = obj(item), a = obj(r.annotations);
    const href = r.href == null ? undefined : str(r.href);
    return { text: str(r.plain_text), ...(href && safeLink(href) ? { href } : {}), bold: a.bold === true, italic: a.italic === true, strike: a.strikethrough === true, underline: a.underline === true, code: a.code === true };
  });
}
async function paginate(request: (cursor?: string) => Promise<unknown>) {
  const results: unknown[] = [], seen = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = obj(await request(cursor));
    results.push(...list(page.results));
    if (typeof page.has_more !== "boolean") throw new Error("Paginación incompleta");
    if (!page.has_more) break;
    cursor = str(page.next_cursor);
    if (!cursor || seen.has(cursor)) throw new Error("Cursor inválido");
    seen.add(cursor);
  } while (cursor);
  return results;
}

// Only raster formats with matching signatures are published; SVG can execute content.
export async function downloadImage(url: string, fetcher: typeof fetch = fetch): Promise<{ bytes: Buffer; extension: string }> {
  const address = new URL(url);
  if (address.protocol !== "https:" || address.username || address.password) throw new Error("Imagen requiere HTTPS");
  const response = await fetcher(address, { signal: AbortSignal.timeout(30_000), redirect: "error" });
  if (!response.ok || !response.body) throw new Error("No se pudo descargar una imagen");
  const limit = 10 * 1024 * 1024;
  if (Number(response.headers.get("content-length")) > limit) throw new Error("Imagen demasiado grande");
  const chunks: Uint8Array[] = []; let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) { await response.body.cancel().catch(() => {}); throw new Error("Imagen demasiado grande"); }
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks);
  const extension = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png"
    : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? "jpg"
    : ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6)) ? "gif"
    : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : "";
  const mime = response.headers.get("content-type")?.split(";")[0];
  if (!extension || mime !== ({ png: "image/png", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp" }[extension])) throw new Error("Formato de imagen inválido");
  return { bytes, extension };
}

export async function collectTheory(notion: Client, sourceId: string, fetcher: typeof fetch = fetch) {
  sourceId = uuid(sourceId).replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  let source: Raw;
  try { source = obj(await notion.dataSources.retrieve({ data_source_id: sourceId })); }
  catch (error) {
    if (obj(error).code !== "object_not_found") throw error;
    const database = obj(await notion.databases.retrieve({ database_id: sourceId }));
    const sources = list(database.data_sources);
    if (sources.length !== 1) throw new Error("Configurá el ID de la data source: la base contiene varias fuentes", { cause: error });
    sourceId = str(obj(sources[0]).id);
    source = obj(await notion.dataSources.retrieve({ data_source_id: sourceId }));
  }
  const schema: (Raw & { name: string })[] = Object.entries(obj(source.properties)).map(([name, value]) => ({ name, ...obj(value) }));
  const state = schema.find(p => p.name === "Estado");
  if (!state || (state.type !== "status" && state.type !== "select")) throw new Error("Estado debe ser Status o Select");
  const stateId = str(state.id), stateType = state.type;
  const pages = await paginate(cursor => notion.dataSources.query({ data_source_id: sourceId, page_size: 100, start_cursor: cursor, filter: stateType === "status" ? { property: stateId, status: { equals: "Publicado" } } : { property: stateId, select: { equals: "Publicado" } }, sorts: [{ timestamp: "created_time", direction: "ascending" }] }));
  const assets = new Map<string, Buffer>();
  async function image(value: unknown) {
    const media = obj(value), type = str(media.type);
    if (type !== "file" && type !== "external") throw new Error("Imagen no disponible");
    const { bytes, extension } = await downloadImage(str(obj(media[type]).url), fetcher);
    const name = `${createHash("sha256").update(bytes).digest("hex")}.${extension}`;
    assets.set(name, bytes);
    return `notion-images/${name}`;
  }
  async function blocks(id: string, depth = 0): Promise<TheoryBlock[]> {
    if (depth > 100) throw new Error("Anidamiento excesivo");
    const rows = await paginate(cursor => notion.blocks.children.list({ block_id: id, page_size: 100, start_cursor: cursor }));
    const output: TheoryBlock[] = [];
    for (const row of rows) {
      const b = obj(row), type = str(b.type), blockId = str(b.id);
      // Never traverse linked pages or synced blocks: they may expose unpublished material.
      if (!blockTypes.includes(type as TheoryBlock["type"])) throw new Error(`Bloque no compatible: ${type}`);
      const p = obj(b[type]);
      if (typeof b.has_children !== "boolean") throw new Error("Bloque incompleto");
      if (["paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "numbered_list_item", "to_do", "toggle", "quote", "callout", "code"].includes(type) && !Array.isArray(p.rich_text)) throw new Error("Texto de bloque incompleto");
      const block: TheoryBlock = { id: blockId, type: type as TheoryBlock["type"], text: rich(p.rich_text ?? p.caption ?? []), children: b.has_children === true ? await blocks(blockId, depth + 1) : [] };
      if (type === "image") block.src = await image(p);
      if (type === "equation") block.text = [{ text: str(p.expression), bold: false, italic: false, strike: false, underline: false, code: false }];
      if (type === "table_row") block.cells = list(p.cells).map(rich);
      if (type === "table") { block.columnHeader = p.has_column_header === true; block.rowHeader = p.has_row_header === true; }
      if (type === "table" && block.children.some(child => child.type !== "table_row")) throw new Error("Tabla incompleta");
      if (type === "to_do") block.checked = p.checked === true;
      output.push(block);
    }
    return output;
  }
  const data: TheoryData = { version: 1, documents: [] };
  for (const item of pages) {
    const page = obj(item), properties = Object.values(obj(page.properties)).map(obj);
    const status = properties.find(p => p.id === stateId);
    if (!status || status.type !== stateType) throw new Error("Estado incompleto");
    if (status[stateType] === null || obj(status[stateType]).name !== "Publicado" || page.in_trash === true || page.archived === true) continue;
    if (obj(page.parent).data_source_id !== sourceId) throw new Error("Página fuera de la fuente autorizada");
    const title = properties.find(p => p.type === "title");
    if (!title) throw new Error("Página sin propiedad de título");
    const categorySchema = schema.find(p => ["categoría", "categoria"].includes(p.name.toLocaleLowerCase("es")));
    const category = properties.find(p => p.id === categorySchema?.id);
    let categoryText = "General";
    if (category?.type === "select" && category.select) categoryText = str(obj(category.select).name);
    if (category?.type === "multi_select") categoryText = list(category.multi_select).map(v => str(obj(v).name)).join(", ") || "General";
    if (category?.type === "rich_text") categoryText = rich(category.rich_text).map(r => r.text).join("") || "General";
    data.documents.push({ id: `notion-${uuid(str(page.id))}`, title: rich(title.title).map(r => r.text).join(""), category: categoryText, ...(page.cover ? { cover: await image(page.cover) } : {}), blocks: await blocks(str(page.id)) });
  }
  data.documents.sort((a, b) => a.id.localeCompare(b.id));
  validateTheory(data);
  return { data, assets };
}

export async function syncTheory(notion: Client, sourceId: string, root = process.cwd(), fetcher: typeof fetch = fetch) {
  // Complete all reads and validation before touching the published snapshot.
  const { data, assets } = await collectTheory(notion, sourceId, fetcher);
  const file = resolve(root, "public/notion-theory.json"), directory = resolve(root, "public/notion-images");
  const json = JSON.stringify(data, null, 2) + "\n";
  let previous = "";
  try { previous = await readFile(file, "utf8"); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  await mkdir(directory, { recursive: true });
  for (const [name, bytes] of assets) {
    const path = join(directory, name);
    try { if ((await readFile(path)).equals(bytes)) continue; } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    await writeFile(`${path}.tmp`, bytes); await rename(`${path}.tmp`, path);
  }
  if (json !== previous) {
    await writeFile(`${file}.tmp`, json);
    await rename(`${file}.tmp`, file);
  }
  let removed = false;
  // Once the new snapshot is complete, retire assets belonging only to withdrawn pages.
  for (const name of await readdir(directory)) {
    if (/^[a-f0-9]{64}\.(png|jpg|gif|webp)$/.test(name) && !assets.has(name)) {
      await unlink(join(directory, name));
      removed = true;
    }
  }
  return json !== previous || removed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const token = process.env.NOTION_TOKEN, source = process.env.NOTION_THEORY_SOURCE_ID;
    if (!token || !source) throw new Error("Configurá NOTION_TOKEN y NOTION_THEORY_SOURCE_ID");
    const changed = await syncTheory(new Client({ auth: token, notionVersion: "2026-03-11", logLevel: LogLevel.ERROR, logger: () => {} }), source);
    process.stdout.write(changed ? "Teoría actualizada.\n" : "Sin cambios.\n");
  } catch {
    // SDK errors may contain request URLs; never log raw responses or credentials.
    process.stderr.write("Sincronización cancelada. Revisá configuración, permisos, bloques e imágenes en Notion; el contenido previo se conserva.\n");
    process.exitCode = 1;
  }
}
