import { Label } from "@prisma/client";
import { useCallback, useEffect } from "react";
import { useMultiSelectContext } from "../MultiSelectList/MultiSelectList";
import LabelCheckbox from "./LabelCheckbox";
import classes from "./TrackListContent.module.css";
import TrackWrapper from "./TrackWrapper";
import { TrackWithRelations } from "./types";
import { useLabelToggle } from "./useLabelToggle";
import { handleAsyncErrors } from "app/lib/async";

interface TrackListContentProps {
  labels: Label[];
}

const TrackListContent: React.FC<TrackListContentProps> = ({ labels }) => {
  const {
    selectedItems: selectedTracks,
    items: tracks,
    handleKeyDown,
  } = useMultiSelectContext<TrackWithRelations>();
  const { toggleLabel } = useLabelToggle();

  const handleKeyDownExtended = useCallback(
    (event: KeyboardEvent) => {
      if (event.key >= "1" && event.key <= "9" && selectedTracks.length > 0) {
        const label = labels[event.key.charCodeAt(0) - "1".charCodeAt(0)];
        if (label) {
          handleAsyncErrors(toggleLabel(selectedTracks, label));
        }
      }
      handleKeyDown(event);
    },
    [handleKeyDown, labels, selectedTracks, toggleLabel],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // If the keyboard event is for the body and not a specific element, allow the multiselect
      // list to handle those events
      if (event.target === document.body) {
        handleKeyDownExtended(event);
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [handleKeyDownExtended]);

  return (
    <div tabIndex={0} onKeyDown={(event) => handleKeyDownExtended(event.nativeEvent)}>
      <div className={classes.header}>
        {labels.map((label, index) => (
          <LabelCheckbox
            key={label.id}
            label={label}
            selectedTracks={selectedTracks}
            keyboardIndex={index < 9 ? index + 1 : undefined}
          />
        ))}
      </div>
      {tracks.map((track) => (
        <TrackWrapper key={track.id} track={track} />
      ))}
    </div>
  );
};
export default TrackListContent;
