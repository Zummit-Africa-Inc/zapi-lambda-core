import { EndpointHeaderType } from '../enums/endpointHeaderType.enum';

export interface ReqBody {
  key?: string;
  value?: string | Date | boolean | number | object | symbol | Array<any>;
}

export interface DataType {
  types: [];
}

export interface HeaderType {
  name?: string;
  type?: EndpointHeaderType;
  value?: string;
  required?: boolean;
}

export interface QueryType {
  name?: string;
  type?: EndpointHeaderType;
  value?: string;
  required?: boolean;
}
