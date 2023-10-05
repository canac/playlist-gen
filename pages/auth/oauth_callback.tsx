import { BlitzPage } from "@blitzjs/next";
import { Text } from "@mantine/core";
import { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useEffect } from "react";
import { z } from "zod";
import { gSSP } from "app/blitz-server";
import Layout from "app/core/layouts/Layout";
import { env } from "app/lib/env";
import db from "db";

// POST https://accounts.spotify.com/api/token
// Only includes fields that we care about
const tokenResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});

// GET https://api.spotify.com/v1/me
// Only includes fields that we care about
const profileResponse = z.object({
  id: z.string(),
  images: z.array(
    z.object({
      url: z.string(),
    }),
  ),
});

export const getServerSideProps = gSSP(async ({ req, ctx }) => {
  const { searchParams } = new URL(req.url ?? "", env.DOMAIN);
  const code = searchParams.get("code");
  if (!code) {
    throw new Error("Search param 'code' is missing or empty");
  }
  const state = searchParams.get("state");
  if (!state) {
    throw new Error("Search param 'state' is missing or empty");
  }
  if (state !== ctx.session.$handle) {
    throw new Error("OAuth state doesn't match");
  }
  const redirectUri = ctx.session.redirectUri ?? "/";

  // Exchange the code for an access token
  const body = new URLSearchParams();
  body.append("grant_type", "authorization_code");
  body.append("code", code);
  body.append("redirect_uri", `${env.DOMAIN}/auth/oauth_callback`);
  const authorization = `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`;
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body,
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(authorization).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
  } = tokenResponse.parse(await tokenRes.json());

  // Use the access token to get the user's id
  const userRes = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const { id, images } = profileResponse.parse(await userRes.json());

  // Save the user, avatar URL, and access token to the database
  const updatedFields = {
    avatarUrl: images[0]?.url ?? null,
    accessToken,
    refreshToken,
    // expiresIn is the length of the token's validity in seconds
    // Calculate the absolute time when it will expire, considering it expired a minute
    // sooner to avoid accidentally using an expired access token
    accessTokenExpiresAt: new Date(Date.now() + (expiresIn - 60) * 1000),
  };
  const { id: userId, role } = await db.user.upsert({
    where: { id },
    create: { id, role: "USER", ...updatedFields },
    update: updatedFields,
    select: { id: true, role: true },
  });

  // Create the session, logging the user in
  await ctx.session.$create({ userId, role });

  return {
    props: { redirectUri },
  };
});

const OauthCallbackPage: BlitzPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { redirectUri } = props;

  useEffect(() => {
    document.location = redirectUri;
  });

  return (
    <Layout title="Log In">
      <Text>Logging you in...</Text>
      <Text>
        Click <Link href={redirectUri}>here</Link> to return to the site if you are not redirected
        automatically.
      </Text>
    </Layout>
  );
};

export default OauthCallbackPage;
