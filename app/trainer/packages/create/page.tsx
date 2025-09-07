"use client";

import PackageForm from "@/components/modules/pages/trainer/packages/package-form";

const CreatePackage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PackageForm mode="create" />
      </div>
    </div>
  );
};

export default CreatePackage;
