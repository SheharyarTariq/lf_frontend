"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../common/Input";
import { Plus, Search } from "lucide-react";
import GenericTable, { Column } from "@/components/common/GenericTable";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import FormDialog from "../common/form-dailog";
import { validateAndSetErrors } from "@/utils/validation";
import { categorySchema } from "./schema";

interface ItemCategory {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  name: string;
  washingLabel: string;
  position?: number;
}

interface ItemCategoriesResponse {
  totalItems: number;
  member: ItemCategory[];
}

function Category() {
  const router = useRouter();
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createData, setCreateData] = useState<{
    name: string;
    position?: number;
  }>({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategories = async () => {
    setIsLoading(true);
    const response = await apiCall<ItemCategoriesResponse>({
      endpoint: routes.api.getItemCategories,
      method: "GET",
    });
    if (response.success && response?.data) {
      setCategories(response.data.member);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleCreate = async () => {
    if (
      !(await validateAndSetErrors(
        categorySchema,
        { name: createData.name, position: createData.position },
        setErrors
      ))
    )
      return false;
    try {
      const response = await apiCall({
        endpoint: routes.api.createItemCategory,
        method: "POST",
        data: { ...createData, name: createData.name.trim() },
        showSuccessToast: true,
        successMessage: "Category Created Successfully",
      });
      if (response.success) {
        setErrors({});
        setCreateData({ name: "" });
        getCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to create category", error);
      return false;
    }
  };

  const columns: Column<ItemCategory>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Position",
      accessor: "position" as keyof ItemCategory,
      render: (item) => (
        <div className="w-[30px] h-[30px] flex items-center justify-center bg-muted rounded-md text-[18px]">
          {item.position}
        </div>
      ),
    },
    {
      header: "Action",
      accessor: () => (
        <div className="flex justify-end">
          <img src="/assets/ArrowRight.svg" alt="" className="cursor-pointer" />
        </div>
      ),
      className: "text-right pr-[25px]",
    },
  ];

  return (
    <div>
      <div className="px-4 md:px-[50px] mt-6 md:mt-[51px] mb-10">
        <h1 className="text-[24px] md:text-[32px] font-[500] text-black">
          Category
        </h1>
        <div className="w-full flex flex-col md:flex-row items-stretch md:items-center gap-[16px] md:gap-[24px] mt-5">
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral">
              <Search size={24} color="#8F8F8F" />
            </div>
            <input
              className="py-3 md:py-4 px-4 md:px-6 !pl-10 md:!pl-12 placeholder:font-[400] placeholder:text-[#C1C1C1] text-black border-muted border border-[1px] focus:outline-neutral rounded-[8px] w-full"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center w-full md:w-auto relative [&>button]:w-full md:[&>button]:w-auto">
            <FormDialog
              title="Create New Category"
              buttonText={
                <div className="flex gap-[10px] items-center justify-center md:justify-start text-[16px]">
                  <Plus size={20} />
                  Create
                </div>
              }
              saveButtonText="Save"
              onSubmit={handleCreate}
              triggerVariant="primary"
            >
              <div className="flex flex-col gap-6 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-black">
                    Name
                  </label>
                  <Input
                    placeholder="e.g. Curtains"
                    value={createData.name}
                    onChange={(e) => {
                      setCreateData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    error={errors.name}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-medium text-black">
                    Position
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    min={1}
                    value={createData.position ?? ""}
                    onChange={(e) => {
                      setCreateData((prev) => ({
                        ...prev,
                        position: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }));
                      if (errors.position)
                        setErrors((prev) => ({ ...prev, position: "" }));
                    }}
                    error={errors.position}
                  />
                </div>
              </div>
            </FormDialog>
          </div>
        </div>
        <div className="mt-[30px]">
          <GenericTable
            pageSize={1000}
            columns={columns}
            data={filteredCategories}
            isLoading={isLoading}
            onRowClick={(row) =>
              router.push(
                `${routes.ui.categoryDetails(row.id)}?name=${encodeURIComponent(row.name)}&position=${row.position ?? ""}`
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Category;
