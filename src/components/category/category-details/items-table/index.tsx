import { useEffect, useState } from "react";
import Input from "@/components/common/Input";
import FormDialog from "@/components/common/form-dailog";
import SearchInput from "@/components/common/SearchInput";
import Select from "@/components/common/Select";
import GenericTable, { Column } from "@/components/common/GenericTable";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import { Plus } from "lucide-react";
import { validateAndSetErrors } from "@/utils/validation";
import { categoryItemSchema } from "../../schema";
import { penceToPounds, poundsToPence } from "@/utils/helper";

interface CategoryItem {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  name: string;
  priceDryCleaning: number | null;
  priceWashing: number | null;
  priceType: string;
  piece: number;
  position?: number;
}

interface CategoryDetailsResponse {
  totalItems: number;
  search?: any;
  member: CategoryItem[];
}

interface ItemsTableProps {
  categoryId: string;
  onItemsChange?: (items: CategoryItem[]) => void;
}

const EditItemDialog = ({
  item,
  onUpdateSuccess,
}: {
  item: CategoryItem;
  onUpdateSuccess: () => void;
}) => {
  const [editItemData, setEditItemData] = useState({
    id: item.id,
    name: item.name,
    priceWashing:
      item.priceWashing !== null && item.priceWashing !== undefined
        ? penceToPounds(item.priceWashing).toString()
        : "",
    priceDryCleaning:
      item.priceDryCleaning !== null && item.priceDryCleaning !== undefined
        ? penceToPounds(item.priceDryCleaning).toString()
        : "",
    priceType: item.priceType.charAt(0).toUpperCase() + item.priceType.slice(1),
    position: item.position ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        categoryItemSchema,
        {
          name: editItemData.name,
          priceType: editItemData.priceType,
          priceWashing: editItemData.priceWashing,
          priceDryCleaning: editItemData.priceDryCleaning,
          position: editItemData.position,
        },
        setErrors
      ))
    )
      return false;

    setIsUpdating(true);
    const payload = {
      name: editItemData.name.trim(),
      priceWashing: editItemData.priceWashing
        ? poundsToPence(Number(editItemData.priceWashing))
        : null,
      priceDryCleaning: editItemData.priceDryCleaning
        ? poundsToPence(Number(editItemData.priceDryCleaning))
        : null,
      priceType: editItemData.priceType.toLowerCase(),
      position: editItemData.position ? Number(editItemData.position) : null,
    };

    const response = await apiCall({
      endpoint: routes.api.updateItems(editItemData.id),
      method: "PATCH",
      headers: { "Content-Type": "application/merge-patch+json" },
      data: payload,
      showSuccessToast: true,
      successMessage: "Item updated successfully",
    });

    setIsUpdating(false);
    if (response.success) {
      setErrors({});
      onUpdateSuccess();
      return true;
    }
    return false;
  };

  return (
    <FormDialog
      title="Edit Item"
      buttonText={
        <img src="/assets/edit.svg" alt="Edit" className="cursor-pointer" />
      }
      saveButtonText="Save"
      onSubmit={handleUpdate}
      loading={isUpdating}
      triggerVariant="icon"
      onOpen={() => {
        setEditItemData({
          id: item.id,
          name: item.name,
          priceWashing:
            item.priceWashing !== null && item.priceWashing !== undefined
              ? penceToPounds(item.priceWashing).toString()
              : "",
          priceDryCleaning:
            item.priceDryCleaning !== null &&
            item.priceDryCleaning !== undefined
              ? penceToPounds(item.priceDryCleaning).toString()
              : "",
          priceType:
            item.priceType.charAt(0).toUpperCase() + item.priceType.slice(1),
          position: item.position ?? "",
        });
        setErrors({});
      }}
    >
      <div className="flex flex-col gap-6 mt-2 text-left">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-[500] text-black">Item Name</label>
          <Input
            placeholder="e.g. Formal Shirt"
            value={editItemData.name}
            onChange={(e) => {
              setEditItemData((prev) => ({
                ...prev,
                name: e.target.value,
              }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-[500] text-black">
            Wash Price
          </label>
          <Input
            type="number"
            placeholder="e.g. 1.99"
            min={0}
            step="0.01"
            value={editItemData.priceWashing ?? ""}
            onChange={(e) => {
              setEditItemData((prev) => ({
                ...prev,
                priceWashing: e.target.value,
              }));
              if (errors.priceWashing)
                setErrors((prev) => ({ ...prev, priceWashing: "" }));
            }}
            error={errors.priceWashing}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-[500] text-black">
            Dry Clean Price
          </label>
          <Input
            type="number"
            placeholder="e.g. 1.99"
            min={0}
            step="0.01"
            value={editItemData.priceDryCleaning ?? ""}
            onChange={(e) => {
              setEditItemData((prev) => ({
                ...prev,
                priceDryCleaning: e.target.value,
              }));
              if (errors.priceDryCleaning)
                setErrors((prev) => ({ ...prev, priceDryCleaning: "" }));
            }}
            error={errors.priceDryCleaning}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-[14px] font-[500] text-black">
              Price Type
            </label>
            <Select
              options={[
                { label: "Fixed", value: "Fixed" },
                { label: "From", value: "From" },
                { label: "Kg", value: "Kg" },
              ]}
              value={editItemData.priceType}
              onChange={(e) => {
                setEditItemData((prev) => ({
                  ...prev,
                  priceType: e.target.value,
                }));
                if (errors.priceType)
                  setErrors((prev) => ({ ...prev, priceType: "" }));
              }}
              fullWidth
              error={errors.priceType}
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-[14px] font-[500] text-black">
              Position
            </label>
            <Input
              type="number"
              placeholder="1"
              min={1}
              value={editItemData.position ?? ""}
              onChange={(e) => {
                setEditItemData((prev) => ({
                  ...prev,
                  position: e.target.value ? Number(e.target.value) : "",
                }));
                if (errors.position)
                  setErrors((prev) => ({ ...prev, position: "" }));
              }}
              error={errors.position}
            />
          </div>
        </div>
      </div>
    </FormDialog>
  );
};

function ItemsTable({ categoryId, onItemsChange }: ItemsTableProps) {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createItemData, setCreateItemData] = useState<{
    name: string;
    priceWashing?: string;
    priceDryCleaning?: string;
    priceType: string;
    position?: number;
  }>({
    name: "",
    priceType: "Fixed",
  });

  const handleCreateItem = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        categoryItemSchema,
        {
          name: createItemData.name,
          priceType: createItemData.priceType,
          priceWashing: createItemData.priceWashing,
          priceDryCleaning: createItemData.priceDryCleaning,
          position: createItemData.position,
        },
        setErrors
      ))
    )
      return false;
    setIsCreatingItem(true);
    const payload = {
      name: createItemData.name.trim(),
      priceWashing: createItemData.priceWashing
        ? poundsToPence(Number(createItemData.priceWashing))
        : null,
      priceDryCleaning: createItemData.priceDryCleaning
        ? poundsToPence(Number(createItemData.priceDryCleaning))
        : null,
      priceType: createItemData.priceType.toLowerCase(),
      position: createItemData.position
        ? Number(createItemData.position)
        : undefined,
      category: `/item-categories/${categoryId}`,
    };

    const response = await apiCall({
      endpoint: routes.api.createItems,
      method: "POST",
      data: payload,
      showSuccessToast: true,
      successMessage: "Item added successfully",
    });
    console.log("Create Item API Response:", response);
    setIsCreatingItem(false);
    if (response.success) {
      setErrors({});
      setCreateItemData({ name: "", priceType: "Fixed" });
      fetchItems(false);
      return true;
    }
    return false;
  };

  const handleDeleteItem = async (): Promise<boolean> => {
    setIsDeletingItem(true);
    const response = await apiCall({
      endpoint: routes.api.deleteItems(deleteItemId),
      method: "DELETE",
      showSuccessToast: true,
      successMessage: "Item deleted successfully",
    });
    setIsDeletingItem(false);
    if (response.success) {
      fetchItems(false);
      return true;
    }
    return false;
  };

  const fetchItems = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    const response = await apiCall<CategoryDetailsResponse>({
      endpoint: routes.api.getItemCategoryDetails(categoryId),
      method: "GET",
    });

    if (response.success && response.data) {
      setItems(response.data.member);
      onItemsChange?.(response.data.member);
    }
    if (showLoader) setLoading(false);
  };

  useEffect(() => {
    if (categoryId) {
      fetchItems();
    }
  }, [categoryId]);

  const formatPrice = (price?: number | null) => {
    if (price === null || price === undefined)
      return <div className="w-[45px] text-center">-</div>;
    return `£${penceToPounds(price).toFixed(2)}`;
  };

  const columns: Column<CategoryItem>[] = [
    {
      header: "Item Name",
      accessor: (item) => item.name || "-",
      sortable: false,
    },
    {
      header: "Wash",
      accessor: (item) => formatPrice(item.priceWashing),
    },
    {
      header: "Dry Clean",
      accessor: (item) => formatPrice(item.priceDryCleaning),
    },
    {
      header: "Price Type",
      accessor: (item) =>
        item.priceType ? (
          <span className="capitalize">{item.priceType}</span>
        ) : (
          <div className="w-[60px] text-center">-</div>
        ),
    },
    {
      header: "Position",
      accessor: "position" as keyof CategoryItem,
      className: "text-center [&>div]:justify-center",
      render: (item) => (
        <div className="w-[30px] h-[30px] flex items-center justify-center bg-muted rounded-md text-[18px] mx-auto">
          {item.position ?? "-"}
        </div>
      ),
    },
    {
      header: "Action",
      accessor: (item) => (
        <div className="flex items-center justify-end mr-[15px] gap-[18px]">
          <EditItemDialog
            item={item}
            onUpdateSuccess={() => fetchItems(false)}
          />
          <div className="h-[24px] border-l border-muted" />
          <div onClick={() => setDeleteItemId(item.id)}>
            <FormDialog
              title="Delete Item"
              buttonText={
                <img
                  src="/assets/TrashEnabled.svg"
                  alt="Delete"
                  className="cursor-pointer"
                />
              }
              saveButtonText="Yes"
              onSubmit={handleDeleteItem}
              loading={isDeletingItem}
              triggerVariant="icon"
              submitVariant="delete"
            >
              Are you sure you want to delete this item?
              <span className="mt-[8px] block">
                This action cannot be undone.
              </span>
            </FormDialog>
          </div>
        </div>
      ),
      className: "text-right",
      headerClassName: "mr-1",
    },
  ];

  return (
    <div className="border border-[#EAEAEA] rounded-[16px] p-6 bg-white shadow-sm mt-4">
      <div className="w-full flex items-center gap-[24px] mb-6">
        <div className="flex-1">
          <SearchInput<CategoryDetailsResponse>
            endpoint={routes.api.getItemCategoryDetails(categoryId)}
            searchKey="name"
            placeholder="Search Items"
            onResults={(data) => {
              if (data) {
                setItems(data.member);
                onItemsChange?.(data.member);
              } else {
                fetchItems(false);
              }
            }}
          />
        </div>
        <div className="flex items-center">
          <FormDialog
            title="Add New Item"
            buttonText={
              <div className="flex gap-[10px] items-center text-[16px]">
                <Plus size={20} />
                Add Items
              </div>
            }
            saveButtonText="Save"
            onSubmit={handleCreateItem}
            loading={isCreatingItem}
            triggerVariant="primary"
          >
            <div className="flex flex-col gap-6 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-[500] text-black">
                  Item Name
                </label>
                <Input
                  placeholder="e.g. Formal Shirt"
                  value={createItemData.name}
                  onChange={(e) => {
                    setCreateItemData((prev) => ({
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
                <label className="text-[14px] font-[500] text-black">
                  Wash Price
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1.99"
                  min={0}
                  step="0.01"
                  value={createItemData.priceWashing ?? ""}
                  onChange={(e) => {
                    setCreateItemData((prev) => ({
                      ...prev,
                      priceWashing: e.target.value,
                    }));
                    if (errors.priceWashing)
                      setErrors((prev) => ({ ...prev, priceWashing: "" }));
                  }}
                  error={errors.priceWashing}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-[500] text-black">
                  Dry Clean Price
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1.99"
                  min={0}
                  step="0.01"
                  value={createItemData.priceDryCleaning ?? ""}
                  onChange={(e) => {
                    setCreateItemData((prev) => ({
                      ...prev,
                      priceDryCleaning: e.target.value,
                    }));
                    if (errors.priceDryCleaning)
                      setErrors((prev) => ({ ...prev, priceDryCleaning: "" }));
                  }}
                  error={errors.priceDryCleaning}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[14px] font-[500] text-black">
                    Price Type
                  </label>
                  <Select
                    options={[
                      { label: "Fixed", value: "Fixed" },
                      { label: "From", value: "From" },
                      { label: "Kg", value: "Kg" },
                    ]}
                    value={createItemData.priceType}
                    onChange={(e) => {
                      setCreateItemData((prev) => ({
                        ...prev,
                        priceType: e.target.value,
                      }));
                      if (errors.priceType)
                        setErrors((prev) => ({ ...prev, priceType: "" }));
                    }}
                    fullWidth
                    error={errors.priceType}
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[14px] font-[500] text-black">
                    Position
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    min={1}
                    value={createItemData.position ?? ""}
                    onChange={(e) => {
                      setCreateItemData((prev) => ({
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
            </div>
          </FormDialog>
        </div>
      </div>

      <GenericTable columns={columns} data={items} isLoading={loading} />
    </div>
  );
}

export default ItemsTable;
