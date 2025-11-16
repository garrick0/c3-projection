/**
 * Module - Represents a logical grouping of code files
 */

import { Entity } from '@garrick0/c3-shared';

export interface ModuleMetrics {
  fileCount: number;
  totalLines: number;
  dependencyCount: number;    // outgoing dependencies
  dependentCount: number;     // incoming dependencies
  cyclicComplexity?: number;
}

export class Module extends Entity<string> {
  constructor(
    id: string,
    public readonly name: string,
    public readonly path: string,
    public readonly files: string[],      // Node IDs from PropertyGraph
    public readonly dependencies: Set<string> = new Set(),  // Module IDs this depends on
    public readonly dependents: Set<string> = new Set(),    // Module IDs that depend on this
    public readonly metrics: ModuleMetrics
  ) {
    super(id);
  }

  /**
   * Add a dependency to this module
   */
  addDependency(moduleId: string): void {
    this.dependencies.add(moduleId);
  }

  /**
   * Add a dependent to this module
   */
  addDependent(moduleId: string): void {
    this.dependents.add(moduleId);
  }

  /**
   * Check if this module depends on another
   */
  hasDependency(moduleId: string): boolean {
    return this.dependencies.has(moduleId);
  }

  /**
   * Check if this module has a dependent
   */
  hasDependent(moduleId: string): boolean {
    return this.dependents.has(moduleId);
  }

  /**
   * Get count of dependencies
   */
  getDependencyCount(): number {
    return this.dependencies.size;
  }

  /**
   * Get count of dependents
   */
  getDependentCount(): number {
    return this.dependents.size;
  }

  /**
   * Get all dependencies as array
   */
  getDependencies(): string[] {
    return Array.from(this.dependencies);
  }

  /**
   * Get all dependents as array
   */
  getDependents(): string[] {
    return Array.from(this.dependents);
  }

  /**
   * Check if this is a root module (no dependents)
   */
  isRoot(): boolean {
    return this.dependents.size === 0;
  }

  /**
   * Check if this is a leaf module (no dependencies)
   */
  isLeaf(): boolean {
    return this.dependencies.size === 0;
  }
}

