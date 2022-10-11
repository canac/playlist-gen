import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { Avatar, Box, Loader, MultiSelect, SelectItem, Text } from "@mantine/core";
import { map } from "lodash";
import { useState } from "react";
import createLabel from "app/labels/mutations/createLabel";
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
  labels: Label[];
};

export default function TrackItem({ labels: allLabels, track }: TrackItemProps): JSX.Element {
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

  return (
    <Box
      sx={{
        padding: "0.75em 0.5em",
        display: "flex",
        flexDirection: "row",
        gap: "1em",
        alignItems: "center",
      }}
    >
      <Avatar alt={`${track.name} album artwork`} src={track.album.thumbnailUrl} />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Text size="lg">{track.name}</Text>
        <Text color="dimmed" size="sm">
          {map(track.artists, "name").join(" & ")}
        </Text>
      </Box>
      <Box sx={{ flex: 1 }} />
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
