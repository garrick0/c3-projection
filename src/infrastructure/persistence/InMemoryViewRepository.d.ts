import { ViewRepository } from '../../domain/ports/ViewRepository.js';
import { Projection } from '../../domain/entities/Projection.js';
export declare class InMemoryViewRepository implements ViewRepository {
    private views;
    save(projection: Projection): Promise<void>;
    findById(id: string): Promise<Projection | undefined>;
    findByGraphId(graphId: string): Promise<Projection[]>;
    delete(id: string): Promise<void>;
    list(): Promise<Projection[]>;
}
//# sourceMappingURL=InMemoryViewRepository.d.ts.map