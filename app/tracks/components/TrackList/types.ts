import { Album, Artist, Label, Track } from "db";

export interface TrackWithRelations extends Track {
  album: Album;
  artists: Artist[];
  labels: Label[];
}
