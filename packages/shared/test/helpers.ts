import { getComponent } from '../src/catalog/components';
import { inferConnectionProps, type ConnectionProps } from '../src/catalog/connections';
import type { PropertyValue } from '../src/catalog/properties';
import { DIAGRAM_SCHEMA_VERSION, type DiagramSnapshot } from '../src/diagram/types';

/**
 * Builds diagrams tersely for tests:
 *   diagram({ web: 'web-client', app: ['app-server', { instances: 'multiple' }] }, ['web>app'])
 */
export function diagram(
  nodes: Record<string, string | [string, Record<string, PropertyValue>]>,
  edges: (string | [string, Partial<ConnectionProps>])[] = [],
): DiagramSnapshot {
  const types = new Map<string, string>();
  const n = Object.entries(nodes).map(([id, spec], i) => {
    const [type, props] = typeof spec === 'string' ? [spec, {}] : spec;
    types.set(id, type);
    return {
      id,
      kind: 'component' as const,
      componentType: type,
      label: getComponent(type)?.label ?? type,
      position: { x: i * 100, y: 0 },
      props,
    };
  });
  const e = edges.map((spec, i) => {
    const [s, extra] = typeof spec === 'string' ? [spec, {}] : spec;
    const bidi = s.includes('<>');
    const [source, target] = s.split(bidi ? '<>' : '>');
    return {
      id: `e${i}`,
      source: source!,
      target: target!,
      props: {
        ...inferConnectionProps(types.get(source!) ?? '', types.get(target!) ?? ''),
        ...(bidi ? { direction: 'bidirectional' as const } : {}),
        ...extra,
      },
    };
  });
  return { version: DIAGRAM_SCHEMA_VERSION, nodes: n, edges: e };
}
