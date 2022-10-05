import { Visibility } from 'src/common/enums/visibility.enum';
import { ReqBody } from 'src/endpoints/interface/endpoint.interface';
import { HttpMethod } from '../enums/httpMethods.enum';

export interface LoggerJson {
  name: string;
  description: string;
  base_url: string;
  about: string;
  categoryId: string;
  method: HttpMethod;
  route: string;
  requestBody: ReqBody;
  headers: {
    name: string;
    description: string;
    type: string;
    value: string;
    required: boolean;
  }[];
  logo_url: string;
  api_website: string;
  term_of_use: string;
  read_me: string;
  visibility: Visibility;
}
