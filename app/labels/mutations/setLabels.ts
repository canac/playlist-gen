import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const SetLabels = z.object({
  // The id of the track to add the label to
  trackId: primaryKey,

  // The id of the label to add to the track
  labelIds: z.array(primaryKey),
});

/*
 * Replace a track's labels with a list of labels.
 */
export default resolver.pipe(
  resolver.zod(SetLabels),
  resolver.authorize(),
  async ({ trackId, labelIds }, ctx) => {
    const userId = ctx.session.userId;

    // Ensure that the user owns the track
    const verifyTrack = db.track.findFirstOrThrow({
      where: { id: trackId, userId },
      select: { id: true },
    });

    // Filter out any labels not owned by the user
    const verifyLabels = db.label.findMany({
      where: { id: { in: labelIds }, userId },
      select: { id: true },
    });
    const [_, labels] = await Promise.all([verifyTrack, verifyLabels]);

    // Link the tracks to the label
    await db.track.update({
      where: { id: trackId },
      data: {
        labels: {
          set: labels,
        },
      },
    });

    return { success: true };
  },
);
