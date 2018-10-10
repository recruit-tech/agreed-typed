export interface AgreedRequest {
  headers?: object;
  path: string;
  method: string;
  query?: object;
  values?: object;
}

export interface AgreedResponse {
  headers?: object;
  body?: object;
  statusCode?: number;
  values?: object;
}

export interface Agree {
  request: AgreedRequest;
  response: AgreedResponse;
}
