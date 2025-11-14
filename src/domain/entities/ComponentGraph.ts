/**
 * ComponentGraph - Component relationship view
 */

import { Projection, ProjectionMetadata } from './Projection.js';

export interface Component {
  id: string;
  name: string;
  type: 'class' | 'module' | 'package' | 'service';
  interfaces: string[];
  dependencies: string[];
  metrics: {
    complexity?: number;
    coupling?: number;
    cohesion?: number;
  };
}

export class ComponentGraph extends Projection {
  private components: Map<string, Component> = new Map();

  constructor(id: string, metadata: ProjectionMetadata) {
    super(id, metadata);
  }

  /**
   * Add component
   */
  addComponent(component: Component): void {
    this.components.set(component.id, component);
  }

  /**
   * Get component by ID
   */
  getComponent(id: string): Component | undefined {
    return this.components.get(id);
  }

  /**
   * Get all components
   */
  getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by type
   */
  getComponentsByType(type: Component['type']): Component[] {
    return this.getComponents().filter(c => c.type === type);
  }

  /**
   * Get highly coupled components
   */
  getHighlyCoupled(threshold: number = 5): Component[] {
    return this.getComponents().filter(c => c.dependencies.length > threshold);
  }

  /**
   * Get projection data
   */
  getData(): Component[] {
    return this.getComponents();
  }

  /**
   * Get projection summary
   */
  getSummary(): Record<string, any> {
    const components = this.getComponents();

    return {
      totalComponents: components.length,
      byType: {
        class: this.getComponentsByType('class').length,
        module: this.getComponentsByType('module').length,
        package: this.getComponentsByType('package').length,
        service: this.getComponentsByType('service').length
      },
      averageCoupling: components.length > 0
        ? components.reduce((sum, c) => sum + c.dependencies.length, 0) / components.length
        : 0
    };
  }
}
