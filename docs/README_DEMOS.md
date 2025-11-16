# c3-projection Demos - README

Welcome to the c3-projection demo system! This document provides a quick overview of the available demos and how to get started.

## 🚀 Quick Start (30 seconds)

```bash
# 1. Build the project
npm run build

# 2. Run the quick start demo
npm run demo:quick-start

# 3. View the results
open output/quick-start/module-graph.svg
```

**That's it!** You just analyzed the c3-projection codebase and visualized its architecture.

---

## 📚 Available Demos

### 1. Quick Start Demo (5 minutes)
**Command:** `npm run demo:quick-start`

Analyzes c3-projection's `src/` directory and generates:
- 📊 SVG visualization
- 📄 JSON data
- 📐 GraphML for professional tools
- 📝 Markdown analysis report

**Best for:** First-time users, quick demos, presentations

---

### 2. Self-Analysis Demo (10 minutes)
**Command:** `npm run demo:self-analysis`

Performs a meta-analysis of c3-projection itself, validating:
- ✅ Clean Architecture principles
- ✅ Domain layer independence
- ✅ Proper dependency direction
- ✅ Zero circular dependencies
- 📊 Architecture health score (0-100)

**Best for:** Understanding Clean Architecture validation, showcasing tool capabilities

---

### 3. Full-Featured Example (15 minutes)
**Command:** `npm run demo:full`

Demonstrates all features:
- Multiple configuration options
- Different aggregation levels
- All export formats
- Detailed customization

**Best for:** Learning the complete API, advanced usage

---

### 4. Run All Demos
**Command:** `npm run demo:all`

Runs both quick-start and self-analysis demos sequentially.

---

## 📊 Demo Output

All demos save results to `./output/[demo-name]/`:

```
output/
├── quick-start/
│   ├── module-graph.svg         # Visual diagram
│   ├── module-graph.json        # Programmatic access
│   ├── module-graph.graphml     # Import to yEd/Gephi
│   └── ANALYSIS.md              # Detailed report
│
└── self-analysis/
    ├── full-architecture.svg    # Architecture diagram
    ├── architecture.json        # Full data
    └── ARCHITECTURE_ANALYSIS.md # Health score & validation
```

---

## 🎯 What You'll Learn

### From Quick Start:
- How to analyze any TypeScript codebase
- Understanding module dependencies
- Identifying coupling issues
- Detecting circular dependencies
- Exporting to multiple formats

### From Self-Analysis:
- Clean Architecture validation
- Layer separation patterns
- Dependency direction rules
- Architecture scoring system
- Meta-analysis capabilities

### From Full Example:
- Advanced configuration options
- Custom aggregation levels
- Filtering strategies
- Performance optimization
- Integration patterns

---

## 📖 Documentation

- **[Demo Guide](./DEMO_GUIDE.md)** - Complete walkthrough with scenarios
- **[Quick Reference](./DEMO_QUICK_REFERENCE.md)** - Commands and tips
- **[Example Catalog](../examples/README.md)** - All examples with usage
- **[Full Plan](./demo-and-example-plan.md)** - Comprehensive implementation plan

---

## 🎬 5-Minute Demo Script

Perfect for presentations:

```bash
# 1. Show the problem
echo "Large TypeScript codebases are hard to understand..."

# 2. Run the demo
npm run demo:quick-start

# 3. Open the visualization
open output/quick-start/module-graph.svg

# 4. Show the metrics
cat output/quick-start/ANALYSIS.md | head -20

# 5. Highlight insights
echo "✅ 12 modules analyzed"
echo "✅ 0 circular dependencies"
echo "✅ Clean architecture validated"
```

---

## 🔧 Customization

### Analyze a Different Codebase
```bash
npx tsx examples/quick-start.ts /path/to/your/project/src
```

### Change Output Directory
Edit the example files to modify `outputDir`:
```typescript
const outputDir = './output/my-custom-name';
```

### Exclude Test Files
Already configured by default:
```typescript
excludePatterns: ['**/*.test.ts', 'tests/**', 'dist/**']
```

### Change Aggregation Level
```typescript
aggregationLevel: AggregationLevel.DIRECTORY  // More granular
aggregationLevel: AggregationLevel.TOP_LEVEL  // Higher level
```

---

## 💡 Use Cases

### 1. Architecture Reviews
```bash
# Generate current architecture
npm run demo:self-analysis

# Compare with previous quarter
diff output/previous/ARCHITECTURE_ANALYSIS.md output/self-analysis/ARCHITECTURE_ANALYSIS.md
```

### 2. CI/CD Integration
```yaml
# .github/workflows/architecture.yml
- name: Check Architecture
  run: |
    npm run demo:quick-start
    grep -q "Circular: 0" output/quick-start/ANALYSIS.md || exit 1
```

### 3. Onboarding New Developers
```bash
# Generate architecture diagram
npm run demo:self-analysis

# Share with new team members
echo "See output/self-analysis/ for architecture overview"
```

### 4. Documentation
```bash
# Regenerate on release
npm run demo:quick-start
cp output/quick-start/module-graph.svg docs/architecture.svg
```

---

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
npm run build
```

### Empty or partial output
```bash
# Check that src/ directory exists
ls -la src/

# Verify TypeScript files are present
find src -name "*.ts" | head -5
```

### Performance issues
```typescript
// In the example file:
// 1. Use TOP_LEVEL aggregation
aggregationLevel: AggregationLevel.TOP_LEVEL

// 2. Exclude more files
excludePatterns: ['tests/**', 'dist/**', '**/*.test.ts', '**/*.spec.ts']
```

---

## ✅ Success Criteria

After running the demos, you should:

- [x] See colored SVG visualizations of module dependencies
- [x] Have JSON/GraphML exports for further analysis
- [x] Get markdown reports with actionable insights
- [x] Understand your architecture's health score
- [x] Know how to integrate into your workflow

---

## 🎓 Next Steps

1. ✅ Run the demos
2. 📖 Read the [Demo Guide](./DEMO_GUIDE.md)
3. 🔧 Customize for your codebase
4. 📊 Integrate into CI/CD
5. 🎨 Import GraphML into yEd for professional layouts
6. 📝 Include SVG diagrams in your documentation

---

## 🤝 Feedback

Found an issue or have a suggestion?
- Open an issue in the repository
- Contribute improvements
- Share your use cases

---

## 📈 Demo Statistics

Based on c3-projection analysis:

- **Modules:** 12 top-level modules
- **Files:** 36 source files
- **Architecture Score:** 100/100 ✨
- **Circular Dependencies:** 0 ✅
- **Layers:** 3 (Domain, Application, Infrastructure)
- **Analysis Time:** ~10 seconds

---

**Ready to explore your architecture? Start with:**
```bash
npm run demo:quick-start
```

Happy analyzing! 🎉

---

*Last Updated: 2025-11-16*  
*Version: 1.0.0*

