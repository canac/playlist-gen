import { Album, Artist, Label, SpotifyTrack, Track, TrackLabel } from "db";

export interface SpotifyTrackWithRelations extends SpotifyTrack {
  album: Album;
  artists: Artist[];
}

export interface TrackLabelWithRelations extends TrackLabel {
  label: Label;
}

export interface TrackWithRelations extends Track {
  spotifyTrack: SpotifyTrackWithRelations;
  trackLabels: TrackLabelWithRelations[];
}
