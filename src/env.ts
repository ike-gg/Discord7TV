import { z } from "zod";

import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  node_env: z.enum(["development", "production"]).default("development"),

  discordBotToken: z.string(),
  discordBotId: z.string(),

  oauthClientId: z.string(),
  oauthClientSecret: z.string(),

  inviteLink: z.string().url(),

  twitchClientId: z.string(),
  twitchSecretKey: z.string(),

  secretPhrase: z.string(),

  tenorApiKey: z.string(),

  imgurClientId: z.string(),

  DATABASE_URL: z.string().url(),

  PORT: z.string().default("3002"),

  openai_auth_key: z.string(),

  COBALT_URL: z.string().url(),
  COBALT_API_KEY: z.string(),

  POSTGRES_URL: z.string(),

  BACKEND_URL: z.string(),

  SESSION_KEYS: z.string().transform((val) => val.split(",")),
});

export const env = envSchema.parse(process.env);
export const isDevelopment = env.node_env === "development";
