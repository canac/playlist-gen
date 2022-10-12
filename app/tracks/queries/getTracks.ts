import { resolver } from "@blitzjs/rpc";
import { paginate } from "blitz";
import { z } from "zod";
import { generatePrismaFilter } from "app/lib/smartLabel";
import db from "db";

const GetTracks = z.object({
  search: z.string().optional(),
  skip: z.number().nonnegative().optional(),
  take: z.number().nonnegative().optional(),
});

export default resolver.pipe(
  resolver.zod(GetTracks),
  resolver.authorize(),
  async ({ search, skip = 0, take = 25 }, ctx) => {
    const userId = ctx.session.userId;

    const searchWhere = search ? generatePrismaFilter(search) : {};
    if (searchWhere === null) {
      return {
        success: false as const,
        error: {
          message: "Invalid search query",
        },
      };
    }

    const where = { userId, ...searchWhere };
    const { items: tracks, count } = await paginate({
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
      success: true as const,
      data: {
        tracks,
        count,
      },
    };
  },
);
