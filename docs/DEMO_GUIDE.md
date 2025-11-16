# Demo Guide - c3-projection Module Dependency View

This guide walks you through a complete demonstration of c3-projection's module dependency view capabilities.

---

## 🎯 Demo Overview

**Total Time:** 15-20 minutes  
**Target Audience:** Developers, Tech Leads, Architects  
**Prerequisites:** Node.js, TypeScript knowledge  

---

## 🚀 Setup (2 minutes)

### 1. Clone and Install
```bash
cd /Users/samuelgleeson/dev/c3-projection
npm install
npm run build
```

### 2. Verify Installation
```bash
npx ts-node --version
# Should output TypeScript version
```

---

## 📖 Act 1: Quick Start Demo (5 minutes)

### The Problem
*"How do you understand the architecture of a large TypeScript codebase?"*

- Dependencies are invisible
- Circular dependencies hide until they bite
- Refactoring is risky without visibility
- Documentation gets out of sync

### The Solution
*"c3-projection makes your architecture visible in seconds."*

### Live Demo

```bash
# Analyze c3-parsing (a real TypeScript codebase)
npx tsx examples/quick-start.ts ../c3-parsing/src

# Or use the built-in demo (analyzes c3-projection itself)
npm run demo:quick-start
```

**What you'll see:**
```
╔════════════════════════════════════════════════╗
║  Module Dependency Analysis - Quick Start     ║
╚════════════════════════════════════════════════╝

📂 Target: ../c3-parsing/src
📁 Output: ./output/quick-start

⏳ Step 1/5: Loading codebase...
   ✓ Loaded 234 nodes, 156 edges

⏳ Step 2/5: Creating module projection...
   ✓ Created 8 modules with 15 dependencies

⏳ Step 3/5: Building visualization...
   ✓ Applied layout to 8 nodes

⏳ Step 4/5: Exporting results...
   ✓ Exported to JSON
   ✓ Exported to GraphML
   ✓ Exported to SVG

⏳ Step 5/5: Generating report...
   ✓ Generated analysis report

╔════════════════════════════════════════════════╗
║  Analysis Complete!                            ║
╚════════════════════════════════════════════════╝

📊 Summary:
   Modules: 8
   Files: 45
   Dependencies: 15
   Avg Coupling: 1.88
   Circular: 0

✓ No circular dependencies detected

📁 Results saved to: ./output/quick-start

💡 Next steps:
   - Open ./output/quick-start/module-graph.svg to visualize
   - Import ./output/quick-start/module-graph.graphml into yEd/Gephi
   - Review ./output/quick-start/ANALYSIS.md for detailed insights

✅ Done!
```

### Show the Results

#### 1. Open SVG Visualization
```bash
open output/quick-start/module-graph.svg
```

**Point out:**
- Color coding (red = high coupling, green = low)
- Node sizes (bigger = more files)
- Directional arrows (dependencies)
- Clean hierarchy (no cycles)

#### 2. Read the Report
```bash
cat output/quick-start/ANALYSIS.md
```

**Highlight:**
- Summary metrics
- Largest modules
- Most depended-on modules (hotspots)
- Coupling analysis
- Recommendations

#### 3. Professional Visualization (Optional)
```bash
# Download yEd: https://www.yworks.com/products/yed
# Open module-graph.graphml
# Apply automatic layout
```

---

## 🔍 Act 2: Self-Analysis Demo (5 minutes)

### The Meta-Analysis
*"Let's analyze c3-projection itself to validate Clean Architecture."*

```bash
npm run demo:self-analysis
# Or: npx tsx examples/analyze-self.ts
```

