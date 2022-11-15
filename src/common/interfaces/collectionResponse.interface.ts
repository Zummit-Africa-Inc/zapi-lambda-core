import { Endpoint } from 'src/entities/endpoint.entity';

export interface CollectionResponse {
  endpoints: Endpoint[];
  skipped: string[];
}
