import { APIDef, Capture, convert, GET } from "../../types";

export type PingAPI = APIDef<
  ["ping", Capture<":message">], // /ping/:message
  GET, // HTTP Method
  undefined, // Http Request Body
  { message: string } // Http Response Body
>;

const pingAPIs: PingAPI[] = [
  {
    request: {
      path: ["ping", "test"], // /ping/test
      method: "GET",
      body: undefined
    },
    response: {
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
      body: { message: "ok {:message}" }
    }
  }
];

module.exports = convert(...pingAPIs);
