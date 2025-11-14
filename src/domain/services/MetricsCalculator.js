export class MetricsCalculator {
    calculateGraphMetrics(graph) {
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
    calculateCoupling(dependencies) {
        return dependencies.length;
    }
    calculateCohesion(internalConnections, totalConnections) {
        return totalConnections > 0 ? internalConnections / totalConnections : 0;
    }
}
//# sourceMappingURL=MetricsCalculator.js.map