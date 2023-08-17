import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const schema = z.object({
  // The ids of the tracks to remove the label from
  trackIds: z.array(primaryKey),

  // The id of the label to remove from the tracks
  labelId: primaryKey,
});

/*
 * Remove a label from multiple tracks.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ trackIds, labelId }, ctx) => {
    const userId = ctx.session.userId;

    // Remove the labels from the tracks
    await db.trackLabel.deleteMany({
      where: {
        track: { userId, id: { in: trackIds } },
        labelId,
      },
    });

    return { success: true };
  },
);
