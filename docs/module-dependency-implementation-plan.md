# Module Dependency View - Implementation Plan

**Date:** November 16, 2025  
**Target:** c3-projection v0.2.0  
**Status:** Planning Phase

---

## Executive Summary

This document outlines a **4-phase implementation plan** for the Actual Module Dependency View system, as described in `module-dependency-view-design.md`. Each phase builds incrementally on the previous one, with clear acceptance criteria and filesystem visualizations.

**Total Estimated Timeline:** 12-16 days

---

## Overview: End-to-End Flow

```text
┌──────────────┐
│ c3-parsing   │  Parse code → PropertyGraph
└──────┬───────┘
       │
       v
┌──────────────────────────────────────┐
│ Phase 1: Canonical Graph Layer       │  Build CanonicalActualGraph
│  - FileNode[]                         │  from PropertyGraph
│  - ImportEdge[]                       │
└──────┬───────────────────────────────┘
       │
       v
┌──────────────────────────────────────┐
│ Phase 2: Module Model Layer          │  Group files → Modules
│  - ModuleModel                        │  Create ModuleDependencyModel
│  - ModuleDependencyModel              │
└──────┬───────────────────────────────┘
       │
       v
┌──────────────────────────────────────┐
│ Phase 3: Viewpoint Layer             │  Apply filters/config
│  - ActualModuleDependencyViewpoint   │  Calculate metrics
│  - View filtering & metrics          │  Detect cycles
└──────┬───────────────────────────────┘
       │
       v
┌──────────────────────────────────────┐
│ Phase 4: Export & Integration        │  Export formats
│  - GraphML/JSON exporters            │  CLI tools
│  - CLI commands                      │  Integration tests
└──────────────────────────────────────┘
```

---

## Phase 1: Canonical Graph Layer

**Goal:** Transform PropertyGraph from c3-parsing into a simplified CanonicalActualGraph focused on files and imports.

**Duration:** 3-4 days

### 1.1 Filesystem Structure

```text
c3-projection/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Projection.ts                      [existing]
│   │   │   ├── ModuleProjection.ts                [existing]
│   │   │   ├── CanonicalActualGraph.ts            [NEW] ✨
│   │   │   ├── FileNode.ts                        [NEW] ✨
│   │   │   └── ImportEdge.ts                      [NEW] ✨
│   │   │
│   │   ├── services/
│   │   │   ├── ProjectionEngine.ts                [existing]
│   │   │   ├── CanonicalGraphBuilder.ts           [NEW] ✨
│   │   │   └── GraphNormalizer.ts                 [NEW] ✨
│   │   │
│   │   └── value-objects/
│   │       ├── ProjectionType.ts                  [existing]
│   │       └── FileType.ts                        [NEW] ✨
│   │
│   └── infrastructure/
│       └── builders/
│           └── CanonicalGraphBuilderImpl.ts       [NEW] ✨
│
├── tests/
│   └── integration/
│       └── canonical-graph-builder.test.ts        [NEW] ✨
│
└── docs/
    ├── module-dependency-view-design.md           [existing]
    └── module-dependency-implementation-plan.md   [NEW] ✨
```

### 1.2 Key Types & Interfaces

