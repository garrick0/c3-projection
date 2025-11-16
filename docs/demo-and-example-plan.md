# Module Dependency View - Demo & Example Plan

**Date:** 2025-11-16  
**Status:** Planning  
**Goal:** Create a compelling demo and example showcasing c3-projection's capabilities

---

## Executive Summary

Create a multi-tiered demo strategy that showcases the module dependency view system through:
1. **Quick Start Example** - Simple, runnable script (5 minutes)
2. **Self-Analysis Demo** - Analyze c3-projection itself (10 minutes)
3. **Real-World Demo** - Analyze c3-parsing codebase (15 minutes)
4. **Interactive Web Demo** - Visual browser-based demo (Future)

---

## Demo 1: Quick Start Example

### Objective
Demonstrate the complete workflow in a single, easy-to-understand script that anyone can run immediately.

### Target Audience
- Developers evaluating the library
- Quick demos in meetings
- Documentation examples

### Implementation

#### File: `examples/quick-start.ts`

**Features to Demonstrate:**
1. Load a simple codebase
2. Create module projection
3. Apply layout
4. Export to multiple formats
5. Show metrics and insights

**Output:**
- Console output with progress
- JSON file with graph data
- GraphML file for external tools
- SVG visualization file

**Runtime:** < 10 seconds

#### Sample Output Structure:
```
output/quick-start/
├── module-graph.json      # Graph data
├── module-graph.graphml   # For yEd/Gephi
├── module-graph.svg       # Visual representation
└── metrics.txt            # Analysis summary
```

---

## Demo 2: Self-Analysis Demo

### Objective
Demonstrate the power by analyzing c3-projection's own codebase - a meta-analysis that shows real architectural insights.

### Why This Works
- "Eating our own dog food"
- Real, non-trivial codebase
- Familiar to developers reviewing the code
- Shows actual architectural patterns (Clean Architecture)

### Implementation

#### File: `examples/analyze-self.ts`

**Features to Demonstrate:**
1. Multi-level aggregation (directory vs top-level)
2. Clean Architecture layer visualization
3. Circular dependency detection
4. Module metrics comparison
5. Different color schemes
6. Multiple layout configurations

**Analysis Points:**
- Domain layer (should have no dependencies on infrastructure)
- Infrastructure layer (depends on domain)
- Application layer (orchestrates domain)
- Show that architecture is clean (no cycles, proper dependencies)

**Outputs:**
```
output/self-analysis/
├── directory-level/
│   ├── module-graph.json
│   ├── module-graph.graphml
│   └── module-graph.svg
├── top-level/
│   ├── domain-layer.svg
│   ├── infrastructure-layer.svg
│   └── application-layer.svg
├── metrics-report.md
└── architecture-analysis.md
```

**Insights to Highlight:**
- "Domain layer has 0 dependencies on Infrastructure ✓"
- "Infrastructure depends only on Domain (not on Application) ✓"
- "No circular dependencies detected ✓"
- "Average module cohesion score: X"

---

## Demo 3: Real-World Codebase Demo

### Objective
Analyze a substantial, real-world TypeScript codebase to demonstrate scalability and practical use.

### Target: c3-parsing

**Why c3-parsing:**
- ~5,000+ lines of code
- Real complexity (parser, AST transformers, extensions)
- Multiple domains (domain, infrastructure, application)
- Real architectural decisions to analyze

### Implementation

#### File: `examples/analyze-codebase.ts`

**Configurable Parameters:**
```typescript
{
  target: '../c3-parsing/src',
  aggregationLevel: 'TOP_LEVEL',
  includeTests: false,
  colorScheme: 'dependencies',
  layoutDirection: 'TB'
}
```

**Analysis Features:**
1. Module size distribution
2. Dependency hotspots (most depended-upon modules)
3. Coupling metrics (modules with most dependencies)
4. Island detection (disconnected components)
5. Depth analysis (dependency chain length)

**Interactive Report:**
```
output/c3-parsing-analysis/
├── full-graph/
│   ├── module-dependencies.svg      (full view)
│   ├── module-dependencies.graphml  (for Gephi)
│   └── module-dependencies.json     (raw data)
├── hotspots/
│   ├── most-depended-on.svg         (top 5 modules)
│   ├── most-dependencies.svg        (top 5 modules)
│   └── coupling-report.md
├── layers/
│   ├── domain-view.svg
│   ├── infrastructure-view.svg
│   └── application-view.svg
├── metrics/
│   ├── module-metrics.csv
│   ├── dependency-matrix.csv
│   └── architecture-score.md
└── README.md                        (analysis summary)
```

**Narrative Report Structure:**

