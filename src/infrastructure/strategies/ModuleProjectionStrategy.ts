/**
 * ModuleProjectionStrategy - Strategy for creating module-level projections
 */

import { ProjectionStrategy } from '../../domain/ports/ProjectionStrategy.js';
import { Projection } from '../../domain/entities/Projection.js';
import { ModuleProjection, type ModuleProjectionMetadata } from '../../domain/entities/ModuleProjection.js';
import { PropertyGraph } from 'c3-parsing';
import { ViewConfiguration } from '../../domain/value-objects/ViewConfiguration.js';
import { ProjectionType } from '../../domain/value-objects/ProjectionType.js';
import { ModuleAggregator, type AggregationConfig } from '../../domain/services/ModuleAggregator.js';
import { ModuleDependencyCalculator } from '../../domain/services/ModuleDependencyCalculator.js';
import { AggregationLevel } from '../../domain/value-objects/AggregationLevel.js';
import { Logger } from 'c3-shared';

export class ModuleProjectionStrategy implements ProjectionStrategy {
  private aggregator: ModuleAggregator;
  private dependencyCalculator: ModuleDependencyCalculator;

  constructor(
    private logger: Logger,
    private rootPath: string
  ) {
    this.aggregator = new ModuleAggregator(logger);
    this.dependencyCalculator = new ModuleDependencyCalculator(logger);
  }

  async project(graph: PropertyGraph, config: ViewConfiguration): Promise<Projection> {
    const aggregationLevel = config.aggregationLevel;

    this.logger.info('Creating module projection', {
      graphId: graph.id,
      aggregationLevel
    });

    try {
      // Step 1: Aggregate files into modules
      const includeTests = config.getOption<boolean>('includeTests', true);
      const excludePatterns = config.getOption<string[]>('excludePatterns', ['node_modules', 'dist', 'coverage', 'build']);

      const aggregationConfig: AggregationConfig = {
        level: aggregationLevel,
        includeTests,
        excludePatterns
      };

      const modules = await this.aggregator.aggregate(graph, this.rootPath, aggregationConfig);

      // Step 2: Calculate module dependencies
      this.dependencyCalculator.calculate(modules, graph);

      // Step 3: Create projection with metadata
      const totalDeps = modules.reduce((sum, m) => sum + m.getDependencyCount(), 0);
      const totalFiles = modules.reduce((sum, m) => sum + m.files.length, 0);

      const metadata: ModuleProjectionMetadata = {
        sourceGraphId: graph.id,
        createdAt: new Date(),
        projectionType: ProjectionType.MODULE,
        configuration: aggregationConfig,
        rootPath: this.rootPath,
        aggregationLevel,
        generatedAt: new Date(),
        totalFiles,
        totalDependencies: totalDeps
      };

      const projection = new ModuleProjection(
        `proj-module-${Date.now()}`,
        metadata,
        modules
      );

      this.logger.info('Module projection created successfully', {
        modules: modules.length,
        dependencies: totalDeps,
        cycles: projection.getCycles().length
      });

      return projection;
    } catch (error) {
      this.logger.error('Failed to create module projection', error as Error);
      throw error;
    }
  }

  supports(type: ProjectionType): boolean {
    return type === ProjectionType.MODULE;
  }
}
