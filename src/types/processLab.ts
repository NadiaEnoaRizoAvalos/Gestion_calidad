export const categories = [
  "Estratégicos",
  "Operativos",
  "De apoyo",
  "De gestión",
] as const;
export type ProcessCategory = (typeof categories)[number];
export type ProcessSector = ProcessCategory | "needs" | "result";
export interface ProcessNode {
  id: string;
  name: string;
  category: ProcessCategory;
  purpose: string;
  justification: string;
  example: string;
  inputs: string;
  outputs: string;
  stages: { name: string; activities: string[] }[];
}
export interface ProcessSheet {
  name: string;
  objective: string;
  scope: string;
  owner: string;
  inputs: string;
  activities: string;
  outputs: string;
  resources: string;
  indicators: string;
  records: string;
  related: string;
}
export interface ProcessMap {
  kind: "map";
  id: string;
  name: string;
  organization: string;
  needs: string;
  result: string;
  nodes: ProcessNode[];
  relations: { id: string; from: string; to: string; label: string }[];
  sheet: ProcessSheet;
}
export interface BpmnDocument {
  kind: "bpmn";
  id: string;
  name: string;
  xml: string;
}
export type LabDocument = ProcessMap | BpmnDocument;
export interface FlowNode {
  id: string;
  name: string;
  type: string;
  pool: string;
  incoming: string[];
  outgoing: string[];
}
export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  label: string;
}
export interface ModelIssue {
  severity: "error" | "recommendation";
  text: string;
}