```markdown
# c3-parsing Architecture Analysis

## Overview
- Total Modules: X
- Total Dependencies: Y
- Average Dependencies per Module: Z
- Circular Dependencies: N

## Key Insights

### 1. Core Modules (Most Depended-On)
1. Module A - Used by X modules
2. Module B - Used by Y modules
...

### 2. Complex Modules (Most Dependencies)
1. Module C - Depends on X modules (Consider refactoring?)
2. Module D - Depends on Y modules
...

### 3. Architecture Health
- ✓ Domain layer is clean (no external dependencies)
- ✓ No circular dependencies
- ⚠ Module X has high coupling (12 dependencies)

### 4. Recommendations
1. Consider splitting Module X (high coupling)
2. Review dependency from A → B (might be avoidable)
3. Module Y is isolated (potential dead code?)
```

---

## Demo 4: Comparative Analysis

### Objective
Compare different codebases or different versions of the same codebase.

### Implementation

#### File: `examples/compare-codebases.ts`

**Use Cases:**
1. Before/after refactoring
2. Compare different projects
3. Track architectural drift over time

**Outputs:**
```
output/comparison/
├── codebase-a/
│   └── [analysis files]
├── codebase-b/
│   └── [analysis files]
├── comparison/
│   ├── side-by-side.svg
│   ├── metrics-comparison.csv
│   └── delta-report.md
└── summary.md
```

**Metrics to Compare:**
- Module count change
- Dependency count change
- Average coupling change
- New circular dependencies
- Architectural score change

---

## Demo 5: Interactive Web Demo (Future)

### Objective
Browser-based interactive visualization for exploring module dependencies.

### Technology Stack
- React + TypeScript
- D3.js or Cytoscape.js for visualization
- Web worker for graph processing
- Local file upload or GitHub integration

### Features
1. **Interactive Graph:**
   - Zoom, pan, drag nodes
   - Click module to see details
   - Hover to highlight dependencies
   - Filter by metrics (size, dependencies, etc.)

2. **Analysis Panel:**
   - Real-time metrics
   - Search modules
   - Filter by label/domain
   - Export options

3. **Preset Views:**
   - Architecture layers
   - Hotspot analysis
   - Island detection
   - Dependency chains

### Implementation Path
```
web-demo/
├── public/
│   └── sample-graphs/        # Pre-generated examples
├── src/
│   ├── components/
│   │   ├── GraphViewer.tsx
│   │   ├── MetricsPanel.tsx
│   │   ├── FilterPanel.tsx
│   │   └── ExportPanel.tsx
│   ├── hooks/
│   │   ├── useGraphData.ts
│   │   └── useAnalysis.ts
│   ├── utils/
│   │   └── graphProcessing.ts
│   └── App.tsx
├── package.json
└── README.md
```

---

## Demo Script & Presentation

### 5-Minute Lightning Demo

**Script:**
```
[0:00-0:30] "Let me show you how to analyze your codebase architecture"

[0:30-1:30] Show quick-start.ts running
  - "One command analyzes your entire codebase"
  - Watch progress bar
  - "30 modules, 45 dependencies detected"

[1:30-2:30] Open generated SVG
  - "Here's your architecture visualized"
  - Point out key modules
  - "Red nodes = high complexity, blue = simple"

[2:30-3:30] Show metrics
  - "2 circular dependencies detected"
  - "Module X is your most critical (used by 10 others)"
  - "Average coupling is good"

[3:30-4:30] Open in yEd with GraphML
  - "Export to professional tools"
  - Show different layouts
  - "Deep analysis in tools you already use"

[4:30-5:00] Wrap up
  - "JSON for programmatic analysis"
  - "Works with any TypeScript codebase"
  - "Try it: npm install c3-projection"
```

### 15-Minute Deep Dive

**Part 1: Setup (2 min)**
- Clone example repo
- Run analyzer
- Show configuration options

**Part 2: Basic Analysis (5 min)**
- Module structure
- Dependency patterns
- Metrics overview
- Export formats

**Part 3: Advanced Features (5 min)**
- Circular dependency detection
- Hotspot analysis
- Different aggregation levels
- Custom color schemes

**Part 4: Practical Use Cases (3 min)**
- Refactoring planning
- Code review insights
- Architecture documentation
- Onboarding new developers

---

## Implementation Priority

### Phase 1: Essential Demos (Week 1)
- [x] ~~Basic example script~~ (Already exists as `generate-module-view.ts`)
- [ ] Self-analysis demo
- [ ] Documentation with screenshots
- [ ] Demo script/walkthrough

### Phase 2: Enhanced Examples (Week 2)
- [ ] Real-world codebase analysis (c3-parsing)
- [ ] Metrics report generator
- [ ] Comparison utility
- [ ] Video recording of demos

### Phase 3: Interactive Demo (Week 3-4)
- [ ] Web-based viewer prototype
- [ ] GitHub integration
- [ ] Public demo deployment
- [ ] Interactive documentation

---

## Required Enhancements

### 1. Improve Existing Example
**File:** `examples/generate-module-view.ts`

**Enhancements Needed:**
- [ ] Add more detailed console output
- [ ] Generate metrics report (Markdown)
- [ ] Add progress indicators
- [ ] Create summary visualization
- [ ] Add CLI arguments for configuration

### 2. Create Quick Start
**File:** `examples/quick-start.ts`

