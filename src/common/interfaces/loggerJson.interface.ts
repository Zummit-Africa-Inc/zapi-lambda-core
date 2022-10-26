import { Visibility } from 'src/common/enums/visibility.enum';
import { HttpMethod } from '../enums/httpMethods.enum';
import { PartialType } from '@nestjs/swagger';
import { Endpoint } from '../../entities/endpoint.entity';
import { HeaderType, ReqBody } from './endpoint.interface';
import { EndpointHeaderType } from '../enums/endpointHeaderType.enum';

export class LoggerJson extends PartialType(Endpoint) {
  name: string;
  description: string;
  base_url: string;
  about: string;
  categoryId: string;
  method: HttpMethod;
  route: string;
  body: ReqBody[];
  headers: HeaderType[];
  logo_url: string;
  api_website: string;
  term_of_use: string;
  read_me: string;
  visibility: Visibility;
}
