import { randomBytes } from "crypto";
import { DiscordAPIError } from "discord.js";
import { NextFunction, Request, Response, Router } from "express";

import { TetraAPIError } from "./TetraAPIError";
import { checkUserAuth } from "./middleware/auth";
import { authRouter } from "./routes/auth/auth-router";
import { guildsRouter } from "./routes/guilds/guilds-router";
import { meRouter } from "./routes/me/me-router";

import { ApiConsole } from "#/loggers";

export const router = Router();

// -- UNPROTECTED ROUTES --

router.use("/auth", authRouter);

// /me includes protected routes, check meRouter structure
router.use("/me", meRouter);

// -- PROTECTED ROUTES --
router.use((req, res, next) => checkUserAuth(req, res, next, { fetchUserData: true }));

router.use("/guilds", guildsRouter);

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof TetraAPIError) {
    res.status(error.code).json({
      error: error.message,
      reference: error.reference,
    });
    return;
  }

  if (error instanceof DiscordAPIError) {
    res.status(409).json({
      error: `Discord Error: ${error.message}`,
    });
    return;
  }

  const ref = randomBytes(8).toString("hex");
  ApiConsole.error(`[${ref}]`, error);

  res.status(500).json({
    error: "Internal Server Error",
    reference: ref,
  });

  return;
});

// export default router;
