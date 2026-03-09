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
import { categoryNameSchema } from "../schema";

function CategoryDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params["category-details"] as string;
  const categoryName = searchParams.get("name") || "";
  const router = useRouter();

  const [editName, setEditName] = useState(categoryName);
  const [displayName, setDisplayName] = useState(categoryName);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [hasItems, setHasItems] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdateCategory = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        categoryNameSchema,
        { name: editName },
        setErrors
      ))
    )
      return false;
    setIsUpdating(true);
    const response = await apiCall({
      endpoint: routes.api.updateItemCategory(categoryId),
      method: "PATCH",
      headers: { "Content-Type": "application/merge-patch+json" },
      data: { name: editName },
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
    <div className="px-[30px] py-[60px] pb-[100px]">
      <BackArrow />

      <div className="flex items-center justify-between mt-[20px] mx-[20px] mb-[30px]">
        <p className="text-black text-[32px] font-[500]">{displayName}</p>
        <FormDialog
          title="Edit Category Name"
          buttonText="Edit Category"
          saveButtonText="Save"
          onSubmit={handleUpdateCategory}
          loading={isUpdating}
        >
          <div className="flex flex-col gap-2 mt-2">
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
        </FormDialog>
      </div>

      <ItemsTable
        categoryId={categoryId}
        onItemsChange={(items) => setHasItems(items.length > 0)}
      />

      <div className="flex justify-end mt-[40px] px-6">
        {!hasItems ? (
          <FormDialog
            title="Delete Category"
            buttonText="Delete Category"
            saveButtonText="Yes"
            onSubmit={handleDeleteCategory}
            loading={isDeletingCategory}
            triggerVariant="delete"
            submitVariant="delete"
          >
            Are you sure you want to delete this category ?
            <span className="mt-[8px] block">
              This action cannot be undone.
            </span>
          </FormDialog>
        ) : (
          <button className="bg-muted text-neutral px-[25px] py-[14px] rounded-[8px] font-[500] text-[20px] cursor-not-allowed [font-family:var(--font-poppins)]">
            Delete Category
          </button>
        )}
      </div>
    </div>
  );
}

export default CategoryDetails;
