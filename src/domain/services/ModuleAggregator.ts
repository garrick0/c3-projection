/**
 * ModuleAggregator - Service for aggregating PropertyGraph nodes into Module entities
 */

import { PropertyGraph, NodeType, type Node } from '@garrick0/c3-parsing';
import { Logger } from '@garrick0/c3-shared';
import { Module, type ModuleMetrics } from '../entities/Module.js';
import { AggregationLevel } from '../value-objects/AggregationLevel.js';
import * as path from 'path';
import { promises as fs } from 'fs';

export interface AggregationConfig {
  level: AggregationLevel;
  includeTests?: boolean;
  excludePatterns?: string[];  // e.g., ['node_modules', 'dist']
}

export class ModuleAggregator {
  constructor(private logger: Logger) {}

  /**
   * Aggregate PropertyGraph nodes into Module entities
   * Works directly with PropertyGraph - no intermediate layer!
   */
  async aggregate(graph: PropertyGraph, rootPath: string, config: AggregationConfig): Promise<Module[]> {
    this.logger.info('Aggregating modules', { level: config.level });

    // Step 1: Get all code files from PropertyGraph
    const codeFiles = graph.getNodes()
      .filter(node => node.type === NodeType.FILE)
      .filter(node => node.isFromDomain('code'))
      .filter(node => this.shouldIncludeFile(node, config));

    this.logger.info(`Found ${codeFiles.length} code files to aggregate`);

    // Step 2: Group files by aggregation level
    const filesByModule = await this.groupFilesByLevel(codeFiles, rootPath, config.level);

    this.logger.info(`Grouped into ${filesByModule.size} modules`);

    // Step 3: Create Module entities
    const modules: Module[] = [];
    for (const [modulePath, files] of filesByModule.entries()) {
      const module = this.createModule(modulePath, files, graph);
      modules.push(module);
    }

    this.logger.info(`Created ${modules.length} modules from ${codeFiles.length} files`);
    return modules;
  }

  /**
   * Group files by aggregation level
   */
  private async groupFilesByLevel(
    files: Node[],
    rootPath: string,
    level: AggregationLevel
  ): Promise<Map<string, Node[]>> {
    const grouped = new Map<string, Node[]>();

    for (const file of files) {
      const modulePath = await this.getModulePathForFile(file, rootPath, level);
      
      if (!grouped.has(modulePath)) {
        grouped.set(modulePath, []);
      }
      grouped.get(modulePath)!.push(file);
    }

    return grouped;
  }

  /**
   * Determine module path for a file based on aggregation level
   */
  private async getModulePathForFile(file: Node, rootPath: string, level: AggregationLevel): Promise<string> {
    const filePath = file.metadata.filePath;

    switch (level) {
      case AggregationLevel.DIRECTORY:
        return path.dirname(filePath);
      
      case AggregationLevel.TOP_LEVEL:
        // Get top two directory levels (e.g., "src/domain/entities/File.ts" → "src/domain")
        const relativePath = path.relative(rootPath, filePath);
        const parts = relativePath.split(path.sep).filter(Boolean);
        // Always take first TWO directory components only
        if (parts.length >= 3) { // At least: dir1/dir2/file
          return path.join(rootPath, parts[0], parts[1]);
        } else if (parts.length >= 2) { // dir1/file
          return path.join(rootPath, parts[0]);
        }
        return rootPath;
      
      case AggregationLevel.PACKAGE:
        // Find nearest package.json or tsconfig.json
        return await this.findNearestPackage(filePath, rootPath);
      
      default:
        return path.dirname(filePath);
    }
  }

  /**
   * Find nearest package.json or tsconfig.json
   */
  private async findNearestPackage(filePath: string, rootPath: string): Promise<string> {
    let currentDir = path.dirname(filePath);

    while (currentDir.startsWith(rootPath)) {
      // Check for package.json
      const packageJsonPath = path.join(currentDir, 'package.json');
      try {
        await fs.access(packageJsonPath);
        return currentDir;
      } catch {
        // Not found, continue
      }

      // Check for tsconfig.json
      const tsconfigPath = path.join(currentDir, 'tsconfig.json');
      try {
        await fs.access(tsconfigPath);
        return currentDir;
      } catch {
        // Not found, continue
      }

      // Move up one directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break; // Reached root
      }
      currentDir = parentDir;
    }

    // Default to directory if no package found
    return path.dirname(filePath);
  }

  /**
   * Create a Module entity from grouped files
   */
  private createModule(modulePath: string, files: Node[], graph: PropertyGraph): Module {
    const fileIds = files.map(f => f.id);
    const metrics = this.calculateMetrics(files);

    return new Module(
      this.generateModuleId(modulePath),
      path.basename(modulePath),
      modulePath,
      fileIds,
      new Set<string>(),  // Dependencies calculated later
      new Set<string>(),  // Dependents calculated later
      metrics
    );
  }

  /**
   * Calculate metrics for a module
   */
  private calculateMetrics(files: Node[]): ModuleMetrics {
    const totalLines = files.reduce((sum, f) => {
      const endLine = f.metadata.endLine || 0;
      const startLine = f.metadata.startLine || 0;
      return sum + (endLine - startLine);
    }, 0);

    return {
      fileCount: files.length,
      totalLines,
      dependencyCount: 0,  // Calculated by ModuleDependencyCalculator
      dependentCount: 0    // Calculated by ModuleDependencyCalculator
    };
  }

  /**
   * Check if file should be included based on config
   */
  private shouldIncludeFile(node: Node, config: AggregationConfig): boolean {
    const filePath = node.metadata.filePath;

    // Exclude patterns
    if (config.excludePatterns) {
      for (const pattern of config.excludePatterns) {
        if (filePath.includes(pattern)) {
          return false;
        }
      }
    }

    // Include/exclude tests
    if (!config.includeTests && node.hasLabel && node.hasLabel('Test')) {
      return false;
    }

    return true;
  }

  /**
   * Generate a unique module ID from path
   */
  private generateModuleId(modulePath: string): string {
    return `module-${modulePath.replace(/[/\\]/g, '-').replace(/^-/, '')}`;
  }
}

