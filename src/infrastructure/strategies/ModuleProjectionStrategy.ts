import { ProjectionStrategy } from '../../domain/ports/ProjectionStrategy.js';
import { Projection } from '../../domain/entities/Projection.js';
import { ModuleProjection } from '../../domain/entities/ModuleProjection.js';
import { PropertyGraph } from 'c3-parsing';
import { ViewConfiguration } from '../../domain/value-objects/ViewConfiguration.js';
import { ProjectionType } from '../../domain/value-objects/ProjectionType.js';

export class ModuleProjectionStrategy implements ProjectionStrategy {
  async project(graph: PropertyGraph, config: ViewConfiguration): Promise<Projection> {
    const projection = new ModuleProjection(`proj-${Date.now()}`, {
      sourceGraphId: graph.id,
      createdAt: new Date(),
      projectionType: ProjectionType.MODULE,
      configuration: {}
    });
    return projection;
  }

  supports(type: ProjectionType): boolean {
    return type === ProjectionType.MODULE;
  }
}
