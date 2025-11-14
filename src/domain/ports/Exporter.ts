import { Projection } from '../entities/Projection.js';
import { ExportFormat } from '../value-objects/ExportFormat.js';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  metadata?: Record<string, any>;
}

export interface Exporter {
  export(projection: Projection, options: ExportOptions): Promise<string | Buffer>;
  supports(format: ExportFormat): boolean;
}
