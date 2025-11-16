/**
 * ModuleDependencyCalculator Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PropertyGraph, NodeType, EdgeType, Node, Edge } from '@garrick0/c3-parsing';
import { Logger, LogLevel } from '@garrick0/c3-shared';
import { ModuleDependencyCalculator } from '../../src/domain/services/ModuleDependencyCalculator.js';
import { Module } from '../../src/domain/entities/Module.js';

describe('ModuleDependencyCalculator', () => {
  let calculator: ModuleDependencyCalculator;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('test', LogLevel.ERROR);
    calculator = new ModuleDependencyCalculator(logger);
  });

  describe('calculate()', () => {
    it('should detect dependencies between modules', () => {
      // Create graph with file nodes
      const graph = new PropertyGraph('test-graph');
      const file1 = new Node('file-1', NodeType.FILE, new Set(['File']), {
        filePath: '/src/services/UserService.ts'
      });
      const file2 = new Node('file-2', NodeType.FILE, new Set(['File']), {
        filePath: '/src/data/DataStore.ts'
      });
      
      graph.addNode(file1);
      graph.addNode(file2);

      // Add import edge
      const importEdge = new Edge('edge-1', EdgeType.IMPORTS, 'file-1', 'file-2');
      graph.addEdge(importEdge);

      // Create modules
      const moduleA = new Module(
        'mod-services',
        'services',
        '/src/services',
        ['file-1'],
        new Set(),
        new Set(),
        { fileCount: 1, totalLines: 0, dependencyCount: 0, dependentCount: 0 }
      );

      const moduleB = new Module(
        'mod-data',
        'data',
        '/src/data',
        ['file-2'],
        new Set(),
        new Set(),
        { fileCount: 1, totalLines: 0, dependencyCount: 0, dependentCount: 0 }
      );

      // Calculate dependencies
      calculator.calculate([moduleA, moduleB], graph);

      // Assert
      expect(moduleA.getDependencyCount()).toBe(1);
      expect(moduleA.getDependencies()).toContain('mod-data');
      expect(moduleB.getDependentCount()).toBe(1);
      expect(moduleB.getDependents()).toContain('mod-services');
    });

    it('should ignore same-module dependencies', () => {
      const graph = new PropertyGraph('test-graph');
      const file1 = new Node('file-1', NodeType.FILE, new Set(['File']), {
        filePath: '/src/services/UserService.ts'
      });
      const file2 = new Node('file-2', NodeType.FILE, new Set(['File']), {
        filePath: '/src/services/AuthService.ts'
      });

      graph.addNode(file1);
      graph.addNode(file2);

      // Both files in same module
      const edge = new Edge('edge-1', EdgeType.IMPORTS, 'file-1', 'file-2');
      graph.addEdge(edge);

      const module = new Module(
        'mod-services',
        'services',
        '/src/services',
        ['file-1', 'file-2'],
        new Set(),
        new Set(),
        { fileCount: 2, totalLines: 0, dependencyCount: 0, dependentCount: 0 }
      );

      calculator.calculate([module], graph);

      // No cross-module dependencies
      expect(module.getDependencyCount()).toBe(0);
    });

    it('should handle external dependencies gracefully', () => {
      const graph = new PropertyGraph('test-graph');
      const file1 = new Node('file-1', NodeType.FILE, new Set(['File']), {
        filePath: '/src/index.ts'
      });
      
      graph.addNode(file1);

      // Import to external module (not in graph)
      const edge = new Edge('edge-1', EdgeType.IMPORTS, 'file-1', 'external-module');
      graph.addEdge(edge);

      const module = new Module(
        'mod-src',
        'src',
        '/src',
        ['file-1'],
        new Set(),
        new Set(),
        { fileCount: 1, totalLines: 0, dependencyCount: 0, dependentCount: 0 }
      );

      // Should not throw
      expect(() => calculator.calculate([module], graph)).not.toThrow();
      expect(module.getDependencyCount()).toBe(0);
    });

    it('should update module metrics', () => {
      const graph = new PropertyGraph('test-graph');
      const file1 = new Node('file-1', NodeType.FILE, new Set(['File']), {
        filePath: '/src/a.ts'
      });
      const file2 = new Node('file-2', NodeType.FILE, new Set(['File']), {
        filePath: '/src/b.ts'
      });

      graph.addNode(file1);
      graph.addNode(file2);

      const edge = new Edge('edge-1', EdgeType.IMPORTS, 'file-1', 'file-2');
      graph.addEdge(edge);

      const moduleA = new Module(
        'mod-a',
        'a',
        '/src/a',
        ['file-1'],
        new Set(),
        new Set(),
        { fileCount: 1, totalLines: 0, dependencyCount: 0, dependentCount: 0 }
      );

      const moduleB = new Module(
        'mod-b',
        'b',
        '/src/b',
        ['file-2'],
        new Set(),
        new Set(),
        { fileCount: 1, totalLines: 0, dependencyCount: 0, dependentCount: 0 }
      );

      calculator.calculate([moduleA, moduleB], graph);

      // Metrics should be updated
      expect(moduleA.metrics.dependencyCount).toBe(1);
      expect(moduleB.metrics.dependentCount).toBe(1);
    });
  });

  describe('getTransitiveDependencies()', () => {
    it('should calculate transitive dependencies', () => {
      // A -> B -> C
      const moduleA = new Module('mod-a', 'a', '/a', [], new Set(['mod-b']), new Set(), {
        fileCount: 0, totalLines: 0, dependencyCount: 1, dependentCount: 0
      });
      const moduleB = new Module('mod-b', 'b', '/b', [], new Set(['mod-c']), new Set(), {
        fileCount: 0, totalLines: 0, dependencyCount: 1, dependentCount: 0
      });
      const moduleC = new Module('mod-c', 'c', '/c', [], new Set(), new Set(), {
        fileCount: 0, totalLines: 0, dependencyCount: 0, dependentCount: 0
      });

      const transitive = calculator.getTransitiveDependencies('mod-a', [moduleA, moduleB, moduleC]);

      expect(transitive.has('mod-b')).toBe(true);
      expect(transitive.has('mod-c')).toBe(true);
      expect(transitive.size).toBe(2);
    });

    it('should handle circular dependencies', () => {
      // A -> B -> A
      const moduleA = new Module('mod-a', 'a', '/a', [], new Set(['mod-b']), new Set(), {
        fileCount: 0, totalLines: 0, dependencyCount: 1, dependentCount: 0
      });
      const moduleB = new Module('mod-b', 'b', '/b', [], new Set(['mod-a']), new Set(), {
        fileCount: 0, totalLines: 0, dependencyCount: 1, dependentCount: 0
      });

      // Should not infinite loop
      const transitive = calculator.getTransitiveDependencies('mod-a', [moduleA, moduleB]);

      expect(transitive.has('mod-b')).toBe(true);
      expect(transitive.has('mod-a')).toBe(true);
    });
  });
});
