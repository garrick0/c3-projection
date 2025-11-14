export interface RenderOptions {
  width?: number;
  height?: number;
  style?: Record<string, any>;
}

export interface Renderer {
  render(data: any, options?: RenderOptions): Promise<string | Buffer>;
  supports(format: string): boolean;
  getFormat(): string;
}