```typescript
// domain/entities/FileNode.ts
export interface FileNode {
  id: string;                    // file path
  path: string;                  // relative path from root
  absolutePath: string;          // absolute filesystem path
  language: string;              // ts, tsx, js, jsx
  fileType: FileType;            // SOURCE, TEST, CONFIG
  labels: string[];              // from PropertyGraph
  metadata: {
    linesOfCode?: number;
    lastModified?: Date;
    [key: string]: any;
  };
}

// domain/entities/ImportEdge.ts
export interface ImportEdge {
  id: string;
  from: string;                  // source file path
  to: string;                    // target file path
  importType: ImportType;        // STATIC, DYNAMIC, TYPE_ONLY
  isTestOnly: boolean;           // from test file
  metadata: {
    importedSymbols?: string[];
    lineNumber?: number;
    [key: string]: any;
  };
}

// domain/entities/CanonicalActualGraph.ts
export class CanonicalActualGraph {
  constructor(
    public readonly files: FileNode[],
    public readonly imports: ImportEdge[],
    public readonly rootPath: string,
    public readonly metadata: {
      parsedAt: Date;
      version: string;
      [key: string]: any;
    }
  ) {}

  // Query methods
  getFile(path: string): FileNode | undefined;
  getFilesByType(fileType: FileType): FileNode[];
  getImportsFrom(filePath: string): ImportEdge[];
  getImportsTo(filePath: string): ImportEdge[];
  getFileCount(): number;
  getImportCount(): number;
}

// domain/services/CanonicalGraphBuilder.ts
export interface CanonicalGraphBuilder {
  /**
   * Build CanonicalActualGraph from c3-parsing PropertyGraph
   */
  build(propertyGraph: PropertyGraph): Promise<CanonicalActualGraph>;
}
```

### 1.3 Implementation Steps

**Step 1:** Create entity types
- FileNode.ts
- ImportEdge.ts  
- CanonicalActualGraph.ts
- FileType.ts value object

**Step 2:** Create CanonicalGraphBuilder service
- Interface definition
- Implementation that transforms PropertyGraph
- Extract file nodes from graph
- Extract import edges from graph
- Normalize paths and metadata

**Step 3:** Add tests
- Unit tests for CanonicalActualGraph methods
- Integration test: PropertyGraph → CanonicalActualGraph
- Test with sample TypeScript project

### 1.4 Acceptance Criteria

| Criterion | Description | Verification |
|-----------|-------------|--------------|
| **AC1.1** | CanonicalGraphBuilder transforms PropertyGraph to CanonicalActualGraph | Unit test with real PropertyGraph |
| **AC1.2** | FileNode correctly extracts path, language, type from graph nodes | Test with 10+ file types |
| **AC1.3** | ImportEdge correctly maps IMPORTS edges from PropertyGraph | Test static, dynamic, type-only imports |
| **AC1.4** | CanonicalActualGraph query methods work correctly | Unit tests for all query methods |
| **AC1.5** | Handles test files separately (isTestOnly flag) | Test files marked correctly |
| **AC1.6** | Performance: Process 1000+ file graph in <1s | Performance benchmark |

---

## Phase 2: Module Model Layer

**Goal:** Group files into modules and create module-to-module dependency relationships.

**Duration:** 4-5 days

### 2.1 Filesystem Structure

```text
c3-projection/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── CanonicalActualGraph.ts            [Phase 1]
│   │   │   ├── Module.ts                          [NEW] ✨
│   │   │   ├── ModuleModel.ts                     [NEW] ✨
│   │   │   ├── ModuleDependencyEdge.ts            [NEW] ✨
│   │   │   └── ModuleDependencyModel.ts           [NEW] ✨
│   │   │
│   │   ├── services/
│   │   │   ├── ModuleGrouper.ts                   [NEW] ✨
│   │   │   ├── ModuleDependencyAnalyzer.ts        [NEW] ✨
│   │   │   └── ModuleDetectionStrategy.ts         [NEW] ✨
│   │   │
│   │   └── value-objects/
│   │       ├── ModuleId.ts                        [NEW] ✨
│   │       └── ModuleGroupingStrategy.ts          [NEW] ✨
│   │
│   ├── infrastructure/
│   │   ├── builders/
│   │   │   └── CanonicalGraphBuilderImpl.ts       [Phase 1]
│   │   │
│   │   └── strategies/
│   │       ├── DirectoryBasedModuleStrategy.ts    [NEW] ✨
│   │       ├── PackageBasedModuleStrategy.ts      [NEW] ✨
│   │       └── ConfigBasedModuleStrategy.ts       [NEW] ✨
│   │
│   └── application/
│       └── use-cases/
│           └── BuildModuleDependencyModel.ts      [NEW] ✨
│
├── tests/
│   ├── integration/
│   │   ├── canonical-graph-builder.test.ts        [Phase 1]
│   │   ├── module-grouper.test.ts                 [NEW] ✨
│   │   └── module-dependency-analyzer.test.ts     [NEW] ✨
│   │
│   └── fixtures/
│       └── sample-monorepo/                       [NEW] ✨
│           ├── packages/
│           │   ├── billing/
│           │   ├── auth/
│           │   └── shared/
│           └── apps/
│               └── web/
│
└── configs/
    └── module-groups.example.ts                   [NEW] ✨
```

