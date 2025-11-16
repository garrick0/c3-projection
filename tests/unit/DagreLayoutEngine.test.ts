/**
 * Tests for DagreLayoutEngine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DagreLayoutEngine, type DagreLayoutConfig } from '../../src/infrastructure/layout-engines/DagreLayoutEngine.js';
import { GraphView, type GraphViewNode, type GraphViewEdge, type GraphViewMetadata } from '../../src/domain/entities/GraphView.js';
import { createLogger } from '@garrick0/c3-shared';

describe('DagreLayoutEngine', () => {
  let engine: DagreLayoutEngine;
  const logger = createLogger('test');

  beforeEach(() => {
    engine = new DagreLayoutEngine({}, logger);
  });

  describe('layout', () => {
    it('should assign x, y coordinates to nodes', async () => {
      // Create graph view without layout
      const nodes: GraphViewNode[] = [
        { id: 'A', label: 'Node A', type: 'module', width: 100, height: 50, metadata: {} },
        { id: 'B', label: 'Node B', type: 'module', width: 100, height: 50, metadata: {} },
        { id: 'C', label: 'Node C', type: 'module', width: 100, height: 50, metadata: {} }
      ];

      const edges: GraphViewEdge[] = [
        { id: 'A-B', from: 'A', to: 'B', metadata: {} },
        { id: 'B-C', from: 'B', to: 'C', metadata: {} }
      ];

      const metadata: GraphViewMetadata = {
        projectionType: 'module-dependency',
        generatedAt: new Date()
      };

      const view = new GraphView('view-1', nodes, edges, metadata);

      // Apply layout
      const layoutedView = await engine.layout(view);

      // Check that all nodes have coordinates
      for (const node of layoutedView.nodes) {
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
      }

      // Check that layout was recorded in metadata
      expect(layoutedView.metadata.layout).toBe('dagre');
      expect(layoutedView.metadata.layoutConfig).toBeDefined();

      // Check bounding box exists
      const bbox = layoutedView.getBoundingBox();
      expect(bbox).toBeDefined();
      expect(bbox!.minX).toBeDefined();
      expect(bbox!.maxX).toBeDefined();
      expect(bbox!.minY).toBeDefined();
      expect(bbox!.maxY).toBeDefined();
    });

    it('should respect layout configuration', async () => {
      const nodes: GraphViewNode[] = [
        { id: 'A', label: 'A', type: 'module', metadata: {} },
        { id: 'B', label: 'B', type: 'module', metadata: {} }
      ];

      const edges: GraphViewEdge[] = [
        { id: 'A-B', from: 'A', to: 'B', metadata: {} }
      ];

      const metadata: GraphViewMetadata = {
        projectionType: 'test',
        generatedAt: new Date()
      };

      const view = new GraphView('view-1', nodes, edges, metadata);

      // Test Top-to-Bottom layout
      const engineTB = new DagreLayoutEngine({ rankdir: 'TB' }, logger);
      const viewTB = await engineTB.layout(view);

      // In TB layout, node A should be above node B (lower y coordinate)
      const nodeATB = viewTB.getNode('A');
      const nodeBTB = viewTB.getNode('B');
      expect(nodeATB!.y).toBeLessThan(nodeBTB!.y!);

      // Test Left-to-Right layout
      const viewLR = new GraphView('view-2', 
        [
          { id: 'A', label: 'A', type: 'module', metadata: {} },
          { id: 'B', label: 'B', type: 'module', metadata: {} }
        ],
        [{ id: 'A-B', from: 'A', to: 'B', metadata: {} }],
        metadata
      );

      const engineLR = new DagreLayoutEngine({ rankdir: 'LR' }, logger);
      const viewLRLayouted = await engineLR.layout(viewLR);

      // In LR layout, node A should be to the left of node B (lower x coordinate)
      const nodeALR = viewLRLayouted.getNode('A');
      const nodeBLR = viewLRLayouted.getNode('B');
      expect(nodeALR!.x).toBeLessThan(nodeBLR!.x!);
    });

    it('should handle disconnected graphs', async () => {
      const nodes: GraphViewNode[] = [
        { id: 'A', label: 'A', type: 'module', metadata: {} },
        { id: 'B', label: 'B', type: 'module', metadata: {} },
        { id: 'C', label: 'C', type: 'module', metadata: {} }
      ];

      // No edges - all nodes disconnected
      const edges: GraphViewEdge[] = [];

      const metadata: GraphViewMetadata = {
        projectionType: 'test',
        generatedAt: new Date()
      };

      const view = new GraphView('view-1', nodes, edges, metadata);

      const layoutedView = await engine.layout(view);

      // All nodes should still get positions
      for (const node of layoutedView.nodes) {
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
      }
    });

    it('should handle single node', async () => {
      const nodes: GraphViewNode[] = [
        { id: 'A', label: 'A', type: 'module', metadata: {} }
      ];

      const edges: GraphViewEdge[] = [];

      const metadata: GraphViewMetadata = {
        projectionType: 'test',
        generatedAt: new Date()
      };

      const view = new GraphView('view-1', nodes, edges, metadata);

      const layoutedView = await engine.layout(view);

      const nodeA = layoutedView.getNode('A');
      expect(nodeA!.x).toBeDefined();
      expect(nodeA!.y).toBeDefined();
    });

    it('should apply node separation configuration', async () => {
      const nodes: GraphViewNode[] = [
        { id: 'A', label: 'A', type: 'module', width: 50, height: 30, metadata: {} },
        { id: 'B', label: 'B', type: 'module', width: 50, height: 30, metadata: {} },
        { id: 'C', label: 'C', type: 'module', width: 50, height: 30, metadata: {} }
      ];

      const edges: GraphViewEdge[] = [
        { id: 'A-B', from: 'A', to: 'B', metadata: {} },
        { id: 'A-C', from: 'A', to: 'C', metadata: {} }
      ];

      const metadata: GraphViewMetadata = {
        projectionType: 'test',
        generatedAt: new Date()
      };

      // Test with large node separation
      const engineLargeSep = new DagreLayoutEngine({ nodesep: 200 }, logger);
      const viewLargeSep = new GraphView('view-1', 
        JSON.parse(JSON.stringify(nodes)), 
        JSON.parse(JSON.stringify(edges)), 
        { ...metadata }
      );
      const layoutedLargeSep = await engineLargeSep.layout(viewLargeSep);

      // Test with small node separation
      const engineSmallSep = new DagreLayoutEngine({ nodesep: 20 }, logger);
      const viewSmallSep = new GraphView('view-2', 
        JSON.parse(JSON.stringify(nodes)), 
        JSON.parse(JSON.stringify(edges)), 
        { ...metadata }
      );
      const layoutedSmallSep = await engineSmallSep.layout(viewSmallSep);

      // Bounding box should be larger with larger separation
      const bboxLarge = layoutedLargeSep.getBoundingBox()!;
      const bboxSmall = layoutedSmallSep.getBoundingBox()!;

      const widthLarge = bboxLarge.maxX - bboxLarge.minX;
      const widthSmall = bboxSmall.maxX - bboxSmall.minX;

      // Large separation should result in wider layout
      expect(widthLarge).toBeGreaterThan(widthSmall);
    });
  });

  describe('getName', () => {
    it('should return the engine name', () => {
      expect(engine.getName()).toBe('dagre');
    });
  });
});

