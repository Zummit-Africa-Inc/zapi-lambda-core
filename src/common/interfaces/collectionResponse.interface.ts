import { Endpoint } from 'src/entities/endpoint.entity';

interface skipped {
  [key: string]: string;
}

export interface CollectionResponse {
  endpoints: Endpoint[];
  skipped: skipped[];
}
