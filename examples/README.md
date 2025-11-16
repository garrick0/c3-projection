# c3-projection Examples

This directory contains examples demonstrating how to use c3-projection to analyze and visualize module dependencies in TypeScript codebases.

## 📚 Example Catalog

### 1. Quick Start (`quick-start.ts`) ⚡
**Perfect for:** First-time users, demos, presentations  
**Time:** ~5 minutes  
**What it does:**
- Analyzes any TypeScript codebase
- Exports to JSON, GraphML, and SVG
- Generates a comprehensive markdown report
- Shows module metrics and insights

**Usage:**
```bash
npx tsx examples/quick-start.ts [path-to-analyze]
npx tsx examples/quick-start.ts ../c3-parsing/src

# Or use npm script
npm run demo:quick-start
```

**Output:**
```
./output/quick-start/
├── module-graph.json       # Programmatic access
├── module-graph.graphml    # Import into yEd/Gephi
├── module-graph.svg        # Visual diagram
└── ANALYSIS.md             # Detailed report
```

---

### 2. Self-Analysis (`analyze-self.ts`) 🔍
**Perfect for:** Understanding Clean Architecture validation  
**Time:** ~10 minutes  
**What it does:**
- Analyzes c3-projection's own codebase
- Validates Clean Architecture principles
- Checks layer separation (Domain, Application, Infrastructure)
- Calculates architecture health score
- Detects circular dependencies

**Usage:**
```bash
npx tsx examples/analyze-self.ts

# Or use npm script
npm run demo:self-analysis
```

**Output:**
```
./output/self-analysis/
├── full-architecture.svg
├── architecture.json
└── ARCHITECTURE_ANALYSIS.md
```

**Key Insights:**
- ✓ Domain layer has 0 dependencies on Infrastructure
- ✓ Application orchestrates without coupling
- ✓ Zero circular dependencies
- ✓ Architecture Score: 95/100

---

### 3. Full-Featured Example (`generate-module-view.ts`) 🎯
**Perfect for:** Learning the complete API  
**Time:** ~15 minutes  
**What it does:**
- Demonstrates every feature of c3-projection
- Shows configuration options
- Includes caching strategies
- Multiple aggregation levels
- All export formats

**Usage:**
```bash
npx tsx examples/generate-module-view.ts

# Or use npm script
npm run demo:full
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd /path/to/c3-projection
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Run an Example
```bash
# Quick analysis of any codebase
npx tsx examples/quick-start.ts ../my-project/src
# Or: npm run demo:quick-start

# Self-analysis demo
npx tsx examples/analyze-self.ts
# Or: npm run demo:self-analysis

# Full-featured example
npx tsx examples/generate-module-view.ts
# Or: npm run demo:full
```

### 4. View Results
```bash
# Open SVG in browser
open output/quick-start/module-graph.svg

# Read analysis report
cat output/quick-start/ANALYSIS.md

# Import GraphML into yEd
# Download yEd: https://www.yworks.com/products/yed
# File > Open > output/quick-start/module-graph.graphml
```

---

## 📊 Understanding the Output

### JSON Export
```json
{
  "version": "1.0.0",
  "type": "module-dependency-graph",
  "metadata": {
    "generatedAt": "2025-11-16T...",
    "totalNodes": 15,
    "totalEdges": 42
  },
  "nodes": [
    {
      "id": "module-domain",
      "label": "domain",
      "x": 400,
      "y": 100,
      "metadata": { "fileCount": 8, "dependencyCount": 0 }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "module-app",
      "target": "module-domain",
      "type": "DEPENDS_ON"
    }
  ]
}
```

**Use cases:**
- CI/CD integration
- Automated checks
- Custom tooling
- Programmatic analysis

---

### GraphML Export
```xml
<graphml>
  <graph edgedefault="directed">
    <node id="module-domain">
      <data key="label">domain</data>
      <data key="fileCount">8</data>
      <data key="x">400</data>
      <data key="y">100</data>
    </node>
    <edge source="module-app" target="module-domain">
      <data key="type">DEPENDS_ON</data>
    </edge>
  </graph>
