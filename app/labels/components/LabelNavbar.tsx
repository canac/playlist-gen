import { usePaginatedQuery } from "@blitzjs/rpc";
import { ActionIcon, Box, Navbar, Text, UnstyledButton } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCirclePlus,
} from "@tabler/icons";
import { useRouter } from "next/router";
import React from "react";
import LabelList from "app/labels/components/LabelList";
import getLabels from "app/labels/queries/getLabels";
import { handleAsyncErrors } from "app/lib/error";

export type LabelNavbarProps = {
  onChange?: (labelId: number | "new") => void;
};

const ITEMS_PER_PAGE = 100;

export default function LabelNavbar(props: LabelNavbarProps): JSX.Element {
  const router = useRouter();
  const page = Math.max(Number(router.query.page) || 1, 1);
  const [{ labels, count }] = usePaginatedQuery(getLabels, {
    skip: ITEMS_PER_PAGE * (page - 1),
    take: ITEMS_PER_PAGE,
  });
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

  function gotoPage(page: number) {
    handleAsyncErrors(router.push({ query: { page } }));
  }

  return (
    <Navbar width={{ base: 250 }} sx={{ display: "flex" }}>
      <LabelList labels={labels} onChange={props.onChange} />
      <UnstyledButton
        sx={(theme) => ({
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          width: "100%",

          "&:hover": {
            backgroundColor: theme.colors.gray[0],
          },
        })}
        onClick={() => props.onChange?.("new")}
      >
        <Text weight="bold" sx={{ display: "flex", alignItems: "center" }}>
          <IconCirclePlus size={16} style={{ marginRight: "0.25em" }} color="green" />
          Create label...
        </Text>
      </UnstyledButton>
      <Box sx={{ flex: 1 }} />

      {pageCount > 1 ? (
        <Box sx={(theme) => ({ display: "flex", flexDirection: "row", padding: theme.spacing.xs })}>
          <ActionIcon variant="transparent" disabled={page === 1} onClick={() => gotoPage(1)}>
            <IconChevronsLeft />
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            disabled={page === 1}
            onClick={() => gotoPage(page - 1)}
          >
            <IconChevronLeft />
          </ActionIcon>
          <Text align="center" sx={{ flex: 1 }}>
            Page {page} of {pageCount}
          </Text>
          <ActionIcon
            variant="transparent"
            disabled={page >= pageCount}
            onClick={() => gotoPage(page + 1)}
          >
            <IconChevronRight />
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            disabled={page >= pageCount}
            onClick={() => gotoPage(pageCount)}
          >
            <IconChevronsRight />
          </ActionIcon>
        </Box>
      ) : null}
    </Navbar>
  );
}
