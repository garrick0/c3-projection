# Module Dependency View - Implementation Plan v2.0

> **Architecture Decision:** After analysis (see `canonical-graph-analysis.md`), we've decided to **skip the CanonicalActualGraph layer** and work directly with `PropertyGraph` from `c3-parsing`. This simplifies the architecture, improves performance, and leverages PropertyGraph's rich query API.

## Overall Goal

To provide a robust, extensible, and performant system for generating module-level dependency views from a codebase's property graph, enabling insights into software architecture.

## Key Concepts

- **PropertyGraph (from `c3-parsing`):** The foundational graph containing nodes (files, classes, functions, etc.) and edges (imports, calls, contains, etc.). **This is our single source of truth.**
- **Module:** A logical grouping of code elements (e.g., a directory, a feature, a domain).
- **Module Projection:** A specialized `Projection` entity representing modules and their inter-dependencies.
- **Aggregation:** The process of grouping fine-grained nodes/edges from the property graph into higher-level module entities.

## Simplified Architecture

```text
┌──────────────────────────────────────┐
│ PropertyGraph (from c3-parsing)      │  Single source of truth
│  - Nodes: FILE, CLASS, FUNCTION, ... │  Rich metadata
│  - Edges: IMPORTS, CALLS, ...        │  Labels & source tracking
│  - Query API: getNodesByLabel(), ... │  Domain filtering
└──────┬───────────────────────────────┘
       │ Direct access (no transformation)
       v
┌──────────────────────────────────────┐
│ Phase 1: Module Model                │  Aggregate files → modules
│  - ModuleAggregator                  │  Calculate dependencies
│  - ModuleDependencyCalculator        │
└──────┬───────────────────────────────┘
       │
       v
┌──────────────────────────────────────┐
│ Phase 2: Viewpoint & Layout          │  Apply layout algorithm
│  - GraphViewBuilder                  │  Prepare for rendering
│  - DagreLayoutEngine                 │
└──────┬───────────────────────────────┘
       │
       v
┌──────────────────────────────────────┐
│ Phase 3: Export & Integration        │  Export formats
│  - JSONGraphExporter                 │  CLI tools
│  - SVGGraphExporter                  │  Integration tests
└──────────────────────────────────────┘
```

**Benefits of this approach:**
- ✅ 33% fewer layers (3 phases instead of 4)
- ✅ No transformation overhead between PropertyGraph and modules
- ✅ Direct access to rich metadata (labels, source tracking, etc.)
- ✅ Easier to add new data sources (git, tests, etc.)
- ✅ Less code to write and maintain

---

## Phase 1: Module Model Layer

**Goal:** Create the core logic for aggregating PropertyGraph nodes into Module entities and calculating module-level dependencies.

**Duration:** 4-5 days

### 1.1 Filesystem Structure

```text
c3-projection/
├── src/
│   ├── application/
│   │   └── use-cases/
│   │       └── GenerateProjection.ts                [modified] 🔧
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Projection.ts                        [existing]
│   │   │   ├── Module.ts                            [NEW] ✨
│   │   │   ├── ModuleProjection.ts                  [NEW] ✨
│   │   │   └── GraphView.ts                         [NEW] ✨
│   │   │
│   │   ├── services/
│   │   │   ├── ProjectionEngine.ts                  [existing]
│   │   │   ├── GraphLoader.ts                       [NEW] ✨
│   │   │   ├── ModuleAggregator.ts                  [NEW] ✨
│   │   │   └── ModuleDependencyCalculator.ts        [NEW] ✨
│   │   │
│   │   ├── ports/
│   │   │   └── ProjectionStrategy.ts                [existing]
│   │   │
│   │   └── value-objects/
│   │       ├── AggregationLevel.ts                  [NEW] ✨
│   │       └── ModuleMetrics.ts                     [NEW] ✨
│   │
│   └── infrastructure/
│       ├── strategies/
│       │   └── ModuleProjectionStrategy.ts          [NEW] ✨
│       │
│       └── persistence/
│           └── InMemoryViewRepository.ts            [existing]
│
├── tests/
│   ├── unit/
│   │   ├── ModuleAggregator.test.ts                 [NEW] ✨
│   │   └── ModuleDependencyCalculator.test.ts       [NEW] ✨
│   │
│   └── integration/
│       └── module-projection.test.ts                [NEW] ✨
│
├── docs/
│   ├── module-dependency-view-design.md             [existing]
│   ├── module-dependency-implementation-plan-v2.md  [NEW] ✨
│   └── canonical-graph-analysis.md                  [NEW] ✨
│
└── package.json                                     [modified] 🔧
```

