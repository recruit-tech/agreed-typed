import {
  APIDef,
  Capture,
  Placeholder,
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
  ResponseDef<Success201, CreateResponseBody>
>;

enum GenderType {
  Male = 1,
  Famale,
  Other
}

export type CreateRequestBody = {
  /**
   * @pattern ^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$
   * @examples foo@example.com
   */
  email: string;
  /**
   * @maximum 1000
   * @examples 5
   * @minimum 0
   */
  id: Placeholder<number>;
  genderId: GenderType;
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
        id: "{:id}",
        genderId: 2
      },
      values: {
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
