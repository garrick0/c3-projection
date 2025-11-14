/**
 * ModuleProjection - Module-level view of the codebase
 */
import { Projection } from './Projection.js';
export class ModuleProjection extends Projection {
    modules = new Map();
    constructor(id, metadata) {
        super(id, metadata);
    }
    /**
     * Add module to projection
     */
    addModule(module) {
        this.modules.set(module.id, module);
    }
    /**
     * Get module by ID
     */
    getModule(id) {
        return this.modules.get(id);
    }
    /**
     * Get all modules
     */
    getModules() {
        return Array.from(this.modules.values());
    }
    /**
     * Get module count
     */
    getModuleCount() {
        return this.modules.size;
    }
    /**
     * Get modules with dependencies
     */
    getModulesWithDependencies() {
        return this.getModules().filter(m => m.dependencies.length > 0);
    }
    /**
     * Get projection data
     */
    getData() {
        return this.getModules();
    }
    /**
     * Get projection summary
     */
    getSummary() {
        const modules = this.getModules();
        const totalDeps = modules.reduce((sum, m) => sum + m.dependencies.length, 0);
        return {
            moduleCount: modules.length,
            totalDependencies: totalDeps,
            averageDependencies: modules.length > 0 ? totalDeps / modules.length : 0,
            largestModule: modules.reduce((max, m) => m.fileCount > (max?.fileCount || 0) ? m : max, modules[0])?.name
        };
    }
}
//# sourceMappingURL=ModuleProjection.js.map