### 1.2 Key Types & Interfaces

```typescript
// domain/entities/Module.ts
export interface ModuleMetrics {
  fileCount: number;
  totalLines: number;
  dependencyCount: number;    // outgoing dependencies
  dependentCount: number;     // incoming dependencies
  cyclicComplexity?: number;
}

export class Module {
  constructor(
    public readonly id: string,           // unique module ID
    public readonly name: string,         // module name (e.g., directory name)
    public readonly path: string,         // module path (e.g., "src/domain")
    public readonly files: string[],      // Node IDs from PropertyGraph
    public readonly dependencies: Set<string>,  // Module IDs this depends on
    public readonly dependents: Set<string>,    // Module IDs that depend on this
    public readonly metrics: ModuleMetrics
  ) {}

  // Helper methods
  addDependency(moduleId: string): void;
  addDependent(moduleId: string): void;
  hasDependency(moduleId: string): boolean;
  getDependencyCount(): number;
  getDependentCount(): number;
}

// domain/entities/ModuleProjection.ts
export class ModuleProjection extends Projection {
  constructor(
    id: string,
    public readonly modules: Module[],
    public readonly metadata: {
      rootPath: string;
      aggregationLevel: AggregationLevel;
      generatedAt: Date;
      totalFiles: number;
      totalDependencies: number;
    }
  ) {
    super(id, ProjectionType.MODULE_DEPENDENCY);
  }

  // Query methods
  getModule(id: string): Module | undefined;
  getModulesByPath(pathPrefix: string): Module[];
  getRootModules(): Module[];  // Modules with no dependents
  getLeafModules(): Module[];  // Modules with no dependencies
  getCycles(): Module[][];     // Detect circular dependencies
  getMetrics(): { /* aggregate metrics */ };
}

// domain/value-objects/AggregationLevel.ts
export enum AggregationLevel {
  DIRECTORY = 'directory',       // Group by directory
  TOP_LEVEL = 'top-level',       // Only top-level directories
  PACKAGE = 'package',           // Group by package.json/tsconfig
  CUSTOM = 'custom'              // Custom grouping rules
}

// domain/services/GraphLoader.ts
export interface GraphLoaderConfig {
  extensions: GraphExtension[];
  cacheEnabled?: boolean;
}

export class GraphLoader {
  constructor(
    private logger: Logger,
    private config: GraphLoaderConfig
  ) {}

  /**
   * Load PropertyGraph from c3-parsing
   */
  async loadGraph(rootPath: string): Promise<PropertyGraph> {
    // Initialize ParsingService with extensions
    const repository = new InMemoryGraphRepository();
    const parsingService = new ParsingService(
      repository,
      this.logger,
      this.config.extensions
    );

    // Parse codebase
    const graph = await parsingService.parseCodebase(rootPath);

    // Clean up
    await parsingService.disposeExtensions();

    return graph;
  }
}

// domain/services/ModuleAggregator.ts
export interface AggregationConfig {
  level: AggregationLevel;
  includeTests?: boolean;
  excludePatterns?: string[];  // e.g., ['node_modules', 'dist']
}

export class ModuleAggregator {
  constructor(private logger: Logger) {}

  /**
   * Aggregate PropertyGraph nodes into Module entities
   * Works directly with PropertyGraph - no intermediate layer!
   */
  aggregate(graph: PropertyGraph, config: AggregationConfig): Module[] {
    this.logger.info('Aggregating modules', { level: config.level });

    // Step 1: Get all code files from PropertyGraph
    const codeFiles = graph.getNodes()
      .filter(node => node.type === NodeType.FILE)
      .filter(node => node.isFromDomain('code'))
      .filter(node => this.shouldIncludeFile(node, config));

    // Step 2: Group files by aggregation level
    const filesByModule = this.groupFilesByLevel(codeFiles, config.level);

    // Step 3: Create Module entities
    const modules: Module[] = [];
    for (const [modulePath, files] of filesByModule.entries()) {
      const module = this.createModule(modulePath, files, graph);
      modules.push(module);
    }

    this.logger.info(`Created ${modules.length} modules from ${codeFiles.length} files`);
    return modules;
  }

  private groupFilesByLevel(
    files: Node[],
    level: AggregationLevel
  ): Map<string, Node[]> {
    const grouped = new Map<string, Node[]>();

    for (const file of files) {
      const modulePath = this.getModulePathForFile(file, level);
      
      if (!grouped.has(modulePath)) {
        grouped.set(modulePath, []);
      }
      grouped.get(modulePath)!.push(file);
    }

    return grouped;
  }

  private getModulePathForFile(file: Node, level: AggregationLevel): string {
    const filePath = file.metadata.filePath;

    switch (level) {
      case AggregationLevel.DIRECTORY:
        return path.dirname(filePath);
      
      case AggregationLevel.TOP_LEVEL:
        // Get first directory after root (e.g., "src/domain" → "domain")
        const parts = filePath.split(path.sep).filter(Boolean);
        return parts.length > 1 ? parts[1] : parts[0];
      
      case AggregationLevel.PACKAGE:
        // Find nearest package.json or tsconfig.json
        return this.findNearestPackage(filePath);
      
      default:
        return path.dirname(filePath);
    }
  }

  private createModule(modulePath: string, files: Node[], graph: PropertyGraph): Module {
    const fileIds = files.map(f => f.id);
    const metrics = this.calculateMetrics(files);

    return new Module(
      this.generateModuleId(modulePath),
      path.basename(modulePath),
      modulePath,
      fileIds,
      new Set<string>(),  // Dependencies calculated later
      new Set<string>(),  // Dependents calculated later
      metrics
    );
  }

  private calculateMetrics(files: Node[]): ModuleMetrics {
    return {
      fileCount: files.length,
      totalLines: files.reduce((sum, f) => sum + (f.metadata.linesOfCode || 0), 0),
      dependencyCount: 0,  // Calculated by ModuleDependencyCalculator
      dependentCount: 0    // Calculated by ModuleDependencyCalculator
    };
  }

  private shouldIncludeFile(node: Node, config: AggregationConfig): boolean {
    const filePath = node.metadata.filePath;

    // Exclude patterns
    if (config.excludePatterns?.some(pattern => filePath.includes(pattern))) {
      return false;
    }

    // Include/exclude tests
    if (!config.includeTests && node.hasLabel('Test')) {
      return false;
    }

    return true;
  }

  private generateModuleId(modulePath: string): string {
    return `module-${modulePath.replace(/[/\\]/g, '-')}`;
  }
}

// domain/services/ModuleDependencyCalculator.ts
export class ModuleDependencyCalculator {
  constructor(private logger: Logger) {}

  /**
   * Calculate module-level dependencies from PropertyGraph edges
   * Works directly with PropertyGraph - no intermediate layer!
   */
  calculate(modules: Module[], graph: PropertyGraph): void {
    this.logger.info(`Calculating dependencies for ${modules.length} modules`);

    // Build a map from file ID to module
    const fileToModule = new Map<string, Module>();
    for (const module of modules) {
      for (const fileId of module.files) {
        fileToModule.set(fileId, module);
      }
    }

    // Get all import edges from PropertyGraph
    const importEdges = graph.getEdges()
      .filter(edge => edge.type === EdgeType.IMPORTS);

    this.logger.info(`Processing ${importEdges.length} import edges`);

    // Process each import edge
    for (const edge of importEdges) {
      const sourceModule = fileToModule.get(edge.fromNodeId);
      const targetModule = fileToModule.get(edge.toNodeId);

      // Skip if either file is not in a module (e.g., external dependency)
      if (!sourceModule || !targetModule) {
        continue;
      }

      // Skip self-dependencies (imports within same module)
      if (sourceModule.id === targetModule.id) {
        continue;
      }

      // Add dependency relationship
      sourceModule.addDependency(targetModule.id);
      targetModule.addDependent(sourceModule.id);
    }

    // Update metrics
    for (const module of modules) {
      module.metrics.dependencyCount = module.getDependencyCount();
      module.metrics.dependentCount = module.getDependentCount();
    }

    const totalDeps = modules.reduce((sum, m) => sum + m.getDependencyCount(), 0);
    this.logger.info(`Calculated ${totalDeps} module dependencies`);
  }
}
```

