import { PropertyGraph } from '@garrick0/c3-parsing';

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  averageDegree: number;
  clustering?: number;
}

export class MetricsCalculator {
  calculateGraphMetrics(graph: PropertyGraph): GraphMetrics {
    const nodeCount = graph.getNodeCount();
    const edgeCount = graph.getEdgeCount();

    const density = nodeCount > 1
      ? edgeCount / (nodeCount * (nodeCount - 1))
      : 0;

    const averageDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0;

    return {
      nodeCount,
      edgeCount,
      density,
      averageDegree
    };
  }

  calculateCoupling(dependencies: string[]): number {
    return dependencies.length;
  }

  calculateCohesion(internalConnections: number, totalConnections: number): number {
    return totalConnections > 0 ? internalConnections / totalConnections : 0;
  }
}
