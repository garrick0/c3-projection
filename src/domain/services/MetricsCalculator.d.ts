import { PropertyGraph } from 'c3-parsing';
export interface GraphMetrics {
    nodeCount: number;
    edgeCount: number;
    density: number;
    averageDegree: number;
    clustering?: number;
}
export declare class MetricsCalculator {
    calculateGraphMetrics(graph: PropertyGraph): GraphMetrics;
    calculateCoupling(dependencies: string[]): number;
    calculateCohesion(internalConnections: number, totalConnections: number): number;
}
//# sourceMappingURL=MetricsCalculator.d.ts.map