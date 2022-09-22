export interface ReqBody {
  name: string;
  data_type: string | VarDate | boolean | number | object | symbol;
}

export interface DataType {
  types: [];
}
