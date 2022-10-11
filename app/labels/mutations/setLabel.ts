import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const SetLabel = z.object({
  // The id of the track to add or remove the label to
  trackId: primaryKey,

  // The id of the label to add or remove from the track
  labelId: primaryKey,

  // Whether to add or remove the label from the track
  operation: z.union([z.literal("add"), z.literal("remove")]),
});

/*
 * Add a label to or remove a label from a track.
 */
export default resolver.pipe(
  resolver.zod(SetLabel),
  resolver.authorize(),
  async ({ trackId, labelId, operation }, ctx) => {
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

    // Add or remove the label
    const mutation =
      operation === "add" ? { connect: { id: labelId } } : { disconnect: { id: labelId } };
    await db.track.update({
      where: { id: trackId },
      data: {
        labels: mutation,
      },
    });

    return { success: true };
  },
);
