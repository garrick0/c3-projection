import { ProjectionStrategy } from '../../domain/ports/ProjectionStrategy.js';
import { Projection } from '../../domain/entities/Projection.js';
import { PropertyGraph } from 'c3-parsing';
import { ViewConfiguration } from '../../domain/value-objects/ViewConfiguration.js';
import { ProjectionType } from '../../domain/value-objects/ProjectionType.js';
export declare class ModuleProjectionStrategy implements ProjectionStrategy {
    project(graph: PropertyGraph, config: ViewConfiguration): Promise<Projection>;
    supports(type: ProjectionType): boolean;
}
//# sourceMappingURL=ModuleProjectionStrategy.d.ts.map