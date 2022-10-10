import { BlitzPage } from "@blitzjs/next";
import { Suspense } from "react";
import Layout from "app/core/layouts/Layout";
import CreateLabelForm from "app/labels/components/CreateLabelForm";
import LabelNavbar from "app/labels/components/LabelNavbar";

const NewLabelPage: BlitzPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateLabelForm />
    </Suspense>
  );
};

NewLabelPage.getLayout = (page) => (
  <Layout title="Create Label" navbar={<LabelNavbar />}>
    {page}
  </Layout>
);

export default NewLabelPage;
