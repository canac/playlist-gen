import { Routes } from "@blitzjs/next";
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc";
import { Box, Button, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { IconTrash, IconX } from "@tabler/icons";
import { useRouter } from "next/router";
import deleteLabel from "../mutations/deleteLabel";
import editLabel from "../mutations/editLabel";
import getLabel from "../queries/getLabel";
import getLabels from "../queries/getLabels";
import SmartCriteriaInput from "./SmartCriteriaInput";
import { TooltipActionIcon } from "app/core/components/TooltipActionIcon";
import { handleAsyncErrors } from "app/lib/async";

export type EditLabelProps = {
  labelId: number;
};

export default function EditLabelForm({ labelId }: EditLabelProps): JSX.Element {
  const router = useRouter();
  const [{ name, smartCriteria }] = useQuery(getLabel, { labelId });
  const [editLabelMutation, { isLoading: isSaving }] = useMutation(editLabel);
  const [deleteLabelMutation, { isLoading: isDeleting }] = useMutation(deleteLabel);

  const form = useForm({
    initialValues: { name, smartCriteria: smartCriteria ?? "" },
  });

  // Open the confirm delete dialog
  // The returned promise resolves to false if the user clicked cancel, true if
  // the user clicked confirm
  function confirmDelete(): Promise<boolean> {
    return new Promise((resolve) => {
      openConfirmModal({
        title: "Confirm Delete",
        centered: true,
        children: "Are you sure you want to delete this label?",
        labels: { confirm: "Delete", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onCancel: () => resolve(false),
        onConfirm: () => resolve(true),
      });
    });
  }

  // Leave the edit label form
  function close(): Promise<boolean> {
    return router.push(Routes.LabelsPage({ page: router.query.page }));
  }

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit((values) => {
        handleAsyncErrors(
          (async () => {
            await editLabelMutation({
              labelId,
              fields: {
                name: values.name,
                smartCriteria: smartCriteria === null ? undefined : values.smartCriteria,
              },
            });
            await invalidateQuery(getLabels);
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
          Edit label ({name})
        </Title>
        <TooltipActionIcon label="Close" onClick={() => handleAsyncErrors(close())}>
          <IconX />
        </TooltipActionIcon>
      </Box>
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
        disabled={isDeleting}
        sx={{ width: "10em", alignSelf: "center", marginBottom: "1em" }}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
      <Button
        loading={isDeleting}
        disabled={isSaving}
        color="red"
        leftIcon={<IconTrash />}
        sx={{ width: "10em", alignSelf: "center" }}
        onClick={async () => {
          if (!(await confirmDelete())) {
            return;
          }

          await deleteLabelMutation({ labelId });
          await invalidateQuery(getLabels);
          await close();
        }}
      >
        {isSaving ? "Deleting..." : "Delete"}
      </Button>
    </Box>
  );
}
