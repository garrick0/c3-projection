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
export declare class ViewConfiguration extends ValueObject<ViewConfigProps> {
    private constructor();
    static create(props: ViewConfigProps): ViewConfiguration;
    get projectionType(): ProjectionType;
    get aggregationLevel(): AggregationLevel;
    get filters(): Record<string, any>;
    get options(): Record<string, any>;
    /**
     * Get specific filter
     */
    getFilter<T = any>(key: string, defaultValue?: T): T | undefined;
    /**
     * Get specific option
     */
    getOption<T = any>(key: string, defaultValue?: T): T | undefined;
}
//# sourceMappingURL=ViewConfiguration.d.ts.map