**Requirements:**
- Minimal dependencies
- Fast execution (< 10 sec)
- Clear output
- Self-documenting code

### 3. Create Self-Analysis
**File:** `examples/analyze-self.ts`

**Requirements:**
- Analyze c3-projection
- Generate architectural insights
- Multiple output formats
- Validation of Clean Architecture

### 4. Documentation
**Files:**
- `docs/DEMO_GUIDE.md` - How to run demos
- `docs/SCREENSHOTS.md` - Visual examples
- `examples/README.md` - Example catalog

---

## Output Specifications

### Console Output Format
```
╔══════════════════════════════════════════════╗
║  Module Dependency Analysis                  ║
╚══════════════════════════════════════════════╝

📂 Target: ./src
📊 Configuration:
   - Aggregation: TOP_LEVEL
   - Tests included: No
   - Color scheme: dependencies

⏳ Step 1/5: Loading codebase...
   ✓ Loaded 156 files

⏳ Step 2/5: Creating modules...
   ✓ Created 12 modules

⏳ Step 3/5: Analyzing dependencies...
   ✓ Found 34 dependencies
   ⚠ Detected 2 circular dependencies

⏳ Step 4/5: Generating visualizations...
   ✓ Applied layout
   ✓ Rendered graph

⏳ Step 5/5: Exporting results...
   ✓ JSON → output/module-graph.json
   ✓ GraphML → output/module-graph.graphml
   ✓ SVG → output/module-graph.svg
   ✓ Report → output/ANALYSIS.md

╔══════════════════════════════════════════════╗
║  Analysis Complete!                          ║
╚══════════════════════════════════════════════╝

📊 Summary:
   Modules: 12
   Files: 156
   Dependencies: 34
   Circular: 2
   Avg Coupling: 2.8

📁 Results saved to: ./output

⚠️  Issues Found:
   1. Circular: domain → infrastructure → domain
   2. High coupling: ModuleX (8 dependencies)

💡 Recommendations:
   - Review circular dependencies
   - Consider splitting ModuleX
   - Document core modules

🎉 Analysis successful! Open SVG to visualize.
```

### Markdown Report Template
```markdown
# Module Dependency Analysis Report

**Generated:** [timestamp]
**Target:** [path]
**Configuration:** [config summary]

## Summary Metrics

| Metric | Value |
|--------|-------|
| Total Modules | X |
| Total Files | Y |
| Dependencies | Z |
| Avg Coupling | N |
| Circular Deps | M |

## Module Overview

### Largest Modules
1. [Module A] - X files, Y lines
2. [Module B] - X files, Y lines

### Most Depended-On
1. [Module C] - Used by X modules
2. [Module D] - Used by Y modules

### Most Coupled
1. [Module E] - Depends on X modules
2. [Module F] - Depends on Y modules

## Architecture Analysis

### Dependency Graph
![Module Dependencies](./module-graph.svg)

### Issues Detected

#### Circular Dependencies
- [Module A] → [Module B] → [Module A]

#### High Coupling
- [Module X]: 8 dependencies (recommend < 5)

### Health Score: 85/100

✓ Clear layer separation
✓ Low average coupling
⚠ 2 circular dependencies
⚠ 1 highly coupled module

## Recommendations

1. **Break circular dependency** between A and B
   - Consider extracting shared interface
   - Review dependency direction

2. **Refactor Module X**
   - Too many dependencies
   - Consider splitting responsibilities

3. **Document core modules**
   - Module C is critical (used by many)
   - Ensure stability and test coverage
```

---

## Success Criteria

### Demo Success
- [ ] Can run demo in < 5 minutes
- [ ] Output is visually appealing
- [ ] Insights are actionable
- [ ] Works on multiple codebases
- [ ] Documentation is clear

### Technical Success
- [ ] Handles codebases up to 10,000 files
- [ ] Generates output in < 30 seconds
- [ ] All export formats work correctly
- [ ] No errors on edge cases

### User Success
- [ ] Users understand the value immediately
- [ ] Users can run it on their own code
- [ ] Users find actionable insights
- [ ] Users can share results with teams

---

## Timeline

### Week 1: Foundation
- Day 1-2: Enhance existing example
- Day 3-4: Create self-analysis demo
- Day 5: Documentation and screenshots

### Week 2: Real-World
- Day 1-2: c3-parsing analysis
- Day 3: Metrics report generator
- Day 4-5: Demo script and video

### Week 3-4: Interactive (Optional)
- Week 3: Web demo prototype
- Week 4: Polish and deploy

---

## Next Steps

1. **Immediate:**
   - Enhance `generate-module-view.ts` with better output
   - Create `quick-start.ts` example
   - Add progress indicators

2. **Short-term:**
   - Create self-analysis demo
   - Generate screenshots
   - Write demo guide

3. **Medium-term:**
   - Record demo video
   - Create comparison utility
   - Web demo prototype

---

**Status:** Ready to implement
**Priority:** High
**Estimated Effort:** 1-2 weeks for complete demo suite

