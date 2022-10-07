import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { Box, Button, Checkbox, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import createLabel from "../mutations/createLabel";
import getLabels from "../queries/getLabels";
import SmartCriteriaInput from "./SmartCriteriaInput";
import { handleAsyncErrors } from "app/lib/error";

export type CreateLabelProps = {
  // Called when the label is done being created
  onDone?: () => void;
};

export default function CreateLabelForm({ onDone }: CreateLabelProps): JSX.Element {
  const [createLabelMutation, { isLoading: isCreating }] = useMutation(createLabel);

  const form = useForm({
    initialValues: { name: "", smartLabel: false, smartCriteria: "" },
  });

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(({ name, smartLabel, smartCriteria }) => {
        handleAsyncErrors(
          (async () => {
            await createLabelMutation({
              name,
              smartCriteria: smartLabel ? smartCriteria : null,
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
      <Title order={2}>Create label</Title>
      <TextInput required label="Label name" {...form.getInputProps("name")} />
      <Checkbox label="Smart label" {...form.getInputProps("smartLabel")} />
      {form.values.smartLabel ? (
        <SmartCriteriaInput
          required
          label="Smart criteria"
          {...form.getInputProps("smartCriteria")}
        />
      ) : null}
      <Button
        type="submit"
        loading={isCreating}
        sx={{ width: "10em", alignSelf: "center", marginBottom: "1em" }}
      >
        {isCreating ? "Creating..." : "Create"}
      </Button>
    </Box>
  );
}
