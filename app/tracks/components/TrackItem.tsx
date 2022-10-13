import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { Avatar, Box, Loader, MultiSelect, SelectItem, Text } from "@mantine/core";
import { map } from "lodash";
import { useState } from "react";
import createLabel from "app/labels/mutations/createLabel";
import setLabel from "app/labels/mutations/setLabel";
import setLabels from "app/labels/mutations/setLabels";
import getLabels from "app/labels/queries/getLabels";
import { handleAsyncErrors } from "app/lib/async";
import { Album, Artist, Label, Track } from "db";

export type TrackItemProps = {
  track: Track & {
    album: Album;
    artists: Artist[];
    labels: Label[];
  };

  // All available dumb labels
  labels: Label[];

  // The id of the active quick apply label
  quickLabelId: number | null;
};

export default function TrackItem({
  labels: allLabels,
  track,
  quickLabelId,
}: TrackItemProps): JSX.Element {
  const [setLabelMutation] = useMutation(setLabel);
  const [setLabelsMutation, { isLoading: setLabelsLoading }] = useMutation(setLabels);
  const [createLabelMutation, { isLoading: createLabelLoading }] = useMutation(createLabel);

  const [trackLabels, setTrackLabels] = useState(track.labels.map((label) => label.id.toString()));

  // When the user creates a new label by typing a label that doesn't exist yet, MultiSelect forces
  // us to synchronously create that new label before we have a chance to save it on the server. To
  // work around this, when creating a new label, we synchronously add a new label with
  // `value: pendingLabelId` to the MultiSelect options and then asynchronously create the label
  // and refresh the labels list. Once we have the updated list of labels, we can safely remove the
  // pending label from the options.
  const pendingLabelId = "*";
  // `pendingLabel` is the label pending creation
  const [pendingLabel, setPendingLabel] = useState<SelectItem | null>(null);

  // Handle changes to the selected labels
  async function updateLabels(labelIds: string[]) {
    setTrackLabels(labelIds);

    // Update the track's labels on the server, ignoring the pending label because it won't exist
    // on the server yet
    await setLabelsMutation({
      trackId: track.id,
      labelIds: labelIds.filter((id) => id !== pendingLabelId).map((id) => Number(id)),
    });
  }

  const hasQuickLabel = trackLabels.some((label) => label === quickLabelId?.toString());

  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing.sm,
        borderRadius: theme.radius.sm,
        display: "flex",
        flexDirection: "row",
        gap: "1em",
        alignItems: "center",

        "&:hover":
          quickLabelId === null
            ? undefined
            : {
                backgroundColor: hasQuickLabel ? theme.colors.red[1] : theme.colors.green[1],
                cursor: "pointer",
              },
      })}
      onClick={async () => {
        if (quickLabelId === null) {
          return;
        }

        if (hasQuickLabel) {
          // Remove the quick label from the labels list
          setTrackLabels(trackLabels.filter((labelId) => labelId !== quickLabelId.toString()));
        } else {
          // Add the quick label to the labels list
          setTrackLabels([...trackLabels, quickLabelId.toString()]);
        }

        await setLabelMutation({
          trackId: track.id,
          labelId: quickLabelId,
          operation: hasQuickLabel ? "remove" : "add",
        });
      }}
    >
      <Avatar alt={`${track.name} album artwork`} src={track.album.thumbnailUrl} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <Text size="lg" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {track.name}
        </Text>
        <Text color="dimmed" size="sm" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {map(track.artists, "name").join(" & ")}
        </Text>
      </Box>
      <MultiSelect
        rightSection={setLabelsLoading || createLabelLoading ? <Loader size={16} /> : null}
        label="Track labels"
        data={[
          ...allLabels.map((label) => ({ value: label.id.toString(), label: label.name })),
          ...(pendingLabel ? [pendingLabel] : []),
        ]}
        value={trackLabels}
        onChange={(labelIds) => {
          handleAsyncErrors(updateLabels(labelIds));
        }}
        searchable
        creatable={!createLabelLoading} // Only one label can be pending creation at a time
        getCreateLabel={(query) => (
          <Text>
            Create new label:{" "}
            <Text span weight="bold">
              {query}
            </Text>
          </Text>
        )}
        onCreate={(labelName) => {
          handleAsyncErrors(
            (async () => {
              const { id } = await createLabelMutation({ name: labelName, smartCriteria: null });
              await invalidateQuery(getLabels);
              setPendingLabel(null);
              return updateLabels([...trackLabels, id.toString()]);
            })(),
          );

          const newLabel = { value: pendingLabelId, label: labelName };
          setPendingLabel(newLabel);
          return newLabel;
        }}
        clearable
        sx={{ width: 400 }}
      />
    </Box>
  );
}
