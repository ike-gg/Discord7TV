import chalk from "chalk";
import { Table } from "console-table-printer";
import dotenv from "dotenv";
import { tmpdir } from "os";
import path from "path";
import { z } from "zod";

import { CoreConsole } from "#/loggers";

dotenv.config();

const envSchema = z.object({
  ENV: z
    .enum(["development", "production"])
    .default("development")
    .describe(
      "Environment of the application, it makes a difference in how the application behaves in certain situations."
    ),

  TEMP_DIR_PATH: z
    .string()
    .default(tmpdir())
    .transform((value) => {
      if (path.isAbsolute(value)) return value;

      try {
        const rootProjectDir = import.meta.dir?.split("/").slice(0, -1).join("/");
        const tempDir = path.join(rootProjectDir, value);

        return tempDir;
      } catch {
        CoreConsole.dev.warn(
          "Failed to resolve TEMP_DIR_PATH, using system temp directory. (Fallback for CJS modules)"
        );
        return tmpdir();
      }
    })
    .describe("Path to the temporary directory for storing temporary files"),

  DISCORD_BOT_ID: z.string().describe("Discord Bot ID"),
  DISCORD_BOT_TOKEN: z.string().describe("Discord Bot token"),

  DISCORD_OAUTH_CLIENT_ID: z.string().describe("Discord OAuth Client ID"),
  DISCORD_OAUTH_CLIENT_SECRET: z.string().describe("Discord OAuth Client Secret"),

  // DEPRECATED - marked to remove in the future
  DATABASE_URL: z
    .string()
    .url()
    .describe(
      "DEPRECATED: Use POSTGRES_URL instead, still exists due to legacy reasons."
    ),

  POSTGRES_URL: z
    .string()
    .url()
    .describe("URL Connection String for the postgresql database"),

  BACKEND_URL: z
    .string()
    .url()
    .describe("Public URL of the application that is used for example. OAuth2 redirects"),

  FRONTEND_URL: z.string().url().describe("Public URL of the frontend application"),

  SESSION_KEYS: z
    .string()
    .transform((val) => val.split(","))
    .describe("Comma separated list of keys for session"),

  PORT: z.string().default("3002").describe("Port for the API to listen on"),

  INVITE_LINK: z.string().url().describe("Discord Bot invite link"),

  DEV_GUILDS: z
    .string()
    .transform((val) => val.split(","))
    .optional()
    .describe(
      `Used for development purposes, comma separated list of guild IDs, see ${chalk.underline("src/deploy-commands-dev.ts")}`
    ),

  COBALT_URL: z
    .string()
    .url()
    .optional()
    .describe("URL of Cobalt API instance, media command depends on it"),
  COBALT_API_KEY: z
    .string()
    .optional()
    .describe("API key for Cobalt API, if its protected"),

  TWITCH_CLIENT_ID: z.string().describe("Twitch Client ID"),
  TWITCH_SECRET_KEY: z.string().describe("Twitch Secret Key"),

  TENOR_API_KEY: z.string().describe("Tenor API Key"),

  IMGUR_CLIENT_ID: z.string().describe("Imgur Client ID"),

  OPENAI_API_KEY: z.string().describe("OpenAI API Key"),
});

let { data, error } = envSchema.safeParse(process.env);

class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvError";
    this.stack = undefined;
    this.cause = "Invalid environment variables";
  }
}

if (error) {
  CoreConsole.error(`Unable to parse environment variables:`);

  const table = new Table({
    columns: [
      {
        name: "variable",
        color: "red",
        title: "Variable",
      },
      {
        name: "received",
        title: "Received",
      },
      {
        name: "message",
        title: "Message",
      },
      {
        name: "usage",
        maxLen: 20,
        alignment: "left",
        color: "black",
        title: "Usage",
      },
    ],
  });

  error.errors.forEach((err) => {
    const { path, received, expected, message } = err as {
      path: string[];
      received: string;
      expected: string;
      message: string;
    };

    const key = path.at(0)!;
    const usage = envSchema.shape[key as keyof typeof envSchema.shape].description ?? "-";

    table.addRow({
      variable: key,
      received: received,
      message: message,
      usage: usage,
    });
  });

  table.printTable();

  throw new EnvError("Failed to parse environment variables.");
}

export const env = data!;

export const isDevelopment = env.ENV === "development";
export const isProduction = env.ENV === "production";
