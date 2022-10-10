import { BlitzPage } from "@blitzjs/next";
import { Suspense } from "react";
import Layout from "app/core/layouts/Layout";
import LabelNavbar from "app/labels/components/LabelNavbar";

const LabelsPage: BlitzPage = () => {
  return <Suspense fallback={<div>Loading...</div>} />;
};

LabelsPage.getLayout = (page) => (
  <Layout title="Labels" navbar={<LabelNavbar />}>
    {page}
  </Layout>
);

export default LabelsPage;
