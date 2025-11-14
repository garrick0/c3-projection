import { Projection } from '../entities/Projection.js';
import { PropertyGraph } from 'c3-parsing';
import { ViewConfiguration } from '../value-objects/ViewConfiguration.js';
import { ProjectionStrategy } from '../ports/ProjectionStrategy.js';
import { Logger } from 'c3-shared';
export declare class ProjectionEngine {
    private strategies;
    private logger;
    constructor(strategies: ProjectionStrategy[], logger: Logger);
    project(graph: PropertyGraph, config: ViewConfiguration): Promise<Projection>;
}
//# sourceMappingURL=ProjectionEngine.d.ts.map