import { Checkbox, Loader, createStyles } from "@mantine/core";
import { IconTag } from "@tabler/icons-react";
import { useMemo } from "react";
import { TrackWithRelations } from "./types";
import { partitionTracks, useLabelToggle } from "./useLabelToggle";
import { handleAsyncErrors } from "app/lib/async";
import { Label } from "db";

interface LabelCheckboxProps {
  label: Label;
  selectedTracks: TrackWithRelations[];
  keyboardIndex?: number;
}

const useStyles = createStyles((theme) => ({
  checkbox: {
    backgroundColor: theme.colors.gray[1],
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.md,
  },
  label: {
    display: "flex",
    gap: "0.5ch",
    alignItems: "center",
  },
}));

export default function LabelCheckbox({
  label,
  selectedTracks,
  keyboardIndex,
}: LabelCheckboxProps): JSX.Element {
  const { classes } = useStyles();
  const { toggleLabel, isToggling } = useLabelToggle();

  const { tracksWithLabel, tracksWithoutLabel } = useMemo(
    () => partitionTracks(selectedTracks, label),
    [selectedTracks, label],
  );
  const allHaveLabel = tracksWithoutLabel.length === 0;
  const someHaveLabel = tracksWithLabel.length > 0 && tracksWithoutLabel.length > 0;

  return (
    <Checkbox
      className={classes.checkbox}
      key={label.id}
      label={
        <span className={classes.label}>
          {isToggling ? <Loader size="1em" /> : <IconTag size="1em" />}
          {label.name}
          <span>{typeof keyboardIndex !== "undefined" && `(${keyboardIndex})`}</span>
        </span>
      }
      disabled={selectedTracks.length === 0 || isToggling}
      checked={selectedTracks.length > 0 && allHaveLabel}
      indeterminate={someHaveLabel}
      onChange={() => handleAsyncErrors(toggleLabel(selectedTracks, label))}
    />
  );
}
