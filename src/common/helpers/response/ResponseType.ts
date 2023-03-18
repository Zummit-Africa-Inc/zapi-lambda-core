export declare class BaseResponseType {
  status: string;
  success: boolean;
  message: string;
}
export declare class Ok<Type> extends BaseResponseType {
  data?: Type;
}
export declare class BadRequest extends BaseResponseType {
  error?: unknown;
  errorCode?: string | number;
}
export declare class NotFound extends BaseResponseType {
  error?: unknown;
  errorCode?: string;
}
