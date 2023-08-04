import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { generatePrismaFilter } from "app/lib/smartLabel";
import { nonEmptyString } from "app/lib/zodTypes";
import db from "db";

const SearchSmartCriteria = z.object({
  // The smart criteria to search
  smartCriteria: nonEmptyString,
});

/*
 * Get information about the tracks that match a smart criteria.
 */
export default resolver.pipe(
  resolver.zod(SearchSmartCriteria),
  resolver.authorize(),
  async ({ smartCriteria }, ctx) => {
    const userId = ctx.session.userId;

    const where = generatePrismaFilter(smartCriteria);
    if (where === null) {
      return {
        success: false as const,
        error: {
          message: "Invalid smart criteria",
        },
      };
    }

    const matchesPromise = db.track.findMany({
      where: { userId, ...where },
      take: 5,
      select: { name: true },
    });
    const countPromise = db.track.count({
      where: { userId, ...where },
    });
    const [matches, matchCount] = await Promise.all([matchesPromise, countPromise]);
    return {
      success: true as const,
      data: {
        matchCount,
        matchExamples: matches.map((track) => track.name),
      },
    };
  },
);
