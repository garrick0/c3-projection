import { Projection } from '../entities/Projection.js';
import { PropertyGraph } from 'c3-parsing';
import { ViewConfiguration } from '../value-objects/ViewConfiguration.js';
import { ProjectionType } from '../value-objects/ProjectionType.js';
export interface ProjectionStrategy {
    project(graph: PropertyGraph, config: ViewConfiguration): Promise<Projection>;
    supports(type: ProjectionType): boolean;
}
//# sourceMappingURL=ProjectionStrategy.d.ts.map