### 2.2 Key Types & Interfaces

```typescript
// domain/value-objects/ModuleId.ts
export interface ModuleId {
  readonly __brand: "ModuleId";
  readonly value: string;
}

export function createModuleId(value: string): ModuleId {
  return { __brand: "ModuleId", value } as ModuleId;
}

// domain/entities/Module.ts
export interface Module {
  id: ModuleId;
  name: string;                  // display name
  path: string;                  // root path of module
  filePaths: string[];           // all files in this module
  tags: string[];                // domain, layer, type, etc.
  metadata: {
    fileCount: number;
    linesOfCode?: number;
    hasTests: boolean;
    [key: string]: any;
  };
}

// domain/entities/ModuleDependencyEdge.ts
export interface ModuleDependencyEdge {
  from: ModuleId;
  to: ModuleId;
  weight: number;                // number of underlying imports
  viaTestOnly: boolean;          // dependency only through tests
  metadata: {
    importCount: number;
    importingFiles: string[];    // which files create this dep
    [key: string]: any;
  };
}

// domain/entities/ModuleModel.ts
export class ModuleModel {
  constructor(
    public readonly modules: Module[],
    public readonly fileToModule: Map<string, ModuleId>
  ) {}

  getModule(id: ModuleId): Module | undefined;
  getModules(): Module[];
  getModuleForFile(filePath: string): Module | undefined;
  getModulesByTag(tag: string): Module[];
}

// domain/entities/ModuleDependencyModel.ts
export class ModuleDependencyModel {
  constructor(
    public readonly modules: Module[],
    public readonly edges: ModuleDependencyEdge[]
  ) {}

  getDependenciesOf(moduleId: ModuleId): ModuleDependencyEdge[];
  getDependentsOf(moduleId: ModuleId): ModuleDependencyEdge[];
  getModuleDegree(moduleId: ModuleId): { in: number; out: number };
  hasCircularDependency(): boolean;
  findCircularDependencies(): ModuleId[][];
}

// domain/services/ModuleGrouper.ts
export interface ModuleGrouper {
  /**
   * Group files from CanonicalActualGraph into modules
   */
  groupIntoModules(
    graph: CanonicalActualGraph,
    strategy: ModuleGroupingStrategy
  ): Promise<ModuleModel>;
}

// domain/services/ModuleDependencyAnalyzer.ts
export interface ModuleDependencyAnalyzer {
  /**
   * Analyze module-to-module dependencies
   */
  analyzeDependencies(
    graph: CanonicalActualGraph,
    moduleModel: ModuleModel
  ): Promise<ModuleDependencyModel>;
}
```

### 2.3 Module Grouping Strategies

```typescript
// infrastructure/strategies/DirectoryBasedModuleStrategy.ts
export class DirectoryBasedModuleStrategy implements ModuleDetectionStrategy {
  constructor(
    private config: {
      moduleRoots: string[];       // e.g., ['packages/*', 'apps/*']
      depth: number;               // how many levels deep
    }
  ) {}

  detectModules(files: FileNode[]): Module[] {
    // Group by directory structure
    // Each top-level directory under moduleRoots becomes a module
  }
}

// infrastructure/strategies/PackageBasedModuleStrategy.ts
export class PackageBasedModuleStrategy implements ModuleDetectionStrategy {
  detectModules(files: FileNode[]): Module[] {
    // Find all package.json files
    // Each package.json defines a module boundary
  }
}

// infrastructure/strategies/ConfigBasedModuleStrategy.ts
export class ConfigBasedModuleStrategy implements ModuleDetectionStrategy {
  constructor(private configPath: string) {}

  detectModules(files: FileNode[]): Module[] {
    // Read config file that explicitly defines modules
    // Support glob patterns, explicit file lists, etc.
  }
}
```

