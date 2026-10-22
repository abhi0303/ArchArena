/**
 * Tiny layered (left → right) auto-layout used for reference architectures and starter canvases.
 * It is deliberately simple: longest-path layering + stable ordering within a layer.
 */

export interface LayoutInput {
  id: string;
  /** Optional manual grid placement [column, row]. */
  at?: [number, number];
}

export interface LayoutOptions {
  columnWidth?: number;
  rowHeight?: number;
  originX?: number;
  originY?: number;
}

export function layeredLayout(
  nodes: LayoutInput[],
  edges: { source: string; target: string }[],
  options: LayoutOptions = {},
): Map<string, { x: number; y: number }> {
  const { columnWidth = 250, rowHeight = 120, originX = 40, originY = 40 } = options;
  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const out = new Map<string, string[]>(ids.map((id) => [id, []]));
  const indeg = new Map<string, number>(ids.map((id) => [id, 0]));
  for (const e of edges) {
    if (!idSet.has(e.source) || !idSet.has(e.target) || e.source === e.target) continue;
    out.get(e.source)!.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }

  // Kahn's algorithm; break cycles by picking the earliest remaining node.
  const layer = new Map<string, number>();
  const remaining = new Set(ids);
  const deg = new Map(indeg);
  while (remaining.size) {
    let ready = ids.filter((id) => remaining.has(id) && (deg.get(id) ?? 0) === 0);
    if (!ready.length) ready = [ids.find((id) => remaining.has(id))!];
    for (const id of ready) {
      remaining.delete(id);
      const l = layer.get(id) ?? 0;
      layer.set(id, l);
      for (const nb of out.get(id)!) {
        if (!remaining.has(nb)) continue;
        layer.set(nb, Math.max(layer.get(nb) ?? 0, l + 1));
        deg.set(nb, (deg.get(nb) ?? 0) - 1);
      }
    }
  }

  const columns = new Map<number, string[]>();
  for (const id of ids) {
    const l = layer.get(id) ?? 0;
    if (!columns.has(l)) columns.set(l, []);
    columns.get(l)!.push(id);
  }
  const tallest = Math.max(1, ...[...columns.values()].map((c) => c.length));
  const positions = new Map<string, { x: number; y: number }>();
  for (const [l, col] of columns) {
    const offset = ((tallest - col.length) * rowHeight) / 2;
    col.forEach((id, i) => {
      positions.set(id, { x: originX + l * columnWidth, y: originY + offset + i * rowHeight });
    });
  }
  for (const n of nodes) {
    if (n.at) positions.set(n.id, { x: originX + n.at[0] * columnWidth, y: originY + n.at[1] * rowHeight });
  }
  return positions;
}
