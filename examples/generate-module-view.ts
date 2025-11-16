/**
 * Example: Generate Module Dependency View
 * 
 * This example demonstrates the complete workflow:
 * 1. Load PropertyGraph from c3-parsing
 * 2. Create module projection
 * 3. Build GraphView
 * 4. Apply layout
 * 5. Export to multiple formats
 */

import { GraphLoader } from '../src/domain/services/GraphLoader.js';
import { ModuleProjectionStrategy } from '../src/infrastructure/strategies/ModuleProjectionStrategy.js';
import { GraphViewBuilder } from '../src/domain/services/GraphViewBuilder.js';
import { DagreLayoutEngine } from '../src/infrastructure/layout-engines/DagreLayoutEngine.js';
import { JSONGraphExporter } from '../src/infrastructure/exporters/JSONGraphExporter.js';
import { GraphMLExporter } from '../src/infrastructure/exporters/GraphMLExporter.js';
import { SVGGraphExporter } from '../src/infrastructure/exporters/SVGGraphExporter.js';
import { TypeScriptExtension } from 'c3-parsing';
import { ViewConfiguration } from '../src/domain/value-objects/ViewConfiguration.js';
import { ProjectionType } from '../src/domain/value-objects/ProjectionType.js';
import { AggregationLevel } from '../src/domain/value-objects/AggregationLevel.js';
import { ModuleProjection } from '../src/domain/entities/ModuleProjection.js';
import { createLogger } from 'c3-shared';
import * as fs from 'fs/promises';
import * as path from 'path';

async function main() {
  const logger = createLogger('example');
  console.log('=== Module Dependency View Generator ===\n');

  // Configuration
  const rootPath = process.argv[2] || '../c3-parsing/src';
  const outputDir = './output';

  console.log(`Analyzing: ${rootPath}`);
  console.log(`Output directory: ${outputDir}\n`);

  // Step 1: Load PropertyGraph from c3-parsing
  console.log('Step 1: Loading PropertyGraph...');
  const tsExtension = new TypeScriptExtension({
    tsconfigRootDir: path.resolve(rootPath),
    includePrivateMembers: false,
    excludePatterns: ['node_modules/**', 'dist/**', 'tests/**', '**/*.test.ts']
  });

  const graphLoader = new GraphLoader(logger, {
    extensions: [tsExtension],
    cacheEnabled: false
  });

  const graph = await graphLoader.loadGraph(path.resolve(rootPath));
  console.log(`  ✓ Loaded graph: ${graph.getNodeCount()} nodes, ${graph.getEdgeCount()} edges\n`);

  // Step 2: Create Module Projection
  console.log('Step 2: Creating module projection...');
  const strategy = new ModuleProjectionStrategy(logger, path.resolve(rootPath));
  
  const config = ViewConfiguration.create({
    projectionType: ProjectionType.MODULE,
    aggregationLevel: AggregationLevel.TOP_LEVEL,
    options: {
      includeTests: false,
      excludePatterns: ['node_modules', 'dist', 'tests']
    }
  });

  const projection = await strategy.project(graph, config) as ModuleProjection;
  console.log(`  ✓ Created projection: ${projection.getModuleCount()} modules\n`);

  // Display module summary
  console.log('Module Summary:');
  const modules = projection.getModules();
  modules.forEach(module => {
    console.log(`  - ${module.name}: ${module.files.length} files, ${module.getDependencyCount()} dependencies`);
  });
  console.log();

  // Step 3: Build GraphView
  console.log('Step 3: Building GraphView...');
  const viewBuilder = new GraphViewBuilder(logger);
  const graphView = viewBuilder.build(projection, {
    includeMetrics: true,
    colorScheme: 'dependencies',
    nodeSize: 'proportional'
  });
  console.log(`  ✓ Built GraphView: ${graphView.getNodeCount()} nodes, ${graphView.getEdgeCount()} edges\n`);

  // Step 4: Apply Layout
  console.log('Step 4: Applying layout...');
  const layoutEngine = new DagreLayoutEngine({
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 100
  }, logger);

  await layoutEngine.layout(graphView);
  console.log(`  ✓ Layout applied\n`);

  // Step 5: Export to Multiple Formats
  console.log('Step 5: Exporting to files...');
  await fs.mkdir(outputDir, { recursive: true });

  // Export to JSON
  const jsonExporter = new JSONGraphExporter(logger);
  const jsonOutput = jsonExporter.exportForFile(graphView, { pretty: true });
  await fs.writeFile(path.join(outputDir, 'module-graph.json'), jsonOutput);
  console.log('  ✓ Exported to JSON: module-graph.json');

  // Export to GraphML
  const graphmlExporter = new GraphMLExporter(logger);
  const graphmlOutput = graphmlExporter.export(graphView, { includeLayout: true });
  await fs.writeFile(path.join(outputDir, 'module-graph.graphml'), graphmlOutput);
  console.log('  ✓ Exported to GraphML: module-graph.graphml');

  // Export to SVG
  const svgExporter = new SVGGraphExporter(logger);
  const svgOutput = svgExporter.export(graphView, {
    width: 1200,
    height: 800,
    padding: 40,
    showLabels: true
  });
  await fs.writeFile(path.join(outputDir, 'module-graph.svg'), svgOutput);
  console.log('  ✓ Exported to SVG: module-graph.svg\n');

  // Display metrics
  console.log('=== Analysis Complete ===\n');
  const metrics = projection.getMetrics();
  console.log('Graph Metrics:');
  console.log(`  Total Modules: ${metrics.totalModules}`);
  console.log(`  Total Files: ${metrics.totalFiles}`);
  console.log(`  Total Dependencies: ${metrics.totalDependencies}`);
  console.log(`  Avg Dependencies/Module: ${metrics.averageDependenciesPerModule.toFixed(2)}`);
  console.log(`  Max Dependencies: ${metrics.maxDependencies}`);
  console.log(`  Circular Dependencies: ${metrics.cyclicDependencies}`);

  // Display cycles if any
  const cycles = projection.getCycles();
  if (cycles.length > 0) {
    console.log(`\n⚠️  Warning: ${cycles.length} circular dependency cycle(s) detected:`);
    cycles.forEach((cycle, idx) => {
      const cycleNames = cycle.map(m => m.name).join(' → ');
      console.log(`  ${idx + 1}. ${cycleNames} → ${cycle[0].name}`);
    });
  } else {
    console.log('\n✓ No circular dependencies detected');
  }

  // Clean up
  await tsExtension.dispose();
  
  console.log(`\n📁 Output files saved to: ${outputDir}`);
  console.log('\n✅ Done!\n');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