### 2.4 Implementation Steps

**Step 1:** Create Module domain entities
- Module.ts
- ModuleId.ts
- ModuleModel.ts
- ModuleDependencyEdge.ts
- ModuleDependencyModel.ts

**Step 2:** Implement ModuleGrouper
- Interface definition
- DirectoryBasedModuleStrategy (start here)
- PackageBasedModuleStrategy
- ConfigBasedModuleStrategy

**Step 3:** Implement ModuleDependencyAnalyzer
- Aggregate file imports → module dependencies
- Count import weights
- Detect test-only dependencies
- Build ModuleDependencyModel

**Step 4:** Add tests
- Test each grouping strategy
- Test dependency aggregation
- Test with sample monorepo structure

### 2.5 Acceptance Criteria

| Criterion | Description | Verification |
|-----------|-------------|--------------|
| **AC2.1** | DirectoryBasedModuleStrategy correctly groups files | Test with sample monorepo |
| **AC2.2** | PackageBasedModuleStrategy finds all package.json modules | Test with Nx/pnpm workspace |
| **AC2.3** | ConfigBasedModuleStrategy reads and applies config | Test with example config |
| **AC2.4** | ModuleDependencyAnalyzer correctly aggregates imports | Compare with manual calculation |
| **AC2.5** | Edge weights accurately reflect import counts | Verify 10+ module pairs |
| **AC2.6** | Test-only dependencies correctly flagged | Verify test file imports |
| **AC2.7** | Performance: Process 100 modules with 1000 files in <2s | Performance benchmark |

---

## Phase 3: Viewpoint Layer

**Goal:** Apply filters, calculate metrics, detect cycles, and prepare display-ready views.

**Duration:** 3-4 days

### 3.1 Filesystem Structure

```text
c3-projection/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── ModuleDependencyModel.ts           [Phase 2]
│   │   │   ├── ModuleDependencyView.ts            [NEW] ✨
│   │   │   └── ViewNode.ts                        [NEW] ✨
│   │   │
│   │   ├── services/
│   │   │   ├── CycleDetector.ts                   [NEW] ✨
│   │   │   ├── ModuleMetricsCalculator.ts         [NEW] ✨
│   │   │   └── GraphLayoutEngine.ts               [NEW] ✨
│   │   │
│   │   └── viewpoints/
│   │       └── actual-module-dependency/          [NEW] ✨
│   │           ├── ActualModuleDependencyViewpoint.ts
│   │           ├── ViewpointConfig.ts
│   │           ├── ModuleFilter.ts
│   │           └── ViewMetrics.ts
│   │
│   ├── infrastructure/
│   │   └── viewpoints/
│   │       └── ActualModuleDependencyViewpointImpl.ts [NEW] ✨
│   │
│   └── application/
│       └── use-cases/
│           ├── BuildModuleDependencyModel.ts       [Phase 2]
│           └── GenerateModuleDependencyView.ts     [NEW] ✨
│
└── tests/
    ├── integration/
    │   ├── module-dependency-analyzer.test.ts     [Phase 2]
    │   ├── cycle-detector.test.ts                 [NEW] ✨
    │   └── viewpoint.test.ts                      [NEW] ✨
    │
    └── fixtures/
        └── circular-deps-sample/                  [NEW] ✨
            ├── module-a/
            ├── module-b/
            └── module-c/
```

