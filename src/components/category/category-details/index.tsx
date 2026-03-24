"use client";
import React, { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import BackArrow from "@/components/common/BackArrow";
import Input from "@/components/common/Input";
import FormDialog from "@/components/common/form-dailog";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import ItemsTable from "./items-table";
import { validateAndSetErrors } from "@/utils/validation";
import { categorySchema } from "../schema";

function CategoryDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params["category-details"] as string;
  const categoryName = searchParams.get("name") || "";
  const positionParam = searchParams.get("position");
  const router = useRouter();

  const [editName, setEditName] = useState(categoryName);
  const [editPosition, setEditPosition] = useState<number | undefined>(
    positionParam ? Number(positionParam) : undefined
  );
  const [displayName, setDisplayName] = useState(categoryName);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [hasItems, setHasItems] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdateCategory = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        categorySchema,
        { name: editName, position: editPosition },
        setErrors
      ))
    )
      return false;
    setIsUpdating(true);
    const response = await apiCall({
      endpoint: routes.api.updateItemCategory(categoryId),
      method: "PATCH",
      headers: { "Content-Type": "application/merge-patch+json" },
      data: { name: editName.trim(), position: editPosition },
      showSuccessToast: true,
      successMessage: "Category updated successfully",
    });
    setIsUpdating(false);
    if (response.success) {
      setErrors({});
      setDisplayName(editName);
      return true;
    }
    return false;
  };

  const handleDeleteCategory = async (): Promise<boolean> => {
    setIsDeletingCategory(true);
    const response = await apiCall({
      endpoint: routes.api.deleteItemCategory(categoryId),
      method: "DELETE",
      showSuccessToast: true,
      successMessage: "Category deleted successfully",
    });
    setIsDeletingCategory(false);
    if (response.success) {
      router.push(routes.ui.category);
      return true;
    }
    return false;
  };

  return (
    <div className="px-4 md:px-[30px] py-10 md:py-[60px] pb-[100px]">
      <BackArrow />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-[20px] mx-0 md:mx-[20px] mb-[30px] gap-4">
        <p className="text-black text-[24px] md:text-[32px] font-[500]">{displayName}</p>
        <FormDialog
          title="Edit Category Name"
          buttonText="Edit Category"
          saveButtonText="Save"
          onSubmit={handleUpdateCategory}
          loading={isUpdating}
        >
          <div className="flex flex-col gap-6 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-[500] text-black">
                Category Name
              </label>
              <Input
                placeholder="e.g. Shirts"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                error={errors.name}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-[500] text-black">
                Position
              </label>
              <Input
                type="number"
                placeholder="1"
                min={1}
                value={editPosition ?? ""}
                onChange={(e) => {
                  setEditPosition(
                    e.target.value ? Number(e.target.value) : undefined
                  );
                  if (errors.position)
                    setErrors((prev) => ({ ...prev, position: "" }));
                }}
                error={errors.position}
              />
            </div>
          </div>
        </FormDialog>
      </div>

      <ItemsTable
        categoryId={categoryId}
        onItemsChange={(items) => setHasItems(items.length > 0)}
      />

      <div className="flex flex-col md:flex-row justify-center md:justify-end mt-[40px] px-0 md:px-6 w-full">
        {!hasItems ? (
          <FormDialog
            title="Delete Category"
            buttonText="Delete Category"
            saveButtonText="Yes"
            onSubmit={handleDeleteCategory}
            loading={isDeletingCategory}
            triggerVariant="delete"
            submitVariant="delete"
            triggerClassName="w-full md:w-auto"
          >
            Are you sure you want to delete this category ?
            <span className="mt-[8px] block">
              This action cannot be undone.
            </span>
          </FormDialog>
        ) : (
          <button className="bg-muted text-neutral px-5 md:px-[25px] py-3 md:py-[14px] rounded-[8px] font-[500] text-[16px] md:text-[20px] cursor-not-allowed [font-family:var(--font-poppins)] w-full md:w-auto">
            Delete Category
          </button>
        )}
      </div>
    </div>
  );
}

export default CategoryDetails;
