import { APIDef, Capture, convert, ErrorResponseBody, GET } from "../../types";

export type PingAPI = APIDef<
  GET, // HTTP Method
  ["ping", Capture<":message">], // /ping/:message
  { apiKey: "x-api-key"; foo?: string }, // request header
  { q: string; qoo?: string; moo: "moo" | "mooo" }, // request query
  undefined, // request body
  {}, // response header
  200 | 404, // status code
  PongBody | ErrorResponseBody // Http Response Body
>;

type PongBody = {
  message: string;
};

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

module.exports = convert(...pingAPIs);
