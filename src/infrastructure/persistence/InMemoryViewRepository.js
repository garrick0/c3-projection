export class InMemoryViewRepository {
    views = new Map();
    async save(projection) {
        this.views.set(projection.id, projection);
    }
    async findById(id) {
        return this.views.get(id);
    }
    async findByGraphId(graphId) {
        return Array.from(this.views.values()).filter(v => v.getSourceGraphId() === graphId);
    }
    async delete(id) {
        this.views.delete(id);
    }
    async list() {
        return Array.from(this.views.values());
    }
}
//# sourceMappingURL=InMemoryViewRepository.js.map