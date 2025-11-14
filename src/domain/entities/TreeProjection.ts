/**
 * TreeProjection - Hierarchical tree view
 */

import { Projection, ProjectionMetadata } from './Projection.js';

export interface TreeNode {
  id: string;
  name: string;
  type: 'directory' | 'file' | 'module';
  children: TreeNode[];
  metadata?: Record<string, any>;
}

export class TreeProjection extends Projection {
  private root?: TreeNode;

  constructor(id: string, metadata: ProjectionMetadata) {
    super(id, metadata);
  }

  /**
   * Set root node
   */
  setRoot(node: TreeNode): void {
    this.root = node;
  }

  /**
   * Get root node
   */
  getRoot(): TreeNode | undefined {
    return this.root;
  }

  /**
   * Find node by ID
   */
  findNode(id: string, node: TreeNode = this.root!): TreeNode | undefined {
    if (!node) return undefined;
    if (node.id === id) return node;

    for (const child of node.children) {
      const found = this.findNode(id, child);
      if (found) return found;
    }

    return undefined;
  }

  /**
   * Get tree depth
   */
  getDepth(node: TreeNode = this.root!): number {
    if (!node || node.children.length === 0) return 0;
    return 1 + Math.max(...node.children.map(c => this.getDepth(c)));
  }

  /**
   * Get total node count
   */
  getNodeCount(node: TreeNode = this.root!): number {
    if (!node) return 0;
    return 1 + node.children.reduce((sum, c) => sum + this.getNodeCount(c), 0);
  }

  /**
   * Get projection data
   */
  getData(): TreeNode | undefined {
    return this.root;
  }

  /**
   * Get projection summary
   */
  getSummary(): Record<string, any> {
    return {
      depth: this.getDepth(),
      totalNodes: this.getNodeCount(),
      rootName: this.root?.name
    };
  }
}
