# Canonical Graph Layer Analysis

## Question
Do we actually need the CanonicalActualGraph intermediate layer, or can we go directly from PropertyGraph to ModuleModel?

## Investigation

### What PropertyGraph Provides (from c3-parsing v2.0.0)

The `PropertyGraph` is already a rich, queryable data structure:

**Node Capabilities:**
- `getNodes()` - Get all nodes
- `getNodesByLabel(label)` - Filter by label (e.g., "File", "CodeElement")
- `getNodesByAnyLabel(labels)` - Filter by any of multiple labels
- `getNodesByDomain(domain)` - Filter by source domain (e.g., "code", "filesystem")
- `getNode(id)` - Get specific node by ID

**Node Types Available:**
```typescript
NodeType.FILE        // Source code files
NodeType.DIRECTORY   // Directories
NodeType.MODULE      // Modules/packages
NodeType.CLASS       // Classes
NodeType.FUNCTION    // Functions
// ... and 15+ other types
```

**Edge Capabilities:**
- `getEdges()` - Get all edges
- `getEdgesFrom(nodeId)` - All edges originating from a node
- `getEdgesTo(nodeId)` - All edges pointing to a node
- `getEdgesByDomain(domain)` - Filter by source domain

**Edge Types Available:**
```typescript
EdgeType.IMPORTS     // Import relationships
EdgeType.DEPENDS_ON  // Dependency relationships
EdgeType.CALLS       // Function call relationships
EdgeType.CONTAINS    // Containment (e.g., file contains class)
// ... and 15+ other types
```

**Rich Metadata:**
- Each node has: `filePath`, `startLine`, `endLine`, `size`, and arbitrary metadata
- Each node has: `labels` (Set<string>) for multi-classification
- Each node has: `source` (domain, extension, version, timestamp)
- Each edge has: metadata including `weight`, imported symbols, etc.

### What CanonicalActualGraph Would Provide

The proposed CanonicalActualGraph would essentially be:

```typescript
class CanonicalActualGraph {
  files: FileNode[];      // Simplified file representation
  imports: ImportEdge[];  // Simplified import relationships
}

interface FileNode {
  id: string;
  path: string;
}

interface ImportEdge {
  from: string;  // file ID
  to: string;    // file ID
}
```

**This is just a filtered, simplified view of PropertyGraph.**

### What ModuleModel Needs

To build a ModuleModel (grouping files into modules and calculating dependencies), we need:

1. **Files** - To group into modules (typically by directory)
2. **Import relationships** - To determine module dependencies
3. **File metadata** - Paths, sizes, etc.

**All of this is already available in PropertyGraph!**

Example code to get what we need:

```typescript
// Get all code files
const files = propertyGraph.getNodes()
  .filter(node => node.type === NodeType.FILE && node.isFromDomain('code'));

// Get all import edges between files
const imports = propertyGraph.getEdges()
  .filter(edge => edge.type === EdgeType.IMPORTS);

// Group files by directory (for module aggregation)
const filesByDirectory = new Map<string, Node[]>();
files.forEach(file => {
  const dir = path.dirname(file.metadata.filePath);
  if (!filesByDirectory.has(dir)) {
    filesByDirectory.set(dir, []);
  }
  filesByDirectory.get(dir)!.push(file);
});
```

## Options Analysis

### Option 1: Skip CanonicalActualGraph (RECOMMENDED) ✅

**Architecture:**
```
PropertyGraph (from c3-parsing)
      ↓
  [Filter & Query]
      ↓
ModuleAggregator → Module[]
      ↓
ModuleDependencyCalculator → ModuleDependencyModel
      ↓
GraphViewBuilder → GraphView (for rendering)
```

**Pros:**
- ✅ **Simpler architecture** - One less layer to maintain
- ✅ **No transformation overhead** - Direct access to rich data
- ✅ **More flexible** - Can easily query additional node/edge types
- ✅ **Less code** - No need to write transformation logic
- ✅ **Rich metadata available** - Can access labels, source tracking, etc.
- ✅ **Future-proof** - Easy to add git, testing, or other data sources
- ✅ **Better performance** - No intermediate transformation step
- ✅ **Reusable** - Same PropertyGraph can serve multiple projections

**Cons:**
- ❌ **Direct coupling to PropertyGraph** - But this is our core model anyway
- ❌ **Need to filter for relevant data** - Trivial with existing query methods

**Implementation:**
```typescript
class ModuleAggregator {
  aggregate(graph: PropertyGraph, config: AggregationConfig): Module[] {
    // Direct filtering - no intermediate layer needed
    const codeFiles = graph.getNodes()
      .filter(node => node.type === NodeType.FILE)
      .filter(node => node.isFromDomain('code'));
    
    const imports = graph.getEdges()
      .filter(edge => edge.type === EdgeType.IMPORTS);
    
    // Group files into modules by directory
    return this.groupByDirectory(codeFiles);
  }
}
```

