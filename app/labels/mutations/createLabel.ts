import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { nonEmptyString } from "app/lib/zodTypes";
import db from "db";

const CreateLabel = z.object({
  // The name of the new label
  name: nonEmptyString,
});

/*
 * Create a new label.
 */
export default resolver.pipe(
  resolver.zod(CreateLabel),
  resolver.authorize(),
  async ({ name }, ctx) => {
    const userId = ctx.session.userId;

    // Create the label
    const { id } = await db.label.create({
      data: {
        userId,
        name,
      },
    });

    return { id };
  },
);
