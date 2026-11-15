import type BaseViewer from "bpmn-js/lib/BaseViewer";
import type ElementFactory from "bpmn-js/lib/features/modeling/ElementFactory";
import type BpmnFactory from "bpmn-js/lib/features/modeling/BpmnFactory";
import type Modeling from "bpmn-js/lib/features/modeling/Modeling";
import type BpmnRules from "bpmn-js/lib/features/rules/BpmnRules";
import type { Element } from "bpmn-js/lib/model/Types";
import type { BpmnElementSpec } from "../../data/processes/bpmnElements";
export const elementLabel = (element: Element) =>
  String(element.businessObject?.text ?? element.businessObject?.name ?? "");
export function createBpmnShape(engine: BaseViewer, spec: BpmnElementSpec) {
  const shape = engine
    .get<ElementFactory>("elementFactory")
    .create("shape", {
      type: spec.type,
      eventDefinitionType: spec.eventDefinitionType,
      isExpanded: false,
    });
  if (spec.eventDefinitionType === "bpmn:TimerEventDefinition") {
    const definition = shape.businessObject.eventDefinitions[0];
    const duration = engine
      .get<BpmnFactory>("bpmnFactory")
      .create("bpmn:FormalExpression", { body: "PT1H" });
    duration.$parent = definition;
    definition.timeDuration = duration;
  }
  return shape;
}
export function connectBpmn(
  engine: BaseViewer,
  source: Element,
  target: Element,
  type: string,
  label = "",
) {
  if (source.id === target.id) throw new Error("Mismo elemento");
  const rules = engine.get<BpmnRules>("bpmnRules");
  const allowed =
    type === "bpmn:SequenceFlow"
      ? rules.canConnectSequenceFlow(source, target)
      : type === "bpmn:MessageFlow"
        ? rules.canConnectMessageFlow(source, target)
        : rules.canConnectAssociation(source, target);
  if (!allowed) throw new Error("Conexión no permitida");
  const modeling = engine.get<Modeling>("modeling");
  const connection = modeling.connect(source, target, { type });
  if (label) modeling.updateLabel(connection, label);
  return connection;
}