### Option 2: Keep CanonicalActualGraph

**Architecture:**
```
PropertyGraph (from c3-parsing)
      ↓
CanonicalGraphBuilder → CanonicalActualGraph
      ↓
ModuleAggregator → Module[]
      ↓
ModuleDependencyCalculator → ModuleDependencyModel
      ↓
GraphViewBuilder → GraphView (for rendering)
```

**Pros:**
- ✅ **Explicit contract** - Clear interface between layers
- ✅ **Could be cached** - For multiple projections (but PropertyGraph can too)
- ✅ **Separation of concerns** - Isolates PropertyGraph structure changes

**Cons:**
- ❌ **Extra layer** - More code to write and maintain
- ❌ **Transformation overhead** - Converting PropertyGraph → CanonicalActualGraph
- ❌ **Loses metadata** - Simplified view discards useful information
- ❌ **Less flexible** - Hard to add new data sources later
- ❌ **Premature abstraction** - PropertyGraph is already stable
- ❌ **Duplicates functionality** - PropertyGraph already has filtering

**When might this be useful?**
- If PropertyGraph was unstable or changed frequently (it's not)
- If we needed a drastically different model (we don't - just files & imports)
- If transformation was complex (it's trivial - just filtering)

## Recommendation

**Skip the CanonicalActualGraph layer entirely.** 

Here's why:

1. **PropertyGraph is already canonical** - It's our authoritative source of truth from c3-parsing
2. **Filtering is trivial** - `getNodesByLabel()`, `getEdgesByType()` already do what we need
3. **No transformation needed** - The data is already in the right format
4. **More maintainable** - Less code, fewer layers, simpler mental model
5. **More flexible** - Easy to query additional data (git, tests, etc.) later
6. **Better performance** - No intermediate conversion step

## Updated Architecture

### Phase 1: Direct Graph Integration (Recommended)
```
c3-projection/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Module.ts                  # Core module entity
│   │   │   └── ModuleProjection.ts        # Collection of modules
│   │   └── services/
│   │       ├── ModuleAggregator.ts        # PropertyGraph → Module[]
│   │       └── ModuleDependencyCalculator.ts  # Calculate module deps
│   └── infrastructure/
│       └── strategies/
│           └── ModuleProjectionStrategy.ts
```

**Code Flow:**
```typescript
// In ModuleProjectionStrategy
async project(propertyGraph: PropertyGraph): Promise<ModuleProjection> {
  // Step 1: Aggregate files into modules (direct from PropertyGraph)
  const modules = this.moduleAggregator.aggregate(propertyGraph, {
    level: 'directory'
  });
  
  // Step 2: Calculate module dependencies (using PropertyGraph edges)
  this.moduleDependencyCalculator.calculate(modules, propertyGraph);
  
  // Step 3: Build projection
  return new ModuleProjection(modules);
}
```

## Testing Strategy

With this approach, tests become simpler:

```typescript
describe('ModuleAggregator', () => {
  it('should group files by directory', () => {
    // Create a PropertyGraph with test data
    const graph = new PropertyGraph(/* ... */);
    graph.addNode(new Node('file1', NodeType.FILE, 'FileA.ts', { filePath: '/src/foo/FileA.ts' }));
    graph.addNode(new Node('file2', NodeType.FILE, 'FileB.ts', { filePath: '/src/foo/FileB.ts' }));
    
    // Aggregate directly
    const modules = aggregator.aggregate(graph, { level: 'directory' });
    
    expect(modules).toHaveLength(1);
    expect(modules[0].path).toBe('/src/foo');
    expect(modules[0].files).toHaveLength(2);
  });
});
```

No need to create/maintain CanonicalActualGraph test fixtures!

## Migration Path (if we later need abstraction)

If we discover we need CanonicalActualGraph later (unlikely), we can easily add it:

1. Create a `GraphAdapter` interface
2. Implement `PropertyGraphAdapter` (our current approach)
3. Optionally implement `CanonicalGraphAdapter`
4. Inject the adapter into `ModuleAggregator`

But let's not prematurely abstract. **YAGNI** (You Aren't Gonna Need It) applies here.

## Conclusion

**Skip CanonicalActualGraph.** Work directly with PropertyGraph using its rich query API.

This gives us:
- Simpler code
- Better performance
- More flexibility
- Less maintenance
- Direct access to rich metadata

The Phase 1 implementation should be:
1. Create `ModuleAggregator` that takes `PropertyGraph`
2. Filter for `NodeType.FILE` nodes
3. Group by directory path
4. Query `EdgeType.IMPORTS` edges for dependencies

No intermediate transformation layer needed.

