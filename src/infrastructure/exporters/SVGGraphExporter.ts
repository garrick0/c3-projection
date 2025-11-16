/**
 * SVGGraphExporter - Exports GraphView to SVG format
 */

import { GraphView } from '../../domain/entities/GraphView.js';
import { Logger } from 'c3-shared';

export interface SVGExportOptions {
  width?: number;
  height?: number;
  padding?: number;
  showLabels?: boolean;
  nodeRadius?: number;
  arrowSize?: number;
}

export class SVGGraphExporter {
  constructor(private logger: Logger) {}

  /**
   * Export GraphView to SVG
   */
  export(graphView: GraphView, options: SVGExportOptions = {}): string {
    this.logger.info('Exporting GraphView to SVG', {
      nodes: graphView.getNodeCount(),
      edges: graphView.getEdgeCount()
    });

    if (!graphView.hasLayout()) {
      throw new Error('GraphView must have layout information (x, y coordinates) before exporting to SVG');
    }

    const bbox = graphView.getBoundingBox()!;
    const padding = options.padding || 20;
    
    // Calculate dimensions
    const graphWidth = bbox.maxX - bbox.minX;
    const graphHeight = bbox.maxY - bbox.minY;
    const svgWidth = options.width || graphWidth + (padding * 2);
    const svgHeight = options.height || graphHeight + (padding * 2);

    // Calculate scale and offset to fit graph in SVG viewport
    const scaleX = (svgWidth - padding * 2) / graphWidth;
    const scaleY = (svgHeight - padding * 2) / graphHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    const offsetX = padding - (bbox.minX * scale);
    const offsetY = padding - (bbox.minY * scale);

    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += '  <defs>\n';
    svg += '    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">\n';
    svg += '      <polygon points="0 0, 10 3, 0 6" fill="#666" />\n';
    svg += '    </marker>\n';
    svg += '  </defs>\n\n';

    // Draw edges first (so they appear behind nodes)
    svg += '  <g class="edges">\n';
    for (const edge of graphView.edges) {
      const fromNode = graphView.getNode(edge.from);
      const toNode = graphView.getNode(edge.to);
      
      if (fromNode && toNode && fromNode.x !== undefined && toNode.x !== undefined) {
        const x1 = fromNode.x * scale + offsetX;
        const y1 = fromNode.y! * scale + offsetY;
        const x2 = toNode.x * scale + offsetX;
        const y2 = toNode.y! * scale + offsetY;

        // Calculate arrow endpoint (stop before node)
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const nodeRadius = (toNode.width || 100) / 2 * scale;
        const arrowX2 = x2 - Math.cos(angle) * nodeRadius;
        const arrowY2 = y2 - Math.sin(angle) * nodeRadius;

        svg += `    <line x1="${x1}" y1="${y1}" x2="${arrowX2}" y2="${arrowY2}" `;
        svg += `stroke="${edge.color || '#999'}" stroke-width="2" marker-end="url(#arrowhead)" />\n`;
      }
    }
    svg += '  </g>\n\n';

    // Draw nodes
    svg += '  <g class="nodes">\n';
    for (const node of graphView.nodes) {
      if (node.x !== undefined && node.y !== undefined) {
        const x = node.x * scale + offsetX;
        const y = node.y! * scale + offsetY;
        const width = (node.width || 100) * scale;
        const height = (node.height || 50) * scale;
        const rectX = x - width / 2;
        const rectY = y - height / 2;

        svg += '    <g>\n';
        svg += `      <rect x="${rectX}" y="${rectY}" width="${width}" height="${height}" `;
        svg += `fill="${node.color || '#4ecdc4'}" stroke="#333" stroke-width="2" rx="5" />\n`;
        
        if (options.showLabels !== false && node.label) {
          const fontSize = Math.max(10, Math.min(14, height / 3));
          svg += `      <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" `;
          svg += `fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">${this.escapeXml(node.label)}</text>\n`;
        }
        
        svg += '    </g>\n';
      }
    }
    svg += '  </g>\n\n';

    svg += '</svg>';

    this.logger.info('SVG export complete', {
      size: svg.length,
      dimensions: `${svgWidth}x${svgHeight}`
    });

    return svg;
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

