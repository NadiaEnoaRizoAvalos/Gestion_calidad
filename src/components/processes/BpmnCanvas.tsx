import { useEffect, useRef, useState } from "react";
import Modeler from "bpmn-js/lib/Modeler";
import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import type BaseViewer from "bpmn-js/lib/BaseViewer";
import type Canvas from "diagram-js/lib/core/Canvas";
import type ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import type Modeling from "bpmn-js/lib/features/modeling/Modeling";
import type ElementFactory from "bpmn-js/lib/features/modeling/ElementFactory";
import type BpmnRules from "bpmn-js/lib/features/rules/BpmnRules";
import type CommandStack from "diagram-js/lib/command/CommandStack";
import type {
  Element,
  Shape,
  Parent,
  Connection,
} from "bpmn-js/lib/model/Types";
import type { BpmnDocument, ModelIssue } from "../../types/processLab";
import { symbols } from "../../data/processes/symbols";
import { bpmnGraph } from "../../lib/processes/bpmnGraph";
import { validateBpmn } from "../../lib/processes/validation";
import { downloadFile } from "../../lib/processes/storage";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
const nodeTypes = [
  ["bpmn:StartEvent", "Inicio"],
  ["bpmn:Task", "Tarea"],
  ["bpmn:EndEvent", "Fin"],
  ["bpmn:ExclusiveGateway", "Compuerta XOR"],
  ["bpmn:ParallelGateway", "Compuerta AND"],
  ["bpmn:IntermediateThrowEvent", "Evento intermedio"],
  ["bpmn:SubProcess", "Subproceso"],
];
export default function BpmnCanvas({
  initial,
  onReady,
  onChange,
  onBusy,
  active = true,
  readOnly = false,
  highlight,
}: {
  initial: BpmnDocument;
  onReady?: (doc: BpmnDocument) => void;
  onChange?: (xml: string) => void;
  onBusy?: (busy: boolean) => void;
  active?: boolean;
  readOnly?: boolean;
  highlight?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<BaseViewer | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [selected, setSelected] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState("bpmn:Task");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [edgeType, setEdgeType] = useState("bpmn:SequenceFlow");
  const [connectionLabel, setConnectionLabel] = useState("");
  const [message, setMessage] = useState("");
  const [issues, setIssues] = useState<ModelIssue[] | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const engine = readOnly
      ? new NavigatedViewer({ container: container.current! })
      : new Modeler({ container: container.current! });
    instance.current = engine;
    let disposed = false;
    let imported = false;
    let serial = 0;
    const refresh = () => {
      if (!disposed)
        setElements(
          (
            engine.get<ElementRegistry>("elementRegistry").getAll() as Element[]
          ).filter(
            (e) =>
              !e.labelTarget &&
              e.type !== "bpmn:Process" &&
              e.type !== "bpmn:Collaboration",
          ),
        );
    };
    const snapshot = async () => {
      const request = ++serial;
      onBusy?.(true);
      try {
        const result = await engine.saveXML({ format: true });
        if (!disposed && request === serial && result.xml)
          onChange?.(result.xml);
      } catch {
        if (!disposed)
          setMessage(
            "No se pudo serializar el diagrama. Conservá el respaldo anterior.",
          );
      } finally {
        if (!disposed && request === serial) onBusy?.(false);
      }
    };
    engine.on("element.click", (event: { element: Element }) => {
      if (disposed) return;
      const clicked = (event.element.labelTarget ?? event.element) as Element;
      setSelected(clicked.id);
      setLabel(String(clicked.businessObject?.name ?? ""));
    });
    engine.on("commandStack.changed", () => {
      if (imported && !disposed) {
        refresh();
        void snapshot();
      }
    });
    const open = async () => {
      onBusy?.(true);
      try {
        if (
          initial.xml.length > 2_000_000 ||
          /<!DOCTYPE|<!ENTITY/i.test(initial.xml)
        )
          throw new Error();
        const result = await engine.importXML(initial.xml);
        if (disposed) return;
        if (result.warnings.length) throw new Error();
        imported = true;
        setMessage("");
        setSelected("");
        setLabel("");
        setIssues(null);
        refresh();
        setReady(true);
        engine
          .get<Canvas>("canvas")
          .zoom(window.innerWidth < 650 ? 1 : "fit-viewport");
        const saved = await engine.saveXML({ format: true });
        if (!disposed && saved.xml) onReady?.({ ...initial, xml: saved.xml });
      } catch {
        if (!disposed) {
          setReady(false);
          setMessage(
            "No se pudo abrir este XML BPMN completo. El borrador anterior y los trabajos guardados se conservan; restaurá el borrador desde la biblioteca.",
          );
        }
      } finally {
        if (!disposed) onBusy?.(false);
      }
    };
    void open();
    return () => {
      disposed = true;
      instance.current = null;
      engine.destroy();
    };
  }, [initial, readOnly, onReady, onChange, onBusy]);
  useEffect(() => {
    if (active && instance.current && ready) {
      instance.current.get<Canvas>("canvas").resized();
      instance.current
        .get<Canvas>("canvas")
        .zoom(window.innerWidth < 650 ? 1 : "fit-viewport");
    }
  }, [active, ready]);
  useEffect(() => {
    if (!ready || !instance.current) return;
    const canvas = instance.current.get<Canvas>("canvas");
    for (const element of elements)
      canvas.removeMarker(element.id, "lab-current");
    if (highlight && elements.some((e) => e.id === highlight)) {
      canvas.addMarker(highlight, "lab-current");
      canvas.scrollToElement(highlight);
    }
  }, [highlight, elements, ready]);
  const registry = () =>
    instance.current!.get<ElementRegistry>("elementRegistry");
  const modeling = () => instance.current!.get<Modeling>("modeling");
  const current = elements.find((e) => e.id === selected);
  const symbolForType: Record<string, string> = {
    "bpmn:StartEvent": "start",
    "bpmn:EndEvent": "end",
    "bpmn:IntermediateThrowEvent": "intermediate",
    "bpmn:Task": "task",
    "bpmn:SubProcess": "subprocess",
    "bpmn:ExclusiveGateway": "xor",
    "bpmn:ParallelGateway": "and",
    "bpmn:InclusiveGateway": "or",
    "bpmn:Participant": "pool",
    "bpmn:Lane": "lane",
    "bpmn:SequenceFlow": "sequence",
    "bpmn:MessageFlow": "message",
    "bpmn:Association": "association",
  };
  const selectedHelp = current
    ? symbols.find((item) => item.id === symbolForType[current.type])
    : undefined;
  const run = (action: () => void) => {
    try {
      action();
      setMessage("");
    } catch {
      setMessage(
        "Operación no permitida. Revisá el tipo de elemento, su participante y las reglas de conexión; usá Deshacer si necesitás volver al paso anterior.",
      );
    }
  };
  const chooseParent = (): Parent => {
    const root = instance
      .current!.get<Canvas>("canvas")
      .getRootElement() as Parent;
    if (
      current &&
      ["bpmn:Participant", "bpmn:Lane", "bpmn:SubProcess"].includes(
        current.type,
      )
    )
      return current as Shape;
    if (current?.parent && current.parent.type !== "bpmn:Collaboration")
      return current.parent as Parent;
    return (elements.find((e) => e.type === "bpmn:Lane") ??
      elements.find((e) => e.type === "bpmn:Participant") ??
      root) as Parent;
  };
  const position = (parent: Parent) => {
    const shapes = elements.filter(
      (e) => e.parent?.id === parent.id && !e.waypoints,
    ) as Shape[];
    for (let row = 0; row < 25; row++)
      for (let col = 0; col < 6; col++) {
        const x =
          (parent.type === "bpmn:Process" ? 50 : (parent as Shape).x + 50) +
          col * 165;
        const y =
          (parent.type === "bpmn:Process" ? 80 : (parent as Shape).y + 45) +
          row * 115;
        if (
          !shapes.some(
            (e) =>
              e.x < x + 140 &&
              e.x + e.width > x - 20 &&
              e.y < y + 95 &&
              e.y + e.height > y - 20,
          )
        )
          return { x: x + 60, y: y + 40 };
      }
    throw new Error();
  };
  async function exportDiagram(format: "svg" | "xml") {
    try {
      if (!instance.current || !ready) return;
      const result =
        format === "svg"
          ? await instance.current.saveSVG()
          : await instance.current.saveXML({ format: true });
      const content = "svg" in result ? result.svg : result.xml;
      if (content)
        downloadFile(
          format === "svg" ? "diagrama-bpmn.svg" : "diagrama.bpmn",
          content,
          format === "svg" ? "image/svg+xml" : "application/xml",
        );
    } catch {
      setMessage("No se pudo exportar. El trabajo guardado no se modificó.");
    }
  }
  const move = (dx: number, dy: number) =>
    run(() => {
      if (!current || current.waypoints || current.type === "bpmn:Lane")
        throw new Error();
      const shape = current as Shape;
      const parent = shape.parent as Parent;
      const minX =
          parent.type === "bpmn:Process" ? 0 : (parent as Shape).x + 35,
        minY = parent.type === "bpmn:Process" ? 0 : (parent as Shape).y + 10;
      const maxX =
          parent.type === "bpmn:Process"
            ? 10000
            : (parent as Shape).x + (parent as Shape).width - shape.width - 10,
        maxY =
          parent.type === "bpmn:Process"
            ? 10000
            : (parent as Shape).y +
              (parent as Shape).height -
              shape.height -
              10;
      modeling().moveShape(shape, {
        x: Math.min(maxX, Math.max(minX, shape.x + dx)) - shape.x,
        y: Math.min(maxY, Math.max(minY, shape.y + dy)) - shape.y,
      });
    });
  return (
    <section
      className="lab-bpmn-widget"
      aria-label={readOnly ? "Diagrama BPMN de ejemplo" : "Editor BPMN"}
    >
      <div className="actions">
        <button
          className="secondary"
          disabled={!ready}
          onClick={() =>
            instance.current?.get<Canvas>("canvas").zoom("fit-viewport")
          }
        >
          Ajustar vista
        </button>
        <button
          className="secondary"
          disabled={!ready}
          onClick={() => {
            const canvas = instance.current!.get<Canvas>("canvas");
            canvas.zoom(Math.max(0.3, canvas.zoom() - 0.2));
          }}
          aria-label="Reducir zoom BPMN"
        >
          −
        </button>
        <button
          className="secondary"
          disabled={!ready}
          onClick={() => {
            const canvas = instance.current!.get<Canvas>("canvas");
            canvas.zoom(Math.min(2, canvas.zoom() + 0.2));
          }}
          aria-label="Aumentar zoom BPMN"
        >
          +
        </button>
        <button
          className="secondary"
          disabled={!ready}
          onClick={() => void exportDiagram("svg")}
        >
          Exportar SVG BPMN
        </button>
        {!readOnly && (
          <>
            <button
              className="secondary"
              disabled={!ready}
              onClick={() => void exportDiagram("xml")}
            >
              Exportar BPMN 2.0 XML
            </button>
            <button
              className="secondary"
              disabled={!ready}
              onClick={() =>
                run(() =>
                  instance.current!.get<CommandStack>("commandStack").undo(),
                )
              }
            >
              Deshacer
            </button>
            <button
              className="secondary"
              disabled={!ready}
              onClick={() =>
                run(() =>
                  instance.current!.get<CommandStack>("commandStack").redo(),
                )
              }
            >
              Rehacer
            </button>
          </>
        )}
      </div>
      <p className="muted">
        {readOnly
          ? "Seleccioná los elementos o usá el recorrido guiado. Podés acercar y desplazar el diagrama."
          : "Usá la paleta para arrastrar símbolos o los controles accesibles de abajo. El área se desplaza y tiene zoom; no es un motor de ejecución."}
      </p>
      <div className="lab-bpmn-canvas" ref={container} />
      {message && (
        <p role="alert" className="lab-notice">
          {message}
        </p>
      )}
      {readOnly && current && (
        <aside className="example-box" aria-live="polite">
          <h3>
            {String(
              current.businessObject?.name ||
                selectedHelp?.name ||
                "Elemento seleccionado",
            )}
          </h3>
          <p>
            {selectedHelp?.use ??
              "Elemento del modelo BPMN. Consultá su función en la referencia de símbolos."}
          </p>
          {selectedHelp && (
            <p>
              <strong>Para recordar:</strong> {selectedHelp.error}
            </p>
          )}
        </aside>
      )}
      {!readOnly && (
        <details open className="panel lab-bpmn-tools">
          <summary>Herramientas y propiedades accesibles</summary>
          <div className="lab-two-columns">
            <section>
              <h3>Agregar elementos</h3>
              <label>
                Símbolo
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {nodeTypes.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="primary"
                disabled={!ready || elements.length > 200}
                onClick={() =>
                  run(() => {
                    const parent = chooseParent();
                    const shape = instance
                      .current!.get<ElementFactory>("elementFactory")
                      .create("shape", { type, isExpanded: false });
                    const added = modeling().createShape(
                      shape,
                      position(parent),
                      parent,
                    );
                    modeling().updateLabel(
                      added,
                      nodeTypes.find(([id]) => id === type)?.[1] ?? "Elemento",
                    );
                    setSelected(added.id);
                    setLabel(String(added.businessObject.name ?? ""));
                  })
                }
              >
                Agregar símbolo
              </button>
              <button
                className="secondary"
                disabled={!ready}
                onClick={() =>
                  run(() => {
                    const root = instance
                      .current!.get<Canvas>("canvas")
                      .getRootElement() as Parent;
                    const wrapping = root.type === "bpmn:Process";
                    const shapes = elements.filter(
                      (e) => !e.waypoints,
                    ) as Shape[];
                    const left = wrapping
                      ? Math.min(100, ...shapes.map((e) => e.x)) - 60
                      : 200;
                    const top = wrapping
                      ? Math.min(60, ...shapes.map((e) => e.y)) - 30
                      : 0;
                    const width = wrapping
                      ? Math.max(700, ...shapes.map((e) => e.x + e.width)) +
                        50 -
                        left
                      : 600;
                    const height = wrapping
                      ? Math.max(360, ...shapes.map((e) => e.y + e.height)) +
                        30 -
                        top
                      : 250;
                    const shape = instance
                      .current!.get<ElementFactory>("elementFactory")
                      .create("shape", {
                        type: "bpmn:Participant",
                        isExpanded: true,
                        width,
                        height,
                      });
                    const pools = elements.filter(
                      (e) => e.type === "bpmn:Participant",
                    ) as Shape[];
                    const added = modeling().createShape(
                      shape,
                      {
                        x: wrapping ? left + width / 2 : 500,
                        y: wrapping
                          ? top + height / 2
                          : Math.max(0, ...pools.map((p) => p.y + p.height)) +
                            180,
                      },
                      root,
                    );
                    const name = wrapping
                      ? "Mi organización"
                      : `Participante ${pools.length + 1}`;
                    modeling().updateLabel(added, name);
                    setSelected(added.id);
                    setLabel(name);
                  })
                }
              >
                Agregar participante
              </button>
              <button
                className="secondary"
                disabled={
                  !ready ||
                  !current ||
                  !["bpmn:Participant", "bpmn:Lane"].includes(current.type)
                }
                onClick={() =>
                  run(() => {
                    const lane = modeling().addLane(current as Shape, "bottom");
                    const name = `Carril ${elements.filter((e) => e.type === "bpmn:Lane").length + 1}`;
                    modeling().updateLabel(lane, name);
                    setSelected(lane.id);
                    setLabel(name);
                  })
                }
              >
                Agregar carril al seleccionado
              </button>
            </section>
            <section>
              <h3>Elemento seleccionado</h3>
              <label>
                Seleccionar elemento
                <select
                  value={selected}
                  onChange={(e) => {
                    setSelected(e.target.value);
                    setLabel(
                      String(
                        elements.find((n) => n.id === e.target.value)
                          ?.businessObject?.name ?? "",
                      ),
                    );
                  }}
                >
                  <option value="">Elegir</option>
                  {elements.map((e) => (
                    <option key={e.id} value={e.id}>
                      {String(e.businessObject?.name || e.id)} ·{" "}
                      {e.type.replace("bpmn:", "")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Etiqueta del elemento
                <input
                  maxLength={200}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </label>
              <button
                className="secondary"
                disabled={!current}
                onClick={() =>
                  run(() => modeling().updateLabel(current!, label))
                }
              >
                Aplicar etiqueta
              </button>
              <div className="actions">
                {[
                  ["Izquierda", -40, 0],
                  ["Derecha", 40, 0],
                  ["Arriba", 0, -40],
                  ["Abajo", 0, 40],
                ].map(([text, x, y]) => (
                  <button
                    className="secondary"
                    key={String(text)}
                    disabled={!current || !!current.waypoints}
                    onClick={() => move(Number(x), Number(y))}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <label>
                Ubicar en carril
                <select
                  value=""
                  disabled={
                    !current ||
                    !!current.waypoints ||
                    ["bpmn:Lane", "bpmn:Participant"].includes(current.type)
                  }
                  onChange={(e) =>
                    run(() => {
                      const parent = registry().get(e.target.value) as Shape;
                      if (!current || !parent) return;
                      const pos = position(parent);
                      const shape = current as Shape;
                      modeling().moveShape(
                        shape,
                        {
                          x: pos.x - shape.x - shape.width / 2,
                          y: pos.y - shape.y - shape.height / 2,
                        },
                        parent,
                      );
                    })
                  }
                >
                  <option value="">Elegir destino</option>
                  {elements
                    .filter((e) => e.type === "bpmn:Lane")
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {String(e.businessObject.name || e.id)}
                      </option>
                    ))}
                </select>
              </label>
              <button
                className="secondary"
                disabled={!current}
                onClick={() =>
                  run(() => {
                    if (current!.waypoints)
                      modeling().removeConnection(current! as Connection);
                    else modeling().removeShape(current! as Shape);
                    setSelected("");
                    setLabel("");
                  })
                }
              >
                Eliminar elemento o conexión
              </button>
            </section>
          </div>
          <form
            className="lab-form-row"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => {
                const source = registry().get(from) as Element,
                  target = registry().get(to) as Element;
                if (!source || !target || from === to) throw new Error();
                const rules = instance.current!.get<BpmnRules>("bpmnRules");
                const allowed =
                  edgeType === "bpmn:SequenceFlow"
                    ? rules.canConnectSequenceFlow(source, target)
                    : edgeType === "bpmn:MessageFlow"
                      ? rules.canConnectMessageFlow(source, target)
                      : rules.canConnectAssociation(source, target);
                if (!allowed) throw new Error();
                const connection = modeling().connect(source, target, {
                  type: edgeType,
                });
                if (connectionLabel)
                  modeling().updateLabel(connection, connectionLabel);
              });
            }}
          >
            <label>
              Desde
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                <option value="">Elegir</option>
                {elements
                  .filter((e) => !e.waypoints && e.type !== "bpmn:Lane")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {String(e.businessObject.name || e.id)}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Hasta
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="">Elegir</option>
                {elements
                  .filter((e) => !e.waypoints && e.type !== "bpmn:Lane")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {String(e.businessObject.name || e.id)}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Conexión
              <select
                value={edgeType}
                onChange={(e) => setEdgeType(e.target.value)}
              >
                <option value="bpmn:SequenceFlow">Flujo de secuencia</option>
                <option value="bpmn:MessageFlow">Flujo de mensaje</option>
                <option value="bpmn:Association">Asociación</option>
              </select>
            </label>
            <label>
              Etiqueta de la conexión
              <input
                value={connectionLabel}
                maxLength={200}
                onChange={(e) => setConnectionLabel(e.target.value)}
              />
            </label>
            <button className="primary" disabled={!ready || !from || !to}>
              Conectar elementos
            </button>
          </form>
          <button
            className="primary"
            disabled={!ready}
            onClick={() => {
              const graph = bpmnGraph(registry().getAll() as Element[]);
              setIssues(validateBpmn(graph.nodes, graph.edges));
            }}
          >
            Comprobar BPMN
          </button>
          {issues && (
            <div role="status">
              <p>
                Comprobación básica de elementos visibles. No certifica
                conformidad completa con BPMN 2.0 ni detecta todos los
                interbloqueos.
              </p>
              {issues.length ? (
                <ul>
                  {issues.map((issue, i) => (
                    <li key={i}>
                      <strong>
                        {issue.severity === "error" ? "Error" : "Recomendación"}
                        :
                      </strong>{" "}
                      {issue.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se detectaron errores en estas comprobaciones.</p>
              )}
            </div>
          )}
        </details>
      )}
    </section>
  );
}
