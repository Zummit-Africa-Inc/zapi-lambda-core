import { EndpointHeaderType } from '../enums/endpointHeaderType.enum';

export interface ReqBody {
  key?: string;
  value?: string | Date | boolean | number | object | symbol | Array<any>;
}

export interface DataType {
  types: [];
}

export interface HeaderType {
  key?: string;
  type?: string;
  value?: string;
  required?: boolean;
}

export interface QueryType {
  key?: string;
  type?: EndpointHeaderType;
  value?: string;
  required?: boolean;
}
