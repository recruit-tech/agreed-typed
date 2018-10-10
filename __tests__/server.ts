import * as Agreed from "agreed-core";
import axios from "axios";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as getPort from "get-port";
import * as path from "path";
import * as assert from "power-assert";

const setupServer = agreed => {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  app.use(
    agreed.middleware({
      path: path.resolve(__dirname, "./data/agrees.ts")
    })
  );
  app.use((err, _, res) => {
    // tslint:disable-next-line
    console.error(err);
    res.statusCode = 500;
    res.send(`Error is occurred : ${err}`);
  });

  return app;
};

test("(study) register ts agrees", async done => {
  const port = await getPort();
  const agreed = new Agreed();

  const app = setupServer(agreed);

  const serv = app.listen(port, async () => {
    try {
      const response = await axios.get(`http://localhost:${port}/ping/hello`);
      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, { message: "ok hello" });

      const response2 = await axios.get(`http://localhost:${port}/ping/test`);
      assert.deepStrictEqual(response2.data, { message: "test" });

      serv.close(done);
    } catch (e) {
      serv.close();
      done(e);
    }
  });
});
