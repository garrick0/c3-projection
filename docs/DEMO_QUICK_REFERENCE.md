# Quick Reference - c3-projection Demos

## ⚡ Quick Commands

```bash
# Quick Start (5 min)
npm run demo:quick-start
# Or: npx tsx examples/quick-start.ts ./src

# Self-Analysis (10 min)
npm run demo:self-analysis
# Or: npx tsx examples/analyze-self.ts

# Full Example (15 min)
npm run demo:full
# Or: npx tsx examples/generate-module-view.ts

# Run all demos
npm run demo:all
```

---

## 📊 Output Locations

| Example | Output Directory | Key Files |
|---------|-----------------|-----------|
| Quick Start | `./output/quick-start/` | `module-graph.svg`, `ANALYSIS.md` |
| Self-Analysis | `./output/self-analysis/` | `full-architecture.svg`, `ARCHITECTURE_ANALYSIS.md` |
| Full Example | `./output/example/` | Multiple formats |

---

## 🎨 Quick Customization

### Analyze Different Path
```bash
npx tsx examples/quick-start.ts ../my-app/src
```

### Change Aggregation Level
```typescript
// In the example file
aggregationLevel: AggregationLevel.DIRECTORY  // More detailed
aggregationLevel: AggregationLevel.TOP_LEVEL  // High-level overview
```

### Color Schemes
```typescript
colorScheme: 'dependencies'  // Red = high coupling
colorScheme: 'complexity'    // Red = high complexity
colorScheme: 'default'       // Standard colors
```

---

## 🔍 Key Metrics Explained

| Metric | What It Means | Good Value |
|--------|---------------|------------|
| **Modules** | Number of logical groupings | Varies by codebase size |
| **Files** | Total source files analyzed | N/A |
| **Dependencies** | Module-to-module dependencies | Lower is better |
| **Avg Coupling** | Average dependencies per module | < 3 is excellent, < 5 is good |
| **Circular** | Circular dependency count | 0 is ideal |
| **Architecture Score** | Overall health (0-100) | > 85 is excellent |

---

## 📁 Export Formats

| Format | Extension | Use Case | Open With |
|--------|-----------|----------|-----------|
| **JSON** | `.json` | Programmatic access, CI/CD | Any JSON viewer, VS Code |
| **GraphML** | `.graphml` | Professional visualization | yEd, Gephi, Cytoscape |
| **SVG** | `.svg` | Documentation, presentations | Browser, Figma, Illustrator |
| **Markdown** | `.md` | Team reports, docs | Any markdown viewer |

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot find module"
```bash
# Solution: Rebuild
npm run build
```

### Issue: Empty graph
```bash
# Solution: Check path
npx ts-node examples/quick-start.ts ./correct/path
```

### Issue: TypeScript errors
```bash
# Solution: Check tsconfig.json
# Ensure correct include/exclude patterns
```

### Issue: Slow performance
```typescript
// Solution: Use TOP_LEVEL aggregation
aggregationLevel: AggregationLevel.TOP_LEVEL

// And exclude tests
excludePatterns: ['**/*.test.ts', 'tests/**']
```

---

## 💡 Pro Tips

1. **Start Simple**: Use `quick-start.ts` first
2. **Self-Analysis**: Run `analyze-self.ts` to understand the tool
3. **Exclude Tests**: Add `includeTests: false` for cleaner graphs
4. **Use yEd**: Import `.graphml` files for professional layouts
5. **CI Integration**: Check for circular dependencies in your pipeline
6. **Documentation**: Include `.svg` files in your project docs

---

## 🎯 Demo Script (30 seconds)

```bash
# 1. Analyze
npm run demo:quick-start

# 2. Open SVG
open output/quick-start/module-graph.svg

# 3. Read report
cat output/quick-start/ANALYSIS.md | head -20

# Done! 🎉
```

---

## 📚 Links

- [Full Documentation](./demo-and-example-plan.md)
- [Example Catalog](../examples/README.md)
- [Architecture Design](./module-dependency-view-design.md)

---

**Last Updated:** 2025-11-16
