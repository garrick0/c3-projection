export class NodeAggregator {
    aggregate(nodes, groupBy) {
        const groups = new Map();
        for (const node of nodes) {
            const key = groupBy(node);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(node);
        }
        return Array.from(groups.entries()).map(([key, groupNodes]) => ({
            id: `agg-${key}`,
            name: key,
            originalNodes: groupNodes.map(n => n.id),
            metadata: { nodeCount: groupNodes.length }
        }));
    }
    aggregateByDirectory(nodes) {
        return this.aggregate(nodes, node => node.getFilePath().split('/')[0]);
    }
    aggregateByExtension(nodes) {
        return this.aggregate(nodes, node => {
            const path = node.getFilePath();
            const ext = path.split('.').pop() || 'unknown';
            return ext;
        });
    }
}
//# sourceMappingURL=NodeAggregator.js.map