import { BlitzPage } from "@blitzjs/next";
import { Box, Button } from "@mantine/core";
import { InferGetServerSidePropsType } from "next";
import { gSSP } from "app/blitz-server";
import Layout from "app/core/layouts/Layout";
import { env } from "app/lib/env";

export const getServerSideProps = gSSP(async ({ req, ctx }) => {
  const redirectUri = new URL(req.url ?? "", env.DOMAIN).searchParams.get("redirect") ?? "/";

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

const LoginPage: BlitzPage = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Layout title="Log In">
      <Box sx={{ textAlign: "center", paddingTop: "1em" }}>
        <Button component="a" href={props.spotifyOauthUrl}>
          Login with Spotify
        </Button>
      </Box>
    </Layout>
  );
};

export default LoginPage;
