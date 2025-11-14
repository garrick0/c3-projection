export class SVGRenderer {
    async render(data, options) {
        return '<svg></svg>';
    }
    supports(format) {
        return format === 'svg';
    }
    getFormat() {
        return 'svg';
    }
}
//# sourceMappingURL=SVGRenderer.js.map