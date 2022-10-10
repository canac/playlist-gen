import { BlitzPage, useParam } from "@blitzjs/next";
import { Suspense } from "react";
import Layout from "app/core/layouts/Layout";
import EditLabelForm from "app/labels/components/EditLabelForm";
import LabelNavbar from "app/labels/components/LabelNavbar";

const EditLabelPage: BlitzPage = () => {
  const labelId = useParam("labelId", "number");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {typeof labelId === "undefined" ? null : <EditLabelForm labelId={labelId} key={labelId} />}
    </Suspense>
  );
};

EditLabelPage.getLayout = (page) => (
  <Layout title="Edit Label" navbar={<LabelNavbar />}>
    {page}
  </Layout>
);

export default EditLabelPage;
