import { Routes } from "@blitzjs/next";
import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { ActionIcon, Box, Button, Checkbox, TextInput, Title, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconX } from "@tabler/icons";
import { useRouter } from "next/router";
import createLabel from "../mutations/createLabel";
import getLabels from "../queries/getLabels";
import SmartCriteriaInput from "./SmartCriteriaInput";
import { handleAsyncErrors } from "app/lib/error";

export default function CreateLabelForm(): JSX.Element {
  const router = useRouter();
  const [createLabelMutation, { isLoading: isCreating }] = useMutation(createLabel);

  const form = useForm({
    initialValues: { name: "", smartLabel: false, smartCriteria: "" },
  });

  // Leave the create label form
  function close(): Promise<boolean> {
    return router.push(Routes.LabelsPage());
  }

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
            await close();
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
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Title order={2} sx={{ flex: 1 }}>
          Create label
        </Title>
        <Tooltip label="Close">
          <ActionIcon aria-label="Close" onClick={() => handleAsyncErrors(close())}>
            <IconX />
          </ActionIcon>
        </Tooltip>
      </Box>
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
