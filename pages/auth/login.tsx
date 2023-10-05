import { BlitzPage } from "@blitzjs/next";
import { Button } from "@mantine/core";
import { InferGetServerSidePropsType } from "next";
import classes from "./login.module.css";
import { gSSP } from "app/blitz-server";
import Layout from "app/core/layouts/Layout";
import { env } from "app/lib/env";

export const getServerSideProps = gSSP(async ({ req, ctx }) => {
  const redirectUri = new URL(req.url ?? "", env.DOMAIN).searchParams.get("next") ?? "/";

  if (ctx.session.$isAuthorized()) {
    // Redirect to the home page if the user is already logged in
    return {
      props: {
        spotifyOauthUrl: "",
      },
      redirect: {
        destination: redirectUri,
        permanent: false,
      },
    };
  }

  // Remember where the user needs to be redirected to after login
  await ctx.session.$setPublicData({
    redirectUri,
  });

  // Use the session handle as the OAuth state
  const state = ctx.session.$handle;
  if (!state) {
    throw new Error("OAuth state is empty");
  }
  const qs = new URLSearchParams({
    response_type: "code",
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: "user-library-read,playlist-read-private,playlist-modify-private",
    redirect_uri: `${env.DOMAIN}/auth/oauth_callback`,
    state,
  });
  return {
    props: {
      spotifyOauthUrl: `https://accounts.spotify.com/authorize?${qs.toString()}`,
    },
  };
});

const LoginPage: BlitzPage = ({
  spotifyOauthUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Layout title="Log In">
      <div className={classes.container}>
        <Button component="a" href={spotifyOauthUrl}>
          Login with Spotify
        </Button>
      </div>
    </Layout>
  );
};

export default LoginPage;
