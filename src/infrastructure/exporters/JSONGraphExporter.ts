/**
 * JSONGraphExporter - Exports GraphView to JSON format
 */

import { GraphView } from '../../domain/entities/GraphView.js';
import { Logger } from '@garrick0/c3-shared';

export interface JSONExportOptions {
  pretty?: boolean;
  includeMetadata?: boolean;
}

export class JSONGraphExporter {
  constructor(private logger: Logger) {}

  /**
   * Export GraphView to JSON
   */
  export(graphView: GraphView, options: JSONExportOptions = {}): string {
    this.logger.info('Exporting GraphView to JSON', {
      nodes: graphView.getNodeCount(),
      edges: graphView.getEdgeCount(),
      pretty: options.pretty
    });

    const output: any = {
      nodes: graphView.nodes,
      edges: graphView.edges
    };

    if (options.includeMetadata !== false) {
      output.metadata = graphView.metadata;
    }

    const json = options.pretty 
      ? JSON.stringify(output, null, 2)
      : JSON.stringify(output);

    this.logger.info('JSON export complete', {
      size: json.length
    });

    return json;
  }

  /**
   * Export to JSON file-compatible format with proper structure
   */
  exportForFile(graphView: GraphView, options: JSONExportOptions = {}): string {
    const output = {
      version: '1.0.0',
      type: 'module-dependency-graph',
      generatedAt: new Date().toISOString(),
      graph: {
        nodes: graphView.nodes,
        edges: graphView.edges
      }
    };

    if (options.includeMetadata !== false) {
      (output as any).metadata = graphView.metadata;
    }

    return options.pretty 
      ? JSON.stringify(output, null, 2)
      : JSON.stringify(output);
  }
}

