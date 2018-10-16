import {
  APIDef,
  Capture,
  convert,
  Error400,
  POST,
  ResponseDef,
  Success201
} from "../../types";

export type CreateAPI = APIDef<
  POST, // HTTP Method
  ["ping", Capture<":message">], // /ping/:message
  { apiKey: string }, // header
  { q: string }, // query
  CreateRequestBody, // Http Request Body
  {},
  | ResponseDef<Success201, CreateResponseBody>
  | ResponseDef<Error400, CreateErrorBody>
>;

type CreateRequestBody = {
  email: string;
  id: number;
};

type CreateResponseBody = {
  message: string;
};

type CreateErrorBody = {
  errorCode: string;
  message: string;
};

const pingAPIs: CreateAPI[] = [
  {
    request: {
      path: ["ping", "test"], // /ping/test
      headers: {
        apiKey: "{:apiKey}"
      },
      method: "POST",
      body: {
        email: "hoge@hoge.com{:apiKey}",
        id: 123
      }
    },
    response: {
      statusCode: 201,
      body: { message: "test" }
    }
  },
  {
    request: {
      path: ["ping", ":message"], // /ping/:message
      method: "POST",
      body: {
        email: "error@error.com",
        id: 999
      }
    },
    response: {
      statusCode: 400,
      body: { errorCode: "not_found", message: "ok {:message}" }
    }
  }
];

module.exports = convert(...pingAPIs);
