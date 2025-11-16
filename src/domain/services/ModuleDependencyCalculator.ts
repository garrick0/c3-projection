/**
 * ModuleDependencyCalculator - Service for calculating module-level dependencies
 */

import { PropertyGraph, EdgeType } from 'c3-parsing';
import { Logger } from 'c3-shared';
import { Module } from '../entities/Module.js';

export class ModuleDependencyCalculator {
  constructor(private logger: Logger) {}

  /**
   * Calculate module-level dependencies from PropertyGraph edges
   * Works directly with PropertyGraph - no intermediate layer!
   */
  calculate(modules: Module[], graph: PropertyGraph): void {
    this.logger.info(`Calculating dependencies for ${modules.length} modules`);

    // Build a map from file ID to module
    const fileToModule = new Map<string, Module>();
    for (const module of modules) {
      for (const fileId of module.files) {
        fileToModule.set(fileId, module);
      }
    }

    // Get all import edges from PropertyGraph
    const importEdges = graph.getEdges()
      .filter(edge => edge.type === EdgeType.IMPORTS);

    this.logger.info(`Processing ${importEdges.length} import edges`);

    // Process each import edge
    for (const edge of importEdges) {
      const sourceModule = fileToModule.get(edge.fromNodeId);
      const targetModule = fileToModule.get(edge.toNodeId);

      // Skip if either file is not in a module (e.g., external dependency)
      if (!sourceModule || !targetModule) {
        continue;
      }

      // Skip self-dependencies (imports within same module)
      if (sourceModule.id === targetModule.id) {
        continue;
      }

      // Add dependency relationship
      sourceModule.addDependency(targetModule.id);
      targetModule.addDependent(sourceModule.id);
    }

    // Update metrics
    for (const module of modules) {
      module.metrics.dependencyCount = module.getDependencyCount();
      module.metrics.dependentCount = module.getDependentCount();
    }

    const totalDeps = modules.reduce((sum, m) => sum + m.getDependencyCount(), 0);
    this.logger.info(`Calculated ${totalDeps} module dependencies`);
  }

  /**
   * Calculate transitive dependencies (dependencies of dependencies)
   */
  getTransitiveDependencies(moduleId: string, modules: Module[]): Set<string> {
    const modulesById = new Map(modules.map(m => [m.id, m]));
    const transitive = new Set<string>();
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const module = modulesById.get(id);
      if (!module) return;

      for (const depId of module.dependencies) {
        transitive.add(depId);
        traverse(depId);
      }
    };

    traverse(moduleId);
    return transitive;
  }

  /**
   * Calculate transitive dependents (dependents of dependents)
   */
  getTransitiveDependents(moduleId: string, modules: Module[]): Set<string> {
    const modulesById = new Map(modules.map(m => [m.id, m]));
    const transitive = new Set<string>();
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const module = modulesById.get(id);
      if (!module) return;

      for (const depId of module.dependents) {
        transitive.add(depId);
        traverse(depId);
      }
    };

    traverse(moduleId);
    return transitive;
  }
}

