# Demo & Example Overview

## 📋 Summary

This document provides a high-level overview of the demo strategy for c3-projection's module dependency view system.

---

## 🎯 Demo Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Demo Pyramid                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         🌐 Interactive Web Demo (Future)                    │
│              └─> Live visualization                         │
│                  └─> GitHub integration                     │
│                                                             │
│    📊 Real-World Analysis (c3-parsing)                      │
│         └─> Substantial codebase (~5K LOC)                  │
│             └─> Architectural insights                      │
│                                                             │
│  🔍 Self-Analysis Demo (c3-projection)                      │
│       └─> Meta-analysis                                     │
│           └─> Clean Architecture validation                 │
│                                                             │
│ ⚡ Quick Start Example                                      │
│      └─> 5-minute demo                                      │
│          └─> Immediate value                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Demo Levels

### Level 1: Quick Start (5 minutes)
**File:** `examples/quick-start.ts`
**Target:** First-time users, quick demos

```typescript
// One command to analyze any TypeScript codebase
await analyzeCodebase('./src');

// Output: JSON, GraphML, SVG + metrics report
```

**Key Features:**
- ✅ Minimal setup
- ✅ Fast execution
- ✅ Clear output
- ✅ Actionable insights

---

### Level 2: Self-Analysis (10 minutes)
**File:** `examples/analyze-self.ts`
**Target:** Understanding the tool's architecture

```
Analyze c3-projection's own codebase
  ↓
Validate Clean Architecture
  ↓
Show layer separation
  ↓
Prove zero circular dependencies
```

**Insights Generated:**
- Domain layer has 0 external dependencies ✓
- Infrastructure properly depends on Domain ✓
- Application orchestrates without coupling ✓
- No circular dependencies ✓

---

### Level 3: Real-World Demo (15 minutes)
**File:** `examples/analyze-codebase.ts`
**Target:** c3-parsing (~5,000 LOC)

**Analysis Includes:**
1. **Module Structure**
   - Domain, Infrastructure, Application layers
   - Extensions architecture
   - Service organization

2. **Dependency Patterns**
   - Most depended-on modules (hotspots)
   - Most coupled modules (refactoring candidates)
   - Dependency depth analysis

3. **Health Metrics**
   - Circular dependency detection
   - Coupling metrics
   - Cohesion scores
   - Architecture score

4. **Recommendations**
   - Refactoring suggestions
   - Architectural improvements
   - Risk assessments

---

### Level 4: Interactive Web Demo (Future)
**Technology:** React + D3.js + TypeScript

**Features:**
```
┌─────────────────────────────────────────┐
│ File Upload / GitHub URL                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────┐  ┌──────────────┐ │
│  │                 │  │   Metrics    │ │
│  │   Graph View    │  │   Panel      │ │
│  │   (Interactive) │  │              │ │
│  │                 │  │  • Modules   │ │
│  │   Zoom/Pan/Drag │  │  • Deps      │ │
│  │                 │  │  • Cycles    │ │
│  └─────────────────┘  └──────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┤
│  │ Filters | Export | Settings         │
│  └─────────────────────────────────────┤
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Output Formats

### 1. JSON Export
```json
{
  "version": "1.0.0",
  "type": "module-dependency-graph",
  "graph": {
    "nodes": [...],
    "edges": [...]
  },
  "metadata": {...}
}
```
**Use Case:** Programmatic analysis, CI/CD integration

---

### 2. GraphML Export
```xml
<graphml>
  <graph edgedefault="directed">
    <node id="module-A">
      <data key="label">Module A</data>
      <data key="fileCount">12</data>
    </node>
    ...
  </graph>
</graphml>
```
**Use Case:** Open in yEd, Gephi, Cytoscape

---

### 3. SVG Export
```svg
<svg width="1200" height="800">
  <!-- Visual graph with nodes and edges -->
  <!-- Color-coded by complexity/dependencies -->
  <!-- Labeled with module names -->
</svg>
```
**Use Case:** Documentation, presentations, reports

---

### 4. Markdown Report
```markdown
# Architecture Analysis

## Metrics
- Modules: 12
- Dependencies: 34
- Circular: 2

## Issues
1. Circular: A → B → A
2. High coupling: Module X

## Recommendations
- Break circular dependency
- Refactor Module X
```
**Use Case:** Team reviews, architectural documentation

---

## 🎬 Demo Script (5-Minute Version)

### Scene 1: The Problem (30 seconds)
```
"Large TypeScript codebases are hard to understand.
Dependencies are invisible.
Architecture decays over time.
How do you know if your refactoring made things better?"
```

### Scene 2: The Solution (30 seconds)
```
"c3-projection makes your architecture visible in seconds.
One command analyzes your entire codebase.
See your modules, dependencies, and issues instantly."
```

### Scene 3: Live Demo (2 minutes)
```
1. Run: npm run analyze ./src
2. Watch: Real-time progress
3. Show: Generated SVG visualization
4. Highlight: "Look - 2 circular dependencies found!"
```

### Scene 4: Deep Dive (1.5 minutes)
```
1. Open metrics report
   └─> Module counts, coupling scores
