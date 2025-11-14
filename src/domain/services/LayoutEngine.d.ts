export interface LayoutPosition {
    x: number;
    y: number;
}
export interface LayoutResult {
    positions: Map<string, LayoutPosition>;
    bounds: {
        width: number;
        height: number;
    };
}
export declare class LayoutEngine {
    forceDirectedLayout(nodeIds: string[], edges: Array<{
        from: string;
        to: string;
    }>): LayoutResult;
    hierarchicalLayout(root: any, childrenKey?: string): LayoutResult;
    circularLayout(nodeIds: string[], radius?: number): LayoutResult;
}
//# sourceMappingURL=LayoutEngine.d.ts.map