### 1.3 Implementation Steps

1. **Add `c3-parsing` dependency:**
   ```bash
   cd c3-projection
   npm install c3-parsing@^2.0.0
   ```

2. **Create entity types:**
   - `Module.ts` - Core module entity
   - `ModuleProjection.ts` - Collection of modules
   - `ModuleMetrics.ts` - Value object for metrics
   - `AggregationLevel.ts` - Enum for aggregation strategies

3. **Create service classes:**
   - `GraphLoader.ts` - Loads PropertyGraph from c3-parsing
   - `ModuleAggregator.ts` - Groups files into modules
   - `ModuleDependencyCalculator.ts` - Calculates module dependencies

4. **Create ModuleProjectionStrategy:**
   - Implements `ProjectionStrategy` interface
   - Orchestrates: GraphLoader → ModuleAggregator → ModuleDependencyCalculator

5. **Update GenerateProjection use case:**
   - Accept extensions as configuration
   - Use new `ModuleProjectionStrategy`

6. **Write comprehensive tests:**
   - Unit tests for `ModuleAggregator` (file grouping logic)
   - Unit tests for `ModuleDependencyCalculator` (dependency calculation)
   - Integration test for end-to-end module projection

### 1.4 Acceptance Criteria

- ✅ `c3-projection` builds successfully with `c3-parsing@2.0.0`
- ✅ `GraphLoader` can load a PropertyGraph from a test codebase
- ✅ `ModuleAggregator` correctly groups files into modules by directory
- ✅ `ModuleDependencyCalculator` accurately identifies dependencies between modules
- ✅ `ModuleProjectionStrategy` generates a `ModuleProjection` with expected structure
- ✅ Integration test confirms module projection works for a sample codebase (e.g., `c3-parsing` itself)
- ✅ All tests pass with >80% code coverage

