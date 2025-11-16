import { Node } from '@garrick0/c3-parsing';

export interface AggregatedNode {
  id: string;
  name: string;
  originalNodes: string[];
  metadata: Record<string, any>;
}

export class NodeAggregator {
  aggregate(nodes: Node[], groupBy: (node: Node) => string): AggregatedNode[] {
    const groups = new Map<string, Node[]>();

    for (const node of nodes) {
      const key = groupBy(node);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(node);
    }

    return Array.from(groups.entries()).map(([key, groupNodes]) => ({
      id: `agg-${key}`,
      name: key,
      originalNodes: groupNodes.map(n => n.id),
      metadata: { nodeCount: groupNodes.length }
    }));
  }

  aggregateByDirectory(nodes: Node[]): AggregatedNode[] {
    return this.aggregate(nodes, node => node.getFilePath().split('/')[0]);
  }

  aggregateByExtension(nodes: Node[]): AggregatedNode[] {
    return this.aggregate(nodes, node => {
      const path = node.getFilePath();
      const ext = path.split('.').pop() || 'unknown';
      return ext;
    });
  }
}
