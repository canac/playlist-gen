import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const RemoveLabel = z.object({
  // The id of the track to remove the label from
  trackId: primaryKey,

  // The id of the label to remove from the track
  labelId: primaryKey,
});

/*
 * Remove a label from a track.
 */
export default resolver.pipe(
  resolver.zod(RemoveLabel),
  resolver.authorize(),
  async ({ trackId, labelId }, ctx) => {
    const userId = ctx.session.userId;

    // Ensure that the user owns the track and label
    const verifyTrack = db.track.findFirstOrThrow({
      where: { id: trackId, userId },
      select: { id: true },
    });
    const verifyLabel = db.label.findFirstOrThrow({
      where: { id: labelId, userId },
      select: { id: true },
    });
    await Promise.all([verifyTrack, verifyLabel]);

    // Remove the label
    await db.track.update({
      where: { id: trackId },
      data: {
        labels: { disconnect: { id: labelId } },
      },
    });

    return { success: true };
  },
);
