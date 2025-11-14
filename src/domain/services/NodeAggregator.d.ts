import { Node } from 'c3-parsing';
export interface AggregatedNode {
    id: string;
    name: string;
    originalNodes: string[];
    metadata: Record<string, any>;
}
export declare class NodeAggregator {
    aggregate(nodes: Node[], groupBy: (node: Node) => string): AggregatedNode[];
    aggregateByDirectory(nodes: Node[]): AggregatedNode[];
    aggregateByExtension(nodes: Node[]): AggregatedNode[];
}
//# sourceMappingURL=NodeAggregator.d.ts.map