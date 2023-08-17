import { chunk, difference, map, uniq } from "lodash";
import log from "loglevel";
import { z } from "zod";
import { env } from "../lib/env";
import { generatePrismaFilter } from "../lib/smartLabel";
import db, { Artist, Prisma, User } from "db";

// Expose higher-level methods for interacting with the Spotify API

// POST https://accounts.spotify.com/api/token
// Only includes fields that we care about
const tokenResponse = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

// Get the user a new Spotify access token, updating the provided user object
async function refreshAccessToken(user: User): Promise<void> {
  // Exchange the refresh token for an access token
  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", user.refreshToken);
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
  const { access_token: accessToken, expires_in: expiresIn } = tokenResponse.parse(
    await tokenRes.json(),
  );

  // Save the new access token
  const modifiedFields = {
    accessToken,
    // expiresIn is the length of the token's validity in seconds
    // Calculate the absolute time when it will expire, considering it expired a minute
    // sooner to avoid accidentally using an expired access token
    accessTokenExpiresAt: new Date(Date.now() + (expiresIn - 60) * 1000),
  };
  await db.user.update({
    where: { id: user.id },
    data: modifiedFields,
  });
  Object.assign(user, modifiedFields);
}

// Make a request to the Spotify API
// This function takes care of adding the Spotify access token to the request
// and retrying failures due to an expired access token
// Return the response body JSON
async function spotifyFetch(user: User, req: Request): Promise<unknown> {
  if (new Date() > user.accessTokenExpiresAt) {
    // The access token is expired, so preemptively refresh it
    log.info("Expired access token, retrying...");
    await refreshAccessToken(user);
  }

  // Add the authorization headers to the provided request
  const authorizedReq = new Request(req.url, req);
  authorizedReq.headers.set("Authorization", `Bearer ${user.accessToken}`);
  authorizedReq.headers.set("Accept", "application/json");

  log.info(`${req.method} ${req.url}`);
  const res = await fetch(authorizedReq);
  log.info(`Status: ${res.status}`);

  const body: unknown = await res.json();
  if (!res.ok) {
    log.error("Spotify API error:");
    log.error(body);
    throw res;
  }

  return body;
}

// GET https://api.spotify.com/v1/me/tracks
// Only includes fields that we care about
const tracksResponse = z.object({
  items: z.array(
    z.object({
      added_at: z.string(),
      track: z.object({
        album: z.object({
          id: z.string(),
          images: z.array(
            z.object({
              url: z.string(),
            }),
          ),
          name: z.string(),
          release_date: z.string(),
        }),
        artists: z.array(
          z.object({
            id: z.string(),
          }),
        ),
        explicit: z.boolean(),
        id: z.string(),
        name: z.string(),
      }),
    }),
  ),
});

// GET https://api.spotify.com/v1/artists
// Only includes fields that we care about
const artistsResponse = z.object({
  artists: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      genres: z.array(z.string()),
    }),
  ),
});

type SpotifyArtist = Pick<Artist, "id" | "name" | "genres">;

// Load the name and genre of artists from Spotify
async function lookupArtists(user: User, artistIds: string[]): Promise<SpotifyArtist[]> {
  const artistGenres: SpotifyArtist[] = [];

  // Load the artists' information 50 at a time
  for (const chunkIds of chunk(artistIds, 50)) {
    const { artists } = artistsResponse.parse(
      await spotifyFetch(
        user,
        new Request(
          `https://api.spotify.com/v1/artists?ids=${encodeURIComponent(chunkIds.join(","))}`,
        ),
      ),
    );
    artistGenres.push(...artists);
  }

  return artistGenres;
}

// Pull the user's favorite tracks from Spotify into the database
export async function syncFavoriteTracks(user: User): Promise<void> {
  // At first, only load five tracks because the user is unlikely to have new favorites since the last time and we don't
  // want to transfer lots of new tracks unnecessarily
  let offset = 0;
  let limit = 5;

  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Get the user's most recent favorite tracks from Spotify
    const tracks = tracksResponse.parse(
      await spotifyFetch(
        user,
        new Request(`https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`),
      ),
    );

    // Create the artists that the tracks reference
    const incomingArtistIds = uniq(tracks.items.flatMap((item) => map(item.track.artists, "id")));
    const existingArtistIds = map(
      await db.artist.findMany({
        where: { id: { in: incomingArtistIds } },
        select: { id: true },
      }),
      "id",
    );
    const newArtistIds = difference(incomingArtistIds, existingArtistIds);
    const newArtists = await lookupArtists(user, newArtistIds);
    await db.artist.createMany({
      data: newArtists,
    });

    // Create the tracks themselves
    const newTracks = tracks.items.map(
      ({ track, added_at }) =>
        ({
          user: { connect: { id: user.id } },
          spotifyTrack: {
            connectOrCreate: {
              where: { id: track.id },
              create: {
                id: track.id,
                name: track.name,
                album: {
                  connectOrCreate: {
                    where: { id: track.album.id },
                    create: {
                      id: track.album.id,
                      name: track.album.name,
                      thumbnailUrl:
                        // The last image has the smallest dimensions
                        track.album.images.at(-1)?.url ??
                        `https://via.placeholder.com/64.jpg?text=${encodeURIComponent(
                          track.album.name,
                        )}`,
                      dateReleased: new Date(track.album.release_date),
                    },
                  },
                },
                artists: {
                  connect: track.artists.map((artist) => ({ id: artist.id })),
                },
                explicit: track.explicit,
              },
            },
          },
          dateAdded: added_at,
        } satisfies Prisma.TrackCreateInput),
    );

    // See if any of the tracks are already in the database
    const existingTracks = await db.track.findMany({
      select: { spotifyTrackId: true },
      where: {
        userId: user.id,
        spotifyTrackId: {
          in: newTracks.map((track) => track.spotifyTrack.connectOrCreate.create.id),
        },
      },
    });
    const existingTrackIds = new Set(existingTracks.map((track) => track.spotifyTrackId));

    // Add the missing tracks to the database in series to avoid race conditions where multiple
    // tracks try to create the same album
    const missingTracks = newTracks.filter(
      (track) => !existingTrackIds.has(track.spotifyTrack.connectOrCreate.create.id),
    );
    await db.$transaction(missingTracks.map((track) => db.track.create({ data: track })));

    if (missingTracks.length === limit) {
      // All of the tracks were missing, so load another, larger batch
      offset += limit;
      limit = 25;
    } else {
      // Some of the tracks weren't missing, so everything after this batch
      // will already exist in the database
      break;
    }
  }
  /* eslint-enable no-await-in-loop */
}

