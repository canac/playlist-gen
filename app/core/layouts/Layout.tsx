import { BlitzLayout } from "@blitzjs/next";
import { Routes } from "@blitzjs/next";
import { useMutation } from "@blitzjs/rpc";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Button,
  Header,
  Menu,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCloudDownload, IconCloudUpload, IconLogout, IconUserCircle } from "@tabler/icons";
import { assert } from "blitz";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import pullTracks from "app/spotify/mutations/pullTracks";
import pushTracks from "app/spotify/mutations/pushTracks";

const Layout: BlitzLayout<{ title?: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => {
  const user = useCurrentUser();
  assert(user !== null, "Not logged in");

  const [pullTracksMutation, { isLoading: pullLoading }] = useMutation(pullTracks);
  const [pushTracksMutation, { isLoading: pushLoading }] = useMutation(pushTracks);

  return (
    <>
      <Head>
        <title>{title || "playlist-gen-blitz"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppShell
        padding="md"
        header={
          <Header
            height={80}
            p="md"
            styles={(theme) => ({
              root: {
                backgroundColor: theme.colors.blue[5],
              },
            })}
            sx={{ display: "flex", gap: "1em", alignItems: "center" }}
          >
            <Title order={1} color="white">
              Playlist Generator
            </Title>
            <Link href={Routes.TracksPage()}>
              <Button component="a">Tracks</Button>
            </Link>
            <Button>Labels</Button>
            <Box sx={{ flex: 1 }} />
            <Tooltip label="Pull tracks from Spotify">
              <ActionIcon
                size="lg"
                variant="filled"
                color="white"
                onClick={() => pullTracksMutation()}
                loading={pullLoading}
              >
                <IconCloudDownload />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Push playlists to Spotify">
              <ActionIcon
                size="lg"
                variant="filled"
                color="white"
                onClick={() => pushTracksMutation()}
                loading={pushLoading}
              >
                <IconCloudUpload />
              </ActionIcon>
            </Tooltip>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon size="lg" variant="filled" color="white" radius="xl">
                  {user.avatarUrl ? (
                    <Avatar alt="User avatar" src={user.avatarUrl} radius="xl" />
                  ) : (
                    <IconUserCircle />
                  )}
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item icon={<IconLogout />}>Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Header>
        }
      >
        {children}
      </AppShell>
    </>
  );
};

Layout.authenticate = true;

export default Layout;