</graphml>
```

**Use cases:**
- Open in [yEd](https://www.yworks.com/products/yed) for professional layouts
- Import into [Gephi](https://gephi.org/) for advanced graph analysis
- Use with [Cytoscape](https://cytoscape.org/) for network visualization

---

### SVG Export
- Vector graphics (scales to any size)
- Color-coded by complexity or dependencies
- Labeled nodes
- Directional edges
- Perfect for documentation, presentations, reports

**Open in:**
- Web browsers (Chrome, Firefox, Safari)
- Design tools (Figma, Adobe Illustrator, Inkscape)
- Documentation (Markdown, Confluence, Notion)

---

### Markdown Report
```markdown
# Module Dependency Analysis

## Summary
| Metric | Value |
|--------|-------|
| Total Modules | 12 |
| Total Files | 145 |
| Circular Dependencies | 0 |

## Issues
- ✓ No circular dependencies
- ⚠ Module X has high coupling (8 dependencies)

## Recommendations
1. Consider splitting Module X
2. Reduce dependencies in Module Y
```

---

## 🎨 Customization Options

### Aggregation Levels

```typescript
import { AggregationLevel } from 'c3-projection';

// Group by directory
AggregationLevel.DIRECTORY

// Top-level packages only
AggregationLevel.TOP_LEVEL

// Package.json boundaries
AggregationLevel.PACKAGE

// Custom grouping
AggregationLevel.CUSTOM
```

### Color Schemes

```typescript
// Color by dependency count
colorScheme: 'dependencies'

// Color by complexity (file count)
colorScheme: 'complexity'

// Default colors
colorScheme: 'default'
```

### Layout Options

```typescript
import { DagreLayoutEngine } from 'c3-projection';

const layoutEngine = new DagreLayoutEngine({
  rankdir: 'TB',  // Top-to-bottom (or 'LR' for left-to-right)
  nodesep: 80,    // Horizontal spacing
  ranksep: 100    // Vertical spacing
}, logger);
```

---

## 🔧 Advanced Usage

### Filtering

```typescript
const config = ViewConfiguration.create({
  projectionType: ProjectionType.MODULE,
  aggregationLevel: AggregationLevel.TOP_LEVEL,
  options: {
    includeTests: false,
    excludePatterns: ['node_modules', 'dist', '__tests__', '*.test.ts']
  }
});
```

### Caching

```typescript
const graphLoader = new GraphLoader(logger, {
  extensions: [tsExtension],
  cacheEnabled: true  // Enable caching for faster re-runs
});
```

### Multiple Extensions

```typescript
import { TypeScriptExtension, FilesystemExtension } from 'c3-parsing';

const extensions = [
  new TypeScriptExtension({ /* config */ }),
  new FilesystemExtension({ /* config */ })
];

const graphLoader = new GraphLoader(logger, { extensions });
```

---

## 💡 Tips & Tricks

### 1. Large Codebases
For codebases with >10,000 files:
- Use `TOP_LEVEL` aggregation
- Enable caching
- Exclude test files
- Use specific include patterns

### 2. CI/CD Integration
```bash
# Run analysis in CI
npm run analyze:modules

# Check for circular dependencies
if grep -q "Circular:" output/ANALYSIS.md; then
  echo "Error: Circular dependencies detected!"
  exit 1
fi
```

### 3. Architecture Governance
```bash
# Validate architecture on every PR
npm run analyze:self
# Check architecture score
SCORE=$(grep "Architecture Score:" output/ARCHITECTURE_ANALYSIS.md)
# Fail if score < 80
```

### 4. Documentation
```bash
# Generate docs on release
npm run analyze:modules
cp output/module-graph.svg docs/architecture.svg
cp output/ANALYSIS.md docs/ARCHITECTURE.md
```

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Rebuild the project
npm run build

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### TypeScript errors during analysis
```bash
# Check your tsconfig.json
# Ensure include/exclude patterns are correct
```

### Empty or incomplete graphs
```bash
# Verify your path is correct
npx ts-node examples/quick-start.ts ./correct/path/to/src

# Check exclude patterns aren't too aggressive
```

### Performance issues
```bash
# Enable caching
# Use TOP_LEVEL aggregation
# Exclude test files and node_modules
```

---

## 📖 Further Reading

- [Module Dependency View Design](/docs/module-dependency-view-design.md)
- [Implementation Plan](/docs/module-dependency-implementation-plan-v2.md)
- [Demo Plan](/docs/demo-and-example-plan.md)
- [c3-parsing Documentation](../c3-parsing/README.md)

---

## 🤝 Contributing

Found a bug or have an idea for a new example?
1. Open an issue
2. Submit a pull request
3. Share your use case

---

**Happy Analyzing! 🎉**

