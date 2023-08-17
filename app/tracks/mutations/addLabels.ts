import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const schema = z.object({
  // The ids of the tracks to add the label to
  trackIds: z.array(primaryKey),

  // The id of the label to add to the tracks
  labelId: primaryKey,
});

/*
 * Add a label to multiple tracks.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ trackIds, labelId }, ctx) => {
    const userId = ctx.session.userId;

    // Ensure that the user owns the label
    const verifyLabel = db.label.findFirstOrThrow({
      where: { id: labelId, userId },
      select: { id: true },
    });

    // Filter out any tracks not owned by the user
    const verifyTracks = db.track.findMany({
      where: { id: { in: trackIds }, userId },
      select: { id: true },
    });
    const [_, tracks] = await Promise.all([verifyLabel, verifyTracks]);

    // Add the labels to the tracks
    await db.trackLabel.createMany({
      data: tracks.map((track) => ({
        trackId: track.id,
        labelId,
      })),
    });

    return { success: true };
  },
);
