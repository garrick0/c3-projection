/**
 * ViewConfiguration - Configuration for generating views
 */
import { ValueObject } from '@c3/shared';
export class ViewConfiguration extends ValueObject {
    constructor(props) {
        super(props);
    }
    static create(props) {
        return new ViewConfiguration(props);
    }
    get projectionType() {
        return this.props.projectionType;
    }
    get aggregationLevel() {
        return this.props.aggregationLevel;
    }
    get filters() {
        return this.props.filters || {};
    }
    get options() {
        return this.props.options || {};
    }
    /**
     * Get specific filter
     */
    getFilter(key, defaultValue) {
        return this.filters[key] ?? defaultValue;
    }
    /**
     * Get specific option
     */
    getOption(key, defaultValue) {
        return this.options[key] ?? defaultValue;
    }
}
//# sourceMappingURL=ViewConfiguration.js.map