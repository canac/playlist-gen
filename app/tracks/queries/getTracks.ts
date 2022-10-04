import { resolver } from "@blitzjs/rpc";
import { paginate } from "blitz";
import { z } from "zod";
import db from "db";

const GetTracks = z.object({
  skip: z.number().nonnegative().optional(),
  take: z.number().nonnegative().optional(),
});

export default resolver.pipe(
  resolver.zod(GetTracks),
  resolver.authorize(),
  async ({ skip = 0, take = 25 }, ctx) => {
    const userId = ctx.session.userId;

    const where = { userId };
    const {
      items: tracks,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.track.count({ where }),
      query: (paginateArgs) =>
        db.track.findMany({
          ...paginateArgs,
          where,
          include: {
            album: true,
            artists: true,
            // Include regular labels, but hide smart labels
            labels: { where: { smartCriteria: null } },
          },
          orderBy: [{ dateAdded: "desc" }],
        }),
    });

    return {
      tracks,
      nextPage,
      hasMore,
      count,
    };
  },
);
