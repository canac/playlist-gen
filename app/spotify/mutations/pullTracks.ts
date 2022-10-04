import { resolver } from "@blitzjs/rpc";
import { syncFavoriteTracks } from "../spotifyApi";
import db from "db";

export default resolver.pipe(resolver.authorize(), async (_, ctx) => {
  const userId = ctx.session.userId;
  const user = await db.user.findFirstOrThrow({ where: { id: userId } });
  await syncFavoriteTracks(user);
  return {
    success: true,
  };
});
