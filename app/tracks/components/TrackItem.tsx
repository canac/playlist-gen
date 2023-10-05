import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { Avatar, Text, UnstyledButton, rem } from "@mantine/core";
import { IconTag, IconX } from "@tabler/icons-react";
import clsx from "clsx";
import getTracks from "../queries/getTracks";
import classes from "./TrackItem.module.css";
import setLabel from "app/labels/mutations/removeLabel";
import { handleAsyncErrors } from "app/lib/async";
import { failureNotification } from "app/lib/notification";
import { Album, Artist, Label, SpotifyTrack, Track, TrackLabel } from "db";

export type TrackItemProps = {
  track: Track & {
    spotifyTrack: SpotifyTrack & {
      album: Album;
      artists: Artist[];
    };
    trackLabels: (TrackLabel & {
      label: Label;
    })[];
  };
};

export default function TrackItem({ track }: TrackItemProps): JSX.Element {
  const [setLabelMutation] = useMutation(setLabel);

  const { spotifyTrack } = track;

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
      <Avatar
        alt={`${spotifyTrack.name} album artwork`}
        src={spotifyTrack.album.thumbnailUrl}
        radius="sm"
      />
      <div className={classes.info}>
        <Text className={clsx([classes.titleRow])} size="lg">
          <Text span mr="lg" truncate="end">
            {spotifyTrack.name}
          </Text>
          {track.trackLabels.map(({ label }) => (
            <Text key={label.id} span className={classes.label}>
              <IconTag size="1rem" />
              {label.name}
              <UnstyledButton
                className={classes.deleteIcon}
                // Prevent the mouse down event from initiating a drag in TrackList
                onMouseDown={(event) => event.stopPropagation()}
                onClick={() => handleAsyncErrors(removeLabel(label.id))}
              >
                <IconX size="1rem" />
              </UnstyledButton>
            </Text>
          ))}
        </Text>
        <Text c="dimmed" size="sm" truncate="end">
          {spotifyTrack.artists.map((artist) => artist.name).join(" & ")}
        </Text>
      </div>
    </div>
  );
}
