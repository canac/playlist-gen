import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const schema = z.object({
  // The id of the label to delete
  labelId: primaryKey,
});

/*
 * Delete an existing label.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ labelId }, ctx) => {
    const userId = ctx.session.userId;

    // Delete the label
    await db.label.delete({
      where: { id: labelId, userId },
    });

    return { success: true };
  },
);
