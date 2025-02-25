import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { NextFunction, Request, Response, Router } from "express";
import { z } from "zod";

import { discordOauth } from "../../..";
import { db } from "../../../db";
import { sessions, users } from "../../../db/schema";
import { env } from "../../../env";
import { TetraAPIError } from "../../TetraAPIError";
import { API_CONSTANTS } from "../../constants/API_CONSTANTS";

import { ApiConsole } from "#/loggers";

export const sessionSchema = z.object({
  session_token: z.string(),
  user_discord_id: z.string(),
});

export type SessionSchema = z.infer<typeof sessionSchema>;

export const authRouter = Router();

authRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  const authUrl = discordOauth.generateAuthUrl({
    scope: API_CONSTANTS.DISCORD_SCOPES,
    redirectUri: `${env.BACKEND_URL}${API_CONSTANTS.RELATIVE_REDIRECT_URI}`,
  });

  res.redirect(authUrl);
});

const callbackSchema = z.object({
  code: z.string(),
});

authRouter.get("/callback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = callbackSchema.parse(req.query);

    const token = await discordOauth.tokenRequest({
      grantType: "authorization_code",
      scope: API_CONSTANTS.DISCORD_SCOPES,
      code,
      redirectUri: `${env.BACKEND_URL}${API_CONSTANTS.RELATIVE_REDIRECT_URI}`,
    });

    // console.log("???");

    const userData = await discordOauth.getUser(token.access_token);

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.discord_id, userData.id),
    });

    let userId;
    if (existingUser) {
      await db
        .update(users)
        .set({
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          token_expires_at: new Date(Date.now() + token.expires_in * 1000),
        })
        .where(eq(users.discord_id, userData.id));

      userId = existingUser.id;
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          discord_id: userData.id,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          token_expires_at: new Date(Date.now() + token.expires_in * 1000),
        })
        .returning();
      userId = newUser.id;
    }

    const sessionToken = randomBytes(32).toString("hex");
    await db.insert(sessions).values({
      user_id: userId,
      session_token: sessionToken,
    });

    const session: SessionSchema = {
      session_token: sessionToken,
      user_discord_id: userData.id,
    };

    console.log(session);

    req.session = session;

    // res.sendStatus(200);
    res.redirect(env.FRONTEND_URL + "/panel");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new TetraAPIError(400, "Bad request", "INVALID_REQUEST_SCHEMA");
    } else {
      // console.log(error);
      ApiConsole.dev.error(error);
      throw new TetraAPIError(500, "Internal Server Error", "AUTH_CALLBACK_ERROR");
    }
  }
});
