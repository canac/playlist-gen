import { resolver } from "@blitzjs/rpc";
import { NotFoundError } from "blitz";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const DeleteLabel = z.object({
  // The id of the label to delete
  labelId: primaryKey,
});

/*
 * Delete an existing label.
 */
export default resolver.pipe(
  resolver.zod(DeleteLabel),
  resolver.authorize(),
  async ({ labelId }, ctx) => {
    const userId = ctx.session.userId;

    // Delete the label
    const { count } = await db.label.deleteMany({
      where: { id: labelId, userId },
    });
    if (count === 0) {
      throw new NotFoundError();
    }

    return { success: true };
  },
);
