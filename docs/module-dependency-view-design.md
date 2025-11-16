# Actual Module Dependency View – Design

This document describes the first concrete view for the "Actual" state: the **Actual Module Dependency View**. It covers:

* ASCII diagrams of how it works
* Filesystem / project structure
* Core layers & key objects
* Data flow from parsing → models → viewpoint → view

---

## 1. High-Level Concept

We want to visualize **how modules depend on each other** in the current, parsed codebase.

### 1.1 Big Picture Pipeline (ASCII)

```text
        ┌───────────────────────┐
        │   Source Code Repo    │
        └──────────┬────────────┘
                   │ parse/scan
                   v
        ┌───────────────────────┐
        │ CanonicalActualGraph  │  (files, imports, symbols)
        └──────────┬────────────┘
                   │ group/aggregate
                   v
        ┌───────────────────────┐
        │     ModuleModel       │  (modules & their files)
        └──────────┬────────────┘
                   │ aggregate deps
                   v
        ┌───────────────────────┐
        │ ModuleDependencyModel │  (module → module deps)
        └──────────┬────────────┘
                   │ apply viewpoint
                   v
        ┌───────────────────────┐
        │ ActualModuleDependency│
        │       Viewpoint       │
        └──────────┬────────────┘
                   │ render/export
                   v
        ┌───────────────────────┐
        │   Actual Module       │
        │ Dependency Graph View │
        └───────────────────────┘
```

---

## 2. Filesystem / Project Structure (High-Level)

We assume a monorepo-ish structure with an "analysis" engine and a UI.

```text
project-root/
  packages/
    analysis-engine/
      src/
        canonical-graph/
          buildCanonicalGraph.ts
          types.ts
        models/
          moduleModel.ts
          moduleDependencyModel.ts
        viewpoints/
          actualModuleDependency/
            viewpoint.ts
            filters.ts
            layouts.ts
        exports/
          graphml.ts
          json.ts
    web-app/
      src/
        views/
          ActualModuleDependencyGraph/
            GraphCanvas.tsx
            SidePanel.tsx
            Controls.tsx
        api/
          fetchModuleGraph.ts

  configs/
    induction.config.ts
    module-groups.config.ts

  scripts/
    run-analysis.ts
    export-graphml.ts
```

This can be flexed to your existing Nx layout, but the idea is:

* **analysis-engine**: parsing, model building, viewpoints, exports
* **web-app**: UI rendering of views

---

## 3. Core Layers & Key Objects

We’ll structure the logic into four conceptual layers:

```text
+------------------------+
|        UI Layer        |
|  (React, Graph canvas) |
+-----------▲------------+
            │ uses
+-----------│------------+
|   View / Viewpoint     |
|   (view configs)       |
+-----------▲------------+
            │ uses
+-----------│------------+
|     Models Layer       |
| (Module, ModuleDeps)   |
+-----------▲------------+
            │ uses
+-----------│------------+
| Canonical Graph Layer  |
| (Parsed AST, FS etc.)  |
+------------------------+
```

### 3.1 Canonical Graph Layer

Key object: `CanonicalActualGraph`

```ts
interface CanonicalActualGraph {
  files: FileNode[];
  imports: ImportEdge[];
  // later: calls, symbols, test links, etc.
}
```

This is the raw, rich representation from which everything else is derived.

### 3.2 Models Layer

**ModuleModel**

```ts
interface ModuleId extends String {
  readonly __brand: "ModuleId";
}

interface Module {
  id: ModuleId;
  name: string;
  filePaths: string[];
  tags: string[]; // domain, layer, etc.
}

interface ModuleModel {
  modules: Module[];
  fileToModule: Record<string, ModuleId>;
}
```

**ModuleDependencyModel**

```ts
interface ModuleDependencyEdge {
  from: ModuleId;
  to: ModuleId;
  weight: number; // number of underlying imports
  viaTestOnly: boolean;
}

interface ModuleDependencyModel {
  modules: Module[];
  edges: ModuleDependencyEdge[];
}
```

### 3.3 Viewpoint Layer

**ActualModuleDependencyViewpoint**

