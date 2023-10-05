import { BlitzPage, Routes } from "@blitzjs/next";
import { Text, Title } from "@mantine/core";
import { IconCloudDownload, IconCloudUpload } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./index.module.css";
import Layout from "app/core/layouts/Layout";

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <main className={classes.container}>
        <div className={classes.content}>
          <Title order={1} pb="xl" ta="center">
            Welcome to Playlist Generator!
          </Title>
          <Text size="lg">
            If you haven&lsquo;t yet, go ahead and click on the <IconCloudDownload size={16} />{" "}
            button to pull all of your tracks from Spotify. Then go to the{" "}
            <Link href={Routes.TracksPage()}>Tracks</Link> page to start adding labels to them. When
            you&lsquo;re done labeling, just click on the <IconCloudUpload size={16} /> to create
            new Spotify playlists based on the tracks you just labeled!
          </Text>
        </div>
      </main>
    </Layout>
  );
};

Home.authenticate = { redirectTo: Routes.LoginPage() };

export default Home;
