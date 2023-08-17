import { TrackWithRelations } from "./types";
import { partitionTracks } from "./useLabelToggle";
import { Label } from "db";

const makeLabel = (id: number): Label => ({
  id,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user:1",
  name: `Label ${id}`,
  smartCriteria: null,
  generatePlaylist: true,
  playlistId: null,
});

const makeTrack = (id: number, labels: Label[]): TrackWithRelations => ({
  id,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user:1",
  spotifyTrackId: `track:${id}`,
  dateAdded: new Date(),
  spotifyTrack: {
    id: `track:${id}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: `Track ${id}`,
    albumId: "album:1",
    album: {
      id: "album:1",
      createdAt: new Date(),
      updatedAt: new Date(),
      name: "Album 1",
      thumbnailUrl: "",
      dateReleased: new Date(),
    },
    artists: [],
    explicit: false,
  },
  trackLabels: labels.map((label) => ({
    id: id * 10 + label.id,
    trackId: id,
    labelId: label.id,
    label,
  })),
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
