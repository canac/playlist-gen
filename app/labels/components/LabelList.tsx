import { Routes } from "@blitzjs/next";
import { Box, Text, UnstyledButton } from "@mantine/core";
import { IconTag, IconWand } from "@tabler/icons";
import Link from "next/link";
import { Label } from "db";

export type LabelListProps = {
  labels: (Label & {
    numTracks: number;
  })[];
};

export default function LabelList({ labels }: LabelListProps): JSX.Element {
  return (
    <div>
      {labels.map((label) => (
        <Box
          key={label.id}
          sx={(theme) => ({
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            width: "100%",

            "&:hover": {
              backgroundColor: theme.colors.gray[0],
            },
          })}
        >
          <Link href={Routes.EditLabelPage({ labelId: label.id })}>
            <UnstyledButton component="a">
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
          </Link>
        </Box>
      ))}
    </div>
  );
}
