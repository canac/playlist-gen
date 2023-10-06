import { resolver } from "@blitzjs/rpc";
import { isEqual } from "lodash";
import { z } from "zod";
import { nonEmptyString, primaryKey } from "app/lib/zodTypes";
import db, { Prisma } from "db";

const schema = z.object({
  // The id of the label to edit
  labelId: primaryKey,

  fields: z
    .object({
      // The new name of the label
      name: nonEmptyString,

      // The new smart criteria of the label
      smartCriteria: nonEmptyString,
    })
    .partial(),
});

/*
 * Modify an existing label.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ labelId, fields }, ctx) => {
    const userId = ctx.session.userId;

    // Update the label
    const where = { id: labelId, userId };
    try {
      await db.label.update({
        where,
        data: fields,
      });
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

    const label = await db.label.findFirstOrThrow({ where });
    return label;
  },
);