### 3.2 Key Types & Interfaces

```typescript
// domain/viewpoints/actual-module-dependency/ViewpointConfig.ts
export interface ActualModuleDependencyViewpointConfig {
  // Filtering
  includeTests?: boolean;
  focusModules?: ModuleId[];     // show only these modules
  hideModules?: ModuleId[];      // exclude these modules
  minWeight?: number;            // hide edges with weight < this
  
  // Depth limiting
  maxDepth?: number;             // from focus modules
  
  // Layout
  layoutAlgorithm?: 'layered' | 'force-directed' | 'circular';
  
  // Metrics
  highlightCycles?: boolean;
  showMetrics?: boolean;
}

// domain/entities/ViewNode.ts
export interface ViewNode {
  id: ModuleId;
  module: Module;
  
  // Display properties
  label: string;
  position?: { x: number; y: number };
  size: number;                  // based on fileCount or LOC
  color?: string;                // based on tags or metrics
  
  // Metrics
  inDegree: number;
  outDegree: number;
  isInCycle: boolean;
  
  // UI state
  visible: boolean;
  highlighted: boolean;
}

// domain/entities/ViewEdge.ts
export interface ViewEdge {
  from: ModuleId;
  to: ModuleId;
  weight: number;
  
  // Display properties
  thickness: number;             // based on weight
  color?: string;
  style: 'solid' | 'dashed';     // dashed for test-only
  
  // Metrics
  isInCycle: boolean;
  
  // UI state
  visible: boolean;
  highlighted: boolean;
}

// domain/entities/ModuleDependencyView.ts
export class ModuleDependencyView {
  constructor(
    public readonly nodes: ViewNode[],
    public readonly edges: ViewEdge[],
    public readonly metrics: ViewMetrics,
    public readonly config: ActualModuleDependencyViewpointConfig
  ) {}

  getVisibleNodes(): ViewNode[];
  getVisibleEdges(): ViewEdge[];
  getNodeById(id: ModuleId): ViewNode | undefined;
  getCycles(): ModuleId[][];
}

// domain/viewpoints/actual-module-dependency/ViewMetrics.ts
export interface ViewMetrics {
  totalModules: number;
  visibleModules: number;
  totalEdges: number;
  visibleEdges: number;
  
  // Cycle metrics
  cycleCount: number;
  modulesInCycles: number;
  largestCycle: number;
  
  // Degree metrics
  avgInDegree: number;
  avgOutDegree: number;
  maxInDegree: number;
  maxOutDegree: number;
  
  // Module metrics
  mostDepended: ModuleId;        // highest in-degree
  mostDependencies: ModuleId;    // highest out-degree
  isolatedModules: ModuleId[];   // no deps
}

// domain/services/CycleDetector.ts
export interface CycleDetector {
  /**
   * Detect all cycles in module dependency graph
   * Returns array of cycles, each cycle is array of ModuleIds
   */
  detectCycles(model: ModuleDependencyModel): ModuleId[][];
  
  /**
   * Check if two modules are in same cycle
   */
  areInSameCycle(
    moduleA: ModuleId,
    moduleB: ModuleId,
    cycles: ModuleId[][]
  ): boolean;
}

// domain/viewpoints/actual-module-dependency/ActualModuleDependencyViewpoint.ts
export interface ActualModuleDependencyViewpoint {
  readonly id: "actual-module-dependency";
  
  /**
   * Build view from model with configuration
   */
  buildView(
    model: ModuleDependencyModel,
    config: ActualModuleDependencyViewpointConfig
  ): Promise<ModuleDependencyView>;
}
```

### 3.3 Implementation Steps

**Step 1:** Create viewpoint infrastructure
- ViewNode, ViewEdge entities
- ModuleDependencyView entity
- ViewMetrics interface
- ViewpointConfig interface

**Step 2:** Implement CycleDetector
- Tarjan's algorithm or DFS-based cycle detection
- Return all strongly connected components
- Optimize for performance

