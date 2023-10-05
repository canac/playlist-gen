import { BlitzPage } from "@blitzjs/next";
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { Center, Combobox, Pagination, Text, TextInput, useCombobox } from "@mantine/core";
import { IconReload, IconSearch } from "@tabler/icons-react";
import { assert } from "blitz";
import { useRouter } from "next/router";
import { Suspense, useState } from "react";
import classes from "./index.module.css";
import { TooltipActionIcon } from "app/core/components/TooltipActionIcon";
import Layout from "app/core/layouts/Layout";
import getLabels from "app/labels/queries/getLabels";
import { handleAsyncErrors } from "app/lib/async";
import TrackList from "app/tracks/components/TrackList/TrackList";
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
  ] = useQuery(getSearchExamples, null, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const searchOptions = examples
    .map(({ value, description }) => {
      // Break the search query into the tail (the incomplete search term) and
      // the head (the rest of the search)
      const matches = /^(.*?[!(]*)([\S]*)$/.exec(search);
      const searchHead = matches && matches[1];
      assert(typeof searchHead === "string", "Failed to match search");

      return {
        value: `${searchHead}${value}`,
        label: (
          <Text size="sm">
            {searchHead.length === 0 ? "" : "... "}
            {value}
            <Text span c="dimmed" pl="xs">
              {description}
            </Text>
          </Text>
        ),
      };
    })
    .filter(({ value }) => value.toLowerCase().includes(search))
    .slice(0, 10);

  return (
    <div>
      <div className={classes.headerContainer}>
        <Combobox
          store={combobox}
          onOptionSubmit={(search) => {
            setSearch(search);
            combobox.closeDropdown();
          }}
          classNames={{
            option: classes.comboboxOption,
          }}
          // Make the dropdown options scroll under the AppShell header
          zIndex={50}
        >
          <Combobox.Target>
            <TextInput
              className={classes.searchBox}
              label="Search"
              rightSection={<IconSearch />}
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
              error={result.error?.message}
            />
          </Combobox.Target>
          {searchOptions.length > 0 && (
            <Combobox.Dropdown>
              <Combobox.Options>
                {searchOptions.map(({ label, value }) => (
                  <Combobox.Option value={value} key={value}>
                    {label}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox.Dropdown>
          )}
        </Combobox>
        <TooltipActionIcon
          className={classes.refresh}
          label="Refresh"
          variant="default"
          size="lg"
          onClick={() => refetch()}
          disabled={isLoading || typeof result.error !== "undefined"}
        >
          <IconReload />
        </TooltipActionIcon>
      </div>
      <TrackList tracks={tracks} labels={labels} />
      {pageCount > 1 || page > 1 ? (
        <Center>
          <Pagination
            total={pageCount}
            withEdges
            p="lg"
            value={page}
            onChange={(page) => handleAsyncErrors(router.push({ query: { page } }))}
          />
        </Center>
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
