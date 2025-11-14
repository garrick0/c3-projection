/**
 * DependencyMatrix - Matrix view of dependencies
 */

import { Projection, ProjectionMetadata } from './Projection.js';

export interface MatrixCell {
  row: string;
  column: string;
  value: number;
  metadata?: Record<string, any>;
}

export class DependencyMatrix extends Projection {
  private matrix: Map<string, MatrixCell> = new Map();
  private rowLabels: Set<string> = new Set();
  private columnLabels: Set<string> = new Set();

  constructor(id: string, metadata: ProjectionMetadata) {
    super(id, metadata);
  }

  /**
   * Set cell value
   */
  setCell(row: string, column: string, value: number, metadata?: Record<string, any>): void {
    const key = `${row}:${column}`;
    this.matrix.set(key, { row, column, value, metadata });
    this.rowLabels.add(row);
    this.columnLabels.add(column);
  }

  /**
   * Get cell value
   */
  getCell(row: string, column: string): MatrixCell | undefined {
    const key = `${row}:${column}`;
    return this.matrix.get(key);
  }

  /**
   * Get row labels
   */
  getRowLabels(): string[] {
    return Array.from(this.rowLabels);
  }

  /**
   * Get column labels
   */
  getColumnLabels(): string[] {
    return Array.from(this.columnLabels);
  }

  /**
   * Get matrix dimensions
   */
  getDimensions(): { rows: number; columns: number } {
    return {
      rows: this.rowLabels.size,
      columns: this.columnLabels.size
    };
  }

  /**
   * Get projection data
   */
  getData(): MatrixCell[] {
    return Array.from(this.matrix.values());
  }

  /**
   * Get projection summary
   */
  getSummary(): Record<string, any> {
    const cells = this.getData();
    const nonZero = cells.filter(c => c.value > 0);

    return {
      dimensions: this.getDimensions(),
      totalCells: cells.length,
      nonZeroCells: nonZero.length,
      sparsity: cells.length > 0 ? 1 - (nonZero.length / cells.length) : 0
    };
  }
}
