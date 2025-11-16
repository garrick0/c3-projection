/**
 * AggregationLevel - Levels of node aggregation
 */

export enum AggregationLevel {
  DIRECTORY = 'directory',       // Group by directory
  TOP_LEVEL = 'top-level',       // Only top-level directories
  PACKAGE = 'package',           // Group by package.json/tsconfig
  CUSTOM = 'custom'              // Custom grouping rules
}
