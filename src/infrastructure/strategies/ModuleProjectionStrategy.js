import { ModuleProjection } from '../../domain/entities/ModuleProjection.js';
import { ProjectionType } from '../../domain/value-objects/ProjectionType.js';
export class ModuleProjectionStrategy {
    async project(graph, config) {
        const projection = new ModuleProjection(`proj-${Date.now()}`, {
            sourceGraphId: graph.id,
            createdAt: new Date(),
            projectionType: ProjectionType.MODULE,
            configuration: {}
        });
        return projection;
    }
    supports(type) {
        return type === ProjectionType.MODULE;
    }
}
//# sourceMappingURL=ModuleProjectionStrategy.js.map