---

## Phase 2: Viewpoint & Layout Layer

**Goal:** Transform the `ModuleProjection` into a format suitable for visualization, applying layout algorithms.

**Duration:** 3-4 days

### 2.1 Filesystem Structure

```text
c3-projection/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── GraphView.ts                         [NEW] ✨
│   │   │
│   │   ├── services/
│   │   │   └── GraphViewBuilder.ts                  [NEW] ✨
│   │   │
│   │   └── ports/
│   │       └── GraphLayoutEngine.ts                 [NEW] ✨
│   │
│   └── infrastructure/
│       └── layout-engines/
│           └── DagreLayoutEngine.ts                 [NEW] ✨
│
├── tests/
│   └── unit/
│       ├── GraphViewBuilder.test.ts                 [NEW] ✨
│       └── DagreLayoutEngine.test.ts                [NEW] ✨
│
└── package.json                                     [modified] 🔧
```

### 2.2 Key Types & Interfaces

```typescript
// domain/entities/GraphView.ts
export interface GraphViewNode {
  id: string;
  label: string;
  type: string;              // 'module', 'file', etc.
  x?: number;                // Layout coordinates
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  metadata: {
    fileCount?: number;
    dependencyCount?: number;
    [key: string]: any;
  };
}

export interface GraphViewEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  color?: string;
  weight?: number;
  metadata: {
    importCount?: number;
    [key: string]: any;
  };
}

export class GraphView {
  constructor(
    public readonly nodes: GraphViewNode[],
    public readonly edges: GraphViewEdge[],
    public readonly metadata: {
      projectionType: string;
      generatedAt: Date;
      layout?: string;  // 'dagre', 'force', etc.
      [key: string]: any;
    }
  ) {}

  getNode(id: string): GraphViewNode | undefined;
  getEdgesFrom(nodeId: string): GraphViewEdge[];
  getEdgesTo(nodeId: string): GraphViewEdge[];
}

// domain/services/GraphViewBuilder.ts
export interface GraphViewConfig {
  includeMetrics?: boolean;
  colorScheme?: 'default' | 'complexity' | 'dependencies';
  nodeSize?: 'fixed' | 'proportional';
}

export class GraphViewBuilder {
  constructor(private logger: Logger) {}

  /**
   * Convert ModuleProjection to GraphView
   */
  build(projection: ModuleProjection, config: GraphViewConfig = {}): GraphView {
    const nodes = this.createNodes(projection.modules, config);
    const edges = this.createEdges(projection.modules, config);

    return new GraphView(nodes, edges, {
      projectionType: 'module-dependency',
      generatedAt: new Date(),
      moduleCount: projection.modules.length,
      dependencyCount: edges.length
    });
  }

  private createNodes(modules: Module[], config: GraphViewConfig): GraphViewNode[] {
    return modules.map(module => ({
      id: module.id,
      label: module.name,
      type: 'module',
      color: this.getNodeColor(module, config.colorScheme),
      metadata: config.includeMetrics ? {
        fileCount: module.metrics.fileCount,
        dependencyCount: module.metrics.dependencyCount,
        dependentCount: module.metrics.dependentCount,
        totalLines: module.metrics.totalLines
      } : {}
    }));
  }

  private createEdges(modules: Module[], config: GraphViewConfig): GraphViewEdge[] {
    const edges: GraphViewEdge[] = [];

    for (const module of modules) {
      for (const depId of module.dependencies) {
        edges.push({
          id: `${module.id}-${depId}`,
          from: module.id,
          to: depId,
          metadata: {}
        });
      }
    }

    return edges;
  }

  private getNodeColor(module: Module, scheme?: string): string {
    if (scheme === 'complexity') {
      // Color by file count
      if (module.metrics.fileCount > 50) return '#ff6b6b';
      if (module.metrics.fileCount > 20) return '#feca57';
      return '#48dbfb';
    }

    if (scheme === 'dependencies') {
      // Color by dependency count
      if (module.metrics.dependencyCount > 10) return '#ff6b6b';
      if (module.metrics.dependencyCount > 5) return '#feca57';
      return '#48dbfb';
    }

    return '#4ecdc4';  // default
  }
}

// domain/ports/GraphLayoutEngine.ts
export interface GraphLayoutEngine {
  /**
   * Apply layout algorithm to GraphView (mutates x, y coordinates)
   */
  layout(graphView: GraphView): Promise<GraphView>;
}

// infrastructure/layout-engines/DagreLayoutEngine.ts
import dagre from 'dagre';

export interface DagreLayoutConfig {
  rankdir?: 'TB' | 'BT' | 'LR' | 'RL';  // Top-to-Bottom, Left-to-Right, etc.
  nodesep?: number;                      // Separation between nodes
  ranksep?: number;                      // Separation between ranks
  marginx?: number;
  marginy?: number;
}

export class DagreLayoutEngine implements GraphLayoutEngine {
  constructor(
    private config: DagreLayoutConfig = {},
    private logger: Logger
  ) {}

  async layout(graphView: GraphView): Promise<GraphView> {
    this.logger.info('Applying Dagre layout', { 
      nodes: graphView.nodes.length, 
      edges: graphView.edges.length 
    });

    // Create Dagre graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: this.config.rankdir || 'TB',
      nodesep: this.config.nodesep || 50,
      ranksep: this.config.ranksep || 50,
      marginx: this.config.marginx || 20,
      marginy: this.config.marginy || 20
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    for (const node of graphView.nodes) {
      g.setNode(node.id, {
        label: node.label,
        width: node.width || 100,
        height: node.height || 50
      });
    }

    // Add edges
    for (const edge of graphView.edges) {
      g.setEdge(edge.from, edge.to);
    }

    // Run layout algorithm
    dagre.layout(g);

    // Update node positions (mutate graphView)
    for (const node of graphView.nodes) {
      const dagreNode = g.node(node.id);
      if (dagreNode) {
        node.x = dagreNode.x;
        node.y = dagreNode.y;
      }
    }

    // Update metadata
    graphView.metadata.layout = 'dagre';
    graphView.metadata.layoutConfig = this.config;

    this.logger.info('Dagre layout complete');
    return graphView;
  }
}
```

