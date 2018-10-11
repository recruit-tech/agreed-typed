export type GET = "GET";
export type HEAD = "HEAD";
export type POST = "POST";
export type PUT = "PUT";
export type PATCH = "PATCH";
export type DELETE = "DELETE";

export type HTTPMethods = GET | HEAD | POST | PATCH | PUT | DELETE;

export type Capture<T extends string> = T | string;

export type Path = Array<string | Capture<string>>;

export type RequestBody<Method extends HTTPMethods> = Method extends
  | POST
  | PATCH
  | PUT
  ? object
  : undefined;

export type Headers = object;

export type Query = object;

export type RequestDef<
  P extends Path,
  H extends Headers,
  Q extends Query,
  M extends HTTPMethods,
  B extends RequestBody<M>
> = {
  path: P;
  method: M;
  headers?: H;
  query?: Q;
  values?: object;
  body: B;
};

export type StatusCode = number;

export type Error40x =
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418;

export type Error50x = 500 | 501 | 502 | 503;

export type ErrorResponseBody = { errorCode: string; message: string };

export type ResponseBody<S extends StatusCode> = S extends Error40x | Error50x
  ? ErrorResponseBody
  : object;

export type ResponseDef<
  H extends Headers,
  S extends StatusCode,
  B extends ResponseBody<S>
> = {
  headers?: H;
  values?: object;
  statusCode: S;
  body?: B;
};

export type APIDef<
  P extends Path,
  ReqHeader extends Headers,
  Q extends Query,
  M extends HTTPMethods,
  ReqBody extends RequestBody<M>,
  RespHeader extends Headers,
  S extends StatusCode,
  RespBody extends ResponseBody<S>
> = {
  request: RequestDef<P, ReqHeader, Q, M, ReqBody>;
  response: ResponseDef<RespHeader, S, RespBody>;
};

export function convert(...apis: Array<{ request }>) {
  return apis.map(a => {
    const { path } = a.request;
    a.request.path = "/" + path.join("/");
    return a;
  });
}
