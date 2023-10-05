import { Routes, useParam } from "@blitzjs/next";
import { usePaginatedQuery } from "@blitzjs/rpc";
import { Group, NavLink, Pagination, Text, Tooltip } from "@mantine/core";
import { IconCirclePlus, IconTag, IconWand } from "@tabler/icons-react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import classes from "./LabelNavbar.module.css";
import getLabels from "app/labels/queries/getLabels";
import { handleAsyncErrors } from "app/lib/async";

const ITEMS_PER_PAGE = 100;

export default function LabelNavbar(): JSX.Element {
  const router = useRouter();
  const page = Math.max(Number(router.query.page) || 1, 1);
  const [{ labels, count }] = usePaginatedQuery(getLabels, {
    skip: ITEMS_PER_PAGE * (page - 1),
    take: ITEMS_PER_PAGE,
  });
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
  const activeLabelId = useParam("labelId", "number");

  function gotoPage(page: number) {
    handleAsyncErrors(router.push({ query: { ...router.query, page } }));
  }

  return (
    <div className={classes.navbar}>
      {labels.map((label) => (
        <NavLink
          key={label.id}
          component={Link}
          href={Routes.EditLabelPage({ page, labelId: label.id })}
          active={label.id === activeLabelId}
          leftSection={<IconTag size={16} />}
          label={
            <>
              <Text span>
                <Text span fw="bold">
                  {label.name}
                </Text>{" "}
                ({label.numTracks})
              </Text>
              {label.smartCriteria && (
                <Text c="dimmed" size="sm">
                  <IconWand size={12} /> {label.smartCriteria}
                </Text>
              )}
            </>
          }
        />
      ))}
      <NavLink
        component={Link}
        href={Routes.NewLabelPage({ page })}
        active={router.pathname === Routes.NewLabelPage().pathname}
        leftSection={<IconCirclePlus color="green" size={16} />}
        label={
          <Text span fw="bold">
            Create label...
          </Text>
        }
      />
      <div className={classes.sidebarSpacing} />

      {pageCount > 1 || page > 1 ? (
        <Pagination.Root total={pageCount} onChange={(page) => gotoPage(page)} p={4} fz="sm">
          <Group gap={4} justify="center">
            <Tooltip label="Go to first page">
              <Pagination.First />
            </Tooltip>
            <Tooltip label="Go to previous page">
              <Pagination.Previous />
            </Tooltip>
            <Text
              className={clsx(classes.currentPage, {
                [classes.currentPageInvalid!]: page > pageCount,
              })}
            >
              Page {page} of {pageCount}
            </Text>
            <Tooltip label="Go to next page">
              <Pagination.Next />
            </Tooltip>
            <Tooltip label="Go to last page">
              <Pagination.Last />
            </Tooltip>
          </Group>
        </Pagination.Root>
      ) : null}
    </div>
  );
}