### 2.3 Implementation Steps

1. **Add `dagre` dependency:**
   ```bash
   npm install dagre @types/dagre
   ```

2. **Create GraphView entity:**
   - Define `GraphViewNode` and `GraphViewEdge` interfaces
   - Implement `GraphView` class with query methods

3. **Create GraphViewBuilder service:**
   - Convert `ModuleProjection` → `GraphView`
   - Support different color schemes
   - Include optional metrics

4. **Create GraphLayoutEngine port:**
   - Define interface for layout engines

5. **Implement DagreLayoutEngine:**
   - Integrate `dagre` library
   - Apply layout algorithm
   - Mutate node positions (x, y)

6. **Integrate into ModuleProjectionStrategy:**
   - After building `ModuleProjection`, build `GraphView`
   - Apply layout engine
   - Return laid-out `GraphView`

7. **Write tests:**
   - Unit tests for `GraphViewBuilder` (node/edge creation)
   - Unit tests for `DagreLayoutEngine` (layout application)

### 2.4 Acceptance Criteria

- ✅ `GraphView` entity is defined and stores nodes/edges
- ✅ `GraphViewBuilder` converts `ModuleProjection` to `GraphView`
- ✅ `DagreLayoutEngine` applies layout and assigns x, y coordinates
- ✅ Layout produces reasonable node positions (no overlaps, clear hierarchy)
- ✅ `ModuleProjectionStrategy` returns a laid-out `GraphView`
- ✅ All tests pass with >80% code coverage

