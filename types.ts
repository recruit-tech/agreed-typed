export type GET = "GET";
export type POST = "POST";
export type PATCH = "PATCH";
export type PUT = "PUT";
export type DELETE = "DELETE";

export type HTTPMethods = GET | POST | PATCH | PUT | DELETE;

export type Capture<T extends string> = T | string;

export type RequestPath = Array<string | Capture<string>>;

export type RequestBody<Method extends HTTPMethods> = Method extends
  | POST
  | PATCH
  | PUT
  ? object
  : undefined;

export type RequestDef<
  P extends RequestPath,
  M extends HTTPMethods,
  B extends RequestBody<M>
> = {
  path: P;
  method: M;
  headers?: object;
  query?: object;
  values?: object;
  body: B;
};

export type ResponseDef<B extends object> = {
  headers?: object;
  values?: object;
  statusCode?: number;
  body?: B;
};

export type APIDef<
  P extends RequestPath,
  M extends HTTPMethods,
  ReqBody extends RequestBody<M>,
  RespBody extends object
> = {
  request: RequestDef<P, M, ReqBody>;
  response: ResponseDef<RespBody>;
};

export function convert(...apis: Array<{ request }>) {
  return apis.map(a => {
    const { path } = a.request;
    a.request.path = "/" + path.join("/");
    return a;
  });
}
