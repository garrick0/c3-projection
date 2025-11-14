import { PropertyGraph, Node, Edge } from 'c3-parsing';
import { AggregationLevel } from '../value-objects/AggregationLevel.js';

export class GraphTransformer {
  mergeNodes(nodes: Node[], level: AggregationLevel): Node[] {
    return [];
  }

  filterEdges(edges: Edge[], criteria: Record<string, any>): Edge[] {
    return edges.filter(e => this.matchesCriteria(e, criteria));
  }

  private matchesCriteria(edge: Edge, criteria: Record<string, any>): boolean {
    return true;
  }

  aggregateByPath(graph: PropertyGraph, pathPattern: string): Map<string, Node[]> {
    return new Map();
  }
}
