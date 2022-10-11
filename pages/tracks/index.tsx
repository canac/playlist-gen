import { BlitzPage } from "@blitzjs/next";
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { Box, Pagination, Select } from "@mantine/core";
import { useRouter } from "next/router";
import { Suspense, useState } from "react";
import Layout from "app/core/layouts/Layout";
import getLabels from "app/labels/queries/getLabels";
import { handleAsyncErrors } from "app/lib/async";
import TrackList from "app/tracks/components/TrackList";
import getTracks from "app/tracks/queries/getTracks";

const ITEMS_PER_PAGE = 50;

export const TracksList = () => {
  const router = useRouter();
  const page = Math.max(Number(router.query.page) || 1, 1);
  const [{ tracks, count }] = usePaginatedQuery(getTracks, {
    skip: ITEMS_PER_PAGE * (page - 1),
    take: ITEMS_PER_PAGE,
  });
  const [{ labels }] = useQuery(getLabels, {
    includeSmartLabels: false,
  });

  const [quickLabel, setQuickLabel] = useState<number | null>(null);

  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <div>
      <Box
        sx={(theme) => ({
          width: "100%",
          backgroundColor: theme.colors.gray[1],
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
        })}
      >
        <Select
          label="Quick apply label"
          data={labels.map((label) => ({
            value: label.id.toString(),
            label: label.name,
          }))}
          value={quickLabel?.toString() ?? ""}
          onChange={(labelId) => {
            setQuickLabel(labelId === null ? null : Number(labelId));
          }}
          searchable
          clearable
          sx={{ width: 400 }}
        />
      </Box>
      <TrackList tracks={tracks} labels={labels} quickLabel={quickLabel} />
      {pageCount > 1 || page > 1 ? (
        <Pagination
          total={pageCount}
          withEdges
          position="center"
          p="lg"
          page={page}
          onChange={(page) => {
            handleAsyncErrors(router.push({ query: { page } }));
          }}
        />
      ) : null}
    </div>
  );
};

const TracksPage: BlitzPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TracksList />
    </Suspense>
  );
};

TracksPage.getLayout = (page) => <Layout title="Tracks">{page}</Layout>;

export default TracksPage;