---

## Phase 3: Export & Integration

**Goal:** Enable export of `GraphView` into various formats (JSON, SVG, GraphML) and integrate with CLI/API.

**Duration:** 2-3 days

### 3.1 Filesystem Structure

```text
c3-projection/
├── src/
│   ├── domain/
│   │   └── ports/
│   │       └── GraphExporter.ts                     [NEW] ✨
│   │
│   └── infrastructure/
│       └── exporters/
│           ├── JSONGraphExporter.ts                 [NEW] ✨
│           ├── GraphMLExporter.ts                   [NEW] ✨
│           └── SVGGraphExporter.ts                  [NEW] ✨
│
├── tests/
│   └── unit/
│       ├── JSONGraphExporter.test.ts                [NEW] ✨
│       └── GraphMLExporter.test.ts                  [NEW] ✨
│
└── examples/
    └── generate-module-view.ts                      [NEW] ✨
```

### 3.2 Key Types & Interfaces

```typescript
// domain/ports/GraphExporter.ts
export enum ExportFormat {
  JSON = 'json',
  GRAPHML = 'graphml',
  SVG = 'svg',
  DOT = 'dot'
}

export interface GraphExporter {
  /**
   * Export GraphView to specified format
   */
  export(graphView: GraphView, options?: ExportOptions): Promise<string | Buffer>;
}

export interface ExportOptions {
  pretty?: boolean;
  includeMetadata?: boolean;
  [key: string]: any;
}

// infrastructure/exporters/JSONGraphExporter.ts
export class JSONGraphExporter implements GraphExporter {
  async export(graphView: GraphView, options: ExportOptions = {}): Promise<string> {
    const output = {
      nodes: graphView.nodes,
      edges: graphView.edges,
      metadata: options.includeMetadata ? graphView.metadata : undefined
    };

    return options.pretty 
      ? JSON.stringify(output, null, 2)
      : JSON.stringify(output);
  }
}

// infrastructure/exporters/GraphMLExporter.ts
export class GraphMLExporter implements GraphExporter {
  async export(graphView: GraphView, options: ExportOptions = {}): Promise<string> {
    // Generate GraphML XML format
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">\n';
    xml += '  <graph id="G" edgedefault="directed">\n';

    // Add nodes
    for (const node of graphView.nodes) {
      xml += `    <node id="${node.id}">\n`;
      xml += `      <data key="label">${node.label}</data>\n`;
      if (node.x !== undefined) xml += `      <data key="x">${node.x}</data>\n`;
      if (node.y !== undefined) xml += `      <data key="y">${node.y}</data>\n`;
      xml += `    </node>\n`;
    }

    // Add edges
    for (const edge of graphView.edges) {
      xml += `    <edge source="${edge.from}" target="${edge.to}" />\n`;
    }

    xml += '  </graph>\n';
    xml += '</graphml>';

    return xml;
  }
}

// infrastructure/exporters/SVGGraphExporter.ts
export class SVGGraphExporter implements GraphExporter {
  async export(graphView: GraphView, options: ExportOptions = {}): Promise<string> {
    // Basic SVG generation (can be enhanced with libraries like D3)
    const width = 1200;
    const height = 800;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
    
    // Draw edges
    svg += '  <g class="edges">\n';
    for (const edge of graphView.edges) {
      const fromNode = graphView.getNode(edge.from);
      const toNode = graphView.getNode(edge.to);
      
      if (fromNode && toNode && fromNode.x !== undefined && toNode.x !== undefined) {
        svg += `    <line x1="${fromNode.x}" y1="${fromNode.y}" x2="${toNode.x}" y2="${toNode.y}" stroke="#999" stroke-width="2" />\n`;
      }
    }
    svg += '  </g>\n';

    // Draw nodes
    svg += '  <g class="nodes">\n';
    for (const node of graphView.nodes) {
      if (node.x !== undefined && node.y !== undefined) {
        svg += `    <g>\n`;
        svg += `      <rect x="${node.x - 50}" y="${node.y - 25}" width="100" height="50" fill="${node.color || '#4ecdc4'}" rx="5" />\n`;
        svg += `      <text x="${node.x}" y="${node.y}" text-anchor="middle" dominant-baseline="middle" fill="white">${node.label}</text>\n`;
        svg += `    </g>\n`;
      }
    }
    svg += '  </g>\n';

    svg += '</svg>';
    return svg;
  }
}
```

