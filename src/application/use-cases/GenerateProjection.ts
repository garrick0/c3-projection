import { Projection } from '../../domain/entities/Projection.js';
import { ProjectionEngine } from '../../domain/services/ProjectionEngine.js';
import { ViewConfiguration } from '../../domain/value-objects/ViewConfiguration.js';
import { PropertyGraph } from 'c3-parsing';
import { Logger } from 'c3-shared';

export class GenerateProjectionUseCase {
  constructor(
    private projectionEngine: ProjectionEngine,
    private logger: Logger
  ) {}

  async execute(graph: PropertyGraph, config: ViewConfiguration): Promise<Projection> {
    this.logger.info('Generating projection');
    return this.projectionEngine.project(graph, config);
  }
}
