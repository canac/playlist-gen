import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const schema = z.object({
  // The id of the track to remove the label from
  trackId: primaryKey,

  // The id of the label to remove from the track
  labelId: primaryKey,
});

/*
 * Remove a label from a user track.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ trackId, labelId }, ctx) => {
    const userId = ctx.session.userId;

    // Remove the label from the track
    await db.trackLabel.deleteMany({
      where: {
        track: { userId, id: trackId },
        labelId,
      },
    });
    return { success: true };
  },
);