### 3.3 Implementation Steps

1. **Create GraphExporter port:**
   - Define interface and `ExportFormat` enum

2. **Implement exporters:**
   - `JSONGraphExporter` - Standard JSON format
   - `GraphMLExporter` - GraphML XML format (for tools like yEd, Gephi)
   - `SVGGraphExporter` - Basic SVG visualization

3. **Update GenerateProjection use case:**
   - Accept `exportFormat` parameter
   - Use appropriate exporter
   - Return exported string/buffer

4. **Create example script:**
   - `examples/generate-module-view.ts`
   - Demonstrates end-to-end usage
   - Generates output files

5. **Write tests:**
   - Unit tests for each exporter
   - Verify output format validity

6. **Documentation:**
   - Update README with usage examples
   - Add API documentation

### 3.4 Acceptance Criteria

- ✅ `JSONGraphExporter` produces valid JSON
- ✅ `GraphMLExporter` produces valid GraphML XML
- ✅ `SVGGraphExporter` produces valid SVG
- ✅ `GenerateProjection` can export in all formats
- ✅ Example script successfully generates module view for a sample codebase
- ✅ Exported files can be opened in external tools (e.g., JSON viewers, yEd for GraphML)
- ✅ All tests pass with >80% code coverage

---

## Risk Assessment & Mitigation

| Risk | Mitigation Strategy |
|---|---|
| **Complexity of module aggregation** | Start with simple directory-based aggregation. Test thoroughly with various codebase structures. |
| **Performance for large codebases** | PropertyGraph already handles large graphs efficiently. Use streaming/batching if needed. Profile early. |
| **Layout algorithm scalability** | Dagre handles hundreds of nodes well. For larger graphs, implement filtering or hierarchical layout. |
| **PropertyGraph API changes** | `c3-parsing` v2.0.0 is stable. Integration tests will catch breaking changes early. |
| **Ambiguous module definitions** | Start with clear directory-based modules. Make aggregation configurable for future flexibility. |
| **Circular dependencies** | Implement cycle detection in Phase 2. Add warnings/visualizations for cycles. |

---

## Success Metrics

- ✅ **Functional Correctness:** Module views accurately reflect codebase structure and dependencies
- ✅ **Performance:** Generation completes in <5 seconds for medium-sized projects (500-1000 files)
- ✅ **Extensibility:** New aggregation strategies can be added without changing core logic
- ✅ **Maintainability:** Clean code with >80% test coverage, clear documentation
- ✅ **Integration:** Seamlessly works with `c3-parsing` v2.0.0
- ✅ **Usability:** Export formats work with standard visualization tools

---

## Timeline Estimate

- **Phase 1 (Module Model Layer):** 4-5 days
- **Phase 2 (Viewpoint & Layout):** 3-4 days
- **Phase 3 (Export & Integration):** 2-3 days
- **Total:** **9-12 days** (vs. 12-16 days in original plan)

**Time saved:** 3-4 days by eliminating the CanonicalActualGraph layer!

---

## Next Steps

1. Review this plan with the team
2. Begin Phase 1 implementation
3. Create a feature branch: `feature/module-dependency-view`
4. Implement incrementally with test-driven development
5. Regular check-ins after each phase

---

*Last updated: 2025-11-16*

