import { z } from 'zod';
import { CONNECTION_TYPES, PROTOCOLS } from '../catalog/connections';
import { DIAGRAM_LIMITS, DIAGRAM_SCHEMA_VERSION, type DiagramSnapshot } from './types';

const id = z.string().min(1).max(64);
const finite = z.number().finite();

const propValue = z.union([z.string().max(DIAGRAM_LIMITS.maxPropLength), z.number().finite(), z.boolean()]);

export const diagramNodeSchema = z.object({
  id,
  kind: z.enum(['component', 'note', 'group']),
  componentType: z.string().max(40).optional(),
  label: z.string().max(DIAGRAM_LIMITS.maxLabelLength),
  position: z.object({ x: finite, y: finite }),
  parentId: id.optional(),
  width: finite.positive().max(10000).optional(),
  height: finite.positive().max(10000).optional(),
  props: z.record(z.string().max(40), propValue).default({}),
  text: z.string().max(DIAGRAM_LIMITS.maxTextLength).optional(),
});

const connectionTypeValues = CONNECTION_TYPES.map((c) => c.value) as [string, ...string[]];
const protocolValues = PROTOCOLS.map((p) => p.value) as [string, ...string[]];

export const connectionPropsSchema = z.object({
  connectionType: z.enum(connectionTypeValues),
  protocol: z.enum(protocolValues),
  mode: z.enum(['sync', 'async']),
  operation: z.enum(['read', 'write', 'read-write']),
  direction: z.enum(['one-way', 'bidirectional']),
  critical: z.boolean(),
  description: z.string().max(DIAGRAM_LIMITS.maxPropLength).optional(),
  label: z.string().max(DIAGRAM_LIMITS.maxLabelLength).optional(),
});

export const diagramEdgeSchema = z.object({
  id,
  source: id,
  target: id,
  sourceHandle: z.string().max(40).nullable().optional(),
  targetHandle: z.string().max(40).nullable().optional(),
  props: connectionPropsSchema,
});

export const diagramSnapshotSchema = z
  .object({
    version: z.literal(DIAGRAM_SCHEMA_VERSION),
    nodes: z.array(diagramNodeSchema).max(DIAGRAM_LIMITS.maxNodes),
    edges: z.array(diagramEdgeSchema).max(DIAGRAM_LIMITS.maxEdges),
    viewport: z.object({ x: finite, y: finite, zoom: finite.positive() }).optional(),
  })
  .superRefine((d, ctx) => {
    const ids = new Set<string>();
    for (const n of d.nodes) {
      if (ids.has(n.id)) ctx.addIssue({ code: 'custom', message: `Duplicate node id ${n.id}` });
      ids.add(n.id);
    }
    const edgeIds = new Set<string>();
    for (const e of d.edges) {
      if (edgeIds.has(e.id)) ctx.addIssue({ code: 'custom', message: `Duplicate edge id ${e.id}` });
      edgeIds.add(e.id);
    }
  });

/** Parses untrusted input into a diagram snapshot. Throws a ZodError on failure. */
export function parseDiagram(input: unknown): DiagramSnapshot {
  return diagramSnapshotSchema.parse(input) as DiagramSnapshot;
}
