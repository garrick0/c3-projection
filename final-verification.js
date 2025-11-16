import * as projection from './dist/index.js';

console.log('\n╔════════════════════════════════════════╗');
console.log('║  c3-projection - Final Verification    ║');
console.log('╚════════════════════════════════════════╝\n');

const checks = {
  'Module Entity': projection.Module,
  'ModuleProjection': projection.ModuleProjection,
  'GraphView': projection.GraphView,
  'GraphLoader': projection.GraphLoader,
  'GraphViewBuilder': projection.GraphViewBuilder,
  'ModuleAggregator': projection.ModuleAggregator,
  'ModuleDependencyCalculator': projection.ModuleDependencyCalculator,
  'ModuleProjectionStrategy': projection.ModuleProjectionStrategy,
  'DagreLayoutEngine': projection.DagreLayoutEngine,
  'JSONGraphExporter': projection.JSONGraphExporter,
  'GraphMLExporter': projection.GraphMLExporter,
  'SVGGraphExporter': projection.SVGGraphExporter,
  'AggregationLevel': projection.AggregationLevel,
  'ViewConfiguration': projection.ViewConfiguration
};

let passed = 0;
let failed = 0;

for (const [name, value] of Object.entries(checks)) {
  if (value) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name} - MISSING`);
    failed++;
  }
}

console.log(`\n${'─'.repeat(40)}`);
console.log(`  Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`${'─'.repeat(40)}\n`);

if (failed === 0) {
  console.log('✅ All exports verified successfully!\n');
} else {
  console.log(`❌ ${failed} export(s) missing!\n`);
  process.exit(1);
}
