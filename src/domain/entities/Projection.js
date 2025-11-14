/**
 * Projection - Base projection entity
 */
import { Entity } from '@c3/shared';
export class Projection extends Entity {
    metadata;
    constructor(id, metadata) {
        super(id);
        this.metadata = metadata;
    }
    /**
     * Get projection type
     */
    getType() {
        return this.metadata.projectionType;
    }
    /**
     * Get source graph ID
     */
    getSourceGraphId() {
        return this.metadata.sourceGraphId;
    }
    /**
     * Get creation timestamp
     */
    getCreatedAt() {
        return this.metadata.createdAt;
    }
}
//# sourceMappingURL=Projection.js.map