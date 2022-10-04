import { Routes } from "@blitzjs/next";
import { usePaginatedQuery } from "@blitzjs/rpc";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Suspense } from "react";
import Layout from "app/core/layouts/Layout";
import getTracks from "app/tracks/queries/getTracks";

const ITEMS_PER_PAGE = 100;

export const TracksList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ tracks, hasMore }] = usePaginatedQuery(getTracks, {
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });

  return (
    <div>
      <ul>{tracks.map((track) => JSON.stringify(track))}</ul>

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
    <Layout>
      <Head>
        <title>Tracks</title>
      </Head>

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <TracksList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default TracksPage;
