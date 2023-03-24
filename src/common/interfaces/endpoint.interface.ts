import { EndpointHeaderType } from '../enums/endpointHeaderType.enum';

export interface ReqBody {
  key: string;
  value:
    | string
    | Date
    | boolean
    | number
    | object
    | symbol
    | Array<any>
    | Express.Multer.File;
}

export interface DataType {
  types: [];
}

export type HeaderType = {
  name: string;
  value: string;
};

export interface QueryType {
  name: string;
  type: EndpointHeaderType;
  value: ReqBody['value'];
  required: boolean;
}
