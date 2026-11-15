import { describe, expect, it } from "vitest";
import {
  categories,
  type FlowNode,
  type FlowEdge,
} from "../src/types/processLab";
import {
  exampleMap,
  newMap,
  organizations,
  certificateSheet,
} from "../src/data/processes/examples";
import {
  bpmnExamples,
  exampleXml,
  emptyBpmnXml,
} from "../src/data/processes/bpmnExamples";
import { checkClassification } from "../src/data/processes/exercises";
import {
  deleteProcess,
  loadDocuments,
  parseDocument,
  saveDocuments,
  storageKey,
  validateDocument,
} from "../src/lib/processes/storage";
import { validateBpmn, validateMap } from "../src/lib/processes/validation";
const node = (id: string, type: string, pool = "empresa"): FlowNode => ({
  id,
  name: id,
  type,
  pool,
  incoming: [],
  outgoing: [],
});
const edge = (
  from: string,
  to: string,
  type = "bpmn:SequenceFlow",
  label = "",
): FlowEdge => ({ id: `${from}-${to}`, from, to, type, label });
const nodes = [
  node("inicio", "bpmn:StartEvent"),
  node("tarea", "bpmn:Task"),
  node("fin", "bpmn:EndEvent"),
];
const edges = [edge("inicio", "tarea"), edge("tarea", "fin")];
it("los cuatro casos incluyen los cuatro grupos, relaciones internas y descomposición en tres niveles", () => {
  expect(organizations).toHaveLength(4);
  for (const org of organizations) {
    const map = exampleMap(org.id);
    validateDocument(map);
    expect(new Set(map.nodes.map((n) => n.category))).toEqual(
      new Set(categories),
    );
    expect(
      map.nodes.every(
        (n) => n.stages.length && n.stages.every((s) => s.activities.length),
      ),
    ).toBe(true);
    expect(
      map.relations.every(
        (r) =>
          map.nodes.some((n) => n.id === r.from) &&
          map.nodes.some((n) => n.id === r.to),
      ),
    ).toBe(true);
  }
  expect(checkClassification("Operativos", "De gestión")).toContain(
    "En este caso corresponde De gestión",
  );
  expect(checkClassification("De gestión", "De gestión")).toContain("coincide");
});
it("serializa y recupera mapas, fichas y BPMN sin perder información", () => {
  const map = exampleMap("optica");
  map.sheet = { ...certificateSheet };
  const bpmn = {
    kind: "bpmn",
    id: "bpmn-uno",
    name: "BPMN guardado",
    xml: emptyBpmnXml,
  };
  let raw: string | null = null;
  const storage = {
    getItem: (key: string) => (key === storageKey ? raw : null),
    setItem: (_key: string, value: string) => {
      raw = value;
    },
  };
  saveDocuments(storage, [map, bpmn] as Parameters<typeof saveDocuments>[1]);
  expect(loadDocuments(storage)).toEqual([map, bpmn]);
  expect(parseDocument(JSON.stringify(map))).toEqual(map);
  expect(parseDocument(JSON.stringify(bpmn))).toEqual(bpmn);
});
it("rechaza importaciones rotas, límites excesivos y referencias inválidas", () => {
  const map = exampleMap("comercial");
  const invalids = [
    null,
    [],
    { ...map, kind: "otro" },
    { ...map, nodes: [...map.nodes, map.nodes[0]] },
    {
      ...map,
      relations: [
        { id: "r", from: "fuera", to: map.nodes[0].id, label: "rota" },
      ],
    },
    { ...map, nodes: [{ ...map.nodes[0], category: "Inventada" }] },
    { ...map, sheet: {} },
    { ...map, nodes: [{ ...map.nodes[0], name: "" }] },
    { kind: "bpmn", id: "x", name: "x", xml: "no es XML" },
    {
      kind: "bpmn",
      id: "x",
      name: "x",
      xml: `<!DOCTYPE malicious>${emptyBpmnXml}`,
    },
  ];
  for (const value of invalids)
    expect(() => parseDocument(JSON.stringify(value))).toThrow();
  expect(() => parseDocument("x".repeat(2_500_001))).toThrow();
});
it("protege datos previos si el almacenamiento está bloqueado, corrupto o sin cuota", () => {
  const map = exampleMap("software");
  const previous = JSON.stringify({ version: 1, documents: [map] });
  let raw = previous;
  const storage = {
    getItem: () => raw,
    setItem: () => {
      throw new Error("quota");
    },
  };
  expect(() => saveDocuments(storage, [newMap()])).toThrow();
  expect(raw).toBe(previous);
  raw = "JSON roto";
  expect(() => loadDocuments(storage)).toThrow();
  expect(raw).toBe("JSON roto");
  expect(() =>
    loadDocuments({
      getItem: () => {
        throw new Error("denied");
      },
    }),
  ).toThrow();
  raw = JSON.stringify({ version: 1, documents: [map, map] });
  expect(() => loadDocuments(storage)).toThrow();
});
it("eliminar un proceso elimina solo sus relaciones y conserva ficha y otros nodos", () => {
  const map = exampleMap("optica");
  map.sheet = { ...certificateSheet };
  const id = map.nodes[0].id;
  const updated = deleteProcess(map, id);
  expect(updated.nodes).toHaveLength(map.nodes.length - 1);
  expect(updated.relations.some((r) => r.from === id || r.to === id)).toBe(
    false,
  );
  expect(updated.sheet).toEqual(map.sheet);
  expect(map.nodes.some((n) => n.id === id)).toBe(true);
});
it("las recomendaciones del mapa piden propósito y relaciones sin imponer clasificaciones universales", () => {
  expect(validateMap(newMap()).some((i) => i.severity === "error")).toBe(true);
  const map = exampleMap("software");
  map.nodes[0].inputs = "";
  expect(
    validateMap(map).some((i) => i.text.includes("entradas y salidas")),
  ).toBe(true);
});
describe("comprobaciones educativas de BPMN", () => {
  it("acepta un recorrido básico conectado y distingue las recomendaciones", () => {
    expect(validateBpmn(nodes, edges)).toEqual([]);
    const parallel = node("paralela", "bpmn:ParallelGateway");
    const result = validateBpmn(
      [...nodes, parallel],
      [
        edge("inicio", "paralela"),
        edge("paralela", "tarea"),
        edge("paralela", "fin"),
        edge("tarea", "fin"),
      ],
    );
    expect(
      result.some(
        (i) => i.severity === "recommendation" && i.text.includes("tokens"),
      ),
    ).toBe(true);
  });
  it("detecta ausencia de inicio, fin y elementos aislados", () => {
    const result = validateBpmn([node("sola", "bpmn:Task")], []);
    for (const text of [
      "Falta un evento de inicio",
      "Falta un evento de fin",
      "aislado",
    ])
      expect(result.some((i) => i.text.includes(text))).toBe(true);
  });
  it("detecta caminos sin salida y ciclos sin llegada a un fin", () => {
    const result = validateBpmn(
      [...nodes, node("ciclo", "bpmn:Task")],
      [edge("inicio", "tarea"), edge("tarea", "ciclo"), edge("ciclo", "tarea")],
    );
    expect(
      result.some((i) => i.text.includes("no tiene camino hacia un final")),
    ).toBe(true);
    expect(result.some((i) => i.text.includes("no es alcanzable"))).toBe(true);
  });
  it("rechaza entrada a inicio, salida de fin y mensajes en el mismo pool", () => {
    const result = validateBpmn(nodes, [
      ...edges,
      edge("tarea", "inicio"),
      edge("fin", "tarea"),
      edge("tarea", "fin", "bpmn:MessageFlow"),
    ]);
    for (const text of [
      "inicio no recibe",
      "fin no emite",
      "mismo participante",
    ])
      expect(result.some((i) => i.text.includes(text))).toBe(true);
  });
  it("rechaza secuencias entre participantes y admite mensajes entre ellos", () => {
    const other = node("externo", "bpmn:Task", "proveedor");
    expect(
      validateBpmn(
        [...nodes, other],
        [...edges, edge("tarea", "externo")],
      ).some((i) => i.text.includes("no puede cruzar")),
    ).toBe(true);
    expect(
      validateBpmn(
        [...nodes, other],
        [...edges, edge("tarea", "externo", "bpmn:MessageFlow")],
      ).some((i) => i.text.includes("mismo participante")),
    ).toBe(false);
  });
  it("pide alternativas y condiciones de salida a las decisiones XOR", () => {
    const xor = node("decision", "bpmn:ExclusiveGateway");
    expect(
      validateBpmn(
        [...nodes, xor],
        [...edges, edge("inicio", "decision"), edge("decision", "fin")],
      ).some((i) => i.text.includes("alternativas claras")),
    ).toBe(true);
    expect(
      validateBpmn(
        [...nodes, xor],
        [
          edge("inicio", "decision"),
          edge("decision", "tarea"),
          edge("decision", "fin"),
          edge("tarea", "fin"),
        ],
      ).some((i) => i.text.includes("nombrá las condiciones")),
    ).toBe(true);
  });
});
it("los seis ejemplos generan documentos BPMN con namespace y DI, no JSON renombrado", () => {
  expect(bpmnExamples).toHaveLength(6);
  for (const example of bpmnExamples) {
    const xml = exampleXml(example);
    expect(xml).toContain("http://www.omg.org/spec/BPMN/20100524/MODEL");
    expect(xml).toContain("bpmndi:BPMNPlane");
    expect(xml).toContain("bpmn:exclusiveGateway");
    expect(xml).toContain("bpmn:endEvent");
    validateDocument({
      kind: "bpmn",
      id: example.id,
      name: example.title,
      xml,
    });
  }
});
