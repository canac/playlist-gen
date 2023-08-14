import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const AddLabels = z.object({
  // The ids of the tracks to add the label to
  trackIds: z.array(primaryKey),

  // The id of the label to add to the tracks
  labelId: primaryKey,
});

/*
 * Add a label to multiple tracks.
 */
export default resolver.pipe(
  resolver.zod(AddLabels),
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

    // Link the tracks to the label
    await Promise.all(
      tracks.map((track) =>
        db.track.update({
          where: { id: track.id },
          data: {
            labels: {
              connect: { id: labelId },
            },
          },
        }),
      ),
    );

    return { success: true };
  },
);
