import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { partition } from "lodash";
import { TrackWithRelations } from "./types";
import { failureNotification } from "app/lib/notification";
import addLabels from "app/tracks/mutations/addLabels";
import removeLabels from "app/tracks/mutations/removeLabels";
import getTracks from "app/tracks/queries/getTracks";
import { Label } from "db";

export interface UseLabelToggleInput {
  label: Label;
  tracks: TrackWithRelations[];
}

// Split the tracks into the ones that have the label and the ones that do not
export const partitionTracks = (tracks: TrackWithRelations[], label: Label) => {
  const [tracksWithLabel, tracksWithoutLabel] = partition(tracks, (track) =>
    track.trackLabels.some((trackLabel) => trackLabel.labelId === label.id),
  );
  return {
    tracksWithLabel,
    tracksWithoutLabel,
  };
};

// Hook for toggling between all tracks having a label and no tracks having a label
export const useLabelToggle = () => {
  const [addLabelsMutation, { isLoading: isAdding }] = useMutation(addLabels);
  const [removeLabelsMutation, { isLoading: isRemoving }] = useMutation(removeLabels);
  const isToggling = isAdding || isRemoving;

  // Add the label to all of the tracks if some or none of the tracks have it, or remove the label
  // if all of the tracks have it
  const toggleLabel = async (tracks: TrackWithRelations[], label: Label) => {
    if (tracks.length === 0) {
      return;
    }

    const { tracksWithLabel, tracksWithoutLabel } = partitionTracks(tracks, label);
    if (tracksWithoutLabel.length === 0) {
      await removeLabelsMutation({
        labelId: label.id,
        trackIds: tracksWithLabel.map((track) => track.id),
      }).catch(() => {
        failureNotification(`Failed to remove label "${label.name}" from tracks`);
      });
    } else {
      await addLabelsMutation({
        labelId: label.id,
        trackIds: tracksWithoutLabel.map((track) => track.id),
      }).catch(() => {
        failureNotification(`Failed to add label "${label.name}" to tracks`);
      });
    }
    await invalidateQuery(getTracks);
  };

  return {
    toggleLabel,
    isToggling,
  };
};
