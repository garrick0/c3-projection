import { PropertyGraph, Node, Edge } from 'c3-parsing';
import { AggregationLevel } from '../value-objects/AggregationLevel.js';
export declare class GraphTransformer {
    mergeNodes(nodes: Node[], level: AggregationLevel): Node[];
    filterEdges(edges: Edge[], criteria: Record<string, any>): Edge[];
    private matchesCriteria;
    aggregateByPath(graph: PropertyGraph, pathPattern: string): Map<string, Node[]>;
}
//# sourceMappingURL=GraphTransformer.d.ts.map