import { resolver } from "@blitzjs/rpc";
import { isEqual } from "lodash";
import { z } from "zod";
import { nonEmptyString } from "app/lib/zodTypes";
import db, { Prisma } from "db";

const schema = z.object({
  // The name of the new label
  name: nonEmptyString,

  // The smart criteria of the new label, or null if it is not a smart label
  smartCriteria: z.union([nonEmptyString, z.null()]),

  // True if the label will create a Spotify playlist
  generatePlaylist: z.boolean(),
});

/*
 * Create a new label.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ name, smartCriteria, generatePlaylist }, ctx) => {
    const userId = ctx.session.userId;

    // Create the label
    try {
      const { id } = await db.label.create({
        data: {
          userId,
          name,
          smartCriteria,
          generatePlaylist: generatePlaylist || smartCriteria !== null,
        },
      });

      return { id };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        isEqual(err.meta?.target, ["userId", "name"])
      ) {
        throw new Error("A label with this name already exists");
      } else {
        throw err;
      }
    }
  },
);
