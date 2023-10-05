import { Routes } from "@blitzjs/next";
import { invalidateQuery, useMutation } from "@blitzjs/rpc";
import { Button, Checkbox, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import createLabel from "../mutations/createLabel";
import getLabels from "../queries/getLabels";
import classes from "./LabelForm.module.css";
import SmartCriteriaInput from "./SmartCriteriaInput";
import { TooltipActionIcon } from "app/core/components/TooltipActionIcon";
import { handleAsyncErrors } from "app/lib/async";

export default function CreateLabelForm(): JSX.Element {
  const router = useRouter();
  const [createLabelMutation, { isLoading: isCreating }] = useMutation(createLabel);

  const form = useForm({
    initialValues: { name: "", smartLabel: false, smartCriteria: "", generatePlaylist: false },
  });

  // Leave the create label form
  function close(): Promise<boolean> {
    return router.push(Routes.LabelsPage({ page: router.query.page }));
  }

  return (
    <form
      className={classes.form}
      onSubmit={form.onSubmit(({ name, smartLabel, smartCriteria, generatePlaylist }) => {
        handleAsyncErrors(
          (async () => {
            await createLabelMutation({
              name,
              smartCriteria: smartLabel ? smartCriteria : null,
              generatePlaylist,
            });
            await invalidateQuery(getLabels);
            await close();
          })(),
        );
      })}
    >
      <div className={classes.header}>
        <Title className={classes.title} order={2}>
          Create label
        </Title>
        <TooltipActionIcon
          label="Close"
          variant="subtle"
          onClick={() => handleAsyncErrors(close())}
        >
          <IconX className={classes.closeIcon} />
        </TooltipActionIcon>
      </div>
      <TextInput required label="Label name" {...form.getInputProps("name")} />
      <Checkbox label="Smart label" {...form.getInputProps("smartLabel")} />
      {form.values.smartLabel ? (
        <SmartCriteriaInput
          required
          label="Smart criteria"
          {...form.getInputProps("smartCriteria")}
        />
      ) : (
        <Checkbox label="Generate playlist" {...form.getInputProps("generatePlaylist")} />
      )}
      <Button className={classes.submit} type="submit" loading={isCreating}>
        {isCreating ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
