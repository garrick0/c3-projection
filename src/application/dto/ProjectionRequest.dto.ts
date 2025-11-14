export interface ProjectionRequestDto {
  graphId: string;
  projectionType: string;
  aggregationLevel: string;
  filters?: Record<string, any>;
}
