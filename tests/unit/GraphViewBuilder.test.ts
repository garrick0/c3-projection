/**
 * Tests for GraphViewBuilder
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GraphViewBuilder, type GraphViewConfig } from '../../src/domain/services/GraphViewBuilder.js';
import { ModuleProjection, type ModuleProjectionMetadata } from '../../src/domain/entities/ModuleProjection.js';
import { Module, type ModuleMetrics } from '../../src/domain/entities/Module.js';
import { ProjectionType } from '../../src/domain/value-objects/ProjectionType.js';
import { AggregationLevel } from '../../src/domain/value-objects/AggregationLevel.js';
import { createLogger } from '@garrick0/c3-shared';

describe('GraphViewBuilder', () => {
  let builder: GraphViewBuilder;
  const logger = createLogger('test');

  beforeEach(() => {
    builder = new GraphViewBuilder(logger);
  });

  describe('build', () => {
    it('should convert ModuleProjection to GraphView', () => {
      // Create test modules
      const metrics: ModuleMetrics = {
        fileCount: 5,
        totalLines: 500,
        dependencyCount: 0,
        dependentCount: 0
      };

      const moduleA = new Module(
        'module-A',
        'ModuleA',
        '/test/A',
        ['file1', 'file2'],
        new Set(['module-B']),
        new Set(),
        { ...metrics, dependencyCount: 1 }
      );

      const moduleB = new Module(
        'module-B',
        'ModuleB',
        '/test/B',
        ['file3'],
        new Set(),
        new Set(['module-A']),
        { ...metrics, fileCount: 1, dependentCount: 1 }
      );

      // Create projection
      const metadata: ModuleProjectionMetadata = {
        sourceGraphId: 'test-graph',
        createdAt: new Date(),
        projectionType: ProjectionType.MODULE,
        configuration: {},
        rootPath: '/test',
        aggregationLevel: AggregationLevel.DIRECTORY,
        generatedAt: new Date(),
        totalFiles: 3,
        totalDependencies: 1
      };

      const projection = new ModuleProjection('proj-1', metadata, [moduleA, moduleB]);

      // Build GraphView
      const view = builder.build(projection);

      // Assertions
      expect(view.getNodeCount()).toBe(2);
      expect(view.getEdgeCount()).toBe(1);

      // Check nodes
      const nodeA = view.getNode('module-A');
      const nodeB = view.getNode('module-B');

      expect(nodeA).toBeDefined();
      expect(nodeA!.label).toBe('ModuleA');
      expect(nodeA!.type).toBe('module');
      expect(nodeA!.metadata.fileCount).toBe(5);
      expect(nodeA!.metadata.dependencyCount).toBe(1);

      expect(nodeB).toBeDefined();
      expect(nodeB!.label).toBe('ModuleB');
      expect(nodeB!.metadata.dependentCount).toBe(1);

      // Check edges
      const edges = view.getEdges();
      expect(edges).toHaveLength(1);
      expect(edges[0].from).toBe('module-A');
      expect(edges[0].to).toBe('module-B');
    });

    it('should apply color scheme based on config', () => {
      const metrics: ModuleMetrics = {
        fileCount: 100,
        totalLines: 1000,
        dependencyCount: 0,
        dependentCount: 0
      };

      const module = new Module(
        'module-large',
        'LargeModule',
        '/test/large',
        [],
        new Set(),
        new Set(),
        metrics
      );

      const metadata: ModuleProjectionMetadata = {
        sourceGraphId: 'test-graph',
        createdAt: new Date(),
        projectionType: ProjectionType.MODULE,
        configuration: {},
        rootPath: '/test',
        aggregationLevel: AggregationLevel.DIRECTORY,
        generatedAt: new Date(),
        totalFiles: 0,
        totalDependencies: 0
      };

      const projection = new ModuleProjection('proj-1', metadata, [module]);

      // Test complexity color scheme
      const viewComplexity = builder.build(projection, { colorScheme: 'complexity' });
      const nodeComplexity = viewComplexity.getNode('module-large');
      expect(nodeComplexity!.color).toBe('#ff6b6b'); // High file count -> red

      // Test default color scheme
      const viewDefault = builder.build(projection, { colorScheme: 'default' });
      const nodeDefault = viewDefault.getNode('module-large');
      expect(nodeDefault!.color).toBe('#4ecdc4'); // Default color
    });

    it('should handle empty projections', () => {
      const metadata: ModuleProjectionMetadata = {
        sourceGraphId: 'test-graph',
        createdAt: new Date(),
        projectionType: ProjectionType.MODULE,
        configuration: {},
        rootPath: '/test',
        aggregationLevel: AggregationLevel.DIRECTORY,
        generatedAt: new Date(),
        totalFiles: 0,
        totalDependencies: 0
      };

      const projection = new ModuleProjection('proj-1', metadata, []);

      const view = builder.build(projection);

      expect(view.getNodeCount()).toBe(0);
      expect(view.getEdgeCount()).toBe(0);
    });

    it('should apply proportional node sizing', () => {
      const smallMetrics: ModuleMetrics = {
        fileCount: 2,
        totalLines: 100,
        dependencyCount: 0,
        dependentCount: 0
      };

      const largeMetrics: ModuleMetrics = {
        fileCount: 50,
        totalLines: 5000,
        dependencyCount: 0,
        dependentCount: 0
      };

      const smallModule = new Module('module-small', 'Small', '/test/small', [], new Set(), new Set(), smallMetrics);
      const largeModule = new Module('module-large', 'Large', '/test/large', [], new Set(), new Set(), largeMetrics);

      const metadata: ModuleProjectionMetadata = {
        sourceGraphId: 'test-graph',
        createdAt: new Date(),
        projectionType: ProjectionType.MODULE,
        configuration: {},
        rootPath: '/test',
        aggregationLevel: AggregationLevel.DIRECTORY,
        generatedAt: new Date(),
        totalFiles: 0,
        totalDependencies: 0
      };

      const projection = new ModuleProjection('proj-1', metadata, [smallModule, largeModule]);

      const view = builder.build(projection, { nodeSize: 'proportional' });

      const smallNode = view.getNode('module-small');
      const largeNode = view.getNode('module-large');

      expect(smallNode!.width).toBeLessThan(largeNode!.width!);
      expect(smallNode!.height).toBeLessThan(largeNode!.height!);
    });
  });
});