**Step 3:** Implement ModuleMetricsCalculator
- Calculate degree metrics
- Find cycles
- Identify hotspots (high degree)
- Calculate averages

**Step 4:** Implement ActualModuleDependencyViewpoint
- Apply filters (focus, hide, minWeight)
- Apply depth limiting
- Calculate metrics
- Create ViewNodes and ViewEdges
- Apply layout algorithm

**Step 5:** Add tests
- Test cycle detection with known circular deps
- Test filtering logic
- Test metrics calculation
- End-to-end test: Model → View

### 3.4 Acceptance Criteria

| Criterion | Description | Verification |
|-----------|-------------|--------------|
| **AC3.1** | CycleDetector finds all cycles correctly | Test with known circular dependency graph |
| **AC3.2** | Filters correctly include/exclude modules | Test all filter combinations |
| **AC3.3** | Depth limiting works from focus modules | Test breadth-first traversal |
| **AC3.4** | Metrics accurately calculated | Verify against manual calculation |
| **AC3.5** | ViewNodes have correct positions (if layout applied) | Visual verification |
| **AC3.6** | Test-only edges styled differently | Check ViewEdge.style |
| **AC3.7** | Performance: Process 200 module graph in <500ms | Performance benchmark |

---

## Phase 4: Export & Integration

**Goal:** Export views to standard formats, create CLI tools, and integrate with existing c3 ecosystem.

**Duration:** 2-3 days

### 4.1 Filesystem Structure

```text
c3-projection/
├── src/
│   ├── domain/
│   │   ├── ports/
│   │   │   ├── Exporter.ts                        [existing]
│   │   │   └── ViewExporter.ts                    [NEW] ✨
│   │   │
│   │   └── viewpoints/
│   │       └── actual-module-dependency/          [Phase 3]
│   │
│   ├── infrastructure/
│   │   └── exporters/
│   │       ├── GraphMLExporter.ts                 [NEW] ✨
│   │       ├── JSONExporter.ts                    [NEW] ✨
│   │       ├── MermaidExporter.ts                 [NEW] ✨
│   │       └── D3Exporter.ts                      [NEW] ✨
│   │
│   ├── application/
│   │   └── use-cases/
│   │       ├── GenerateModuleDependencyView.ts    [Phase 3]
│   │       └── ExportModuleDependencyView.ts      [NEW] ✨
│   │
│   └── cli/
│       ├── commands/
│       │   ├── analyze-modules.ts                 [NEW] ✨
│       │   ├── export-graph.ts                    [NEW] ✨
│       │   └── detect-cycles.ts                   [NEW] ✨
│       │
│       └── index.ts                               [NEW] ✨
│
├── tests/
│   ├── integration/
│   │   ├── viewpoint.test.ts                      [Phase 3]
│   │   ├── exporters.test.ts                      [NEW] ✨
│   │   └── end-to-end.test.ts                     [NEW] ✨
│   │
│   └── e2e/
│       └── full-pipeline.test.ts                  [NEW] ✨
│
├── examples/
│   ├── basic-usage.ts                             [NEW] ✨
│   ├── with-filtering.ts                          [NEW] ✨
│   └── export-to-graphml.ts                       [NEW] ✨
│
└── bin/
    └── c3-projection-cli.ts                       [NEW] ✨
```

### 4.2 Key Types & Interfaces

