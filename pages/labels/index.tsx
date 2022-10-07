import { Suspense, useState } from "react";
import Layout from "app/core/layouts/Layout";
import CreateLabelForm from "app/labels/components/CreateLabelForm";
import EditLabelForm from "app/labels/components/EditLabelForm";
import LabelNavbar from "app/labels/components/LabelNavbar";

const LabelsPage = () => {
  const [selectedLabel, setSelectedLabel] = useState<number | "new" | null>(null);

  return (
    <Layout
      title="Labels"
      navbar={<LabelNavbar onChange={(labelId) => setSelectedLabel(labelId)} />}
    >
      <Suspense fallback={<div>Loading...</div>}>
        {selectedLabel === "new" ? (
          <CreateLabelForm onDone={() => setSelectedLabel(null)} />
        ) : typeof selectedLabel === "number" ? (
          <EditLabelForm labelId={selectedLabel} onDone={() => setSelectedLabel(null)} />
        ) : null}
      </Suspense>
    </Layout>
  );
};

export default LabelsPage;
