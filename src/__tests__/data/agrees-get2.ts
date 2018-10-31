import {
  APIDef,
  Capture,
  GET,
  Placeholder,
  ResponseDef,
  Success200
} from "../../types";

export type UserAPI = APIDef<
  GET,
  ["user", Capture<":id">],
  any,
  { q: string },
  undefined,
  { "x-csrf-token": "csrf-token" },
  ResponseDef<
    Success200,
    {
      message: string;
      images: Placeholder<string[]>;
      themes: Placeholder<{
        name: string;
      }>;
    }
  >
>;

const api: UserAPI[] = [
  {
    request: {
      path: ["user", ":id"],
      method: "GET",
      query: {
        q: "{:someQueryStrings}"
      },
      body: undefined,
      values: {
        id: "yosuke",
        someQueryStrings: "foo"
      }
    },
    response: {
      status: 200,
      headers: {
        "x-csrf-token": "csrf-token"
      },
      body: {
        message: "{:greeting} {:id} {:someQueryStrings}",
        images: "{:images}",
        themes: "{:themes}"
      },
      values: {
        greeting: "hello",
        images: ["http://example.com/foo.jpg", "http://example.com/bar.jpg"],
        themes: {
          name: "green"
        }
      }
    }
  }
];

module.exports = api;