```typescript
// domain/ports/ViewExporter.ts
export interface ViewExporter<T = any> {
  readonly format: ExportFormat;
  
  /**
   * Export view to specific format
   */
  export(view: ModuleDependencyView): Promise<T>;
  
  /**
   * Export to file
   */
  exportToFile(view: ModuleDependencyView, filePath: string): Promise<void>;
}

// infrastructure/exporters/GraphMLExporter.ts
export class GraphMLExporter implements ViewExporter<string> {
  readonly format = ExportFormat.GRAPHML;
  
  export(view: ModuleDependencyView): Promise<string> {
    // Generate GraphML XML
    // Compatible with yEd, Gephi, etc.
  }
}

// infrastructure/exporters/JSONExporter.ts
export interface ModuleDependencyViewJSON {
  nodes: Array<{
    id: string;
    name: string;
    fileCount: number;
    tags: string[];
    metrics: {
      inDegree: number;
      outDegree: number;
      isInCycle: boolean;
    };
  }>;
  edges: Array<{
    from: string;
    to: string;
    weight: number;
    viaTestOnly: boolean;
  }>;
  metrics: ViewMetrics;
}

export class JSONExporter implements ViewExporter<ModuleDependencyViewJSON> {
  readonly format = ExportFormat.JSON;
  
  export(view: ModuleDependencyView): Promise<ModuleDependencyViewJSON> {
    // Convert to JSON-serializable format
  }
}

// infrastructure/exporters/MermaidExporter.ts
export class MermaidExporter implements ViewExporter<string> {
  readonly format = ExportFormat.MERMAID;
  
  export(view: ModuleDependencyView): Promise<string> {
    // Generate Mermaid diagram syntax
    // graph TD
    //   A[Module A] --> B[Module B]
    //   B --> C[Module C]
  }
}
```

### 4.3 CLI Commands

```typescript
// cli/commands/analyze-modules.ts
export interface AnalyzeModulesOptions {
  rootPath: string;
  strategy?: 'directory' | 'package' | 'config';
  configPath?: string;
  includeTests?: boolean;
  output?: string;              // output file path
  format?: 'json' | 'graphml' | 'mermaid';
}

export async function analyzeModules(options: AnalyzeModulesOptions): Promise<void> {
  // 1. Parse code with c3-parsing
  const graph = await parseCodebase(options.rootPath);
  
  // 2. Build CanonicalActualGraph
  const canonicalGraph = await buildCanonicalGraph(graph);
  
  // 3. Group into modules
  const moduleModel = await groupModules(canonicalGraph, options.strategy);
  
  // 4. Analyze dependencies
  const dependencyModel = await analyzeDependencies(canonicalGraph, moduleModel);
  
  // 5. Build view
  const view = await buildView(dependencyModel, { includeTests: options.includeTests });
  
  // 6. Export
  if (options.output) {
    await exportView(view, options.output, options.format);
  }
  
  // 7. Print summary
  console.log(`Modules: ${view.metrics.totalModules}`);
  console.log(`Dependencies: ${view.metrics.totalEdges}`);
  console.log(`Cycles: ${view.metrics.cycleCount}`);
}

// cli/commands/detect-cycles.ts
export interface DetectCyclesOptions {
  rootPath: string;
  strategy?: 'directory' | 'package' | 'config';
  detailed?: boolean;           // show detailed cycle info
}

export async function detectCycles(options: DetectCyclesOptions): Promise<void> {
  // Run analysis pipeline
  // Focus on cycle detection
  // Print cycle report
}
```

### 4.4 Implementation Steps

**Step 1:** Implement exporters
- GraphMLExporter (yEd compatible)
- JSONExporter (for web apps)
- MermaidExporter (for documentation)
- D3Exporter (for D3.js visualization)

**Step 2:** Create CLI commands
- analyze-modules command
- detect-cycles command
- export-graph command
- Set up commander.js or similar

**Step 3:** Create examples
- Basic usage example
- Filtering example
- Export example
- Integration with c3-parsing example

**Step 4:** End-to-end integration
- Test full pipeline: parse → analyze → view → export
- Test CLI commands
- Performance tests with real codebases

**Step 5:** Documentation
- Update README with usage examples
- Create API documentation
- Add architecture diagrams

### 4.5 Acceptance Criteria

