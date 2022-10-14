import { Api } from 'src/entities/api.entity';
import { Endpoint } from 'src/entities/endpoint.entity';
import { FreeApis } from 'src/subscription/apis';

export interface requestProp {
  api: Api | typeof FreeApis[number];
  profileId: string;
  endpoint: Endpoint | typeof FreeApis[number]['endpoint'];
  payload: any;
}
