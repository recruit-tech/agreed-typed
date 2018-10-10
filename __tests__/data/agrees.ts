import { Agree } from "../../types";

const agrees: Agree[] = [
  {
    request: {
      path: "/api/foo",
      method: "GET"
    },
    response: {
      statusCode: 200,
      body: {
        message: "ok"
      }
    }
  },
  {
    request: {
      path: "/api/bar/:id",
      method: "GET",
      query: {
        q: "{:someQuery}"
      },
      values: {
        id: "123",
        q: "test"
      }
    },
    response: {
      headers: {
        token: "{:id}"
      },
      body: {
        message: "ok {:someQuery}"
      }
    }
  }
];

module.exports = agrees;
