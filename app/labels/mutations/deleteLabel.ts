import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import * as spotify from "app/spotify/spotifyApi";
import db from "db";

const schema = z.object({
  // The id of the label to delete
  labelId: primaryKey,

  // Whether to delete the Spotify playlist as well
  deletePlaylist: z.boolean().default(true),
});

/*
 * Delete an existing label.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ labelId, deletePlaylist }, ctx) => {
    const userId = ctx.session.userId;

    // Delete the label
    const { playlistId } = await db.label.delete({
      where: { id: labelId, userId },
      select: { playlistId: true },
    });
    if (playlistId && deletePlaylist) {
      const user = await db.user.findFirstOrThrow({ where: { id: userId } });
      await spotify.deletePlaylist(user, playlistId);
    }

    return { success: true };
  },
);
