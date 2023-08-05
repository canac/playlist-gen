import { BlitzPage } from "@blitzjs/next";
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { Autocomplete, Box, Pagination, Select, Text, useMantineTheme } from "@mantine/core";
import { IconReload, IconSearch } from "@tabler/icons-react";
import { assert } from "blitz";
import { useRouter } from "next/router";
import { Suspense, useState } from "react";
import { TooltipActionIcon } from "app/core/components/TooltipActionIcon";
import Layout from "app/core/layouts/Layout";
import getLabels from "app/labels/queries/getLabels";
import { handleAsyncErrors } from "app/lib/async";
import TrackList from "app/tracks/components/TrackList";
import getSearchExamples from "app/tracks/queries/getSearchExamples";
import getTracks from "app/tracks/queries/getTracks";

const ITEMS_PER_PAGE = 20;

export const TracksList = () => {
  const router = useRouter();
  const page = Math.max(Number(router.query.page) || 1, 1);

  const [search, setSearch] = useState("");
  const [result, { refetch, isLoading }] = usePaginatedQuery(getTracks, {
    search,
    skip: ITEMS_PER_PAGE * (page - 1),
    take: ITEMS_PER_PAGE,
  });
  const tracks = result.success ? result.data.tracks : [];
  const count = result.success ? result.data.count : 0;
  const [{ labels }] = useQuery(getLabels, {
    includeSmartLabels: false,
  });
  const [
    {
      data: { examples },
    },
  ] = useQuery(getSearchExamples, {});
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

  const [quickLabel, setQuickLabel] = useState<number | null>(null);

  const searchOptions = examples.map(({ value, description }) => {
    // Break the search query into the tail (the incomplete search term) and
    // the head (the rest of the search)
    const matches = /^(.*?[!(]*)([\S]*)$/.exec(search);
    const searchHead = matches && matches[1];
    assert(typeof searchHead === "string", "Failed to match search");

    return {
      value: `${searchHead}${value}`,
      label: (
        <Text>
          {searchHead.length === 0 ? "" : "... "}
          {value}
          <Text component="span" color="dimmed" size="sm" pl="0.5em">
            {description}
          </Text>
        </Text>
      ),
    };
  });

  const theme = useMantineTheme();

  return (
    <div>
      <Box sx={{ display: "flex", gap: "1em", paddingBottom: "1em" }}>
        <Autocomplete
          label="Search"
          rightSection={<IconSearch />}
          data={searchOptions}
          limit={10}
          value={search}
          error={result.error?.message}
          onChange={setSearch}
          styles={(theme) => ({
            item: {
              padding: theme.spacing.xs,
            },
          })}
          sx={{ flex: 2 }}
        />
        <TooltipActionIcon
          label="Refresh"
          size="lg"
          onClick={() => refetch()}
          disabled={isLoading || typeof result.error !== "undefined"}
          sx={{
            marginTop: `${theme.lineHeight}em`,
            marginRight: "2em",
          }}
        >
          <IconReload />
        </TooltipActionIcon>
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
          sx={{ flex: 1 }}
        />
      </Box>
      <TrackList tracks={tracks} labels={labels} quickLabel={quickLabel} />
      {pageCount > 1 || page > 1 ? (
        <Pagination
          total={pageCount}
          withEdges
          position="center"
          p="lg"
          value={page}
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
