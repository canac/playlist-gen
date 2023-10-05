import { Routes } from "@blitzjs/next";
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc";
import { Button, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import deleteLabel from "../mutations/deleteLabel";
import editLabel from "../mutations/editLabel";
import getLabel from "../queries/getLabel";
import getLabels from "../queries/getLabels";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import classes from "./LabelForm.module.css";
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
      <form
        className={classes.form}
        onSubmit={form.onSubmit((values) => {
          handleAsyncErrors(performEdit(values));
        })}
      >
        <div className={classes.header}>
          <Title className={classes.title} order={2}>
            Edit label ({name})
          </Title>
          <TooltipActionIcon
            label="Close"
            variant="subtle"
            onClick={() => handleAsyncErrors(closeForm())}
          >
            <IconX className={classes.closeIcon} />
          </TooltipActionIcon>
        </div>
        <TextInput required label="Label name" {...form.getInputProps("name")} />
        {smartCriteria === null ? null : (
          <SmartCriteriaInput
            required
            label="Smart criteria"
            {...form.getInputProps("smartCriteria")}
          />
        )}
        <Button className={classes.submit} type="submit" loading={isSaving} disabled={isDeleting}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          className={classes.submit}
          loading={isDeleting}
          disabled={isSaving || isDeleting}
          color="red"
          leftSection={<IconTrash size="1rem" />}
          onClick={() => openModal()}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </form>
    </>
  );
}
