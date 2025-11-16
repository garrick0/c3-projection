/**
 * GraphLayoutEngine - Port for graph layout algorithms
 */

import { GraphView } from '../entities/GraphView.js';

export interface GraphLayoutEngine {
  /**
   * Apply layout algorithm to GraphView (mutates x, y coordinates)
   * @param graphView The graph view to layout
   * @returns The same graph view with updated node positions
   */
  layout(graphView: GraphView): Promise<GraphView>;

  /**
   * Get the name of this layout engine
   */
  getName(): string;
}

