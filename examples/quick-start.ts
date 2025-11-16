/**
 * Quick Start Example - 5-Minute Demo
 * 
 * This example demonstrates the complete workflow in the simplest way possible.
 * Perfect for demos, presentations, and first-time users.
 * 
 * Usage:
 *   npx tsx examples/quick-start.ts [path-to-analyze]
 *   npx tsx examples/quick-start.ts ../c3-parsing/src
 *   npm run demo:quick-start
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
  const logger = createLogger('quick-start');
  
  // Get target path from command line or use default
  const targetPath = process.argv[2] || './src';
  const outputDir = './output/quick-start';

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  Module Dependency Analysis - Quick Start     ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log(`📂 Target: ${targetPath}`);
  console.log(`📁 Output: ${outputDir}\n`);

  try {
    // Step 1: Load codebase
    console.log('⏳ Step 1/5: Loading codebase...');
    const tsExtension = new TypeScriptExtension({
      tsconfigRootDir: path.resolve(targetPath),
      includePrivateMembers: false,
      excludePatterns: ['node_modules/**', 'dist/**', 'tests/**', '**/*.test.ts']
    });

    const graphLoader = new GraphLoader(logger, {
      extensions: [tsExtension],
      cacheEnabled: false
    });

    const graph = await graphLoader.loadGraph(path.resolve(targetPath));
    console.log(`   ✓ Loaded ${graph.getNodeCount()} nodes, ${graph.getEdgeCount()} edges\n`);

    // Step 2: Create module projection
    console.log('⏳ Step 2/5: Creating module projection...');
    const strategy = new ModuleProjectionStrategy(logger, path.resolve(targetPath));
    
    const config = ViewConfiguration.create({
      projectionType: ProjectionType.MODULE,
      aggregationLevel: AggregationLevel.TOP_LEVEL,
      options: {
        includeTests: false,
        excludePatterns: ['node_modules', 'dist', 'tests']
      }
    });

    const projection = await strategy.project(graph, config) as ModuleProjection;
    const metrics = projection.getMetrics();
    console.log(`   ✓ Created ${metrics.totalModules} modules with ${metrics.totalDependencies} dependencies\n`);

    // Step 3: Build and layout graph view
    console.log('⏳ Step 3/5: Building visualization...');
    const viewBuilder = new GraphViewBuilder(logger);
    const graphView = viewBuilder.build(projection, {
      includeMetrics: true,
      colorScheme: 'dependencies',
      nodeSize: 'proportional'
    });

    const layoutEngine = new DagreLayoutEngine({
      rankdir: 'TB',
      nodesep: 80,
      ranksep: 100
    }, logger);

    await layoutEngine.layout(graphView);
    console.log(`   ✓ Applied layout to ${graphView.getNodeCount()} nodes\n`);

    // Step 4: Export to multiple formats
    console.log('⏳ Step 4/5: Exporting results...');
    await fs.mkdir(outputDir, { recursive: true });

    const jsonExporter = new JSONGraphExporter(logger);
    const graphmlExporter = new GraphMLExporter(logger);
    const svgExporter = new SVGGraphExporter(logger);

    const jsonOutput = jsonExporter.exportForFile(graphView, { pretty: true });
    await fs.writeFile(path.join(outputDir, 'module-graph.json'), jsonOutput);
    console.log('   ✓ Exported to JSON');

    const graphmlOutput = graphmlExporter.export(graphView, { includeLayout: true });
    await fs.writeFile(path.join(outputDir, 'module-graph.graphml'), graphmlOutput);
    console.log('   ✓ Exported to GraphML');

    const svgOutput = svgExporter.export(graphView, {
      width: 1200,
      height: 800,
      padding: 40,
      showLabels: true
    });
    await fs.writeFile(path.join(outputDir, 'module-graph.svg'), svgOutput);
    console.log('   ✓ Exported to SVG\n');

    // Step 5: Generate summary report
    console.log('⏳ Step 5/5: Generating report...');
    const report = generateReport(projection, targetPath);
    await fs.writeFile(path.join(outputDir, 'ANALYSIS.md'), report);
    console.log('   ✓ Generated analysis report\n');

    // Display summary
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  Analysis Complete!                            ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log(`   Modules: ${metrics.totalModules}`);
    console.log(`   Files: ${metrics.totalFiles}`);
    console.log(`   Dependencies: ${metrics.totalDependencies}`);
    console.log(`   Avg Coupling: ${metrics.averageDependenciesPerModule.toFixed(2)}`);
    console.log(`   Circular: ${metrics.cyclicDependencies}\n`);

    // Show issues if any
    if (metrics.cyclicDependencies > 0) {
      console.log('⚠️  Issues Found:');
      const cycles = projection.getCycles();
      cycles.forEach((cycle, idx) => {
        const cycleNames = cycle.map(m => m.name).join(' → ');
        console.log(`   ${idx + 1}. Circular: ${cycleNames} → ${cycle[0].name}`);
      });
      console.log();
    } else {
      console.log('✓ No circular dependencies detected\n');
    }

    console.log(`📁 Results saved to: ${outputDir}`);
    console.log('\n💡 Next steps:');
    console.log(`   - Open ${outputDir}/module-graph.svg to visualize`);
    console.log(`   - Import ${outputDir}/module-graph.graphml into yEd/Gephi`);
    console.log(`   - Review ${outputDir}/ANALYSIS.md for detailed insights\n`);

    console.log('✅ Done!\n');

    // Cleanup
    await tsExtension.dispose();

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function generateReport(projection: ModuleProjection, targetPath: string): string {
  const metrics = projection.getMetrics();
  const modules = projection.getModules();
  
  // Sort modules by different criteria
  const bySize = [...modules].sort((a, b) => b.files.length - a.files.length);
  const byDeps = [...modules].sort((a, b) => b.getDependencyCount() - a.getDependencyCount());
  const byDependents = [...modules].sort((a, b) => b.getDependentCount() - a.getDependentCount());

  let report = `# Module Dependency Analysis\n\n`;
  report += `**Target:** ${targetPath}\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `---\n\n`;

  report += `## Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Modules | ${metrics.totalModules} |\n`;
  report += `| Total Files | ${metrics.totalFiles} |\n`;
  report += `| Total Dependencies | ${metrics.totalDependencies} |\n`;
  report += `| Average Coupling | ${metrics.averageDependenciesPerModule.toFixed(2)} |\n`;
  report += `| Max Dependencies | ${metrics.maxDependencies} |\n`;
  report += `| Circular Dependencies | ${metrics.cyclicDependencies} |\n\n`;

  report += `---\n\n`;

  report += `## Largest Modules\n\n`;
  bySize.slice(0, 5).forEach((module, idx) => {
    report += `${idx + 1}. **${module.name}** - ${module.files.length} files\n`;
  });
  report += `\n`;

  report += `## Most Depended-On Modules (Hotspots)\n\n`;
  byDependents.slice(0, 5).forEach((module, idx) => {
    report += `${idx + 1}. **${module.name}** - Used by ${module.getDependentCount()} modules\n`;
  });
  report += `\n`;

  report += `## Most Coupled Modules\n\n`;
  byDeps.slice(0, 5).forEach((module, idx) => {
    const count = module.getDependencyCount();
    const warning = count > 5 ? ' ⚠️' : '';
    report += `${idx + 1}. **${module.name}** - Depends on ${count} modules${warning}\n`;
  });
  report += `\n`;

  // Circular dependencies
  const cycles = projection.getCycles();
  if (cycles.length > 0) {
    report += `## ⚠️ Circular Dependencies\n\n`;
    cycles.forEach((cycle, idx) => {
      const cycleNames = cycle.map(m => m.name).join(' → ');
      report += `${idx + 1}. ${cycleNames} → ${cycle[0].name}\n`;
    });
    report += `\n**Recommendation:** Break these circular dependencies to improve maintainability.\n\n`;
  } else {
    report += `## ✓ No Circular Dependencies\n\n`;
    report += `Great! Your architecture has no circular dependencies.\n\n`;
  }

  report += `---\n\n`;
  report += `## Recommendations\n\n`;

  if (metrics.cyclicDependencies > 0) {
    report += `1. **Break Circular Dependencies:** ${metrics.cyclicDependencies} cycle(s) detected\n`;
  }

  const highlyCoupled = byDeps.filter(m => m.getDependencyCount() > 5);
  if (highlyCoupled.length > 0) {
    report += `2. **Review High Coupling:** ${highlyCoupled.length} module(s) with > 5 dependencies\n`;
  }

  const isolated = modules.filter(m => m.getDependencyCount() === 0 && m.getDependentCount() === 0);
  if (isolated.length > 0) {
    report += `3. **Check Isolated Modules:** ${isolated.length} module(s) with no connections (potential dead code?)\n`;
  }

  if (metrics.cyclicDependencies === 0 && highlyCoupled.length === 0) {
    report += `✓ Architecture looks good! No major issues detected.\n`;
  }

  report += `\n---\n\n`;
  report += `*Generated by c3-projection - Module Dependency Analysis*\n`;

  return report;
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

