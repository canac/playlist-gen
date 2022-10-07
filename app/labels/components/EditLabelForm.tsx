import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc";
import { Box, Button, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconTrash } from "@tabler/icons";
import deleteLabel from "../mutations/deleteLabel";
import editLabel from "../mutations/editLabel";
import getLabel from "../queries/getLabel";
import getLabels from "../queries/getLabels";
import SmartCriteriaInput from "./SmartCriteriaInput";
import { handleAsyncErrors } from "app/lib/error";

export type EditLabelProps = {
  labelId: number;

  // Called when the label is done being edited (whether it was saved or deleted)
  onDone?: () => void;
};

export default function EditLabelForm({ labelId, onDone }: EditLabelProps): JSX.Element {
  const [{ name, smartCriteria }] = useQuery(getLabel, { labelId });
  const [editLabelMutation, { isLoading: isSaving }] = useMutation(editLabel);
  const [deleteLabelMutation, { isLoading: isDeleting }] = useMutation(deleteLabel);

  const form = useForm({
    initialValues: { name, smartCriteria: smartCriteria ?? "" },
  });

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(({ name, smartCriteria }) => {
        handleAsyncErrors(
          (async () => {
            await editLabelMutation({
              labelId,
              fields: { name, smartCriteria: smartCriteria ?? undefined },
            });
            // Second parameter can be removed once https://github.com/blitz-js/blitz/issues/3725 is fixed
            await invalidateQuery(getLabels, {});
            onDone?.();
          })(),
        );
      })}
      sx={{
        width: "25em",
        display: "flex",
        flexDirection: "column",
        gap: "1em",
      }}
    >
      <Title order={2}>Edit label ({name})</Title>
      <TextInput required label="Label name" {...form.getInputProps("name")} />
      {smartCriteria === null ? null : (
        <SmartCriteriaInput
          required
          label="Smart criteria"
          {...form.getInputProps("smartCriteria")}
        />
      )}
      <Button
        type="submit"
        loading={isSaving}
        sx={{ width: "10em", alignSelf: "center", marginBottom: "1em" }}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <Button
        loading={isDeleting}
        color="red"
        leftIcon={<IconTrash />}
        sx={{ width: "10em", alignSelf: "center" }}
        onClick={async () => {
          await deleteLabelMutation({ labelId });
          // Second parameter can be removed once https://github.com/blitz-js/blitz/issues/3725 is fixed
          await invalidateQuery(getLabels, {});
          onDone?.();
        }}
      >
        {isSaving ? "Deleting..." : "Delete"}
      </Button>
    </Box>
  );
}
