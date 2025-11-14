import { Projection } from '../entities/Projection.js';
import { PropertyGraph } from 'c3-parsing';
import { ViewConfiguration } from '../value-objects/ViewConfiguration.js';
import { ProjectionStrategy } from '../ports/ProjectionStrategy.js';
import { Logger } from 'c3-shared';

export class ProjectionEngine {
  constructor(
    private strategies: ProjectionStrategy[],
    private logger: Logger
  ) {}

  async project(graph: PropertyGraph, config: ViewConfiguration): Promise<Projection> {
    this.logger.info('Creating projection', { type: config.projectionType });

    const strategy = this.strategies.find(s => s.supports(config.projectionType));

    if (!strategy) {
      throw new Error(`No strategy found for projection type: ${config.projectionType}`);
    }

    return strategy.project(graph, config);
  }
}
