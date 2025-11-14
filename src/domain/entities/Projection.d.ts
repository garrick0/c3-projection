/**
 * Projection - Base projection entity
 */
import { Entity } from 'c3-shared';
import { ProjectionType } from '../value-objects/ProjectionType.js';
export interface ProjectionMetadata {
    sourceGraphId: string;
    createdAt: Date;
    projectionType: ProjectionType;
    configuration: Record<string, any>;
}
export declare abstract class Projection extends Entity<string> {
    readonly metadata: ProjectionMetadata;
    constructor(id: string, metadata: ProjectionMetadata);
    /**
     * Get projection type
     */
    getType(): ProjectionType;
    /**
     * Get source graph ID
     */
    getSourceGraphId(): string;
    /**
     * Get creation timestamp
     */
    getCreatedAt(): Date;
    /**
     * Abstract method to get projection data
     */
    abstract getData(): any;
    /**
     * Abstract method to get projection summary
     */
    abstract getSummary(): Record<string, any>;
}
//# sourceMappingURL=Projection.d.ts.map