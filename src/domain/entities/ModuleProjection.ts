/**
 * ModuleProjection - Module-level view of the codebase
 */

import { Projection, ProjectionMetadata } from './Projection.js';
import { Module } from './Module.js';
import { AggregationLevel } from '../value-objects/AggregationLevel.js';

export interface ModuleProjectionMetadata extends ProjectionMetadata {
  rootPath: string;
  aggregationLevel: AggregationLevel;
  generatedAt: Date;
  totalFiles: number;
  totalDependencies: number;
}

export class ModuleProjection extends Projection {
  private modules: Map<string, Module> = new Map();

  constructor(
    id: string,
    metadata: ModuleProjectionMetadata,
    modules: Module[] = []
  ) {
    super(id, metadata);
    modules.forEach(m => this.modules.set(m.id, m));
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
    return this.getModules().filter(m => m.getDependencyCount() > 0);
  }

  /**
   * Get modules by path prefix
   */
  getModulesByPath(pathPrefix: string): Module[] {
    return this.getModules().filter(m => m.path.startsWith(pathPrefix));
  }

  /**
   * Get root modules (modules with no dependents)
   */
  getRootModules(): Module[] {
    return this.getModules().filter(m => m.isRoot());
  }

  /**
   * Get leaf modules (modules with no dependencies)
   */
  getLeafModules(): Module[] {
    return this.getModules().filter(m => m.isLeaf());
  }

  /**
   * Detect circular dependencies
   */
  getCycles(): Module[][] {
    const cycles: Module[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: Module[] = [];

    const dfs = (moduleId: string): void => {
      const module = this.modules.get(moduleId);
      if (!module) return;

      visited.add(moduleId);
      recursionStack.add(moduleId);
      currentPath.push(module);

      for (const depId of module.dependencies) {
        if (!visited.has(depId)) {
          dfs(depId);
        } else if (recursionStack.has(depId)) {
          // Found a cycle
          const cycleStartIdx = currentPath.findIndex(m => m.id === depId);
          if (cycleStartIdx !== -1) {
            cycles.push(currentPath.slice(cycleStartIdx));
          }
        }
      }

      currentPath.pop();
      recursionStack.delete(moduleId);
    };

    for (const module of this.modules.values()) {
      if (!visited.has(module.id)) {
        dfs(module.id);
      }
    }

    return cycles;
  }

  /**
   * Get aggregate metrics across all modules
   */
  getMetrics(): {
    totalModules: number;
    totalFiles: number;
    totalDependencies: number;
    averageDependenciesPerModule: number;
    maxDependencies: number;
    cyclicDependencies: number;
  } {
    const modules = this.getModules();
    const totalDeps = modules.reduce((sum, m) => sum + m.getDependencyCount(), 0);
    const maxDeps = Math.max(...modules.map(m => m.getDependencyCount()), 0);
    const totalFiles = modules.reduce((sum, m) => sum + m.files.length, 0);

    return {
      totalModules: modules.length,
      totalFiles,
      totalDependencies: totalDeps,
      averageDependenciesPerModule: modules.length > 0 ? totalDeps / modules.length : 0,
      maxDependencies: maxDeps,
      cyclicDependencies: this.getCycles().length
    };
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
    const metrics = this.getMetrics();
    const modules = this.getModules();

    return {
      ...metrics,
      largestModule: modules.reduce((max, m) =>
        m.files.length > (max?.files.length || 0) ? m : max, modules[0])?.name,
      rootModules: this.getRootModules().length,
      leafModules: this.getLeafModules().length
    };
  }
}