```ts
interface ActualModuleDependencyViewpointConfig {
  includeTests?: boolean;
  focusModules?: ModuleId[];
  hideModules?: ModuleId[];
  maxDepth?: number;
}

interface ActualModuleDependencyView {
  nodes: ViewNode[]; // positioned for UI
  edges: ViewEdge[]; // styled for UI
  metrics: ViewMetrics; // cycle counts, degrees, etc.
}

interface ActualModuleDependencyViewpoint {
  id: "actual-module-dependency";
  buildView(
    model: ModuleDependencyModel,
    config: ActualModuleDependencyViewpointConfig
  ): ActualModuleDependencyView;
}
```

The viewpoint:

* filters modules/edges
* computes derived metrics (cycles, degrees)
* passes a display-ready graph to the UI

### 3.4 UI Layer

Renders `ActualModuleDependencyView`:

```text
+------------------------------------+
|  GraphCanvas (nodes/edges)         |
|                                    |
|      [ Module dependency graph ]   |
|                                    |
+--------------------+---------------+
| SidePanel          | Controls      |
| - module details   | - filters     |
| - cycles list      | - search      |
+--------------------+---------------+
```

---

## 4. How It Works – Data Flow (Step by Step)

### Step 1: Parse code → CanonicalActualGraph

```text
repo/  ──►  parser/analysis  ──►  CanonicalActualGraph
```

* Walk the filesystem
* For each file, record:

  * path
  * language
  * imports (static; later: dynamic)
* Build `files[]` and `imports[]`

### Step 2: Build ModuleModel

Using config (`module-groups.config.ts`) or conventions:

* Group files into modules
* Create `Module` objects
* Map each file path → `ModuleId`

```text
File A.ts  ─┐
File B.ts  ├─► Module "billing-domain"
File C.ts  ┘
```

### Step 3: Build ModuleDependencyModel

For each import edge `(fileX → fileY)` in `CanonicalActualGraph`:

1. Map `fileX` → `Module Mx`
2. Map `fileY` → `Module My`
3. If `Mx !== My`, add or increment edge: `Mx → My`

Result:

```text
Modules:   [A, B, C, D]
Edges:     A → B (weight 10)
           A → C (weight 3)
           C → D (weight 5)
           B → A (weight 1)  (cycle)
```

### Step 4: Apply Viewpoint – build ActualModuleDependencyView

The viewpoint takes:

* `ModuleDependencyModel`
* `config` (filters, etc.)

And produces:

* a filtered graph
* layout hints (e.g., layered, force-directed)
* metrics (cycles, degrees)

ASCII example:

```text
    [Module A] ─────► [Module B]
        │   ▲
        │   │
        ▼   │
    [Module C] ─────► [Module D]
```

Cycles might be highlighted, e.g. A ⇄ B.

### Step 5: Render View in UI

The UI renders:

```text
+------------------------------------------------+
|  Actual Module Dependency Graph                |
|                                                |
|    A ──────► B                                 |
|    ▲  ╲     ▲                                  |
|    ╲   ╲   ╱                                   |
|     ╲   C ──────► D                            |
|                                                |
+---------------------+--------------------------+
| Cycles:             | Filters:                 |
| - A ↔ B             | [x] include tests        |
|                     | [ ] collapse leaves      |
|                     | [ search modules... ]    |
+---------------------+--------------------------+
```

---

## 5. Description of Behavior / Usage

1. **User runs analysis**

   * CLI or CI step runs `analysis-engine` on the repo.
   * Generates `CanonicalActualGraph`.
2. **Module dependency model is built**

   * Files are grouped into modules.
   * Aggregated module-to-module edges are computed.
3. **Viewpoint creates views**

   * The `ActualModuleDependencyViewpoint` is invoked with config.
   * Produces a `ActualModuleDependencyView` object.
4. **UI fetches and renders**

   * `web-app` calls an endpoint (or reads a file) to get the view data.
   * Renders graph + side panels.
5. **User interacts**

   * Filters modules, focuses on neighborhoods.
   * Inspects cycles and high-degree modules.
   * Exports GraphML/JSON for external tools.

This view becomes the foundation for:

* Later **Conformance/Drift views** (overlay Target rules)
* **Layered views** (add layer info to modules)
* **Hotspot views** (overlay churn/coverage)

---

This document is a first-pass design; we can refine types, naming, and filesystem layout further as we integrate with your existing stack.
