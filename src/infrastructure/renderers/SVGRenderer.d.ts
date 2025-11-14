import { Renderer, RenderOptions } from '../../domain/ports/Renderer.js';
export declare class SVGRenderer implements Renderer {
    render(data: any, options?: RenderOptions): Promise<string>;
    supports(format: string): boolean;
    getFormat(): string;
}
//# sourceMappingURL=SVGRenderer.d.ts.map