/**
 * ModuleDependencyCalculator - Service for calculating module-level dependencies
 */

import { PropertyGraph, EdgeType } from 'c3-parsing';
import { Logger } from 'c3-shared';
import { Module } from '../entities/Module.js';
import * as path from 'path';

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

    // Build maps for path resolution
    // IMPORTANT: Only index FILE nodes, not other node types
    const pathToNodeId = new Map<string, string>();
    const nodeIdToPath = new Map<string, string>();
    
    for (const node of graph.getNodes()) {
      if (node.metadata?.filePath) {
        const filePath = node.metadata.filePath;
        // Only add FILE nodes to the path map (not classes, functions, etc.)
        if (node.type === 'file' || node.labels?.has('File')) {
          pathToNodeId.set(filePath, node.id);
          pathToNodeId.set(path.normalize(filePath), node.id); // Also store normalized
          nodeIdToPath.set(node.id, filePath);
        }
      }
    }

    // Get all import edges from PropertyGraph
    const importEdges = graph.getEdges()
      .filter(edge => edge.type === EdgeType.IMPORTS);

    this.logger.info(`Processing ${importEdges.length} import edges`);

    let resolvedCount = 0;
    let unresolvedCount = 0;
    let sameModuleCount = 0;
    let crossModuleCount = 0;

    // Process each import edge
    for (const edge of importEdges) {
      const sourceModule = fileToModule.get(edge.fromNodeId);
      
      if (!sourceModule) {
        continue; // Source file not in any module
      }

      // The toNodeId might be an import path string, not a node ID
      // Try to resolve it to a file node ID
      let targetNodeId = edge.toNodeId;
      
      // If toNodeId is not in fileToModule, it might be an import path
      if (!fileToModule.has(targetNodeId)) {
        // Try to resolve import path to node ID
        let resolvedNodeId = pathToNodeId.get(targetNodeId);
        
        // If not found, try to resolve it relative to the source file
        if (!resolvedNodeId) {
          const sourceFilePath = nodeIdToPath.get(edge.fromNodeId);
          if (sourceFilePath && (targetNodeId.startsWith('./') || targetNodeId.startsWith('../'))) {
            // Resolve relative import
            const sourceDir = path.dirname(sourceFilePath);
            const resolved = path.resolve(sourceDir, targetNodeId);
            
            // Try with original extension and common TypeScript extensions
            const attempts = [
              resolved,
              path.normalize(resolved),
              resolved.replace(/\.js$/, '.ts'),
              resolved.replace(/\.jsx$/, '.tsx'),
              resolved + '.ts',
              resolved + '.tsx',
              resolved + '.js',
              resolved + '/index.ts',
              resolved + '/index.js'
            ];
            
            for (const attempt of attempts) {
              resolvedNodeId = pathToNodeId.get(attempt);
              if (resolvedNodeId) break;
            }
          }
        }
        
        if (resolvedNodeId) {
          targetNodeId = resolvedNodeId;
          resolvedCount++;
        } else {
          // Could be external dependency (c3-shared, etc.) or unresolved path
          unresolvedCount++;
          continue;
        }
      }

      const targetModule = fileToModule.get(targetNodeId);

      // Skip if target file is not in a module (e.g., external dependency)
      if (!targetModule) {
        continue;
      }

      // Skip self-dependencies (imports within same module)
      if (sourceModule.id === targetModule.id) {
        sameModuleCount++;
        continue;
      }

      // Add dependency relationship
      crossModuleCount++;
      sourceModule.addDependency(targetModule.id);
      targetModule.addDependent(sourceModule.id);
    }

    this.logger.info(`Import resolution stats`, {
      total: importEdges.length,
      resolved: resolvedCount,
      unresolved: unresolvedCount,
      sameModule: sameModuleCount,
      crossModule: crossModuleCount
    });

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

