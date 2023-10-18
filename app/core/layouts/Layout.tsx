import { BlitzLayout } from "@blitzjs/next";
import { Routes } from "@blitzjs/next";
import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { ActionIcon, AppShell, Avatar, Button, Menu, Title, rem } from "@mantine/core";
import {
  IconCloudDownload,
  IconCloudUpload,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { TooltipActionIcon } from "../components/TooltipActionIcon";
import { useCurrentUser } from "../hooks/useCurrentUser";
import classes from "./Layout.module.css";
import logout from "app/auth/mutations/logout";
import getLabel from "app/labels/queries/getLabel";
import getLabels from "app/labels/queries/getLabels";
import { resolves } from "app/lib/async";
import { failureNotification, successNotification } from "app/lib/notification";
import pullTracks from "app/spotify/mutations/pullTracks";
import pushTracks from "app/spotify/mutations/pushTracks";
import getSearchExamples from "app/tracks/queries/getSearchExamples";
import getTracks from "app/tracks/queries/getTracks";

const Layout: BlitzLayout<{
  title?: string;
  children?: React.ReactNode;
  navbar?: React.ReactElement;
}> = ({ title, children, navbar }) => {
  const user = useCurrentUser();
  const router = useRouter();

  const [pullTracksMutation, { isLoading: pullLoading }] = useMutation(pullTracks);
  const [pushTracksMutation, { isLoading: pushLoading }] = useMutation(pushTracks);
  const [logoutMutation] = useMutation(logout);

  return (
    <>
      <Head>
        <title>{title || "playlist-gen"}</title>
      </Head>

      <AppShell
        padding="md"
        header={{ height: rem(80) }}
        navbar={navbar ? { width: rem(288), breakpoint: "sm" } : undefined}
      >
        <AppShell.Header className={classes.header} withBorder={false}>
          <Title order={1} c="white">
            Playlist Generator
          </Title>
          {user && (
            <>
              <Button component={Link} href={Routes.TracksPage()}>
                Tracks
              </Button>
              <Button component={Link} href={Routes.LabelsPage()}>
                Labels
              </Button>
              <div className={classes.headerSpacing} />
              <TooltipActionIcon
                label="Pull tracks from Spotify"
                size="lg"
                variant="filled"
                onClick={async () => {
                  const succeeded = await resolves(pullTracksMutation());
                  if (succeeded) {
                    await Promise.all([
                      invalidateQuery(getTracks),
                      invalidateQuery(getSearchExamples),
                    ]);
                    successNotification("Pulling tracks succeeded!");
                  } else {
                    failureNotification("Pulling tracks failed!");
                  }
                }}
                loading={pullLoading}
              >
                <IconCloudDownload />
              </TooltipActionIcon>
              <TooltipActionIcon
                label="Push playlists to Spotify"
                size="lg"
                variant="filled"
                onClick={async () => {
                  const succeeded = await resolves(pushTracksMutation());
                  if (succeeded) {
                    await Promise.all([invalidateQuery(getLabels), invalidateQuery(getLabel)]);
                    successNotification("Pushing playlists succeeded!");
                  } else {
                    failureNotification("Pushing playlists failed!");
                  }
                }}
                loading={pushLoading}
              >
                <IconCloudUpload />
              </TooltipActionIcon>

              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    size="lg"
                    variant="filled"
                    color="white"
                    radius="xl"
                    aria-label="User avatar"
                  >
                    {user?.avatarUrl ? (
                      <Avatar src={user.avatarUrl} radius="xl" />
                    ) : (
                      <IconUserCircle />
                    )}
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconLogout />}
                    onClick={async () => {
                      await logoutMutation();
                      await router.push(Routes.LoginPage());
                    }}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}
        </AppShell.Header>
        <AppShell.Navbar>{navbar}</AppShell.Navbar>
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
};

Layout.authenticate = { redirectTo: Routes.LoginPage() };

export default Layout;
