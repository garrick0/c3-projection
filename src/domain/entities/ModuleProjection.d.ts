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
export declare class ModuleProjection extends Projection {
    private modules;
    constructor(id: string, metadata: ProjectionMetadata);
    /**
     * Add module to projection
     */
    addModule(module: Module): void;
    /**
     * Get module by ID
     */
    getModule(id: string): Module | undefined;
    /**
     * Get all modules
     */
    getModules(): Module[];
    /**
     * Get module count
     */
    getModuleCount(): number;
    /**
     * Get modules with dependencies
     */
    getModulesWithDependencies(): Module[];
    /**
     * Get projection data
     */
    getData(): Module[];
    /**
     * Get projection summary
     */
    getSummary(): Record<string, any>;
}
//# sourceMappingURL=ModuleProjection.d.ts.map