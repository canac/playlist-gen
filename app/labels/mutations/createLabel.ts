import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { nonEmptyString } from "app/lib/zodTypes";
import db from "db";

const CreateLabel = z.object({
  // The name of the new label
  name: nonEmptyString,

  // The smart criteria of the new label, or null if it is not a smart label
  smartCriteria: z.union([nonEmptyString, z.null()]),
});

/*
 * Create a new label.
 */
export default resolver.pipe(
  resolver.zod(CreateLabel),
  resolver.authorize(),
  async ({ name, smartCriteria }, ctx) => {
    const userId = ctx.session.userId;

    // Create the label
    const { id } = await db.label.create({
      data: {
        userId,
        name,
        smartCriteria,
      },
    });

    return { id };
  },
);
