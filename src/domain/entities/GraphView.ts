/**
 * GraphView - Generic graph representation for visualization
 */

import { Entity } from '@garrick0/c3-shared';

export interface GraphViewNode {
  id: string;
  label: string;
  type: string;              // 'module', 'file', etc.
  x?: number;                // Layout coordinates
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  metadata: {
    fileCount?: number;
    dependencyCount?: number;
    dependentCount?: number;
    totalLines?: number;
    [key: string]: any;
  };
}

export interface GraphViewEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  color?: string;
  weight?: number;
  metadata: {
    importCount?: number;
    [key: string]: any;
  };
}

export interface GraphViewMetadata {
  projectionType: string;
  generatedAt: Date;
  layout?: string;  // 'dagre', 'force', etc.
  layoutConfig?: Record<string, any>;
  [key: string]: any;
}

export class GraphView extends Entity<string> {
  constructor(
    id: string,
    public readonly nodes: GraphViewNode[],
    public readonly edges: GraphViewEdge[],
    public readonly metadata: GraphViewMetadata
  ) {
    super(id);
  }

  /**
   * Get node by ID
   */
  getNode(id: string): GraphViewNode | undefined {
    return this.nodes.find(n => n.id === id);
  }

  /**
   * Get all edges
   */
  getEdges(): GraphViewEdge[] {
    return this.edges;
  }

  /**
   * Get edges originating from a node
   */
  getEdgesFrom(nodeId: string): GraphViewEdge[] {
    return this.edges.filter(e => e.from === nodeId);
  }

  /**
   * Get edges pointing to a node
   */
  getEdgesTo(nodeId: string): GraphViewEdge[] {
    return this.edges.filter(e => e.to === nodeId);
  }

  /**
   * Get all edges connected to a node (in or out)
   */
  getConnectedEdges(nodeId: string): GraphViewEdge[] {
    return this.edges.filter(e => e.from === nodeId || e.to === nodeId);
  }

  /**
   * Get node count
   */
  getNodeCount(): number {
    return this.nodes.length;
  }

  /**
   * Get edge count
   */
  getEdgeCount(): number {
    return this.edges.length;
  }

  /**
   * Check if view has layout information
   */
  hasLayout(): boolean {
    return this.nodes.some(n => n.x !== undefined && n.y !== undefined);
  }

  /**
   * Get bounding box of the graph
   */
  getBoundingBox(): { minX: number; minY: number; maxX: number; maxY: number } | undefined {
    if (!this.hasLayout()) {
      return undefined;
    }

    const xValues = this.nodes.filter(n => n.x !== undefined).map(n => n.x!);
    const yValues = this.nodes.filter(n => n.y !== undefined).map(n => n.y!);

    if (xValues.length === 0 || yValues.length === 0) {
      return undefined;
    }

    return {
      minX: Math.min(...xValues),
      minY: Math.min(...yValues),
      maxX: Math.max(...xValues),
      maxY: Math.max(...yValues)
    };
  }
}

