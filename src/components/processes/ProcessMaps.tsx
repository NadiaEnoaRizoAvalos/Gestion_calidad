import { useState } from "react";
import { exampleMap, organizations } from "../../data/processes/examples";
import { categoryHelp } from "../../data/processes/content";
import type { ProcessMap, ProcessSector } from "../../types/processLab";
import { ProcessMapDiagram } from "./ProcessMapDiagram";
export function ProcessMaps({ onUse }: { onUse: (map: ProcessMap) => void }) {
  const [organization, setOrganization] = useState(organizations[0].id);
  const [map, setMap] = useState(() => exampleMap(organizations[0].id));
  const [selected, setSelected] = useState(
    map.nodes.find((n) => n.category === "Operativos")!.id,
  );
  const [level, setLevel] = useState(1);
  const [stage, setStage] = useState(0);
  const [sector, setSector] = useState<ProcessSector | null>(null);
  const node = map.nodes.find((n) => n.id === selected) ?? map.nodes[0];
  return (
    <div className="lab-stack">
      <section className="panel">
        <h2>Del conjunto al detalle</h2>
        <p>
          El mapa representa la organización completa y las relaciones entre sus
          procesos. No dibuja necesariamente el orden exacto de cada actividad.
          Referencias: diap. 21–32.
        </p>
        <label>
          Organización del caso
          <select
            value={organization}
            onChange={(e) => {
              const next = exampleMap(e.target.value);
              setOrganization(e.target.value);
              setMap(next);
              setSelected(
                next.nodes.find((n) => n.category === "Operativos")!.id,
              );
              setStage(0);
              setSector(null);
              setLevel(1);
            }}
          >
            {organizations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <p className="lab-source">
          {organizations.find((o) => o.id === organization)?.source}
        </p>
        <p>
          <strong>Necesidad:</strong> {map.needs}
        </p>
        <p>
          <strong>Resultado:</strong> {map.result}
        </p>
        <div className="segmented" role="group" aria-label="Nivel del mapa">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              aria-pressed={level === n}
              onClick={() => {
                setLevel(n);
                setSector(null);
              }}
            >
              Nivel {n}
            </button>
          ))}
        </div>
        <p>
          {level === 1
            ? "Primer nivel: procesos generales y sus interrelaciones."
            : level === 2
              ? "Segundo nivel: etapas o subprocesos del proceso seleccionado; cada uno mantiene el objetivo del proceso mayor."
              : "Tercer nivel: actividades concretas de la etapa seleccionada. La descomposición de este caso es didáctica."}
        </p>
        <ProcessMapDiagram
          map={map}
          selected={selected}
          onSelect={(id) => {
            setSector(null);
            setSelected(id);
            setStage(0);
            setLevel(2);
          }}
          onSectorSelect={setSector}
          exportable
        />
      </section>
      {sector && (
        <section className="panel lab-sector-detail" aria-live="polite">
          <h2>
            {sector === "needs"
              ? "Partes interesadas y necesidades"
              : sector === "result"
                ? "Resultados y satisfacción"
                : sector}
          </h2>
          {sector === "needs" ? (
            <>
              <p>
                En {map.organization}, el recorrido parte de esta necesidad:{" "}
                {map.needs}
              </p>
              <p>
                Identificar quién necesita el resultado y con qué requisitos
                permite orientar los procesos operativos y las decisiones
                estratégicas. Los procesos de apoyo aportan recursos y los de
                gestión verifican el desempeño.
              </p>
            </>
          ) : sector === "result" ? (
            <>
              <p>El resultado previsto de este caso es: {map.result}</p>
              <p>
                Se contrasta lo entregado con los requisitos de las partes
                interesadas. Los reclamos, la conformidad y los indicadores
                alimentan el seguimiento y las decisiones de mejora; no se
                presume satisfacción solo porque terminó una tarea.
              </p>
            </>
          ) : (
            <>
              <p>{categoryHelp[sector]}</p>
              <p>
                <strong>En este caso:</strong>{" "}
                {map.nodes
                  .filter((n) => n.category === sector)
                  .map((n) => n.name)
                  .join(" · ")}
              </p>
              <p>
                La clasificación corresponde a la función y alcance declarados
                para {map.organization.toLocaleLowerCase("es")}. Las relaciones
                muestran qué intercambia este grupo con los demás.
              </p>
              <ul>
                {map.relations
                  .filter((r) =>
                    map.nodes.some(
                      (n) =>
                        n.category === sector &&
                        (n.id === r.from || n.id === r.to),
                    ),
                  )
                  .map((r) => (
                    <li key={r.id}>
                      {map.nodes.find((n) => n.id === r.from)?.name} →{" "}
                      {map.nodes.find((n) => n.id === r.to)?.name}: {r.label}
                    </li>
                  ))}
              </ul>
            </>
          )}
          <button className="secondary" onClick={() => setSector(null)}>
            Volver al proceso seleccionado
          </button>
        </section>
      )}
      <section
        hidden={!!sector}
        className="panel lab-process-detail"
        aria-live="polite"
      >
        <h2>{node.name}</h2>
        <span className="tag">{node.category}</span>
        <p>{node.purpose}</p>
        <p>
          <strong>Por qué se clasifica así:</strong> {node.justification}
        </p>
        <dl>
          <div>
            <dt>Entradas</dt>
            <dd>{node.inputs}</dd>
          </div>
          <div>
            <dt>Salidas</dt>
            <dd>{node.outputs}</dd>
          </div>
        </dl>
        <p>{node.example}</p>
        {level >= 2 && (
          <>
            <h3>Etapas de {node.name}</h3>
            <div className="actions">
              {node.stages.map((item, i) => (
                <button
                  key={item.name}
                  className="secondary"
                  aria-pressed={stage === i}
                  onClick={() => {
                    setStage(i);
                    setLevel(3);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </>
        )}
        {level === 3 && (
          <>
            <h3>Actividades · {node.stages[stage]?.name}</h3>
            <ol>
              {node.stages[stage]?.activities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </>
        )}
        <button
          className="primary"
          onClick={() => onUse({ ...map, id: crypto.randomUUID() })}
        >
          Usar este mapa en el laboratorio
        </button>
      </section>
    </div>
  );
}
