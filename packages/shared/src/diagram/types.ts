import type { ConnectionProps } from '../catalog/connections';
import type { PropertyValue } from '../catalog/properties';

export const DIAGRAM_SCHEMA_VERSION = 1 as const;

export const DIAGRAM_LIMITS = {
  maxNodes: 300,
  maxEdges: 600,
  maxLabelLength: 80,
  maxTextLength: 2000,
  maxPropLength: 200,
} as const;

export type DiagramNodeKind = 'component' | 'note' | 'group';

export interface DiagramNode {
  id: string;
  kind: DiagramNodeKind;
  /** Component type from the catalog. Only for kind === 'component'. */
  componentType?: string;
  label: string;
  position: { x: number; y: number };
  /** Group membership (React Flow parent). Position is relative to the parent when set. */
  parentId?: string;
  width?: number;
  height?: number;
  props: Record<string, PropertyValue>;
  /** Free text for notes. */
  text?: string;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  props: ConnectionProps;
}

export interface DiagramSnapshot {
  version: typeof DIAGRAM_SCHEMA_VERSION;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

export function emptyDiagram(): DiagramSnapshot {
  return { version: DIAGRAM_SCHEMA_VERSION, nodes: [], edges: [] };
}