| Criterion | Description | Verification |
|-----------|-------------|--------------|
| **AC4.1** | GraphML export opens correctly in yEd | Manual verification |
| **AC4.2** | JSON export is valid and complete | JSON schema validation |
| **AC4.3** | Mermaid export renders correctly in GitHub | Visual verification |
| **AC4.4** | CLI commands work end-to-end | Test with sample project |
| **AC4.5** | Examples run without errors | Run all examples |
| **AC4.6** | Full pipeline: parse → export works | E2E test |
| **AC4.7** | Performance: Analyze 500 modules in <5s total | Performance benchmark |

---

## Integration Points

### With c3-parsing

```typescript
// Use c3-parsing to get PropertyGraph
import { TypeScriptExtension, ParsingService } from 'c3-parsing';

const extension = new TypeScriptExtension({ tsconfigRootDir: './src' });
const service = new ParsingService(repository, logger, [extension]);

// Parse codebase
const propertyGraph = await service.parseCodebase('./src');

// Convert to CanonicalActualGraph
const builder = new CanonicalGraphBuilder();
const canonicalGraph = await builder.build(propertyGraph);
```

### With c3-compliance (Future)

```typescript
// Use module dependency view for compliance checking
const view = await viewpoint.buildView(model, config);

// Check against target architecture
const violations = await complianceChecker.check(view, targetArchitecture);
```

### With c3-web (Future)

```typescript
// Export view for web visualization
const jsonExporter = new JSONExporter();
const viewData = await jsonExporter.export(view);

// Send to frontend
res.json(viewData);
```

---

## Testing Strategy

### Unit Tests
- Each entity, service, and value object
- Isolated component testing
- Mock dependencies

### Integration Tests
- Phase 1: PropertyGraph → CanonicalActualGraph
- Phase 2: CanonicalActualGraph → ModuleDependencyModel
- Phase 3: ModuleDependencyModel → ModuleDependencyView
- Phase 4: ModuleDependencyView → Export formats

### E2E Tests
- Full pipeline with real codebases
- Test with c3 monorepo itself
- Test with sample projects

### Performance Tests
- Benchmark each phase
- Test with various graph sizes:
  - Small: 10 modules, 100 files
  - Medium: 50 modules, 500 files
  - Large: 200 modules, 2000 files

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Cycle detection performance | High | Medium | Use optimized algorithm (Tarjan's) |
| Large graph visualization | High | High | Implement filtering and pagination |
| Module grouping ambiguity | Medium | High | Support multiple strategies, manual config |
| PropertyGraph format changes | High | Low | Version compatibility checks |
| Export format compatibility | Medium | Medium | Test with external tools |

---

## Success Metrics

### Functionality
- ✅ Can analyze 500+ module codebase
- ✅ Detects all circular dependencies
- ✅ Exports to multiple formats
- ✅ CLI commands work end-to-end

### Performance
- ✅ Parse 1000 files in <5s
- ✅ Build module model in <2s
- ✅ Generate view in <1s
- ✅ Export in <500ms

### Quality
- ✅ 90%+ test coverage
- ✅ Zero TypeScript errors
- ✅ All acceptance criteria met
- ✅ Documentation complete

---

## Timeline Summary

| Phase | Duration | Completion Date | Dependencies |
|-------|----------|-----------------|--------------|
| **Phase 1: Canonical Graph** | 3-4 days | Day 4 | c3-parsing v2.0.0 |
| **Phase 2: Module Model** | 4-5 days | Day 9 | Phase 1 |
| **Phase 3: Viewpoint** | 3-4 days | Day 13 | Phase 2 |
| **Phase 4: Export & CLI** | 2-3 days | Day 16 | Phase 3 |
| **Total** | **12-16 days** | **Day 16** | |

---

## Next Steps

1. **Review this plan** with team
2. **Set up development branch** for Phase 1
3. **Create GitHub issues** for each acceptance criterion
4. **Begin Phase 1 implementation**
5. **Daily progress updates**

---

**End of Implementation Plan**

*Ready to begin Phase 1 implementation.* 🚀

