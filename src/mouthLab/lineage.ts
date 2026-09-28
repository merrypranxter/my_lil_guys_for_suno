import type { MouthGenome } from './types';

export interface MouthLineageNode {
  id: string;
  name: string;
  generation: number;
  depth: number;
  saved: boolean;
  current: boolean;
  parentGenomeIds: string[];
  parentNames: string[];
  mutationTraitIds: string[];
  mutationQuirkIds: string[];
  scarCount: number;
  environmentLabel?: string;
}

export interface MouthLineageGraph {
  nodes: MouthLineageNode[];
  unresolvedParents: Array<{
    id: string;
    name: string;
    depth: number;
    childId: string;
  }>;
}

function generationOf(genome: MouthGenome): number {
  return genome.lineage?.generation ?? 0;
}

function environmentLabel(genome: MouthGenome): string | undefined {
  if (!genome.environment) return undefined;
  const source = genome.environment.sourceDonorId
    ? genome.environment.sourceDonorId.replace(/^mouth-donor-/, '')
    : 'isolation';
  return (
    genome.environment.mode.toUpperCase() +
    ' · ' +
    source +
    ' · ' +
    genome.environment.generations +
    ' gen · ' +
    genome.environment.pressure +
    '/100'
  );
}

export function buildMouthLineageGraph(
  current: MouthGenome,
  savedSpecies: MouthGenome[],
  maxDepth = 4,
): MouthLineageGraph {
  const byId = new Map<string, MouthGenome>();
  for (const genome of savedSpecies) byId.set(genome.id, genome);
  byId.set(current.id, current);

  const nodes: MouthLineageNode[] = [];
  const unresolvedParents: MouthLineageGraph['unresolvedParents'] = [];
  const visited = new Set<string>();
  const queue: Array<{ genome: MouthGenome; depth: number }> = [{ genome: current, depth: 0 }];

  while (queue.length) {
    const item = queue.shift()!;
    if (visited.has(item.genome.id)) continue;
    visited.add(item.genome.id);

    const lineage = item.genome.lineage;
    nodes.push({
      id: item.genome.id,
      name: item.genome.name,
      generation: generationOf(item.genome),
      depth: item.depth,
      saved: savedSpecies.some((candidate) => candidate.id === item.genome.id),
      current: item.genome.id === current.id,
      parentGenomeIds: [...(lineage?.parentGenomeIds || [])],
      parentNames: [...(lineage?.parentNames || [])],
      mutationTraitIds: [...(lineage?.mutationTraitIds || [])],
      mutationQuirkIds: [...(lineage?.mutationQuirkIds || [])],
      scarCount: item.genome.mutationScars?.length || 0,
      environmentLabel: environmentLabel(item.genome),
    });

    if (!lineage || item.depth >= maxDepth) continue;

    lineage.parentGenomeIds.forEach((parentId, index) => {
      const parent = byId.get(parentId);
      if (parent) {
        queue.push({ genome: parent, depth: item.depth + 1 });
        return;
      }
      unresolvedParents.push({
        id: parentId,
        name: lineage.parentNames[index] || parentId,
        depth: item.depth + 1,
        childId: item.genome.id,
      });
    });
  }

  nodes.sort(
    (a, b) =>
      a.depth - b.depth ||
      b.generation - a.generation ||
      a.name.localeCompare(b.name),
  );
  unresolvedParents.sort(
    (a, b) => a.depth - b.depth || a.name.localeCompare(b.name),
  );

  return { nodes, unresolvedParents };
}
