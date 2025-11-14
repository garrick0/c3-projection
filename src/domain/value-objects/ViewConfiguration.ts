/**
 * ViewConfiguration - Configuration for generating views
 */

import { ValueObject } from 'c3-shared';
import { ProjectionType } from './ProjectionType.js';
import { AggregationLevel } from './AggregationLevel.js';

export interface ViewConfigProps {
  projectionType: ProjectionType;
  aggregationLevel: AggregationLevel;
  filters?: Record<string, any>;
  options?: Record<string, any>;
}

export class ViewConfiguration extends ValueObject<ViewConfigProps> {
  private constructor(props: ViewConfigProps) {
    super(props);
  }

  static create(props: ViewConfigProps): ViewConfiguration {
    return new ViewConfiguration(props);
  }

  get projectionType(): ProjectionType {
    return this.props.projectionType;
  }

  get aggregationLevel(): AggregationLevel {
    return this.props.aggregationLevel;
  }

  get filters(): Record<string, any> {
    return this.props.filters || {};
  }

  get options(): Record<string, any> {
    return this.props.options || {};
  }

  /**
   * Get specific filter
   */
  getFilter<T = any>(key: string, defaultValue?: T): T | undefined {
    return this.filters[key] ?? defaultValue;
  }

  /**
   * Get specific option
   */
  getOption<T = any>(key: string, defaultValue?: T): T | undefined {
    return this.options[key] ?? defaultValue;
  }
}
