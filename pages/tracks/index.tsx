import { usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import { Suspense } from "react";
import Layout from "app/core/layouts/Layout";
import getLabels from "app/labels/queries/getLabels";
import TrackList from "app/tracks/components/TrackList";
import getTracks from "app/tracks/queries/getTracks";

const ITEMS_PER_PAGE = 20;

export const TracksList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ tracks, hasMore }] = usePaginatedQuery(getTracks, {
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });
  const [{ labels }] = useQuery(getLabels, {
    includeSmartLabels: false,
  });

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });

  return (
    <div>
      <TrackList tracks={tracks} labels={labels} />

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  );
};

const TracksPage = () => {
  return (
    <Layout title="Tracks">
      <Suspense fallback={<div>Loading...</div>}>
        <TracksList />
      </Suspense>
    </Layout>
  );
};

export default TracksPage;
