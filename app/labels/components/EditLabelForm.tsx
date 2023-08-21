import { Routes } from "@blitzjs/next";
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc";
import { Box, Button, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import deleteLabel from "../mutations/deleteLabel";
import editLabel from "../mutations/editLabel";
import getLabel from "../queries/getLabel";
import getLabels from "../queries/getLabels";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import SmartCriteriaInput from "./SmartCriteriaInput";
import { TooltipActionIcon } from "app/core/components/TooltipActionIcon";
import { handleAsyncErrors } from "app/lib/async";

export type EditLabelProps = {
  labelId: number;
};

export default function EditLabelForm({ labelId }: EditLabelProps): JSX.Element {
  const router = useRouter();
  const [{ name, smartCriteria, playlistId }] = useQuery(getLabel, { labelId });
  const [editLabelMutation, { isLoading: isSaving }] = useMutation(editLabel);
  const [deleteLabelMutation, { isLoading: isDeleting }] = useMutation(deleteLabel);
  const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const form = useForm({
    initialValues: { name, smartCriteria: smartCriteria ?? "" },
  });

  const performEdit = async (values: typeof form.values) => {
    await editLabelMutation({
      labelId,
      fields: {
        name: values.name,
        smartCriteria: smartCriteria === null ? undefined : values.smartCriteria,
      },
    });
    await Promise.all([invalidateQuery(getLabels), invalidateQuery(getLabel, { labelId })]);
    await closeForm();
  };

  const performDelete = async (deletePlaylist: boolean) => {
    await deleteLabelMutation({ labelId, deletePlaylist });
    await invalidateQuery(getLabels);
    await closeForm();
  };

  // Leave the edit label form
  const closeForm = (): Promise<boolean> => {
    return router.push(Routes.LabelsPage({ page: router.query.page }));
  };

  return (
    <>
      <ConfirmDeleteModal
        opened={opened}
        hasPlaylist={playlistId !== null}
        closeModal={closeModal}
        confirmDelete={(deletePlaylist) => handleAsyncErrors(performDelete(deletePlaylist))}
      />
      <Box
        component="form"
        onSubmit={form.onSubmit((values) => {
          handleAsyncErrors(performEdit(values));
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
          <TooltipActionIcon label="Close" onClick={() => handleAsyncErrors(closeForm())}>
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
          disabled={isSaving || isDeleting}
          color="red"
          leftIcon={<IconTrash />}
          sx={{ width: "10em", alignSelf: "center" }}
          onClick={() => openModal()}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </Box>
    </>
  );
}
