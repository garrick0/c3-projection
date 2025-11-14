import { ViewRepository } from '../../domain/ports/ViewRepository.js';
import { Projection } from '../../domain/entities/Projection.js';

export class InMemoryViewRepository implements ViewRepository {
  private views = new Map<string, Projection>();

  async save(projection: Projection): Promise<void> {
    this.views.set((projection as any).id, projection);
  }

  async findById(id: string): Promise<Projection | undefined> {
    return this.views.get(id);
  }

  async findByGraphId(graphId: string): Promise<Projection[]> {
    return Array.from(this.views.values()).filter(
      v => v.getSourceGraphId() === graphId
    );
  }

  async delete(id: string): Promise<void> {
    this.views.delete(id);
  }

  async list(): Promise<Projection[]> {
    return Array.from(this.views.values());
  }
}
