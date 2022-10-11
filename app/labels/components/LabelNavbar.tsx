import { Routes } from "@blitzjs/next";
import { usePaginatedQuery } from "@blitzjs/rpc";
import { Box, MantineTheme, Navbar, Text, UnstyledButton } from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCirclePlus,
  IconTag,
  IconWand,
} from "@tabler/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { TooltipActionIcon } from "app/core/components/TooltipActionIcon";
import getLabels from "app/labels/queries/getLabels";
import { handleAsyncErrors } from "app/lib/error";

const ITEMS_PER_PAGE = 100;

function buttonStyles(theme: MantineTheme) {
  return {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    width: "100%",

    "&:hover": {
      backgroundColor: theme.colors.gray[0],
    },
  };
}

export default function LabelNavbar(): JSX.Element {
  const router = useRouter();
  const page = Math.max(Number(router.query.page) || 1, 1);
  const [{ labels, count }] = usePaginatedQuery(getLabels, {
    skip: ITEMS_PER_PAGE * (page - 1),
    take: ITEMS_PER_PAGE,
  });
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

  function gotoPage(page: number) {
    handleAsyncErrors(router.push({ query: { ...router.query, page } }));
  }

  return (
    <Navbar width={{ base: 250 }} sx={{ display: "flex", overflow: "scroll" }}>
      {labels.map((label) => (
        <Box key={label.id} sx={buttonStyles}>
          <Link href={Routes.EditLabelPage({ page, labelId: label.id })}>
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
      <Link href={Routes.NewLabelPage({ page })}>
        <UnstyledButton component="a" sx={buttonStyles}>
          <Text weight="bold" sx={{ display: "flex", alignItems: "center" }}>
            <IconCirclePlus size={16} style={{ marginRight: "0.25em" }} color="green" />
            Create label...
          </Text>
        </UnstyledButton>
      </Link>
      <Box sx={{ flex: 1 }} />

      {pageCount > 1 ? (
        <Box sx={(theme) => ({ display: "flex", flexDirection: "row", padding: theme.spacing.xs })}>
          <TooltipActionIcon
            label="Go to first page"
            variant="transparent"
            disabled={page === 1}
            onClick={() => gotoPage(1)}
          >
            <IconChevronsLeft />
          </TooltipActionIcon>
          <TooltipActionIcon
            label="Go to previous page"
            variant="transparent"
            disabled={page === 1}
            onClick={() => gotoPage(page - 1)}
          >
            <IconChevronLeft />
          </TooltipActionIcon>
          <Text align="center" sx={{ flex: 1 }}>
            Page {page} of {pageCount}
          </Text>
          <TooltipActionIcon
            label="Go to next page"
            variant="transparent"
            disabled={page >= pageCount}
            onClick={() => gotoPage(page + 1)}
          >
            <IconChevronRight />
          </TooltipActionIcon>
          <TooltipActionIcon
            label="Go to last page"
            variant="transparent"
            disabled={page >= pageCount}
            onClick={() => gotoPage(pageCount)}
          >
            <IconChevronsRight />
          </TooltipActionIcon>
        </Box>
      ) : null}
    </Navbar>
  );
}
