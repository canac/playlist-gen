import { Box, DefaultProps, Text, UnstyledButton } from "@mantine/core";
import { IconTag, IconWand } from "@tabler/icons";
import { Label } from "db";

export type LabelListProps = {
  labels: (Label & {
    numTracks: number;
  })[];
  onChange?: (labelId: number) => void;
};

export default function LabelList({ labels, onChange }: LabelListProps): JSX.Element {
  return (
    <div>
      {labels.map((label) => (
        <UnstyledButton
          key={label.id}
          sx={(theme) => ({
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            width: "100%",

            "&:hover": {
              backgroundColor: theme.colors.gray[0],
            },
          })}
          onClick={() => onChange?.(label.id)}
        >
          <Text weight="bold">
            <IconTag size={16} style={{ marginRight: "0.25em" }} />
            {label.name} ({label.numTracks})
          </Text>
          {label.smartCriteria && (
            <Text color="dimmed" size="sm">
              <IconWand size={12} style={{ marginRight: "0.25em" }} /> {label.smartCriteria}
            </Text>
          )}
        </UnstyledButton>
      ))}
    </div>
  );
}