2. Open in yEd (GraphML)
   └─> Professional visualization tools
3. Show JSON
   └─> Programmatic access for CI/CD
```

### Scene 5: Call to Action (30 seconds)
```
"Works with any TypeScript codebase.
Integrates with your workflow.
Try it: npm install c3-projection"
```

---

## 🎨 Visual Design

### Color Schemes

**By Complexity:**
- 🔴 Red: High complexity (> 50 files)
- 🟡 Yellow: Medium (20-50 files)
- 🔵 Blue: Low (< 20 files)

**By Dependencies:**
- 🔴 Red: High coupling (> 10 deps)
- 🟡 Yellow: Medium (5-10 deps)
- 🔵 Blue: Low (1-5 deps)
- 🟢 Green: Leaf modules (0 deps)

**By Role:**
- 🟣 Purple: Domain layer
- 🔵 Blue: Application layer
- 🟢 Green: Infrastructure layer

---

## 📈 Success Metrics

### Demo Effectiveness
- [ ] Audience understands value in < 1 minute
- [ ] Demo runs smoothly without errors
- [ ] Output is visually impressive
- [ ] Insights are actionable
- [ ] Call to action is clear

### Technical Metrics
- [ ] Analysis completes in < 30 seconds
- [ ] Works on codebases up to 10,000 files
- [ ] All export formats valid
- [ ] Detects real architectural issues

### User Metrics
- [ ] Users can run demo independently
- [ ] Users find issues in their code
- [ ] Users integrate into workflow
- [ ] Users recommend to colleagues

---

## 🔧 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Basic example exists (`generate-module-view.ts`)
- [x] All exporters working (JSON, GraphML, SVG)
- [x] Core functionality complete
- [x] Tests passing

### Phase 2: Enhanced Demos
- [ ] Create `quick-start.ts`
- [ ] Create `analyze-self.ts`
- [ ] Add progress indicators
- [ ] Generate markdown reports
- [ ] Add CLI arguments

### Phase 3: Documentation
- [ ] Screenshot generation
- [ ] Demo script writing
- [ ] Video recording
- [ ] Example catalog

### Phase 4: Interactive (Optional)
- [ ] Web demo prototype
- [ ] GitHub integration
- [ ] Public deployment
- [ ] User analytics

---

## 📚 Documentation Structure

```
docs/
├── demo-and-example-plan.md    # Comprehensive plan (this file)
├── DEMO_OVERVIEW.md            # High-level overview
├── DEMO_QUICK_REFERENCE.md     # Quick commands & tips
└── DEMO_GUIDE.md               # Step-by-step walkthrough

examples/
├── generate-module-view.ts     # Full-featured example ✅
├── quick-start.ts              # 5-minute demo
├── analyze-self.ts             # Self-analysis
└── README.md                   # Example catalog
```

---

## 🎯 Target Audiences

### 1. Developers (Primary)
**Need:** Understand codebase architecture
**Demo:** Quick start → Show SVG → Highlight issues
**Value:** Immediate architectural insights

### 2. Tech Leads (Secondary)
**Need:** Architectural oversight and refactoring planning
**Demo:** Real-world analysis → Metrics → Trends
**Value:** Data-driven decision making

### 3. New Team Members (Tertiary)
**Need:** Onboarding, codebase understanding
**Demo:** Self-analysis → Layer explanation → Navigation
**Value:** Faster ramp-up time

### 4. Open Source Community (Aspirational)
**Need:** Tool evaluation, adoption
**Demo:** Web demo → Examples → GitHub integration
**Value:** Zero-friction try-before-install

---

## 🚦 Next Steps

1. **Immediate (This Week)**
   - Enhance existing example with progress bars
   - Create quick-start.ts
   - Write demo script

2. **Short-term (Next Week)**
   - Create analyze-self.ts
   - Generate screenshots
   - Record demo video

3. **Medium-term (This Month)**
   - Create analyze-codebase.ts for c3-parsing
   - Build comparison utility
   - Web demo prototype

4. **Long-term (Next Quarter)**
   - Interactive web demo
   - GitHub integration
   - Public deployment
   - Community adoption

---

**Status:** Plan Complete ✅  
**Ready to Implement:** Yes  
**Priority:** High  
**Owner:** Development Team
