/**
 * GraphViewBuilder - Converts projections to GraphView for visualization
 */

import { Logger } from 'c3-shared';
import { GraphView, type GraphViewNode, type GraphViewEdge, type GraphViewMetadata } from '../entities/GraphView.js';
import { ModuleProjection } from '../entities/ModuleProjection.js';
import { Module } from '../entities/Module.js';

export interface GraphViewConfig {
  includeMetrics?: boolean;
  colorScheme?: 'default' | 'complexity' | 'dependencies';
  nodeSize?: 'fixed' | 'proportional';
  showLabels?: boolean;
}

export class GraphViewBuilder {
  constructor(private logger: Logger) {}

  /**
   * Build GraphView from ModuleProjection
   */
  build(projection: ModuleProjection, config: GraphViewConfig = {}): GraphView {
    this.logger.info('Building GraphView from ModuleProjection', {
      modules: projection.getModuleCount(),
      config
    });

    const nodes = this.createNodes(projection.getModules(), config);
    const edges = this.createEdges(projection.getModules(), config);

    const metadata: GraphViewMetadata = {
      projectionType: 'module-dependency',
      generatedAt: new Date(),
      moduleCount: projection.getModuleCount(),
      dependencyCount: edges.length
    };

    const view = new GraphView(
      `view-${Date.now()}`,
      nodes,
      edges,
      metadata
    );

    this.logger.info('GraphView created', {
      nodes: view.getNodeCount(),
      edges: view.getEdgeCount()
    });

    return view;
  }

  /**
   * Create GraphViewNodes from Modules
   */
  private createNodes(modules: Module[], config: GraphViewConfig): GraphViewNode[] {
    return modules.map(module => {
      const node: GraphViewNode = {
        id: module.id,
        label: config.showLabels !== false ? module.name : '',
        type: 'module',
        color: this.getNodeColor(module, config.colorScheme),
        width: this.getNodeWidth(module, config.nodeSize),
        height: this.getNodeHeight(module, config.nodeSize),
        metadata: {}
      };

      // Add metrics if requested
      if (config.includeMetrics !== false) {
        node.metadata = {
          fileCount: module.metrics.fileCount,
          dependencyCount: module.metrics.dependencyCount,
          dependentCount: module.metrics.dependentCount,
          totalLines: module.metrics.totalLines,
          path: module.path
        };
      }

      return node;
    });
  }

  /**
   * Create GraphViewEdges from Module dependencies
   */
  private createEdges(modules: Module[], config: GraphViewConfig): GraphViewEdge[] {
    const edges: GraphViewEdge[] = [];

    for (const module of modules) {
      for (const depId of module.dependencies) {
        edges.push({
          id: `${module.id}-${depId}`,
          from: module.id,
          to: depId,
          metadata: {}
        });
      }
    }

    return edges;
  }

  /**
   * Get node color based on color scheme
   */
  private getNodeColor(module: Module, scheme?: string): string {
    if (scheme === 'complexity') {
      // Color by file count
      if (module.metrics.fileCount > 50) return '#ff6b6b';
      if (module.metrics.fileCount > 20) return '#feca57';
      return '#48dbfb';
    }

    if (scheme === 'dependencies') {
      // Color by dependency count
      if (module.metrics.dependencyCount > 10) return '#ff6b6b';
      if (module.metrics.dependencyCount > 5) return '#feca57';
      if (module.metrics.dependencyCount > 0) return '#48dbfb';
      return '#1dd1a1'; // Leaf nodes (no dependencies)
    }

    return '#4ecdc4';  // default
  }

  /**
   * Get node width based on size configuration
   */
  private getNodeWidth(module: Module, sizeMode?: string): number {
    if (sizeMode === 'proportional') {
      // Size based on file count
      const baseWidth = 80;
      const extraWidth = Math.min(module.metrics.fileCount * 2, 100);
      return baseWidth + extraWidth;
    }

    return 100; // fixed width
  }

  /**
   * Get node height based on size configuration
   */
  private getNodeHeight(module: Module, sizeMode?: string): number {
    if (sizeMode === 'proportional') {
      // Size based on file count
      const baseHeight = 40;
      const extraHeight = Math.min(module.metrics.fileCount, 30);
      return baseHeight + extraHeight;
    }

    return 50; // fixed height
  }
}

