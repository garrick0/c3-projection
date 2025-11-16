/**
 * Projection - Base projection entity
 */

import { Entity } from '@garrick0/c3-shared';
import { ProjectionType } from '../value-objects/ProjectionType.js';

export interface ProjectionMetadata {
  sourceGraphId: string;
  createdAt: Date;
  projectionType: ProjectionType;
  configuration: Record<string, any>;
}

export abstract class Projection extends Entity<string> {
  constructor(
    id: string,
    public readonly metadata: ProjectionMetadata
  ) {
    super(id);
  }

  /**
   * Get projection type
   */
  getType(): ProjectionType {
    return this.metadata.projectionType;
  }

  /**
   * Get source graph ID
   */
  getSourceGraphId(): string {
    return this.metadata.sourceGraphId;
  }

  /**
   * Get creation timestamp
   */
  getCreatedAt(): Date {
    return this.metadata.createdAt;
  }

  /**
   * Abstract method to get projection data
   */
  abstract getData(): any;

  /**
   * Abstract method to get projection summary
   */
  abstract getSummary(): Record<string, any>;
}
