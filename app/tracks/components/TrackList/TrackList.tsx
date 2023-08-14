import { createStyles } from "@mantine/core";
import { useCallback } from "react";
import MultiSelectList from "../MultiSelectList/MultiSelectList";
import TrackItem from "../TrackItem";
import LabelCheckbox from "./LabelCheckbox";
import { TrackWithRelations } from "./types";
import { useLabelToggle } from "./useLabelToggle";
import { handleAsyncErrors } from "app/lib/async";
import { Label } from "db";

export interface TrackListProps {
  tracks: TrackWithRelations[];

  // All available dumb labels
  labels: Label[];
}

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  item: {
    borderLeft: "4px solid transparent",
  },
  itemSelected: {
    backgroundColor: theme.colors.blue[1],
  },
  itemActive: {
    borderLeftColor: theme.colors.blue[5],
  },
}));

export default function TrackList({ tracks, labels }: TrackListProps): JSX.Element {
  const { classes, cx } = useStyles();
  const { toggleLabel } = useLabelToggle();

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    selectedTracks: TrackWithRelations[],
  ) => {
    if (event.key >= "1" && event.key <= "9" && selectedTracks.length > 0) {
      const label = labels[event.key.charCodeAt(0) - "1".charCodeAt(0)];
      if (label) {
        handleAsyncErrors(toggleLabel(selectedTracks, label));
      }
    }
  };

  return (
    <MultiSelectList
      items={tracks}
      getKey={useCallback((track) => track.id, [])}
      render={({
        selectedItems: selectedTracks,
        items: tracks,
        isActiveItem,
        isItemSelected,
        getContainerProps,
        getItemProps,
      }) => (
        <div
          {...getContainerProps({
            onKeyDown: (event) => handleKeyDown(event, selectedTracks),
            onBlur: (event) => {
              // If the focus ever moves to the body, bring the focus back to the multiselect list
              // so that it can handle keyboard events. This can happen if a label checkbox was
              // checked, which makes it disabled during the mutation and transfers its focus to the
              // body. This can also happen when the "x" button on a label is clicked, which removes
              // the button and transfers its focus to the body.
              if (document.activeElement === document.body) {
                event.target.focus({ preventScroll: true });
              }
            },
          })}
        >
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
            <div
              key={track.id}
              className={cx(classes.item, {
                [classes.itemSelected]: isItemSelected(track),
                [classes.itemActive]: isActiveItem(track),
              })}
              {...getItemProps(track)}
            >
              <TrackItem track={track} />
            </div>
          ))}
        </div>
      )}
    />
  );
}
