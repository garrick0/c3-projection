/**
 * LayerProjection - Architectural layer view
 */

import { Projection, ProjectionMetadata } from './Projection.js';

export interface Layer {
  name: string;
  path: string;
  nodeCount: number;
  dependencies: string[];
  violations: Array<{ from: string; to: string; reason: string }>;
}

export class LayerProjection extends Projection {
  private layers: Map<string, Layer> = new Map();

  constructor(id: string, metadata: ProjectionMetadata) {
    super(id, metadata);
  }

  /**
   * Add layer to projection
   */
  addLayer(layer: Layer): void {
    this.layers.set(layer.name, layer);
  }

  /**
   * Get layer by name
   */
  getLayer(name: string): Layer | undefined {
    return this.layers.get(name);
  }

  /**
   * Get all layers
   */
  getLayers(): Layer[] {
    return Array.from(this.layers.values());
  }

  /**
   * Get layer violations
   */
  getAllViolations(): Array<{ from: string; to: string; reason: string }> {
    return this.getLayers().flatMap(l => l.violations);
  }

  /**
   * Check if has violations
   */
  hasViolations(): boolean {
    return this.getAllViolations().length > 0;
  }

  /**
   * Get projection data
   */
  getData(): Layer[] {
    return this.getLayers();
  }

  /**
   * Get projection summary
   */
  getSummary(): Record<string, any> {
    return {
      layerCount: this.layers.size,
      totalViolations: this.getAllViolations().length,
      hasViolations: this.hasViolations(),
      layers: this.getLayers().map(l => ({
        name: l.name,
        nodeCount: l.nodeCount,
        violationCount: l.violations.length
      }))
    };
  }
}
