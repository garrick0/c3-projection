/**
 * DagreLayoutEngine - Layout engine using Dagre algorithm
 */

import dagre from 'dagre';
import { GraphLayoutEngine } from '../../domain/ports/GraphLayoutEngine.js';
import { GraphView } from '../../domain/entities/GraphView.js';
import { Logger } from 'c3-shared';

export interface DagreLayoutConfig {
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';  // Top-to-Bottom, Bottom-to-Top, Left-to-Right, Right-to-Left
  nodesep?: number;                      // Separation between nodes in same rank
  ranksep?: number;                      // Separation between ranks
  marginx?: number;                      // Horizontal margin
  marginy?: number;                      // Vertical margin
  align?: 'UL' | 'UR' | 'DL' | 'DR';    // Alignment of nodes
}

export class DagreLayoutEngine implements GraphLayoutEngine {
  constructor(
    private config: DagreLayoutConfig = {},
    private logger: Logger
  ) {}

  getName(): string {
    return 'dagre';
  }

  async layout(graphView: GraphView): Promise<GraphView> {
    this.logger.info('Applying Dagre layout', { 
      nodes: graphView.getNodeCount(), 
      edges: graphView.getEdgeCount(),
      config: this.config
    });

    // Create Dagre graph
    const g = new dagre.graphlib.Graph();
    
    // Set graph configuration
    g.setGraph({
      rankdir: this.config.rankdir || 'TB',
      nodesep: this.config.nodesep || 50,
      ranksep: this.config.ranksep || 50,
      marginx: this.config.marginx || 20,
      marginy: this.config.marginy || 20,
      align: this.config.align
    });
    
    // Set default edge label
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to Dagre graph
    for (const node of graphView.nodes) {
      g.setNode(node.id, {
        label: node.label,
        width: node.width || 100,
        height: node.height || 50
      });
    }

    // Add edges to Dagre graph
    for (const edge of graphView.edges) {
      g.setEdge(edge.from, edge.to);
    }

    // Run layout algorithm
    dagre.layout(g);

    // Update node positions in GraphView (mutate)
    for (const node of graphView.nodes) {
      const dagreNode = g.node(node.id);
      if (dagreNode) {
        node.x = dagreNode.x;
        node.y = dagreNode.y;
      }
    }

    // Update metadata
    graphView.metadata.layout = 'dagre';
    graphView.metadata.layoutConfig = this.config;

    const bbox = graphView.getBoundingBox();
    this.logger.info('Dagre layout complete', {
      boundingBox: bbox
    });

    return graphView;
  }
}

