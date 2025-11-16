/**
 * Integration tests for module projection
 */

import { describe, it, expect } from 'vitest';
import { GraphLoader } from '../../src/domain/services/GraphLoader.js';
import { ModuleProjectionStrategy } from '../../src/infrastructure/strategies/ModuleProjectionStrategy.js';
import { TypeScriptExtension } from '@garrick0/c3-parsing';
import { ProjectionType } from '../../src/domain/value-objects/ProjectionType.js';
import { AggregationLevel } from '../../src/domain/value-objects/AggregationLevel.js';
import { ViewConfiguration } from '../../src/domain/value-objects/ViewConfiguration.js';
import { createLogger } from '@garrick0/c3-shared';
import { ModuleProjection } from '../../src/domain/entities/ModuleProjection.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Module Projection Integration', () => {
  const logger = createLogger('integration-test');

  it.skip('should create module projection from c3-projection codebase itself', async () => {
    // This test parses the c3-projection codebase itself
    const rootPath = path.resolve(__dirname, '../..');

    // Create TypeScript extension
    const tsExtension = new TypeScriptExtension({
      tsconfigRootDir: rootPath,
      includePrivateMembers: false,
      excludePatterns: ['node_modules/**', 'dist/**', 'coverage/**', 'tests/**']
    });

    // Load graph
    const graphLoader = new GraphLoader(logger, {
      extensions: [tsExtension],
      cacheEnabled: false
    });

    const graph = await graphLoader.loadGraph(rootPath);

    expect(graph.getNodeCount()).toBeGreaterThan(0);
    expect(graph.getEdgeCount()).toBeGreaterThan(0);

    logger.info('Graph loaded', {
      nodes: graph.getNodeCount(),
      edges: graph.getEdgeCount()
    });

    // Create module projection
    const strategy = new ModuleProjectionStrategy(logger, rootPath);

    const config = ViewConfiguration.create({
      projectionType: ProjectionType.MODULE,
      aggregationLevel: AggregationLevel.TOP_LEVEL,
      options: {
        includeTests: false,
        excludePatterns: ['node_modules', 'dist', 'coverage', 'tests']
      }
    });

    const projection = await strategy.project(graph, config);

    expect(projection).toBeInstanceOf(ModuleProjection);

    const moduleProjection = projection as ModuleProjection;
    const modules = moduleProjection.getModules();

    logger.info('Module projection created', {
      modules: modules.length,
      summary: moduleProjection.getSummary()
    });

    // Assertions
    expect(modules.length).toBeGreaterThan(0);
    
    // Should have domain, application, and infrastructure modules
    const domainModule = modules.find(m => m.path.includes('domain'));
    const appModule = modules.find(m => m.path.includes('application'));
    const infraModule = modules.find(m => m.path.includes('infrastructure'));

    expect(domainModule).toBeDefined();
    expect(appModule).toBeDefined();
    expect(infraModule).toBeDefined();

    // Check metrics
    const metrics = moduleProjection.getMetrics();
    expect(metrics.totalModules).toBe(modules.length);
    expect(metrics.totalFiles).toBeGreaterThan(0);
    expect(metrics.totalDependencies).toBeGreaterThan(0);

    // Check that some modules have dependencies
    const modulesWithDeps = moduleProjection.getModulesWithDependencies();
    expect(modulesWithDeps.length).toBeGreaterThan(0);

    // Log some details
    modules.forEach(module => {
      logger.info(`Module: ${module.name}`, {
        files: module.files.length,
        dependencies: module.getDependencyCount(),
        dependents: module.getDependentCount()
      });
    });

    // Check for cycles
    const cycles = moduleProjection.getCycles();
    logger.info(`Detected ${cycles.length} circular dependencies`);

    // Cleanup
    await tsExtension.dispose();
  }, 30000); // 30 second timeout for integration test

  it('should create module projection from small synthetic graph', async () => {
    // For a faster test, we can create a synthetic PropertyGraph
    const { PropertyGraph, Node, Edge, NodeType, EdgeType, NodeMetadata, SourceMetadata } = await import('@garrick0/c3-parsing');

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

    // Create a small module structure
    // domain: FileA.ts, FileB.ts
    // application: FileC.ts (imports domain)
    // infrastructure: FileD.ts (imports domain)

    graph.addNode(new Node(
      'file-domain-A',
      NodeType.FILE,
      'FileA.ts',
      { filePath: '/test/src/domain/FileA.ts', startLine: 1, endLine: 50 } as NodeMetadata,
      new Set(['CodeElement', 'File']),
      sourceMetadata
    ));

    graph.addNode(new Node(
      'file-domain-B',
      NodeType.FILE,
      'FileB.ts',
      { filePath: '/test/src/domain/FileB.ts', startLine: 1, endLine: 60 } as NodeMetadata,
      new Set(['CodeElement', 'File']),
      sourceMetadata
    ));

    graph.addNode(new Node(
      'file-app-C',
      NodeType.FILE,
      'FileC.ts',
      { filePath: '/test/src/application/FileC.ts', startLine: 1, endLine: 40 } as NodeMetadata,
      new Set(['CodeElement', 'File']),
      sourceMetadata
    ));

    graph.addNode(new Node(
      'file-infra-D',
      NodeType.FILE,
      'FileD.ts',
      { filePath: '/test/src/infrastructure/FileD.ts', startLine: 1, endLine: 70 } as NodeMetadata,
      new Set(['CodeElement', 'File']),
      sourceMetadata
    ));

    // Add import edges
    graph.addEdge(new Edge('edge1', EdgeType.IMPORTS, 'file-app-C', 'file-domain-A', {}, sourceMetadata));
    graph.addEdge(new Edge('edge2', EdgeType.IMPORTS, 'file-app-C', 'file-domain-B', {}, sourceMetadata));
    graph.addEdge(new Edge('edge3', EdgeType.IMPORTS, 'file-infra-D', 'file-domain-A', {}, sourceMetadata));

    // Create module projection
    const strategy = new ModuleProjectionStrategy(logger, '/test/src');

    const config = ViewConfiguration.create({
      projectionType: ProjectionType.MODULE,
      aggregationLevel: AggregationLevel.DIRECTORY
    });

    const projection = await strategy.project(graph, config);

    expect(projection).toBeInstanceOf(ModuleProjection);

    const moduleProjection = projection as ModuleProjection;
    const modules = moduleProjection.getModules();

    // Should have 3 modules (domain, application, infrastructure)
    expect(modules).toHaveLength(3);

    const domainModule = modules.find(m => m.path.includes('domain'));
    const appModule = modules.find(m => m.path.includes('application'));
    const infraModule = modules.find(m => m.path.includes('infrastructure'));

    expect(domainModule).toBeDefined();
    expect(appModule).toBeDefined();
    expect(infraModule).toBeDefined();

    // Check files in modules
    expect(domainModule!.files).toHaveLength(2);
    expect(appModule!.files).toHaveLength(1);
    expect(infraModule!.files).toHaveLength(1);

    // Check dependencies
    expect(appModule!.getDependencyCount()).toBe(1);
    expect(appModule!.hasDependency(domainModule!.id)).toBe(true);

    expect(infraModule!.getDependencyCount()).toBe(1);
    expect(infraModule!.hasDependency(domainModule!.id)).toBe(true);

    expect(domainModule!.getDependentCount()).toBe(2);

    // Check metrics
    const metrics = moduleProjection.getMetrics();
    expect(metrics.totalModules).toBe(3);
    expect(metrics.totalFiles).toBe(4);
    expect(metrics.totalDependencies).toBe(2); // app->domain, infra->domain

    // No cycles in this structure
    expect(moduleProjection.getCycles()).toHaveLength(0);

    // Root modules (no one depends on them)
    const rootModules = moduleProjection.getRootModules();
    expect(rootModules).toHaveLength(2); // app and infra

    // Leaf modules (don't depend on anything)
    const leafModules = moduleProjection.getLeafModules();
    expect(leafModules).toHaveLength(1); // domain
  });
});

