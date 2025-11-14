export class ProjectionEngine {
    strategies;
    logger;
    constructor(strategies, logger) {
        this.strategies = strategies;
        this.logger = logger;
    }
    async project(graph, config) {
        this.logger.info('Creating projection', { type: config.projectionType });
        const strategy = this.strategies.find(s => s.supports(config.projectionType));
        if (!strategy) {
            throw new Error(`No strategy found for projection type: ${config.projectionType}`);
        }
        return strategy.project(graph, config);
    }
}
//# sourceMappingURL=ProjectionEngine.js.map