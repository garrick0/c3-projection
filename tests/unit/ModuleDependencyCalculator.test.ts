/**
 * Tests for ModuleDependencyCalculator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModuleDependencyCalculator } from '../../src/domain/services/ModuleDependencyCalculator.js';
import { Module, type ModuleMetrics } from '../../src/domain/entities/Module.js';
import { PropertyGraph, Node, Edge, NodeType, EdgeType, NodeMetadata, SourceMetadata } from 'c3-parsing';
import { createLogger } from 'c3-shared';

describe('ModuleDependencyCalculator', () => {
  let calculator: ModuleDependencyCalculator;
  const logger = createLogger('test');

  beforeEach(() => {
    calculator = new ModuleDependencyCalculator(logger);
  });

  describe('calculate', () => {
    it('should calculate module dependencies from import edges', () => {
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
        { filePath: '/test/src/application/FileB.ts' } as NodeMetadata,
        new Set(['CodeElement', 'File']),
        sourceMetadata
      ));

      // Add import edge: file2 imports file1
      graph.addEdge(new Edge(
        'edge1',
        EdgeType.IMPORTS,
        'file2',
        'file1',
        {},
        sourceMetadata
      ));

      // Create modules
      const metrics: ModuleMetrics = {
        fileCount: 1,
        totalLines: 100,
        dependencyCount: 0,
        dependentCount: 0
      };

      const moduleDomain = new Module(
        'module-domain',
        'domain',
        '/test/src/domain',
        ['file1'],
        new Set(),
        new Set(),
        { ...metrics }
      );

      const moduleApp = new Module(
        'module-app',
        'application',
        '/test/src/application',
        ['file2'],
        new Set(),
        new Set(),
        { ...metrics }
      );

      const modules = [moduleDomain, moduleApp];

      // Calculate dependencies
      calculator.calculate(modules, graph);

      // Assertions
      expect(moduleApp.getDependencyCount()).toBe(1);
      expect(moduleApp.hasDependency('module-domain')).toBe(true);

      expect(moduleDomain.getDependentCount()).toBe(1);
      expect(moduleDomain.hasDependent('module-app')).toBe(true);

      // Metrics should be updated
      expect(moduleApp.metrics.dependencyCount).toBe(1);
      expect(moduleDomain.metrics.dependentCount).toBe(1);
    });

    it('should skip self-dependencies', () => {
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

      // Add nodes in same module
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

      // Add import edge between files in same module
      graph.addEdge(new Edge(
        'edge1',
        EdgeType.IMPORTS,
        'file1',
        'file2',
        {},
        sourceMetadata
      ));

      const metrics: ModuleMetrics = {
        fileCount: 2,
        totalLines: 200,
        dependencyCount: 0,
        dependentCount: 0
      };

      const moduleDomain = new Module(
        'module-domain',
        'domain',
        '/test/src/domain',
        ['file1', 'file2'],
        new Set(),
        new Set(),
        { ...metrics }
      );

      const modules = [moduleDomain];

      // Calculate dependencies
      calculator.calculate(modules, graph);

      // Should not have self-dependency
      expect(moduleDomain.getDependencyCount()).toBe(0);
      expect(moduleDomain.getDependentCount()).toBe(0);
    });

    it('should handle multiple dependencies between modules', () => {
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

      // Module A: file1, file2
      graph.addNode(new Node('file1', NodeType.FILE, 'FileA1.ts', { filePath: '/test/A/FileA1.ts' } as NodeMetadata, new Set(['CodeElement', 'File']), sourceMetadata));
      graph.addNode(new Node('file2', NodeType.FILE, 'FileA2.ts', { filePath: '/test/A/FileA2.ts' } as NodeMetadata, new Set(['CodeElement', 'File']), sourceMetadata));

      // Module B: file3, file4
      graph.addNode(new Node('file3', NodeType.FILE, 'FileB1.ts', { filePath: '/test/B/FileB1.ts' } as NodeMetadata, new Set(['CodeElement', 'File']), sourceMetadata));
      graph.addNode(new Node('file4', NodeType.FILE, 'FileB2.ts', { filePath: '/test/B/FileB2.ts' } as NodeMetadata, new Set(['CodeElement', 'File']), sourceMetadata));

      // Multiple imports from B to A
      graph.addEdge(new Edge('edge1', EdgeType.IMPORTS, 'file3', 'file1', {}, sourceMetadata));
      graph.addEdge(new Edge('edge2', EdgeType.IMPORTS, 'file4', 'file2', {}, sourceMetadata));

      const metrics: ModuleMetrics = {
        fileCount: 2,
        totalLines: 200,
        dependencyCount: 0,
        dependentCount: 0
      };

      const moduleA = new Module('module-A', 'A', '/test/A', ['file1', 'file2'], new Set(), new Set(), { ...metrics });
      const moduleB = new Module('module-B', 'B', '/test/B', ['file3', 'file4'], new Set(), new Set(), { ...metrics });

      const modules = [moduleA, moduleB];

      calculator.calculate(modules, graph);

      // Module B should depend on A (only once, even with multiple import edges)
      expect(moduleB.getDependencyCount()).toBe(1);
      expect(moduleB.hasDependency('module-A')).toBe(true);

      expect(moduleA.getDependentCount()).toBe(1);
      expect(moduleA.hasDependent('module-B')).toBe(true);
    });
  });

  describe('getTransitiveDependencies', () => {
    it('should calculate transitive dependencies', () => {
      const metrics: ModuleMetrics = {
        fileCount: 1,
        totalLines: 100,
        dependencyCount: 0,
        dependentCount: 0
      };

      // Create chain: A -> B -> C
      const moduleA = new Module('A', 'A', '/A', ['fileA'], new Set(['B']), new Set(), { ...metrics });
      const moduleB = new Module('B', 'B', '/B', ['fileB'], new Set(['C']), new Set(['A']), { ...metrics });
      const moduleC = new Module('C', 'C', '/C', ['fileC'], new Set(), new Set(['B']), { ...metrics });

      const modules = [moduleA, moduleB, moduleC];

      const transitive = calculator.getTransitiveDependencies('A', modules);

      // A transitively depends on both B and C
      expect(transitive.size).toBe(2);
      expect(transitive.has('B')).toBe(true);
      expect(transitive.has('C')).toBe(true);
    });
  });

  describe('getTransitiveDependents', () => {
    it('should calculate transitive dependents', () => {
      const metrics: ModuleMetrics = {
        fileCount: 1,
        totalLines: 100,
        dependencyCount: 0,
        dependentCount: 0
      };

      // Create chain: A -> B -> C
      const moduleA = new Module('A', 'A', '/A', ['fileA'], new Set(['B']), new Set(), { ...metrics });
      const moduleB = new Module('B', 'B', '/B', ['fileB'], new Set(['C']), new Set(['A']), { ...metrics });
      const moduleC = new Module('C', 'C', '/C', ['fileC'], new Set(), new Set(['B']), { ...metrics });

      const modules = [moduleA, moduleB, moduleC];

      const transitive = calculator.getTransitiveDependents('C', modules);

      // C has transitive dependents A and B
      expect(transitive.size).toBe(2);
      expect(transitive.has('A')).toBe(true);
      expect(transitive.has('B')).toBe(true);
    });
  });
});

