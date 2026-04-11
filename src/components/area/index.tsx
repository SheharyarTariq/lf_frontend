"use client";
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AreaTable from "./area-table";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import FormDialog from "../common/form-dailog";
import Input from "../common/Input";
import SearchInput from "../common/SearchInput";
import { validateAndSetErrors } from "@/utils/validation";
import { areaNameSchema } from "./schema";

export interface AreaData {
  "@id": string;
  id: string;
  name: string;
  code?: string;
  city?: string;
  status?: string;
  totalPostcodes?: number;
  totalActivePostcodes?: number;
}

interface AreaResponse {
  member: AreaData[];
}

interface CreateAreaResponse {
  id: string;
  name: string;
  code: string;
  city: string;
  status: string;
}

function Area() {
  const [areaResponse, setAreaResponse] = useState<AreaData[]>([]);
  const [areaName, setAreaName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getArea = async () => {
    setLoading(true);
    const response = await apiCall<AreaResponse>({
      endpoint: routes.api.getArea,
      method: "GET",
    });
    if (response.success && response.data?.member) {
      setAreaResponse(response.data.member);
    }
    setLoading(false);
  };

  useEffect(() => {
    getArea();
  }, []);

  const handleCreateArea = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        areaNameSchema,
        { name: areaName },
        setErrors
      ))
    )
      return false;
    setLoading(true);
    const response = await apiCall<CreateAreaResponse>({
      endpoint: routes.api.getArea,
      method: "POST",
      data: { name: areaName.trim() },
      showSuccessToast: true,
      successMessage: "Area created successfully",
    });
    setLoading(false);
    if (response.success && response.data) {
      setErrors({});
      setAreaResponse((prev) => [...prev, response.data as AreaData]);
      setAreaName("");
      return true;
    }
    return false;
  };

  const handleSearchResults = (data: AreaResponse | null) => {
    if (data && data.member) {
      setAreaResponse(data.member);
    } else {
      getArea();
    }
  };

  return (
    <>
      <div className="px-4 md:px-[50px] mt-6 md:mt-[51px] mb-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-black text-[24px] md:text-[32px] font-[500]">
            Areas
          </h1>
        </div>

        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-[16px] md:gap-[24px]">
          <SearchInput<AreaResponse>
            endpoint={routes.api.getArea}
            searchKey="name"
            placeholder="Search Area"
            onResults={handleSearchResults}
          />
          <FormDialog
            title="Area Name"
            buttonText={
              <span className="flex items-center justify-center w-full gap-2">
                <Plus size={20} />
                Create
              </span>
            }
            saveButtonText="Save"
            onSubmit={handleCreateArea}
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
        <AreaTable areaResponse={areaResponse} isLoading={loading} />
      </div>
    </>
  );
}

export default Area;
