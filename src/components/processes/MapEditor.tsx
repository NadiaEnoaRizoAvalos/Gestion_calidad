import { useState } from "react";
import {
  categories,
  type ProcessMap,
  type ProcessNode,
} from "../../types/processLab";
import { categoryHelp } from "../../data/processes/content";
import { deleteProcess } from "../../lib/processes/storage";
import { validateMap } from "../../lib/processes/validation";
import { ProcessMapDiagram } from "./ProcessMapDiagram";
import { ProcessSheetForm } from "./ProcessSheetForm";
export function MapEditor({
  map,
  onChange,
}: {
  map: ProcessMap;
  onChange: (map: ProcessMap) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [label, setLabel] = useState("");
  const [checked, setChecked] = useState(false);
  const node = map.nodes.find((n) => n.id === selected);
  const update = (id: string, patch: Partial<ProcessNode>) =>
    onChange({
      ...map,
      nodes: map.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    });
  const issues = validateMap(map);
  return (
    <>
      <div className="lab-editor-grid">
        <details open className="panel lab-tools">
          <summary>Herramientas del mapa</summary>
          <p>Agregá procesos y justificá su categoría.</p>
          {categories.map((category) => (
            <div key={category}>
              <button
                className="secondary"
                disabled={map.nodes.length >= 80}
                onClick={() => {
                  const id = crypto.randomUUID();
                  onChange({
                    ...map,
                    nodes: [
                      ...map.nodes,
                      {
                        id,
                        name: "Nuevo proceso",
                        category,
                        purpose: "",
                        justification: "",
                        example: "",
                        inputs: "",
                        outputs: "",
                        stages: [],
                      },
                    ],
                  });
                  setSelected(id);
                }}
              >
                Agregar: {category}
              </button>
              <small>{categoryHelp[category]}</small>
            </div>
          ))}
        </details>
        <section
          className="panel lab-canvas-panel"
          aria-label="Constructor de mapa"
        >
          <ProcessMapDiagram
            map={map}
            selected={selected ?? undefined}
            onSelect={setSelected}
            onMove={(id, category) => update(id, { category })}
            exportable
          />
        </section>
        <details open className="panel lab-properties">
          <summary>Propiedades del proceso</summary>
          {node ? (
            <>
              <label>
                Nombre del proceso
                <input
                  maxLength={200}
                  value={node.name}
                  onChange={(e) => update(node.id, { name: e.target.value })}
                />
              </label>
              <label>
                Categoría
                <select
                  value={node.category}
                  onChange={(e) =>
                    update(node.id, {
                      category: e.target.value as ProcessNode["category"],
                    })
                  }
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <p>{categoryHelp[node.category]}</p>
              {(
                [
                  ["purpose", "Función"],
                  ["justification", "Justificación"],
                  ["example", "Ejemplo"],
                  ["inputs", "Entradas del proceso"],
                  ["outputs", "Salidas del proceso"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <textarea
                    maxLength={5000}
                    rows={3}
                    value={node[key]}
                    onChange={(e) => update(node.id, { [key]: e.target.value })}
                  />
                </label>
              ))}
              <button
                className="secondary"
                onClick={() => {
                  onChange(deleteProcess(map, node.id));
                  setSelected(null);
                }}
              >
                Eliminar proceso
              </button>
            </>
          ) : (
            <p>
              Seleccioná un proceso del mapa para editarlo. Las categorías se
              pueden cambiar con teclado mediante el selector.
            </p>
          )}
        </details>
      </div>
      <details className="panel">
        <summary>Editar relaciones entre procesos</summary>
        <form
          className="lab-form-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (from && to && from !== to && map.relations.length < 200) {
              onChange({
                ...map,
                relations: [
                  ...map.relations,
                  { id: crypto.randomUUID(), from, to, label },
                ],
              });
              setLabel("");
            }
          }}
        >
          <label>
            Origen
            <select
              required
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            >
              <option value="">Elegir</option>
              {map.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Destino
            <select required value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">Elegir</option>
              {map.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Qué intercambian
            <input
              value={label}
              maxLength={500}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <button
            className="primary"
            disabled={
              !from ||
              !to ||
              from === to ||
              !map.nodes.some((n) => n.id === from) ||
              !map.nodes.some((n) => n.id === to)
            }
          >
            Agregar relación
          </button>
        </form>
        <ul>
          {map.relations.map((edge) => (
            <li key={edge.id}>
              {map.nodes.find((n) => n.id === edge.from)?.name} →{" "}
              {map.nodes.find((n) => n.id === edge.to)?.name}
              <label>
                Relación
                <input
                  aria-label={`Editar relación ${edge.id}`}
                  value={edge.label}
                  maxLength={500}
                  onChange={(e) =>
                    onChange({
                      ...map,
                      relations: map.relations.map((r) =>
                        r.id === edge.id ? { ...r, label: e.target.value } : r,
                      ),
                    })
                  }
                />
              </label>
              <button
                className="text-button"
                onClick={() =>
                  onChange({
                    ...map,
                    relations: map.relations.filter((r) => r.id !== edge.id),
                  })
                }
              >
                Eliminar relación
              </button>
            </li>
          ))}
        </ul>
      </details>
      <div className="panel">
        <button className="primary" onClick={() => setChecked(true)}>
          Comprobar mapa
        </button>
        {checked && (
          <div role="status">
            {issues.length ? (
              <ul>
                {issues.map((issue, i) => (
                  <li key={i}>
                    <strong>
                      {issue.severity === "error" ? "Error" : "Recomendación"}:
                    </strong>{" "}
                    {issue.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No se detectaron problemas en las comprobaciones básicas. La
                adecuación del mapa depende del contexto y de la justificación.
              </p>
            )}
          </div>
        )}
      </div>
      <ProcessSheetForm
        sheet={map.sheet}
        onChange={(sheet) => onChange({ ...map, sheet })}
      />
    </>
  );
}
