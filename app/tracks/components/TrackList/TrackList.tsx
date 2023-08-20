import { useCallback } from "react";
import MultiSelectList from "../MultiSelectList/MultiSelectList";
import TrackListContent from "./TrackListContent";
import { TrackWithRelations } from "./types";
import { Label } from "db";

export interface TrackListProps {
  tracks: TrackWithRelations[];

  // All available dumb labels
  labels: Label[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks, labels }) => (
  <MultiSelectList
    items={tracks}
    getKey={useCallback((track) => track.id, [])}
    render={() => <TrackListContent labels={labels} />}
  />
);
export default TrackList;
