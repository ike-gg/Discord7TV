import cookieSession from "cookie-session";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";

import { env, isDevelopment, isProduction } from "../env";
import { router } from "./router";

import { ApiConsole } from "#/loggers";

export const initApi = () => {
  const PORT = env.PORT;

  const app = express();

  const limiter = rateLimit({
    windowMs: 30000,
    max: 20,
  });

  app.use(
    cookieSession({
      name: "tetra-session",
      keys: env.SESSION_KEYS,
      signed: false,
      secure: isProduction,
      httpOnly: true,
      // max age 1 year
      maxAge: 365 * 24 * 60 * 60 * 1000,
      domain: ".tetra.lol",
    })
  );

  app.use(
    cors({
      credentials: true,
      origin: [
        "https://tetra.lol",
        "http://localhost:3001",
        "http://localhost:3000",
        "https://www.tetra.lol",
        "https://panel.tetra.lol",
        "https://tetra.lol",
        "https://dev.tetra.lol",
      ],
    })
  );

  app.use(express.json());

  // app.use(
  //   bodyParser.json({
  //     limit: "10mb",
  //   })
  // );

  app.use("/api", router);

  app.listen(PORT, () => {
    ApiConsole.log(`Listening on ${env.BACKEND_URL}`);
  });
};
