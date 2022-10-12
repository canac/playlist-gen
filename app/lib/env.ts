import { z } from "zod";
import { nonEmptyString } from "./zodTypes";

const envSchema = z.object({
  DOMAIN: nonEmptyString,
  DATABASE_URL: nonEmptyString,
  SPOTIFY_CLIENT_ID: nonEmptyString,
  SPOTIFY_CLIENT_SECRET: nonEmptyString,
});

// Validate the environment variables against the schema
export const env = envSchema.parse(process.env);