// POST https://api.spotify.com/v1/me/playlists
// Only includes fields that we care about
const createPlaylistResponse = z.object({
  id: z.string(),
});

// Push the tracks from the database into Spotify playlists
export async function syncPlaylists(user: User): Promise<void> {
  // Find all labels that don't have a playlist yet
  const newLabels = await db.label.findMany({
    where: { userId: user.id, generatePlaylist: true, playlistId: null },
  });

  // Create the new Spotify playlists in parallel
  await Promise.all(
    newLabels.map(async (label) => {
      // Create a new Spotify playlist for the label
      const newPlaylist = {
        name: `${label.name} [generated]`,
        description: `Tracks labeled "${label.name}" by playlist-gen`,
        public: false,
      };
      const { id } = createPlaylistResponse.parse(
        await spotifyFetch(
          user,
          new Request(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
            method: "POST",
            body: JSON.stringify(newPlaylist),
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ),
      );

      // Link the playlist to the label
      await db.label.update({
        where: { id: label.id },
        data: {
          playlistId: id,
        },
      });
    }),
  );

  // Load the labels with their tracks in preparation for pushing them into the playlists
  const labels = await db.label.findMany({
    where: { userId: user.id, playlistId: { not: null } },
    include: {
      trackLabels: {
        include: {
          track: {
            include: {
              spotifyTrack: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
        orderBy: [{ track: { createdAt: "desc" } }],
      },
    },
  });

  // Push the playlists to Spotify in parallel
  await Promise.all(
    labels.map(async (label): Promise<void> => {
      const dummyTrackSpotifyId = "41MCdlvXOl62B7Kv86Bb1v";

      let spotifyTracks = label.trackLabels.map((trackLabel) => trackLabel.track);

      // Override the tracks for smart labels
      const { smartCriteria } = label;
      if (smartCriteria !== null) {
        spotifyTracks = [];
        try {
          spotifyTracks = await db.track.findMany({
            where: { ...generatePrismaFilter(smartCriteria), userId: user.id },
            include: {
              spotifyTrack: {
                select: { id: true },
              },
            },
          });
        } catch (err) {
          log.error(err);
        }
      }

      // Replace the tracks in the Spotify playlist with the new tracks
      // If the playlist needs to be cleared without any new tracks put into it, it is more
      // efficient to replace the entire playlist with a single song and then remove it than
      // to query the playlist for all of it's ids, possibly in multiple batches, and then
      // remove all of those ids, possibly in multiple batches
      const url = `https://api.spotify.com/v1/playlists/${label.playlistId}/tracks`;
      const ids = spotifyTracks.map((track) => track.spotifyTrack.id);
      for (const [index, spotifyIds] of chunk(
        ids.length > 0 ? ids : [dummyTrackSpotifyId],
        // Send 50 tracks at a time
        50,
      ).entries()) {
        const uris = spotifyIds.map((spotifyId) => `spotify:track:${spotifyId}`);
        // eslint-disable-next-line no-await-in-loop
        await spotifyFetch(
          user,
          new Request(`${url}?uris=${encodeURIComponent(uris.join(","))}`, {
            // During the first chunk, send PUT request to replace all previous tracks with the new chunk of tracks
            // For subsequent chunks, send POST request to append the new chunk of tracks to the existing tracks
            // to avoid overwriting the chunks that were just uploaded
            method: index === 0 ? "PUT" : "POST",
          }),
        );
      }

      // If the playlist needs to be emptied, remove the dummy track that we added to it
      if (ids.length === 0) {
        await spotifyFetch(
          user,
          new Request(url, {
            method: "DELETE",
            body: JSON.stringify({
              tracks: [{ uri: `spotify:track:${dummyTrackSpotifyId}` }],
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }),
        );
      }
    }),
  );
}
