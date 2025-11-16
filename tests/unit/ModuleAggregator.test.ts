/**
 * Tests for ModuleAggregator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModuleAggregator, type AggregationConfig } from '../../src/domain/services/ModuleAggregator.js';
import { PropertyGraph } from 'c3-parsing';
import { Node, NodeType, NodeMetadata, SourceMetadata } from 'c3-parsing';
import { AggregationLevel } from '../../src/domain/value-objects/AggregationLevel.js';
import { createLogger } from 'c3-shared';

describe('ModuleAggregator', () => {
  let aggregator: ModuleAggregator;
  const logger = createLogger('test');

  beforeEach(() => {
    aggregator = new ModuleAggregator(logger);
  });

  describe('aggregate', () => {
    it('should group files by directory', async () => {
      // Create test graph
      const graph = new PropertyGraph('test-graph', {
        codebaseId: 'test',
        parsedAt: new Date(),
        language: 'typescript',
        version: '1.0.0'
      });

      const sourceMetadata: SourceMetadata = {
        domain: 'code',
        extension: 'typescript',
        version: '1.0.0'
      };

      // Add nodes
      graph.addNode(new Node(
        'file1',
        NodeType.FILE,
        'FileA.ts',
        { filePath: '/test/src/domain/FileA.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      graph.addNode(new Node(
        'file2',
        NodeType.FILE,
        'FileB.ts',
        { filePath: '/test/src/domain/FileB.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      graph.addNode(new Node(
        'file3',
        NodeType.FILE,
        'FileC.ts',
        { filePath: '/test/src/infrastructure/FileC.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      // Aggregate
      const config: AggregationConfig = {
        level: AggregationLevel.DIRECTORY,
        includeTests: true,
        excludePatterns: []
      };

      const modules = await aggregator.aggregate(graph, '/test', config);

      // Assertions
      expect(modules).toHaveLength(2);
      
      const domainModule = modules.find(m => m.path.includes('domain'));
      const infraModule = modules.find(m => m.path.includes('infrastructure'));

      expect(domainModule).toBeDefined();
      expect(domainModule!.files).toHaveLength(2);
      expect(domainModule!.metrics.fileCount).toBe(2);

      expect(infraModule).toBeDefined();
      expect(infraModule!.files).toHaveLength(1);
      expect(infraModule!.metrics.fileCount).toBe(1);
    });

    it('should exclude files based on patterns', async () => {
      const graph = new PropertyGraph('test-graph', {
        codebaseId: 'test',
        parsedAt: new Date(),
        language: 'typescript',
        version: '1.0.0'
      });

      const sourceMetadata: SourceMetadata = {
        domain: 'code',
        extension: 'typescript',
        version: '1.0.0'
      };

      // Add nodes (including one in node_modules)
      graph.addNode(new Node(
        'file1',
        NodeType.FILE,
        'FileA.ts',
        { filePath: '/test/src/FileA.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      graph.addNode(new Node(
        'file2',
        NodeType.FILE,
        'SomeLib.ts',
        { filePath: '/test/node_modules/lib/SomeLib.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      const config: AggregationConfig = {
        level: AggregationLevel.DIRECTORY,
        excludePatterns: ['node_modules']
      };

      const modules = await aggregator.aggregate(graph, '/test', config);

      // Should only have one module (src), node_modules excluded
      expect(modules.length).toBeGreaterThan(0);
      const allFiles = modules.flatMap(m => m.files);
      expect(allFiles).not.toContain('file2');
    });

    it('should aggregate to top-level directories', async () => {
      const graph = new PropertyGraph('test-graph', {
        codebaseId: 'test',
        parsedAt: new Date(),
        language: 'typescript',
        version: '1.0.0'
      });

      const sourceMetadata: SourceMetadata = {
        domain: 'code',
        extension: 'typescript',
        version: '1.0.0'
      };

      // Add nodes in nested directories
      graph.addNode(new Node(
        'file1',
        NodeType.FILE,
        'FileA.ts',
        { filePath: '/test/src/domain/entities/FileA.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      graph.addNode(new Node(
        'file2',
        NodeType.FILE,
        'FileB.ts',
        { filePath: '/test/src/domain/services/FileB.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      graph.addNode(new Node(
        'file3',
        NodeType.FILE,
        'FileC.ts',
        { filePath: '/test/src/application/FileC.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      const config: AggregationConfig = {
        level: AggregationLevel.TOP_LEVEL
      };

      const modules = await aggregator.aggregate(graph, '/test', config);

      // Should have 2 top-level modules (src/domain, src/application)
      expect(modules).toHaveLength(2);
      
      const domainModule = modules.find(m => m.path.includes('domain'));
      const appModule = modules.find(m => m.path.includes('application'));

      expect(domainModule).toBeDefined();
      expect(domainModule!.files).toHaveLength(2);

      expect(appModule).toBeDefined();
      expect(appModule!.files).toHaveLength(1);
    });

    it('should calculate metrics correctly', async () => {
      const graph = new PropertyGraph('test-graph', {
        codebaseId: 'test',
        parsedAt: new Date(),
        language: 'typescript',
        version: '1.0.0'
      });

      const sourceMetadata: SourceMetadata = {
        domain: 'code',
        extension: 'typescript',
        version: '1.0.0'
      };

      graph.addNode(new Node(
        'file1',
        NodeType.FILE,
        'FileA.ts',
        { filePath: '/test/src/FileA.ts', startLine: 1, endLine: 100 } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      graph.addNode(new Node(
        'file2',
        NodeType.FILE,
        'FileB.ts',
        { filePath: '/test/src/FileB.ts', startLine: 1, endLine: 50 } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      const config: AggregationConfig = {
        level: AggregationLevel.DIRECTORY
      };

      const modules = await aggregator.aggregate(graph, '/test', config);

      expect(modules).toHaveLength(1);
      const module = modules[0];
      expect(module.metrics.fileCount).toBe(2);
      expect(module.metrics.totalLines).toBe(148); // (100-1) + (50-1) = 99 + 49
    });
  });
});