**What you'll see:**
```
╔════════════════════════════════════════════════╗
║  c3-projection Self-Analysis                   ║
║  "Know Thyself" - Architecture Validation      ║
╚════════════════════════════════════════════════╝

📂 Analyzing c3-projection itself...

⏳ Loading codebase...
   ✓ Loaded 187 nodes

⏳ Creating module projection (TOP_LEVEL)...
   ✓ Created 12 modules

═══════════════════════════════════════════════
  Clean Architecture Validation
═══════════════════════════════════════════════

✓ Check 1: Domain Layer Independence
   ✓ Domain has 0 dependencies on Infrastructure/Application

✓ Check 2: Application Layer Dependencies
   ✓ Application properly depends on Domain only

✓ Check 3: Infrastructure implements Domain ports
   ✓ Infrastructure correctly depends on Domain

✓ Check 4: No Circular Dependencies

⏳ Generating visualizations...
   ✓ Generated full architecture view

⏳ Generating analysis report...
   ✓ Report saved

╔════════════════════════════════════════════════╗
║  Analysis Complete!                            ║
╚════════════════════════════════════════════════╝

📊 Architecture Health Score

   Overall Score: 95/100

📁 Results saved to: ./output/self-analysis

💡 Key Insights:
   - 4 domain modules (core logic)
   - 2 application modules (use cases)
   - 6 infrastructure modules (implementations)
   - 0 circular dependencies
   - Clean Architecture: ✓ Validated

✅ Self-analysis complete!
```

### Show the Architecture

#### 1. Open Architecture Diagram
```bash
open output/self-analysis/full-architecture.svg
```

**Point out:**
- Three distinct layers (Domain, Application, Infrastructure)
- Dependency arrows flow inward (to Domain)
- No cycles (Clean Architecture validated)
- Infrastructure at the edges

#### 2. Read Architecture Analysis
```bash
cat output/self-analysis/ARCHITECTURE_ANALYSIS.md
```

**Highlight:**
- Architecture Score: 95/100
- Domain layer independence (0 outward dependencies)
- Layer separation validated
- No circular dependencies

---

## 🎨 Act 3: Visual Exploration (3 minutes)

### GraphML in yEd (Professional Visualization)

1. **Open yEd**: https://www.yworks.com/products/yed
2. **Import**: File > Open > `output/quick-start/module-graph.graphml`
3. **Apply Layout**: Layout > Hierarchical
4. **Customize**:
   - Adjust colors
   - Change node shapes
   - Modify edge routing
   - Add labels
5. **Export**: File > Export > PNG/PDF

### SVG in Browser (Quick View)

```bash
open output/quick-start/module-graph.svg
```

- Zoom in/out (browser controls)
- Right-click > View Source (see SVG code)
- Copy/paste into documentation

### JSON for Automation (CI/CD)

```bash
cat output/quick-start/module-graph.json | jq '.metadata'
```

**Use cases:**
- CI/CD checks
- Automated tests
- Custom tooling
- Metrics tracking

---

## 💼 Act 4: Real-World Use Cases (5 minutes)

### 1. Architecture Reviews

**Scenario:** Quarterly architecture review

```bash
# Generate current state
npx ts-node examples/quick-start.ts ./src

# Compare with previous quarter
diff output/previous-quarter/ANALYSIS.md output/quick-start/ANALYSIS.md

# Track improvements:
# - Reduced coupling?
# - Eliminated cycles?
# - Better separation?
```

### 2. Refactoring Confidence

**Scenario:** Planning a large refactor

```bash
# Before refactor: establish baseline
npx ts-node examples/quick-start.ts ./src > baseline.txt

# After refactor: validate improvements
npx ts-node examples/quick-start.ts ./src > after.txt

# Compare metrics
# Expected: Lower coupling, fewer dependencies, no new cycles
```

### 3. Onboarding New Developers

**Scenario:** New team member joins

```bash
# Generate architecture diagram
npx ts-node examples/analyze-self.ts

# Share results
# - SVG shows high-level structure
# - Markdown report explains patterns
# - GraphML for interactive exploration
```

### 4. CI/CD Integration

**Scenario:** Prevent architecture decay

