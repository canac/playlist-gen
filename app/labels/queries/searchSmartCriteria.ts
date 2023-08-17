import { resolver } from "@blitzjs/rpc";
import { z } from "zod";
import { generatePrismaFilter } from "app/lib/smartLabel";
import { nonEmptyString } from "app/lib/zodTypes";
import db from "db";

const schema = z.object({
  // The smart criteria to search
  smartCriteria: nonEmptyString,
});

/*
 * Get information about the tracks that match a smart criteria.
 */
export default resolver.pipe(
  resolver.zod(schema),
  resolver.authorize(),
  async ({ smartCriteria }, ctx) => {
    const userId = ctx.session.userId;

    const searchWhere = generatePrismaFilter(smartCriteria);
    if (searchWhere === null) {
      return {
        success: false as const,
        error: {
          message: "Invalid smart criteria",
        },
      };
    }

    const where = { ...searchWhere, userId };
    const matchesPromise = db.track.findMany({
      where,
      take: 5,
      include: { spotifyTrack: { select: { name: true } } },
    });
    const countPromise = db.track.count({
      where,
    });
    const [matches, matchCount] = await Promise.all([matchesPromise, countPromise]);
    return {
      success: true as const,
      data: {
        matchCount,
        matchExamples: matches.map((track) => track.spotifyTrack.name),
      },
    };
  },
);
