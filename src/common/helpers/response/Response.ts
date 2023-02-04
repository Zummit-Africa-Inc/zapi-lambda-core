import { BadRequest, NotFound, Ok } from './ResponseType';
export class ZaLaResponse {
  static Ok<Type>(
    data: Type,
    message = '',
    status?: string | number,
  ): Ok<Type> {
    return {
      status,
      data,
      success: true,
      message,
    } as Ok<Type>;
  }

  static OkFailure<Type>(
    data: Type,
    message = '',
    status?: string | number,
    errorCode?: string | number,
  ): Ok<Type> {
    return {
      status,
      data,
      success: false,
      message,
      errorCode,
    } as Ok<Type>;
  }

  static BadRequest(
    error: unknown,
    message = '',
    errorCode = '',
    status = 'failed',
  ): BadRequest {
    return {
      status,
      error,
      success: false,
      message,
      errorCode,
    } as BadRequest;
  }

  static NotFoundRequest(
    error: unknown,
    message = '',
    errorCode = '',
    status = 'failed',
  ): NotFound {
    return {
      status,
      error,
      success: false,
      message,
      errorCode,
    } as NotFound;
  }
  static Paginated<T>(array: T, message = '', status?: string | number): Ok<T> {
    const { links, data, meta, page, limit, total }: any = array;
    return {
      status,
      success: true,
      data,
      meta,
      links,
      page,
      limit,
      total,
      message,
    } as Ok<T>;
  }
  static Collection<T>(
    object: T,
    message = '',
    status?: string | number,
  ): Ok<T> {
    const { endpoints, skipped }: any = object;
    return {
      status,
      success: true,
      data: endpoints,
      skipped,
      message,
    } as Ok<T>;
  }
}
