import { useCallback, useState } from "react";
import { Check } from "lucide-react";
import { PageHeading } from "../components/PageHeading";
import { useStudy } from "../hooks/useStudy";
import { LearnProcesses } from "../components/processes/LearnProcesses";
import { ProcessMaps } from "../components/processes/ProcessMaps";
import { BpmnLearning } from "../components/processes/BpmnLearning";
import { LabWorkspace } from "../components/processes/LabWorkspace";
import { ProcessExercises } from "../components/processes/ProcessExercises";
import type { LabDocument } from "../types/processLab";
import "../styles/process-lab.css";
const tabs = ["Aprender", "Mapas de procesos", "BPMN", "Laboratorio práctico"];
export function Processes() {
  const [tab, setTab] = useState(0);
  const [visited, setVisited] = useState([0]);
  const [template, setTemplate] = useState<LabDocument | null>(null);
  const [dirty, setDirty] = useState(false);
  const { state, complete } = useStudy();
  const selectTab = (index: number) => {
    setTab(index);
    setVisited((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };
  const useTemplate = useCallback(
    (doc: LabDocument) => {
      if (
        dirty &&
        !window.confirm(
          "Hay un borrador sin guardar en el laboratorio. ¿Reemplazarlo por esta plantilla?",
        )
      )
        return;
      setTemplate(doc);
      setTab(3);
      setVisited((prev) => (prev.includes(3) ? prev : [...prev, 3]));
    },
    [dirty],
  );
  return (
    <section className="content-page process-lab">
      <PageHeading
        title="Laboratorio de Procesos y BPMN"
        description="Comprendé los procesos, explorá sus relaciones y construí tus propios modelos."
        image="processes"
      />
      <nav className="lab-tabs" aria-label="Apartados de Procesos y BPMN">
        {tabs.map((name, index) => (
          <button
            key={name}
            className="secondary"
            aria-pressed={tab === index}
            aria-controls={`process-panel-${index}`}
            onClick={() => selectTab(index)}
          >
            {name}
          </button>
        ))}
      </nav>
      <div id="process-panel-0" hidden={tab !== 0}>
        <LearnProcesses />
      </div>
      {visited.includes(1) && (
        <div id="process-panel-1" hidden={tab !== 1}>
          <ProcessMaps onUse={useTemplate} />
        </div>
      )}
      {visited.includes(2) && (
        <div id="process-panel-2" hidden={tab !== 2}>
          <BpmnLearning active={tab === 2} onUse={useTemplate} />
        </div>
      )}
      {visited.includes(3) && (
        <div id="process-panel-3" hidden={tab !== 3}>
          <ProcessExercises onUse={useTemplate} />
          <LabWorkspace
            key={template?.id ?? "workspace"}
            initial={template}
            active={tab === 3}
            onDirty={setDirty}
          />
        </div>
      )}
      <section className="panel lab-completion">
        <p>
          La exploración sigue formando parte de tu Ruta de estudio. Tus
          diagramas se guardan por separado en la biblioteca del laboratorio.
        </p>
        <button
          className="primary"
          onClick={() => complete("mapa")}
          disabled={!!state.completed.mapa}
        >
          <Check size={16} />
          {state.completed.mapa
            ? "Exploración completada"
            : "Marcar exploración como completada"}
        </button>
      </section>
    </section>
  );
}
