import {
  APIDef,
  Capture,
  GET,
  ResponseBody,
  StatusCode,
  ErrorResponseBody
} from "../../types";

type PingBaseAPI<S extends StatusCode, B extends ResponseBody<S>> = APIDef<
  GET, // HTTP Method
  ["ping", Capture<":message">], // /ping/:message
  { apiKey: "x-api-key"; foo?: string }, // request header
  { q: string; qoo?: string; moo: "moo" | "mooo" }, // request query
  undefined, // request body
  {}, // response header
  S, // status code
  B // Http Response Body
>;

type PingSuccessAPI = PingBaseAPI<200, {}>;
type PingFailAPI = PingBaseAPI<404, ErrorResponseBody>;

type PingAPI = PingSuccessAPI | PingFailAPI;

const pingAPIs: PingAPI[] = [
  {
    request: {
      path: ["ping", "test"], // /ping/test/hoge
      query: {
        q: "{:query}",
        moo: "moo"
      },
      method: "GET",
      body: undefined
    },
    response: {
      statusCode: 200,
      body: { message: "test" }
    }
  },
  {
    request: {
      path: ["ping", ":message"], // /ping/:message
      method: "GET",
      body: undefined
    },
    response: {
      statusCode: 200,
      body: { message: "ok {:message}" }
    }
  },
  {
    request: {
      path: ["ping", "notfound"], // /ping/:message
      method: "GET",
      body: undefined
    },
    response: {
      statusCode: 404,
      body: { errorCode: "404", message: "invalid id" }
    }
  }
];
