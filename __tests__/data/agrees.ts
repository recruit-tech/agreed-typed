import { APIDef, Capture, convert, GET } from "../../types";

export type PingAPI = APIDef<
  ["ping", Capture<":message">],
  GET,
  undefined,
  { message: string }
>;

const pingAPIs: PingAPI[] = [
  {
    request: {
      path: ["ping", "test"],
      method: "GET",
      body: undefined
    },
    response: {
      body: { message: "test" }
    }
  },
  {
    request: {
      path: ["ping", ":message"],
      method: "GET",
      body: undefined
    },
    response: {
      body: { message: "ok {:message}" }
    }
  }
];

module.exports = convert(...pingAPIs);
