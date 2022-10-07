import { resolver } from "@blitzjs/rpc";
import { paginate } from "blitz";
import { z } from "zod";
import { generatePrismaFilter } from "app/lib/smartLabel";
import db from "db";

const GetLabels = z.object({
  includeSmartLabels: z.boolean().default(true),
  skip: z.number().nonnegative().optional(),
  take: z.number().nonnegative().optional(),
});

// Count the number of tracks matching a smart label
async function countTracks(userId: number, smartCriteria: string): Promise<number> {
  const where = generatePrismaFilter(smartCriteria);
  if (where === null) {
    return 0;
  }
  const tracks = await db.track.findMany({
    where: { userId, ...where },
    select: { id: true },
  });
  return tracks.length;
}

export default resolver.pipe(
  resolver.zod(GetLabels),
  resolver.authorize(),
  async ({ includeSmartLabels, skip = 0, take = 25 }, ctx) => {
    const userId = ctx.session.userId;

    // Potentially hide smart labels
    const where = { userId, ...(includeSmartLabels ? {} : { smartCriteria: null }) };
    const {
      items: labels,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.label.count({ where }),
      query: (paginateArgs) =>
        db.label.findMany({
          ...paginateArgs,
          where,
          orderBy: [{ createdAt: "asc" }],
          include: { _count: true },
        }),
    });

    const labelsWithCount = await Promise.all(
      labels.map(async ({ _count, ...label }) => {
        const numTracks =
          label.smartCriteria === null
            ? _count.tracks
            : await countTracks(userId, label.smartCriteria);
        return { ...label, numTracks };
      }),
    );

    return {
      labels: labelsWithCount,
      nextPage,
      hasMore,
      count,
    };
  },
);
