import { resolver } from "@blitzjs/rpc";
import { uniq } from "lodash";
import db from "db";

type SearchExample = {
  value: string;
  description: string;
};

/*
 * Return a list of possible search queries based on the user's tracks.
 */
export default resolver.pipe(resolver.authorize(), async (_, ctx) => {
  const userId = ctx.session.userId;

  const labelsPromise = db.label.findMany({
    where: { userId, smartCriteria: null },
    select: { name: true },
  });
  const tracksPromise = db.track.findMany({
    where: { userId },
    orderBy: [{ dateAdded: "desc" }],
    include: { album: true, artists: true },
  });
  const [labels, tracks] = await Promise.all([labelsPromise, tracksPromise]);
  const albumNames = uniq(tracks.map((track) => track.album.name));
  const artistNames = uniq(tracks.flatMap((track) => track.artists.map((artist) => artist.name)));

  const examples: SearchExample[] = [
    { value: "clean", description: "Clean" },
    { value: "explicit", description: "Explicit" },
    { value: "unlabeled", description: "Has no labels" },

    { value: "added=2020", description: "Added in 2020" },
    { value: "added<=2020", description: "Added in or before 2020" },
    { value: "added>2020", description: "Added after 2020" },
    { value: "added<4-1-2020", description: "Added before April 1, 2020" },
    {
      value: "added>=4-1-2020",
      description: "Added on or after April 1, 2020",
    },
    { value: "added=7d", description: "Added 7 days ago" },
    { value: "added<3m", description: "Added less than 3 months ago" },
    { value: "added>=1y", description: "Added more than 1 year ago" },

    { value: "released=2020", description: "Released in 2020" },
    { value: "released<=2020", description: "Released in or before 2020" },
    { value: "released>2020", description: "Released after 2020" },
    {
      value: "released<4-1-2020",
      description: "Released before April 1, 2020",
    },
    {
      value: "released>=4-1-2020",
      description: "Released on or after April 1, 2020",
    },
    { value: "released=7d", description: "Released 7 days ago" },
    { value: "released<3m", description: "Released less than 3 months ago" },
    { value: "released>=1y", description: "Released more than 1 year ago" },

    ...labels.map((label) => ({
      value: `label:"${label.name}"`,
      description: `Has label "${label.name}"`,
    })),
    ...albumNames.map((name) => ({
      value: `album:"${name}"`,
      description: `Album is ${name}`,
    })),
    ...artistNames.map((name) => ({
      value: `artist:"${name}"`,
      description: `Artist is ${name}`,
    })),
  ];

  return {
    success: true as const,
    data: {
      examples,
    },
  };
});
