/**
 * GraphMLExporter - Exports GraphView to GraphML XML format
 * Compatible with tools like yEd, Gephi, Cytoscape
 */

import { GraphView } from '../../domain/entities/GraphView.js';
import { Logger } from 'c3-shared';

export interface GraphMLExportOptions {
  includeLayout?: boolean;
  includeMetadata?: boolean;
}

export class GraphMLExporter {
  constructor(private logger: Logger) {}

  /**
   * Export GraphView to GraphML XML
   */
  export(graphView: GraphView, options: GraphMLExportOptions = {}): string {
    this.logger.info('Exporting GraphView to GraphML', {
      nodes: graphView.getNodeCount(),
      edges: graphView.getEdgeCount()
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n';
    xml += '         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n';
    xml += '         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n\n';

    // Define keys (attributes)
    xml += '  <!-- Node attributes -->\n';
    xml += '  <key id="d0" for="node" attr.name="label" attr.type="string"/>\n';
    xml += '  <key id="d1" for="node" attr.name="type" attr.type="string"/>\n';
    xml += '  <key id="d2" for="node" attr.name="color" attr.type="string"/>\n';
    xml += '  <key id="d3" for="node" attr.name="fileCount" attr.type="int"/>\n';
    xml += '  <key id="d4" for="node" attr.name="dependencyCount" attr.type="int"/>\n';

    if (options.includeLayout !== false) {
      xml += '  <key id="d5" for="node" attr.name="x" attr.type="double"/>\n';
      xml += '  <key id="d6" for="node" attr.name="y" attr.type="double"/>\n';
      xml += '  <key id="d7" for="node" attr.name="width" attr.type="double"/>\n';
      xml += '  <key id="d8" for="node" attr.name="height" attr.type="double"/>\n';
    }

    xml += '\n  <!-- Edge attributes -->\n';
    xml += '  <key id="e0" for="edge" attr.name="label" attr.type="string"/>\n';
    xml += '  <key id="e1" for="edge" attr.name="weight" attr.type="double"/>\n\n';

    // Start graph
    xml += '  <graph id="G" edgedefault="directed">\n\n';

    // Add nodes
    for (const node of graphView.nodes) {
      xml += `    <node id="${this.escapeXml(node.id)}">\n`;
      xml += `      <data key="d0">${this.escapeXml(node.label)}</data>\n`;
      xml += `      <data key="d1">${this.escapeXml(node.type)}</data>\n`;
      
      if (node.color) {
        xml += `      <data key="d2">${this.escapeXml(node.color)}</data>\n`;
      }
      
      if (node.metadata.fileCount !== undefined) {
        xml += `      <data key="d3">${node.metadata.fileCount}</data>\n`;
      }
      
      if (node.metadata.dependencyCount !== undefined) {
        xml += `      <data key="d4">${node.metadata.dependencyCount}</data>\n`;
      }

      if (options.includeLayout !== false) {
        if (node.x !== undefined) {
          xml += `      <data key="d5">${node.x}</data>\n`;
        }
        if (node.y !== undefined) {
          xml += `      <data key="d6">${node.y}</data>\n`;
        }
        if (node.width !== undefined) {
          xml += `      <data key="d7">${node.width}</data>\n`;
        }
        if (node.height !== undefined) {
          xml += `      <data key="d8">${node.height}</data>\n`;
        }
      }

      xml += '    </node>\n';
    }

    xml += '\n';

    // Add edges
    for (const edge of graphView.edges) {
      xml += `    <edge source="${this.escapeXml(edge.from)}" target="${this.escapeXml(edge.to)}">\n`;
      
      if (edge.label) {
        xml += `      <data key="e0">${this.escapeXml(edge.label)}</data>\n`;
      }
      
      if (edge.weight !== undefined) {
        xml += `      <data key="e1">${edge.weight}</data>\n`;
      }
      
      xml += '    </edge>\n';
    }

    xml += '\n  </graph>\n';
    xml += '</graphml>\n';

    this.logger.info('GraphML export complete', {
      size: xml.length
    });

    return xml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

