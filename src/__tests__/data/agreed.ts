import { APIDef, Capture, GET } from "../../types";

type HelloAPI = APIDef<
  GET, // HTTP Method
  ["user", Capture<":id">], //  /user/:id
  any, // request header
  { q: string }, // request query
  undefined, // request body
  {}, // response header
  200, // response status code
  HelloResponseBody // response body
>;

type HelloResponseBody = { message: string };

const hellos: HelloAPI[] = [
  {
    request: {
      path: ["user", ":id"],
      method: "GET",
      query: {
        q: "{:someQueryStrings}"
      },
      body: undefined
    },
    response: {
      statusCode: 200,
      body: {
        message: "{:id} {:someQueryString}"
      }
    }
  },
  {
    request: {
      path: ["users", ":id"],
      method: "GET",
      query: {
        q: "{:someQueryStrings}"
      },
      body: undefined
    },
    response: {
      statusCode: 201,
      body: {
        message: "{:id} {:someQueryString}",
        unknown: "test"
      }
    }
  }
];

module.exports = { hellos };
