/**
 * ModuleProjection - Module-level view of the codebase
 */

import { Projection, ProjectionMetadata } from './Projection.js';

export interface Module {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  dependencies: string[];
  dependents: string[];
}

export class ModuleProjection extends Projection {
  private modules: Map<string, Module> = new Map();

  constructor(id: string, metadata: ProjectionMetadata) {
    super(id, metadata);
  }

  /**
   * Add module to projection
   */
  addModule(module: Module): void {
    this.modules.set(module.id, module);
  }

  /**
   * Get module by ID
   */
  getModule(id: string): Module | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all modules
   */
  getModules(): Module[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get module count
   */
  getModuleCount(): number {
    return this.modules.size;
  }

  /**
   * Get modules with dependencies
   */
  getModulesWithDependencies(): Module[] {
    return this.getModules().filter(m => m.dependencies.length > 0);
  }

  /**
   * Get projection data
   */
  getData(): Module[] {
    return this.getModules();
  }

  /**
   * Get projection summary
   */
  getSummary(): Record<string, any> {
    const modules = this.getModules();
    const totalDeps = modules.reduce((sum, m) => sum + m.dependencies.length, 0);

    return {
      moduleCount: modules.length,
      totalDependencies: totalDeps,
      averageDependencies: modules.length > 0 ? totalDeps / modules.length : 0,
      largestModule: modules.reduce((max, m) =>
        m.fileCount > (max?.fileCount || 0) ? m : max, modules[0])?.name
    };
  }
}
