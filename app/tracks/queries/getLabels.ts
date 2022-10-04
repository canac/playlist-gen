import { resolver } from "@blitzjs/rpc";
import { paginate } from "blitz";
import { z } from "zod";
import db from "db";

const GetLabels = z.object({
  skip: z.number().nonnegative().optional(),
  take: z.number().nonnegative().optional(),
});

export default resolver.pipe(
  resolver.zod(GetLabels),
  resolver.authorize(),
  async ({ skip = 0, take = 25 }, ctx) => {
    const userId = ctx.session.userId;

    // Hide smart labels
    const where = { userId, smartCriteria: null };
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
        }),
    });

    return {
      labels,
      nextPage,
      hasMore,
      count,
    };
  },
);
