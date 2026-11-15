import {
  categories,
  type LabDocument,
  type ProcessMap,
} from "../../types/processLab";
import { sheetFields } from "../../data/processes/content";
export const storageKey = "gestion-calidad.process-lab.v1";
export function validateDocument(value: unknown): asserts value is LabDocument {
  const fail = () => {
    throw new Error(
      "Archivo inválido: revisá el formato, los campos y las referencias del laboratorio.",
    );
  };
  const record = (v: unknown): Record<string, unknown> => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return fail();
    return v as Record<string, unknown>;
  };
  const text = (v: unknown, max = 5000) =>
    typeof v === "string" && v.length <= max;
  const doc = record(value);
  if (
    !text(doc.id, 100) ||
    !doc.id ||
    !text(doc.name, 200) ||
    !String(doc.name).trim()
  )
    fail();
  if (doc.kind === "bpmn") {
    if (
      !text(doc.xml, 2_000_000) ||
      !String(doc.xml).includes(
        "http://www.omg.org/spec/BPMN/20100524/MODEL",
      ) ||
      !/<(?:[\w-]+:)?definitions\b/.test(String(doc.xml)) ||
      /<!DOCTYPE|<!ENTITY/i.test(String(doc.xml))
    )
      fail();
    return;
  }
  if (
    doc.kind !== "map" ||
    !text(doc.organization, 200) ||
    !text(doc.needs) ||
    !text(doc.result) ||
    !Array.isArray(doc.nodes) ||
    doc.nodes.length > 80 ||
    !Array.isArray(doc.relations) ||
    doc.relations.length > 200
  )
    return fail();
  const ids = new Set<string>();
  for (const item of doc.nodes) {
    const node = record(item);
    if (
      !text(node.id, 100) ||
      !node.id ||
      ids.has(String(node.id)) ||
      !text(node.name, 200) ||
      !String(node.name).trim() ||
      !categories.includes(node.category as (typeof categories)[number])
    )
      fail();
    ids.add(String(node.id));
    for (const field of [
      "purpose",
      "justification",
      "example",
      "inputs",
      "outputs",
    ])
      if (!text(node[field])) fail();
    if (!Array.isArray(node.stages) || node.stages.length > 30) return fail();
    for (const item of node.stages) {
      const stage = record(item);
      if (
        !text(stage.name, 200) ||
        !Array.isArray(stage.activities) ||
        stage.activities.length > 50 ||
        !stage.activities.every((item) => text(item))
      )
        fail();
    }
  }
  const edges = new Set<string>();
  for (const item of doc.relations) {
    const edge = record(item);
    if (
      !text(edge.id, 100) ||
      !edge.id ||
      edges.has(String(edge.id)) ||
      !ids.has(String(edge.from)) ||
      !ids.has(String(edge.to)) ||
      edge.from === edge.to ||
      !text(edge.label, 500)
    )
      fail();
    edges.add(String(edge.id));
  }
  const sheet = record(doc.sheet);
  for (const [key] of sheetFields) if (!text(sheet[key])) fail();
}
export function parseDocument(text: string): LabDocument {
  if (text.length > 2_500_000)
    throw new Error("El archivo supera el límite de 2,5 MB.");
  const value: unknown = JSON.parse(text);
  validateDocument(value);
  return value;
}
export function loadDocuments(
  storage: Pick<Storage, "getItem">,
): LabDocument[] {
  const raw = storage.getItem(storageKey);
  if (!raw) return [];
  if (raw.length > 10_000_000)
    throw new Error(
      "La biblioteca local es demasiado grande. Conservá un respaldo antes de reiniciarla.",
    );
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== "object" ||
    !("version" in value) ||
    value.version !== 1 ||
    !("documents" in value) ||
    !Array.isArray(value.documents) ||
    value.documents.length > 30
  )
    throw new Error("Biblioteca local inválida; no se sobrescribió.");
  value.documents.forEach(validateDocument);
  if (
    new Set(value.documents.map((doc) => doc.id)).size !==
    value.documents.length
  )
    throw new Error("Hay identificadores duplicados en la biblioteca.");
  return value.documents;
}
export function saveDocuments(
  storage: Pick<Storage, "setItem">,
  documents: LabDocument[],
) {
  documents.forEach(validateDocument);
  if (new Set(documents.map((doc) => doc.id)).size !== documents.length)
    throw new Error("Hay trabajos con identificadores duplicados.");
  const data = JSON.stringify({ version: 1, documents });
  if (documents.length > 30 || data.length > 10_000_000)
    throw new Error("Exportá respaldos: el límite es 30 trabajos o 10 MB.");
  storage.setItem(storageKey, data);
}
export function deleteProcess(map: ProcessMap, id: string): ProcessMap {
  return {
    ...map,
    nodes: map.nodes.filter((node) => node.id !== id),
    relations: map.relations.filter(
      (edge) => edge.from !== id && edge.to !== id,
    ),
  };
}
export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