```bash
# In your CI pipeline (.github/workflows/architecture.yml)
name: Architecture Check
on: [pull_request]
jobs:
  check-architecture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npx ts-node examples/quick-start.ts ./src
      - run: |
          # Fail if circular dependencies detected
          if grep -q "Circular: [1-9]" output/quick-start/ANALYSIS.md; then
            echo "❌ Circular dependencies detected!"
            exit 1
          fi
          echo "✅ Architecture check passed"
```

### 5. Documentation

**Scenario:** Keep architecture docs updated

```bash
# Regenerate on every release
npm run analyze:modules

# Copy to docs
cp output/quick-start/module-graph.svg docs/architecture.svg
cp output/quick-start/ANALYSIS.md docs/ARCHITECTURE.md

# Commit with release
git add docs/
git commit -m "docs: update architecture diagrams for v2.0.0"
```

---

## 🎯 Key Takeaways

### For Developers
- **Instant Visibility**: See your architecture in seconds
- **Circular Detection**: Find hidden cycles before they cause problems
- **Refactoring Confidence**: Validate improvements objectively

### For Tech Leads
- **Architectural Oversight**: Monitor coupling and complexity
- **Data-Driven Decisions**: Use metrics for refactoring priorities
- **Team Alignment**: Visual communication of architecture

### For Architects
- **Validation**: Prove Clean Architecture compliance
- **Governance**: Enforce architectural rules in CI/CD
- **Evolution Tracking**: Monitor architecture over time

---

## 📊 Demo Success Checklist

- [ ] Quick Start runs without errors
- [ ] SVG visualization looks professional
- [ ] Metrics are easy to understand
- [ ] Report provides actionable insights
- [ ] Self-analysis validates Clean Architecture
- [ ] Architecture score makes sense
- [ ] Audience can reproduce independently
- [ ] Integration points are clear (CI/CD, docs)

---

## 🔧 Customization Tips

### Different Aggregation Levels

```typescript
// High-level overview (fewer, larger modules)
aggregationLevel: AggregationLevel.TOP_LEVEL

// Detailed view (more, smaller modules)
aggregationLevel: AggregationLevel.DIRECTORY
```

### Filter Test Files

```typescript
options: {
  includeTests: false,
  excludePatterns: ['**/*.test.ts', '**/*.spec.ts', 'tests/**']
}
```

### Color Schemes

```typescript
// Color by coupling
colorScheme: 'dependencies'

// Color by size
colorScheme: 'complexity'
```

---

## 🐛 Troubleshooting

### Demo Fails to Run

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Empty or Partial Graph

```bash
# Check path is correct
ls ../c3-parsing/src  # Should list files

# Verify exclude patterns aren't too aggressive
```

### Performance Issues

```typescript
// Use TOP_LEVEL for large codebases
aggregationLevel: AggregationLevel.TOP_LEVEL

// Exclude tests and generated code
excludePatterns: ['tests/**', 'dist/**', 'node_modules/**']
```

---

## 📚 Additional Resources

- [Quick Reference](./DEMO_QUICK_REFERENCE.md) - Commands and tips
- [Example Catalog](../examples/README.md) - All examples
- [Design Document](./module-dependency-view-design.md) - Architecture
- [Implementation Plan](./module-dependency-implementation-plan-v2.md) - Details

---

## 🎬 Demo Variations

### 5-Minute Version
1. Quick Start demo only
2. Show SVG
3. Highlight key metrics
4. Done!

### 10-Minute Version
1. Quick Start demo
2. Self-Analysis demo
3. Show both SVGs
4. Explain Clean Architecture validation

### 15-Minute Version
1. Quick Start demo
2. Self-Analysis demo
3. Visual exploration (yEd)
4. One use case (CI/CD or documentation)

### 30-Minute Version
1. All of the above
2. Live coding: customize aggregation
3. Multiple use cases
4. Q&A

---

**Ready to demo? Let's go! 🚀**

---

*Last Updated: 2025-11-16*  
*Version: 1.0.0*

