import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { primaryKey } from "app/lib/zodTypes";
import db from "db";

const schema = z.object({
  // The id of the label to load
  labelId: primaryKey,
});

/*
 * Load a label from the database by its id.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ labelId }, ctx) => {
    const userId = ctx.session.userId;
    const label = await db.label.findFirstOrThrow({ where: { id: labelId, userId } });
    return label;
  },
);
