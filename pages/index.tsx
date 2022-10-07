import { BlitzPage, Routes } from "@blitzjs/next";
import { Box, Text, Title } from "@mantine/core";
import { IconCloudDownload, IconCloudUpload } from "@tabler/icons";
import Link from "next/link";
import { gSSP } from "app/blitz-server";
import Layout from "app/core/layouts/Layout";

export const getServerSideProps = gSSP(async ({ ctx }) => {
  // Redirect to the login page if the user isn't logged in
  if (!ctx.session.$isAuthorized()) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
});

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <Box component="main" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ marginTop: "4em", width: "40em" }}>
          <Title order={1} align="center" pb="xl">
            Welcome to Playlist Generator!
          </Title>

          <Text size="lg">
            If you haven&lsquo;t yet, go ahead and click on the <IconCloudDownload size={16} />{" "}
            button to pull all of your tracks from Spotify. Then go to the{" "}
            <Link href={Routes.TracksPage()}>Tracks</Link> page to start adding labels to them. When
            you&lsquo;re done labeling, just click on the <IconCloudUpload size={16} /> to create
            new Spotify playlists based on the tracks you just labeled!
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};

export default Home;
