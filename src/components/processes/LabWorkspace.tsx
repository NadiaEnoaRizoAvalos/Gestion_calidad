import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import type {
  BpmnDocument,
  LabDocument,
  ProcessMap,
} from "../../types/processLab";
import { newMap, organizations } from "../../data/processes/examples";
import { emptyBpmnXml } from "../../data/processes/bpmnExamples";
import {
  downloadFile,
  loadDocuments,
  parseDocument,
  saveDocuments,
  storageKey,
  validateDocument,
} from "../../lib/processes/storage";
import { MapEditor } from "./MapEditor";
const BpmnCanvas = lazy(() => import("./BpmnCanvas"));
const createBpmn = (): BpmnDocument => ({
  kind: "bpmn",
  id: crypto.randomUUID(),
  name: "Mi diagrama BPMN",
  xml: emptyBpmnXml,
});
export function LabWorkspace({
  initial,
  active,
  onDirty,
}: {
  initial: LabDocument | null;
  active: boolean;
  onDirty: (dirty: boolean) => void;
}) {
  const [library, setLibrary] = useState(() => {
    try {
      return { documents: loadDocuments(localStorage), error: "" };
    } catch {
      return {
        documents: [] as LabDocument[],
        error:
          "No se pudo leer la biblioteca local. No se sobrescribirá: exportá un respaldo antes de reiniciarla.",
      };
    }
  });
  const [mode, setMode] = useState<"map" | "bpmn">(initial?.kind ?? "map");
  const [map, setMap] = useState<ProcessMap>(() =>
    initial?.kind === "map" ? structuredClone(initial) : newMap(),
  );
  const [initialBpmn, setInitialBpmn] = useState<BpmnDocument>(() =>
    initial?.kind === "bpmn" ? initial : createBpmn(),
  );
  const [bpmnDraft, setBpmnDraft] = useState(initialBpmn);
  const [opened, setOpened] = useState(initial?.kind === "bpmn");
  const [bpmnBusy, setBpmnBusy] = useState(false);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const draft: LabDocument = mode === "map" ? map : bpmnDraft;
  const dirty =
    JSON.stringify(draft) !==
      JSON.stringify(library.documents.find((doc) => doc.id === draft.id)) &&
    (draft.kind === "bpmn" ||
      draft.nodes.length > 0 ||
      !!draft.sheet.name ||
      draft.name !== "Mi mapa de procesos");
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const bpmnReady = useCallback((doc: BpmnDocument) => setBpmnDraft(doc), []);
  const bpmnChanged = useCallback(
    (xml: string) => setBpmnDraft((prev) => ({ ...prev, xml })),
    [],
  );
  const replace = () =>
    !dirty ||
    window.confirm(
      "Hay cambios sin guardar. ¿Reemplazar este borrador? Podés cancelar y guardar o exportar primero.",
    );
  const commit = (documents: LabDocument[]) => {
    if (library.error) {
      setMessage(library.error);
      return false;
    }
    try {
      saveDocuments(localStorage, documents);
      setLibrary({ documents, error: "" });
      setMessage("Trabajo guardado en este navegador.");
      return true;
    } catch {
      setMessage(
        "No se pudo guardar: almacenamiento bloqueado, cuota agotada o datos inválidos. El contenido anterior se conserva; exportá JSON de respaldo.",
      );
      return false;
    }
  };
  const open = (doc: LabDocument) => {
    if (!replace()) return;
    if (doc.kind === "map") {
      setMap(structuredClone(doc));
      setMode("map");
    } else {
      setInitialBpmn({ ...doc });
      setMode("bpmn");
      setOpened(true);
    }
    setMessage("");
  };
  const newWork = (kind: "map" | "bpmn") => {
    if (!replace()) return;
    if (kind === "map") setMap(newMap());
    else {
      const doc = createBpmn();
      setInitialBpmn(doc);
      setBpmnDraft(doc);
      setOpened(true);
    }
    setMode(kind);
    setSelected("");
    setMessage("");
  };
  const saved = library.documents.find((doc) => doc.id === selected);
  async function importFile(file: File) {
    try {
      if (file.size > 2_500_000) throw new Error();
      const text = await file.text();
      const doc: LabDocument = file.name.toLowerCase().endsWith(".json")
        ? parseDocument(text)
        : {
            kind: "bpmn",
            id: crypto.randomUUID(),
            name:
              file.name.replace(/\.(xml|bpmn)$/i, "").slice(0, 200) ||
              "BPMN importado",
            xml: text,
          };
      validateDocument(doc);
      open({ ...doc, id: crypto.randomUUID() });
    } catch {
      setMessage(
        "No se importó el archivo: JSON o XML inválido, referencias rotas o tamaño excesivo. El trabajo anterior se conserva.",
      );
    }
  }
  return (
    <div className="lab-stack">
      <section className="panel lab-library">
        <h2>Mi espacio de trabajo</h2>
        <p className="lab-notice">
          Guardá los cambios antes de salir de esta sección. Los trabajos se
          guardan solo en este navegador. Borrar sus datos o cambiar de
          dispositivo puede eliminarlos. Exportá JSON de respaldo; el BPMN
          también se exporta como XML estándar.
        </p>
        <div className="actions">
          <button className="secondary" onClick={() => newWork("map")}>
            Nuevo mapa
          </button>
          <button className="secondary" onClick={() => newWork("bpmn")}>
            Nuevo BPMN
          </button>
          <button
            className="primary"
            disabled={!!library.error || (mode === "bpmn" && bpmnBusy)}
            onClick={() => {
              if (
                commit([
                  ...library.documents.filter((doc) => doc.id !== draft.id),
                  structuredClone(draft),
                ])
              )
                setSelected(draft.id);
            }}
          >
            Guardar trabajo
          </button>
          <button
            className="secondary"
            disabled={mode === "bpmn" && bpmnBusy}
            onClick={() =>
              downloadFile(
                "trabajo-laboratorio.json",
                JSON.stringify(draft, null, 2),
                "application/json",
              )
            }
          >
            Exportar JSON
          </button>
          <label className="secondary lab-file">
            Importar JSON o BPMN
            <input
              type="file"
              accept=".json,.bpmn,.xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="muted" aria-live="polite">
          {dirty
            ? "Borrador con cambios sin guardar."
            : "Sin cambios pendientes."}
        </p>
        <label>
          Nombre del trabajo
          <input
            maxLength={200}
            value={draft.name}
            onChange={(e) =>
              mode === "map"
                ? setMap({ ...map, name: e.target.value })
                : setBpmnDraft({ ...bpmnDraft, name: e.target.value })
            }
          />
        </label>
        <div className="lab-form-row">
          <label>
            Trabajos guardados
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Elegir trabajo</option>
              {library.documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} · {doc.kind === "map" ? "Mapa" : "BPMN"}
                </option>
              ))}
            </select>
          </label>
          <button
            className="secondary"
            disabled={!saved}
            onClick={() => saved && open(saved)}
          >
            Recuperar trabajo
          </button>
          <button
            className="secondary"
            disabled={!saved || !!library.error}
            onClick={() => {
              if (saved) {
                const copy = {
                  ...structuredClone(saved),
                  id: crypto.randomUUID(),
                  name: `${saved.name.slice(0, 190)} (copia)`,
                };
                if (commit([...library.documents, copy])) setSelected(copy.id);
              }
            }}
          >
            Duplicar trabajo
          </button>
          <button
            className="secondary"
            disabled={!saved || !!library.error}
            onClick={() => {
              if (
                saved &&
                window.confirm(
                  `¿Eliminar el trabajo guardado «${saved.name}»? El borrador abierto se conserva.`,
                )
              ) {
                if (
                  commit(library.documents.filter((doc) => doc.id !== saved.id))
                )
                  setSelected("");
              }
            }}
          >
            Eliminar trabajo guardado
          </button>
        </div>
        {library.error && (
          <div role="alert">
            <p>{library.error}</p>
            <button
              className="secondary"
              onClick={() => {
                try {
                  downloadFile(
                    "respaldo-biblioteca-local.json",
                    localStorage.getItem(storageKey) ?? "",
                    "application/json",
                  );
                } catch {
                  setMessage("El navegador impide leer el almacenamiento.");
                }
              }}
            >
              Exportar biblioteca sin modificar
            </button>
            <button
              className="secondary"
              onClick={() => {
                if (
                  window.confirm(
                    "¿Reiniciar la biblioteca local? Se eliminan sus trabajos guardados; exportá antes un respaldo.",
                  )
                ) {
                  try {
                    localStorage.removeItem(storageKey);
                    setLibrary({ documents: [], error: "" });
                  } catch {
                    setMessage(
                      "El navegador no permite acceder al almacenamiento.",
                    );
                  }
                }
              }}
            >
              Reiniciar biblioteca local
            </button>
          </div>
        )}
        {message && (
          <p role="status" className="lab-notice">
            {message}
          </p>
        )}
        <div
          className="segmented"
          role="group"
          aria-label="Herramienta del laboratorio"
        >
          <button aria-pressed={mode === "map"} onClick={() => setMode("map")}>
            Constructor de mapas
          </button>
          <button
            aria-pressed={mode === "bpmn"}
            onClick={() => {
              setMode("bpmn");
              setOpened(true);
            }}
          >
            Editor BPMN
          </button>
        </div>
      </section>
      <div hidden={mode !== "map"}>
        <section className="panel">
          <label>
            Tipo de organización
            <select
              value={map.organization}
              onChange={(e) => setMap({ ...map, organization: e.target.value })}
            >
              <option>Organización propia</option>
              {organizations.map((item) => (
                <option key={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            Necesidades de las partes interesadas
            <textarea
              value={map.needs}
              maxLength={5000}
              onChange={(e) => setMap({ ...map, needs: e.target.value })}
            />
          </label>
          <label>
            Resultados y satisfacción
            <textarea
              value={map.result}
              maxLength={5000}
              onChange={(e) => setMap({ ...map, result: e.target.value })}
            />
          </label>
        </section>
        <MapEditor map={map} onChange={setMap} />
      </div>
      {opened && (
        <div hidden={mode !== "bpmn"}>
          <section className="panel">
            <h2>Construir y revisar un BPMN</h2>
            <p>
              Seleccioná un participante o carril antes de agregar tareas dentro
              de él. Los flujos de secuencia permanecen en el mismo
              participante; los mensajes comunican participantes distintos.
              Doble clic sobre un elemento permite editar su etiqueta, o usá los
              controles accesibles.
            </p>
            <button
              className="secondary"
              onClick={() => setInitialBpmn({ ...bpmnDraft })}
            >
              Restaurar último borrador BPMN válido
            </button>
            <Suspense fallback={<p>Cargando editor BPMN…</p>}>
              <BpmnCanvas
                initial={initialBpmn}
                onReady={bpmnReady}
                onChange={bpmnChanged}
                onBusy={setBpmnBusy}
                active={active && mode === "bpmn"}
              />
            </Suspense>
          </section>
        </div>
      )}
      <CompareRepresentations documents={library.documents} />
    </div>
  );
}
function CompareRepresentations({ documents }: { documents: LabDocument[] }) {
  const [mapId, setMapId] = useState("");
  const [bpmnId, setBpmnId] = useState("");
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);
  const map = documents.find(
    (doc) => doc.id === mapId && doc.kind === "map",
  ) as ProcessMap | undefined;
  const bpmn = documents.find(
    (doc) => doc.id === bpmnId && doc.kind === "bpmn",
  ) as BpmnDocument | undefined;
  const tasks = bpmn
    ? [
        ...new DOMParser()
          .parseFromString(bpmn.xml, "application/xml")
          .getElementsByTagNameNS(
            "http://www.omg.org/spec/BPMN/20100524/MODEL",
            "*",
          ),
      ]
        .filter(
          (task) =>
            /task$/i.test(task.localName) ||
            ["subProcess", "callActivity"].includes(task.localName),
        )
        .map((task) => task.getAttribute("name") || task.id)
    : [];
  const checks = [
    "El mapa sitúa el proceso y sus relaciones",
    "La ficha define objetivo, alcance, entradas y salidas",
    "El BPMN representa las actividades y sus responsables",
    "El resultado del BPMN coincide con la salida de la ficha",
  ];
  return (
    <details className="panel">
      <summary>Comparar representaciones · Mapa, ficha y BPMN</summary>
      <p>
        Guardá ambos trabajos antes de comparar. Esta revisión conceptual es
        guiada: no califica automáticamente el significado del modelo.
      </p>
      <div className="lab-two-columns">
        <label>
          Mapa para comparar
          <select
            value={mapId}
            onChange={(e) => {
              setMapId(e.target.value);
              setChecked(false);
              setAnswers({});
            }}
          >
            <option value="">Elegir mapa</option>
            {documents
              .filter((doc) => doc.kind === "map")
              .map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          BPMN para comparar
          <select
            value={bpmnId}
            onChange={(e) => {
              setBpmnId(e.target.value);
              setChecked(false);
              setAnswers({});
            }}
          >
            <option value="">Elegir BPMN</option>
            {documents
              .filter((doc) => doc.kind === "bpmn")
              .map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      {map && bpmn && (
        <>
          <div className="lab-two-columns">
            <div>
              <h3>Mapa y ficha</h3>
              <p>
                Procesos:{" "}
                {map.nodes.map((n) => n.name).join(" · ") || "Sin procesos"}
              </p>
              <p>Proceso caracterizado: {map.sheet.name || "Sin nombre"}</p>
              <p>Objetivo: {map.sheet.objective || "Por completar"}</p>
              <p>Alcance: {map.sheet.scope || "Por completar"}</p>
              <p>Entradas: {map.sheet.inputs || "Por completar"}</p>
              <p>Salidas: {map.sheet.outputs || "Por completar"}</p>
              <p>Responsable: {map.sheet.owner || "Por completar"}</p>
            </div>
            <div>
              <h3>Detalle BPMN</h3>
              <p>
                Tareas:{" "}
                {tasks.join(" · ") || "No hay tareas simples identificadas"}
              </p>
              <p>
                Contrastá el comienzo y el fin del recorrido con el alcance
                declarado, y los carriles con los responsables de la ficha.
              </p>
            </div>
          </div>
          {checks.map((text) => (
            <label className="lab-radio" key={text}>
              <input
                type="checkbox"
                checked={!!answers[text]}
                onChange={(e) =>
                  setAnswers({ ...answers, [text]: e.target.checked })
                }
              />
              {text}
            </label>
          ))}
          <button className="primary" onClick={() => setChecked(true)}>
            Comprobar comparación
          </button>
          {checked && (
            <div role="status">
              {checks.every((text) => answers[text]) ? (
                <p>
                  Autoevaluación completada. Verificá el recorrido real y
                  justificá las decisiones con el material de la cátedra.
                </p>
              ) : (
                <ul>
                  {checks
                    .filter((text) => !answers[text])
                    .map((text) => (
                      <li key={text}>
                        Revisá: {text.toLocaleLowerCase("es")}.
                      </li>
                    ))}
                </ul>
              )}
              {(!map.sheet.inputs ||
                !map.sheet.outputs ||
                !map.sheet.objective) && (
                <p>
                  La ficha necesita completar entradas, salidas y objetivo para
                  poder contrastarlos con el BPMN.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </details>
  );
}
