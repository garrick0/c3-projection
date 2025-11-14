import { Renderer, RenderOptions } from '../../domain/ports/Renderer.js';

export class SVGRenderer implements Renderer {
  async render(data: any, options?: RenderOptions): Promise<string> {
    return '<svg></svg>';
  }

  supports(format: string): boolean {
    return format === 'svg';
  }

  getFormat(): string {
    return 'svg';
  }
}
