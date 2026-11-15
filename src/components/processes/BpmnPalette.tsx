import { useRef } from "react";
import {
  bpmnElements,
  type BpmnElementSpec,
} from "../../data/processes/bpmnElements";
import { BpmnSymbol } from "./BpmnSymbol";
export function BpmnPalette({
  disabled,
  canAddLane,
  onInsert,
  onDrag,
  onParticipant,
  onLane,
  onConnection,
  onPan,
}: {
  disabled: boolean;
  canAddLane: boolean;
  onInsert: (spec: BpmnElementSpec) => void;
  onDrag: (spec: BpmnElementSpec, event: MouseEvent) => void;
  onParticipant: () => void;
  onLane: () => void;
  onConnection: (type: string) => void;
  onPan: (event: MouseEvent) => void;
}) {
  const pointer = useRef("mouse");
  return (
    <details open className="lab-bpmn-palette">
      <summary>Paleta BPMN</summary>
      <p>
        Arrastrá al lienzo con el mouse. Con teclado o pantalla táctil, activá
        un elemento para insertarlo.
      </p>
      <button
        className="secondary"
        disabled={disabled}
        onClick={(e) => onPan(e.nativeEvent)}
      >
        Desplazar lienzo
      </button>
      {(
        [
          "Eventos",
          "Actividades",
          "Compuertas",
          "Conexiones",
          "Participantes",
          "Datos",
        ] as const
      ).map((group) => (
        <section key={group}>
          <h3>{group}</h3>
          <div className="lab-palette-entries">
            {bpmnElements
              .filter((spec) => spec.group === group)
              .map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  className="lab-palette-entry"
                  title={spec.label}
                  disabled={disabled}
                  aria-label={`Insertar: ${spec.label}`}
                  onPointerDown={(e) => {
                    pointer.current = e.pointerType;
                  }}
                  onMouseDown={(e) => {
                    if (e.button === 0 && pointer.current === "mouse") {
                      e.preventDefault();
                      onDrag(spec, e.nativeEvent);
                    }
                  }}
                  onClick={(e) => {
                    if (e.detail === 0 || pointer.current !== "mouse")
                      onInsert(spec);
                  }}
                >
                  <BpmnSymbol type={spec.symbolId} />
                  <span>{spec.label}</span>
                </button>
              ))}
            {group === "Conexiones" &&
              (
                [
                  ["bpmn:SequenceFlow", "Flujo de secuencia", "sequence"],
                  ["bpmn:MessageFlow", "Flujo de mensaje", "message"],
                  ["bpmn:Association", "Asociación", "association"],
                ] as const
              ).map(([type, label, id]) => (
                <button
                  key={type}
                  className="lab-palette-entry"
                  disabled={disabled}
                  onClick={() => onConnection(type)}
                >
                  <BpmnSymbol type={id} />
                  <span>{label}</span>
                </button>
              ))}
            {group === "Participantes" && (
              <>
                <button
                  className="lab-palette-entry"
                  disabled={disabled}
                  onClick={onParticipant}
                >
                  <BpmnSymbol type="pool" />
                  <span>Pool</span>
                </button>
                <button
                  className="lab-palette-entry"
                  disabled={disabled || !canAddLane}
                  onClick={onLane}
                >
                  <BpmnSymbol type="lane" />
                  <span>Lane · carril</span>
                </button>
              </>
            )}
          </div>
        </section>
      ))}
    </details>
  );
}
