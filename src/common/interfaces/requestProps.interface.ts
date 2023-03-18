import { HeaderType } from './endpoint.interface';

export interface requestProp {
  payload?: any;
  apiId: string;
  method: string;
  endpoint: string;
  base_url: string;
  profileId: string;
  secretKey: string;
  headers?: HeaderType[];
}
