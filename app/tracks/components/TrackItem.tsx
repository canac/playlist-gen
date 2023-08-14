import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { Avatar, Text, UnstyledButton, createStyles } from "@mantine/core";
import { IconTag, IconX } from "@tabler/icons-react";
import { map } from "lodash";
import getTracks from "../queries/getTracks";
import setLabel from "app/labels/mutations/removeLabel";
import { handleAsyncErrors } from "app/lib/async";
import { failureNotification } from "app/lib/notification";
import { Album, Artist, Label, Track } from "db";

export type TrackItemProps = {
  track: Track & {
    album: Album;
    artists: Artist[];
    labels: Label[];
  };
};

const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "center",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  title: {
    marginRight: theme.spacing.lg,
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.5ch",
    fontSize: theme.fontSizes.sm,
    backgroundColor: theme.colors.green[3],
    padding: `calc(${theme.spacing.xs} / 4) calc(${theme.spacing.xs} / 2)`,
    borderRadius: theme.radius.md,
  },
  overflowEllipsis: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  deleteIcon: {
    cursor: "pointer",
    lineHeight: 0,
  },
}));

export default function TrackItem({ track }: TrackItemProps): JSX.Element {
  const { classes, cx } = useStyles();
  const [setLabelMutation] = useMutation(setLabel);

  const removeLabel = async (labelId: number) => {
    try {
      await setLabelMutation({ trackId: track.id, labelId });
    } catch (err) {
      failureNotification("Failed to remove label from track");
    }
    await invalidateQuery(getTracks);
  };

  return (
    <div className={classes.container}>
      <Avatar alt={`${track.name} album artwork`} src={track.album.thumbnailUrl} />
      <div className={classes.info}>
        <Text className={cx(classes.overflowEllipsis, classes.titleRow)} size="lg">
          <span className={classes.title}>{track.name}</span>
          {track.labels.map((label) => (
            <Text key={label.id} component="span" className={classes.label}>
              <IconTag size="1em" />
              {label.name}
              <UnstyledButton
                className={classes.deleteIcon}
                // Prevent the mouse down event from initiating a drag in TrackList
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => handleAsyncErrors(removeLabel(label.id))}
              >
                <IconX size="1em" />
              </UnstyledButton>
            </Text>
          ))}
        </Text>
        <Text className={classes.overflowEllipsis} color="dimmed" size="sm">
          {map(track.artists, "name").join(" & ")}
        </Text>
      </div>
    </div>
  );
}
