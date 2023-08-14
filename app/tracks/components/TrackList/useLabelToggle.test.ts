import { TrackWithRelations } from "./types";
import { partitionTracks } from "./useLabelToggle";
import { Label } from "db";

const makeLabel = (id: number): Label => ({
  id,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 1,
  name: `Label ${id}`,
  smartCriteria: null,
  generatePlaylist: true,
});

const makeTrack = (id: number, labels: Label[]): TrackWithRelations => ({
  id,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 1,
  spotifyId: `track:${id}`,
  name: `Track ${id}`,
  albumId: "album:1",
  dateAdded: new Date(),
  explicit: false,
  album: {
    id: `album:1`,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: `Album 1`,
    thumbnailUrl: "",
    dateReleased: new Date(),
  },
  artists: [],
  labels,
});

describe("partitionTracks", () => {
  it("splits tracks into tracks with and without a label", () => {
    const label1 = makeLabel(1);
    const label2 = makeLabel(2);
    const tracks = [makeTrack(1, [label1]), makeTrack(2, [label1, label2]), makeTrack(3, [])];

    expect(partitionTracks(tracks, label1)).toEqual({
      tracksWithLabel: [tracks[0], tracks[1]],
      tracksWithoutLabel: [tracks[2]],
    });

    expect(partitionTracks(tracks, label2)).toEqual({
      tracksWithLabel: [tracks[1]],
      tracksWithoutLabel: [tracks[0], tracks[2]],
    });
  });
});
