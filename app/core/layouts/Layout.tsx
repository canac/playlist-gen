import { BlitzLayout } from "@blitzjs/next";
import { Routes } from "@blitzjs/next";
import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { ActionIcon, AppShell, Avatar, Box, Button, Header, Menu, Title } from "@mantine/core";
import { IconCloudDownload, IconCloudUpload, IconLogout, IconUserCircle } from "@tabler/icons";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { TooltipActionIcon } from "../components/TooltipActionIcon";
import { useCurrentUser } from "../hooks/useCurrentUser";
import logout from "app/auth/mutations/logout";
import pullTracks from "app/spotify/mutations/pullTracks";
import pushTracks from "app/spotify/mutations/pushTracks";
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
        <title>{title || "playlist-gen-blitz"}</title>
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
            {user && (
              <>
                <Link href={Routes.TracksPage()}>
                  <Button component="a">Tracks</Button>
                </Link>
                <Link href={Routes.LabelsPage()}>
                  <Button component="a">Labels</Button>
                </Link>
                <Box sx={{ flex: 1 }} />
                <TooltipActionIcon
                  label="Pull tracks from Spotify"
                  size="lg"
                  variant="filled"
                  color="white"
                  onClick={async () => {
                    await pullTracksMutation();
                    // Remove second parameter when https://github.com/blitz-js/blitz/issues/3725 is fixed
                    await invalidateQuery(getTracks, {});
                  }}
                  loading={pullLoading}
                >
                  <IconCloudDownload />
                </TooltipActionIcon>
                <TooltipActionIcon
                  label="Push playlists to Spotify"
                  size="lg"
                  variant="filled"
                  color="white"
                  onClick={() => pushTracksMutation()}
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
                      icon={<IconLogout />}
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
          </Header>
        }
        navbar={navbar}
      >
        {children}
      </AppShell>
    </>
  );
};

Layout.authenticate = true;

export default Layout;
