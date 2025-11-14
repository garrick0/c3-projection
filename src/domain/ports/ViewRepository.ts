import { Projection } from '../entities/Projection.js';

export interface ViewRepository {
  save(projection: Projection): Promise<void>;
  findById(id: string): Promise<Projection | undefined>;
  findByGraphId(graphId: string): Promise<Projection[]>;
  delete(id: string): Promise<void>;
  list(): Promise<Projection[]>;
}
