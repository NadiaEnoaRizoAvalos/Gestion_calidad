import type { Element } from "bpmn-js/lib/model/Types";
import type { FlowNode, FlowEdge } from "../../types/processLab";
export function bpmnGraph(elements: Element[]): {
  nodes: FlowNode[];
  edges: FlowEdge[];
} {
  const pool = (element: Element): string => {
    let cursor: Element | undefined = element;
    while (cursor) {
      if (cursor.type === "bpmn:Participant") return cursor.id;
      cursor = cursor.parent as Element | undefined;
    }
    return "process";
  };
  const nodes = elements
    .filter((e) => !e.labelTarget && !e.waypoints)
    .map((e) => ({
      id: e.id,
      name: String(e.businessObject?.text ?? e.businessObject?.name ?? e.id),
      type: e.type,
      pool: pool(e),
      incoming: (e.incoming ?? []).map((c) => c.id),
      outgoing: (e.outgoing ?? []).map((c) => c.id),
    }));
  const edges = elements
    .filter((e) => e.waypoints && !e.labelTarget)
    .map((e) => ({
      id: e.id,
      from: e.source?.id ?? "",
      to: e.target?.id ?? "",
      type: e.type,
      label: String(e.businessObject?.name ?? ""),
    }));
  return { nodes, edges };
}
