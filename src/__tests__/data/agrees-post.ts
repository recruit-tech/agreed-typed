import { APIDef, Capture, POST, ResponseDef, Success201 } from "../../types";

export type CreateAPI = APIDef<
  POST, // HTTP Method
  ["ping", Capture<":message">], // /ping/:message
  { apiKey: string }, // header
  { q: string }, // query
  CreateRequestBody, // Http Request Body
  {},
  ResponseDef<Success201, CreateResponseBody>
>;

type CreateRequestBody = {
  email: string;
  id: number;
};

type CreateResponseBody = {
  message: string;
};

const createAPIs: CreateAPI[] = [
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
      status: 201,
      body: { message: "test" }
    }
  }
];

module.exports = createAPIs;
