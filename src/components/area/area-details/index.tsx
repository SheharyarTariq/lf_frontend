"use client";
import React, { useState } from "react";
import Slots from "./slots";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import BackArrow from "@/components/common/BackArrow";
import FormDialog from "@/components/common/form-dailog";
import toast from "react-hot-toast";
import Input from "@/components/common/Input";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import Postcodes from "./postcodes";
import Button from "@/components/common/Button";
import { validateAndSetErrors } from "@/utils/validation";
import { areaNameSchema } from "../schema";

function AreaDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const areaId = params["area-details"] as string;
  const getareaName = searchParams.get("name") || "";
  const [areaName, setAreaName] = useState(getareaName);
  const [displayName, setDisplayName] = useState(getareaName);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [postcodeCount, setPostcodeCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleUpdateArea = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        areaNameSchema,
        { name: areaName },
        setErrors
      ))
    )
      return false;
    setLoading(true);
    const response = await apiCall({
      endpoint: routes.api.editArea(areaId),
      method: "PATCH",
      headers: { "content-type": "application/merge-patch+json" },
      data: { name: areaName.trim() },
      showSuccessToast: true,
      successMessage: "Area updated successfully",
    });
    setLoading(false);
    if (response.success) {
      setErrors({});
      setDisplayName(areaName);
      return true;
    }
    return false;
  };

  const handleDeleteArea = async (): Promise<boolean> => {
    setDeleteLoading(true);
    const response = await apiCall({
      endpoint: routes.api.deleteArea(areaId),
      method: "DELETE",
      showSuccessToast: true,
      successMessage: "Area deleted successfully",
    });
    setDeleteLoading(false);
    if (response.success) {
      router.push(routes.ui.areas);
      return true;
    }
    return false;
  };

  return (
    <div className="px-4 md:px-[30px] py-10 md:py-[60px]">
      <BackArrow />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-[20px] mx-0 md:mx-[30px] mb-[30px] gap-4">
        <p className="text-black font-[500] text-[24px] md:text-[32px] ">
          {displayName}
        </p>
        <FormDialog
          title="Area Name"
          buttonText="Edit Area"
          saveButtonText="Save"
          onSubmit={handleUpdateArea}
          loading={loading}
        >
          <Input
            placeholder="e.g. Arsenal"
            value={areaName}
            onChange={(e) => {
              setAreaName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
          />
        </FormDialog>
      </div>

      <Slots areaId={areaId} />
      <Postcodes areaId={areaId} onPostcodesChange={setPostcodeCount} />
      <div className="flex w-full justify-end mt-6 mx-0 md:mx-[30px] mb-10 md:mb-0">
        {postcodeCount === 0 ? (
          <div className="md:mr-15 mr-8">
            <FormDialog
              title="Delete Area"
              buttonText="✕ Delete Area"
              saveButtonText="Yes"
              onSubmit={handleDeleteArea}
              triggerVariant="delete"
              submitVariant="delete"
              loading={deleteLoading}
            >
              Are you sure you want to delete this Area?
              <span className="mt-[8px] block">
                This action cannot be undone.
              </span>
            </FormDialog>
          </div>
        ) : (
          <Button
            variant="disabled"
            className="rounded-md mr-14 py-4 px-6 text-[20px] font-[500]"
            onClick={() =>
              toast.error(
                "Please delete all postcodes first to delete this area"
              )
            }
          >
            ✕ Delete Area
          </Button>
        )}
      </div>
    </div>
  );
}

export default AreaDetails;
