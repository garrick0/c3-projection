/**
 * Self-Analysis Demo
 * 
 * Analyze c3-projection's own codebase to demonstrate:
 * - Clean Architecture validation
 * - Layer separation (Domain, Application, Infrastructure)
 * - Zero circular dependencies
 * - Proper dependency direction
 * 
 * Usage:
 *   npx tsx examples/analyze-self.ts
 *   npm run demo:self-analysis
 */

import { GraphLoader } from '../src/domain/services/GraphLoader.js';
import { ModuleProjectionStrategy } from '../src/infrastructure/strategies/ModuleProjectionStrategy.js';
import { GraphViewBuilder } from '../src/domain/services/GraphViewBuilder.js';
import { DagreLayoutEngine } from '../src/infrastructure/layout-engines/DagreLayoutEngine.js';
import { JSONGraphExporter } from '../src/infrastructure/exporters/JSONGraphExporter.js';
import { SVGGraphExporter } from '../src/infrastructure/exporters/SVGGraphExporter.js';
import { TypeScriptExtension } from 'c3-parsing';
import { ViewConfiguration } from '../src/domain/value-objects/ViewConfiguration.js';
import { ProjectionType } from '../src/domain/value-objects/ProjectionType.js';
import { AggregationLevel } from '../src/domain/value-objects/AggregationLevel.js';
import { ModuleProjection } from '../src/domain/entities/ModuleProjection.js';
import { Module } from '../src/domain/entities/Module.js';
import { createLogger } from 'c3-shared';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const logger = createLogger('self-analysis');
  
  const projectRoot = path.resolve(__dirname, '..');
  const srcPath = path.join(projectRoot, 'src');
  const outputDir = './output/self-analysis';

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  c3-projection Self-Analysis                   ║');
  console.log('║  "Know Thyself" - Architecture Validation      ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  console.log('📂 Analyzing c3-projection itself...\n');

  try {
    // Step 1: Load and analyze
    console.log('⏳ Loading codebase...');
    const tsExtension = new TypeScriptExtension({
      tsconfigRootDir: projectRoot,
      includePrivateMembers: false,
      excludePatterns: ['node_modules/**', 'dist/**', 'tests/**', 'examples/**']
    });

    const graphLoader = new GraphLoader(logger, {
      extensions: [tsExtension],
      cacheEnabled: false
    });

    const graph = await graphLoader.loadGraph(srcPath);
    console.log(`   ✓ Loaded ${graph.getNodeCount()} nodes\n`);

    // Step 2: Create projection with TOP_LEVEL aggregation
    console.log('⏳ Creating module projection (TOP_LEVEL)...');
    const strategy = new ModuleProjectionStrategy(logger, srcPath);
    
    const config = ViewConfiguration.create({
      projectionType: ProjectionType.MODULE,
      aggregationLevel: AggregationLevel.TOP_LEVEL
    });

    const projection = await strategy.project(graph, config) as ModuleProjection;
    const modules = projection.getModules();
    console.log(`   ✓ Created ${modules.length} top-level modules\n`);

    // Step 3: Validate Clean Architecture
    console.log('═══════════════════════════════════════════════');
    console.log('  Clean Architecture Validation');
    console.log('═══════════════════════════════════════════════\n');

    const { domain, application, infrastructure } = categorizeModules(modules);

    validateArchitecture(domain, application, infrastructure, modules);

    // Step 4: Generate visualizations
    console.log('\n⏳ Generating visualizations...');
    await fs.mkdir(outputDir, { recursive: true });

    const viewBuilder = new GraphViewBuilder(logger);
    const layoutEngine = new DagreLayoutEngine({ rankdir: 'TB', nodesep: 100, ranksep: 150 }, logger);
    const svgExporter = new SVGGraphExporter(logger);
    const jsonExporter = new JSONGraphExporter(logger);

    // Full graph
    const fullView = viewBuilder.build(projection, {
      includeMetrics: true,
      colorScheme: 'dependencies'
    });
    await layoutEngine.layout(fullView);

    const fullSvg = svgExporter.export(fullView, {
      width: 1400,
      height: 1000,
      padding: 50
    });
    await fs.writeFile(path.join(outputDir, 'full-architecture.svg'), fullSvg);

    const fullJson = jsonExporter.exportForFile(fullView, { pretty: true });
    await fs.writeFile(path.join(outputDir, 'architecture.json'), fullJson);

    console.log('   ✓ Generated full architecture view\n');

    // Step 5: Generate detailed report
    console.log('⏳ Generating analysis report...');
    const report = generateDetailedReport(projection, domain, application, infrastructure);
    await fs.writeFile(path.join(outputDir, 'ARCHITECTURE_ANALYSIS.md'), report);
    console.log('   ✓ Report saved\n');

    // Summary
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  Analysis Complete!                            ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    const metrics = projection.getMetrics();
    console.log('📊 Architecture Health Score\n');
    const score = calculateArchitectureScore(projection, domain, application, infrastructure);
    console.log(`   Overall Score: ${score}/100\n`);

    console.log(`📁 Results saved to: ${outputDir}`);
    console.log('\n💡 Key Insights:');
    console.log(`   - ${domain.length} domain modules (core logic)`);
    console.log(`   - ${application.length} application modules (use cases)`);
    console.log(`   - ${infrastructure.length} infrastructure modules (implementations)`);
    console.log(`   - ${metrics.cyclicDependencies} circular dependencies`);
    console.log(`   - Clean Architecture: ${score >= 85 ? '✓ Validated' : '⚠ Issues detected'}\n`);

    console.log('✅ Self-analysis complete!\n');

    await tsExtension.dispose();

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

interface LayerModules {
  domain: Module[];
  application: Module[];
  infrastructure: Module[];
}

function categorizeModules(modules: Module[]): LayerModules {
  return {
    domain: modules.filter(m => m.path.includes('/domain')),
    application: modules.filter(m => m.path.includes('/application')),
    infrastructure: modules.filter(m => m.path.includes('/infrastructure'))
  };
}

function validateArchitecture(
  domain: Module[],
  application: Module[],
  infrastructure: Module[],
  allModules: Module[]
): void {
  const moduleMap = new Map(allModules.map(m => [m.id, m]));

  // Check 1: Domain layer should have no dependencies on infrastructure
  console.log('✓ Check 1: Domain Layer Independence');
  let domainClean = true;
  for (const domainModule of domain) {
    for (const depId of domainModule.dependencies) {
      const dep = moduleMap.get(depId);
      if (dep && (dep.path.includes('/infrastructure') || dep.path.includes('/application'))) {
        console.log(`   ❌ ${domainModule.name} → ${dep.name} (VIOLATION!)`);
        domainClean = false;
      }
    }
  }
  if (domainClean) {
    console.log(`   ✓ Domain has 0 dependencies on Infrastructure/Application`);
  }
  console.log();

  // Check 2: Application should depend on Domain, not on Infrastructure
  console.log('✓ Check 2: Application Layer Dependencies');
  let appClean = true;
  for (const appModule of application) {
    for (const depId of appModule.dependencies) {
      const dep = moduleMap.get(depId);
      if (dep && dep.path.includes('/infrastructure')) {
        console.log(`   ⚠ ${appModule.name} → ${dep.name} (Prefer injecting via ports)`);
        appClean = false;
      }
    }
  }
  if (appClean) {
    console.log(`   ✓ Application properly depends on Domain only`);
  }
  console.log();

  // Check 3: Infrastructure should depend on Domain
  console.log('✓ Check 3: Infrastructure implements Domain ports');
  const infraDependsOnDomain = infrastructure.some(infraModule => {
    return Array.from(infraModule.dependencies).some(depId => {
      const dep = moduleMap.get(depId);
      return dep && dep.path.includes('/domain');
    });
  });
  if (infraDependsOnDomain) {
    console.log(`   ✓ Infrastructure correctly depends on Domain`);
  } else {
    console.log(`   ⚠ Infrastructure should implement Domain ports`);
  }
  console.log();

  // Check 4: No circular dependencies
  console.log('✓ Check 4: No Circular Dependencies');
  // This will be checked via projection.getCycles()
}

function calculateArchitectureScore(
  projection: ModuleProjection,
  domain: Module[],
  application: Module[],
  infrastructure: Module[]
): number {
  let score = 100;
  const metrics = projection.getMetrics();
  const allModules = projection.getModules();
  const moduleMap = new Map(allModules.map(m => [m.id, m]));

  // Deduct for circular dependencies (20 points each, max 40)
  score -= Math.min(metrics.cyclicDependencies * 20, 40);

  // Deduct for domain depending on infrastructure/application (30 points)
  for (const domainModule of domain) {
    for (const depId of domainModule.dependencies) {
      const dep = moduleMap.get(depId);
      if (dep && (dep.path.includes('/infrastructure') || dep.path.includes('/application'))) {
        score -= 30;
        break;
      }
    }
  }

  // Deduct for high coupling (5 points per module with >7 deps, max 20)
  const highlyCoupled = allModules.filter(m => m.getDependencyCount() > 7).length;
  score -= Math.min(highlyCoupled * 5, 20);

  // Deduct for application depending on infrastructure (10 points, max 20)
  let appInfraCount = 0;
  for (const appModule of application) {
    for (const depId of appModule.dependencies) {
      const dep = moduleMap.get(depId);
      if (dep && dep.path.includes('/infrastructure')) {
        appInfraCount++;
      }
    }
  }
  score -= Math.min(appInfraCount * 10, 20);

  return Math.max(0, Math.min(100, score));
}

function generateDetailedReport(
  projection: ModuleProjection,
  domain: Module[],
  application: Module[],
  infrastructure: Module[]
): string {
  const metrics = projection.getMetrics();
  const score = calculateArchitectureScore(projection, domain, application, infrastructure);

  let report = `# c3-projection Architecture Analysis\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Architecture Score:** ${score}/100\n\n`;
  report += `---\n\n`;

  report += `## Executive Summary\n\n`;
  report += `c3-projection follows Clean Architecture principles with clear layer separation:\n\n`;
  report += `- **Domain Layer:** ${domain.length} modules - Core business logic, entities, and ports\n`;
  report += `- **Application Layer:** ${application.length} modules - Use cases and application services\n`;
  report += `- **Infrastructure Layer:** ${infrastructure.length} modules - External adapters and implementations\n\n`;

  report += `### Key Metrics\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Modules | ${metrics.totalModules} |\n`;
  report += `| Total Files | ${metrics.totalFiles} |\n`;
  report += `| Dependencies | ${metrics.totalDependencies} |\n`;
  report += `| Avg Coupling | ${metrics.averageDependenciesPerModule.toFixed(2)} |\n`;
  report += `| Circular Deps | ${metrics.cyclicDependencies} |\n`;
  report += `| Architecture Score | ${score}/100 |\n\n`;

  report += `---\n\n`;

  report += `## Clean Architecture Validation\n\n`;

  report += `### ✓ Domain Layer Independence\n\n`;
  const allModules = projection.getModules();
  const moduleMap = new Map(allModules.map(m => [m.id, m]));
  
  let domainViolations = 0;
  for (const domainModule of domain) {
    for (const depId of domainModule.dependencies) {
      const dep = moduleMap.get(depId);
      if (dep && (dep.path.includes('/infrastructure') || dep.path.includes('/application'))) {
        domainViolations++;
      }
    }
  }

  if (domainViolations === 0) {
    report += `✓ **PASS** - Domain layer has zero dependencies on Infrastructure or Application layers.\n\n`;
  } else {
    report += `❌ **FAIL** - Domain layer has ${domainViolations} violation(s).\n\n`;
  }

  report += `### Application Layer\n\n`;
  report += `The application layer orchestrates domain objects to implement use cases.\n\n`;
  application.forEach(mod => {
    report += `- **${mod.name}**: ${mod.files.length} files, ${mod.getDependencyCount()} dependencies\n`;
  });
  report += `\n`;

  report += `### Infrastructure Layer\n\n`;
  report += `The infrastructure layer provides concrete implementations of domain ports.\n\n`;
  infrastructure.forEach(mod => {
    report += `- **${mod.name}**: ${mod.files.length} files, ${mod.getDependencyCount()} dependencies\n`;
  });
  report += `\n`;

  report += `---\n\n`;

  report += `## Dependency Analysis\n\n`;

  const cycles = projection.getCycles();
  if (cycles.length === 0) {
    report += `### ✓ No Circular Dependencies\n\n`;
    report += `Excellent! The codebase has no circular dependencies, which indicates good separation of concerns.\n\n`;
  } else {
    report += `### ⚠ Circular Dependencies Detected\n\n`;
    cycles.forEach((cycle, idx) => {
      const cycleNames = cycle.map(m => m.name).join(' → ');
      report += `${idx + 1}. ${cycleNames} → ${cycle[0].name}\n`;
    });
    report += `\n**Action Required:** Break these cycles to improve maintainability.\n\n`;
  }

  report += `---\n\n`;

  report += `## Conclusion\n\n`;
  if (score >= 90) {
    report += `✓ **Excellent Architecture** - Score: ${score}/100\n\n`;
    report += `The codebase demonstrates excellent adherence to Clean Architecture principles.\n`;
  } else if (score >= 75) {
    report += `✓ **Good Architecture** - Score: ${score}/100\n\n`;
    report += `The codebase follows Clean Architecture principles with minor issues.\n`;
  } else {
    report += `⚠ **Architecture Needs Attention** - Score: ${score}/100\n\n`;
    report += `Consider refactoring to better align with Clean Architecture principles.\n`;
  }

  report += `\n---\n\n`;
  report += `*Generated by c3-projection self-analysis*\n`;

  return report;
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

