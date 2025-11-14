export class GraphTransformer {
    mergeNodes(nodes, level) {
        return [];
    }
    filterEdges(edges, criteria) {
        return edges.filter(e => this.matchesCriteria(e, criteria));
    }
    matchesCriteria(edge, criteria) {
        return true;
    }
    aggregateByPath(graph, pathPattern) {
        return new Map();
    }
}
//# sourceMappingURL=GraphTransformer.js.map