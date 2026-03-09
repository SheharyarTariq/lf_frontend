import React, { useEffect, useState } from "react";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import Card from "@/components/common/Card";
import Select from "@/components/common/Select";
import GenericTable from "@/components/common/GenericTable";
import Image from "next/image";
import FormDialog from "@/components/common/form-dailog";
import Input from "@/components/common/Input";
import { validateAndSetErrors } from "@/utils/validation";
import { slotSchema } from "../../schema";

interface Slot {
  "@context"?: string;
  "@id"?: string;
  "@type"?: string;
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  weekDay: number;
}

interface SlotsData {
  totalItems: number;
  member: Slot[];
}

const weekDayMap: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const weekDays = [
  { label: "All Days", value: 7 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
];

const slotWeekDays = [
  { label: "Select", value: "" },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
];

function Slots({ areaId }: { areaId: string }) {
  const [slotsResponse, setSlotsResponse] = useState<Slot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [newSlotWeekDay, setNewSlotWeekDay] = useState<string>("");
  const [newSlotStartTime, setNewSlotStartTime] = useState<string>("");
  const [newSlotEndTime, setNewSlotEndTime] = useState<string>("");
  const [createLoading, setCreateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getSlots = async () => {
    setLoading(true);
    const response = await apiCall<SlotsData>({
      endpoint: routes.api.getAreaSlots(areaId),
      method: "GET",
    });
    if (response.success && response?.data) {
      setSlotsResponse(response.data.member);
      console.log(response);
    }
    setLoading(false);
  };

  const handleToggle = async (slotId: string, isActive: boolean) => {
    const endpoint = isActive
      ? routes.api.markSlotInactive(slotId)
      : routes.api.markSlotActive(slotId);

    const response = await apiCall({
      endpoint,
      method: "POST",
      data: {},
      showSuccessToast: true,
    });

    if (response.success) {
      await getSlots();
    }
  };

  const handleDelete = async (slotId: string): Promise<boolean> => {
    const response = await apiCall({
      endpoint: routes.api.updateSlot(slotId),
      method: "DELETE",
      showSuccessToast: true,
      successMessage: "Slot deleted successfully",
    });
    if (response.success) {
      await getSlots();
      return true;
    }
    return false;
  };

  const handleCreateSlot = async (): Promise<boolean> => {
    if (
      !(await validateAndSetErrors(
        slotSchema,
        {
          weekDay: String(newSlotWeekDay),
          startTime: newSlotStartTime,
          endTime: newSlotEndTime,
        },
        setErrors
      ))
    )
      return false;
    setCreateLoading(true);
    const response = await apiCall({
      endpoint: routes.api.createSlot,
      method: "POST",
      data: {
        startTime: newSlotStartTime,
        endTime: newSlotEndTime,
        area: `/areas/${areaId}`,
        isActive: true,
        weekDay: Number(newSlotWeekDay),
      },
      showSuccessToast: true,
      successMessage: "Slot created successfully",
    });
    setCreateLoading(false);
    if (response.success) {
      setErrors({});
      setNewSlotWeekDay("");
      setNewSlotStartTime("");
      setNewSlotEndTime("");
      await getSlots();
      return true;
    }
    return false;
  };

  useEffect(() => {
    getSlots();
  }, []);

  return (
    <div>
      <Card>
        <h2 className="text-black font-[500] text-[24px] mb-[25px]">Slots</h2>
        <div className="flex items-center justify-between mb-[30px]">
          <Select
            options={weekDays}
            placeholder="All Days"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          />
          <FormDialog
            title="Weekday"
            buttonText="Add Slot"
            saveButtonText="Save"
            onSubmit={handleCreateSlot}
            loading={createLoading}
          >
            <div className="flex flex-col gap-[20px]">
              <Select
                options={slotWeekDays}
                placeholder="Select"
                value={newSlotWeekDay}
                onChange={(e) => {
                  setNewSlotWeekDay(e.target.value);
                  if (errors.weekDay)
                    setErrors((prev) => ({ ...prev, weekDay: "" }));
                }}
                fullWidth
                error={errors.weekDay}
              />
              <div>
                <label className="text-black font-[500] text-[14px] mb-[8px] block">
                  Start Time
                </label>
                <Input
                  placeholder="e.g. 10:00"
                  value={newSlotStartTime}
                  onChange={(e) => {
                    setNewSlotStartTime(e.target.value);
                    if (errors.startTime)
                      setErrors((prev) => ({ ...prev, startTime: "" }));
                  }}
                  type="text"
                  error={errors.startTime}
                />
              </div>
              <div>
                <label className="text-black font-[500] text-[14px] mb-[8px] block">
                  End Time
                </label>
                <Input
                  placeholder="e.g. 12:00"
                  value={newSlotEndTime}
                  onChange={(e) => {
                    setNewSlotEndTime(e.target.value);
                    if (errors.endTime)
                      setErrors((prev) => ({ ...prev, endTime: "" }));
                  }}
                  type="text"
                  error={errors.endTime}
                />
              </div>
            </div>
          </FormDialog>
        </div>
        <GenericTable
          data={slotsResponse}
          isLoading={loading}
          columns={[
            {
              accessor: (row) => weekDayMap[row.weekDay] || row.weekDay,
              header: "Weekday",
            },
            { accessor: "startTime", header: "Start Time" },
            { accessor: "endTime", header: "End Time" },
            {
              accessor: (row) => (
                <div className="flex items-center gap-[16px] justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(row.id, row.isActive);
                    }}
                    className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 cursor-pointer ${row.isActive ? "bg-[#34C759]" : "bg-[#D1D5DB]"}`}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full shadow transition-transform duration-200 ${row.isActive ? "translate-x-[20px]" : "translate-x-0"}`}
                    />
                  </button>
                  {row.isActive ? (
                    <span className="px-2 opacity-100 pointer-events-none cursor-not-allowed">
                      <Image
                        src="/assets/TrashDisabled.svg"
                        alt="Delete disabled"
                        width={30}
                        height={30}
                      />
                    </span>
                  ) : (
                    <FormDialog
                      title="Delete Slot"
                      buttonText={
                        <Image
                          src="/assets/TrashEnabled.svg"
                          alt="Delete"
                          width={30}
                          height={30}
                        />
                      }
                      saveButtonText="Yes"
                      onSubmit={() => handleDelete(row.id)}
                      triggerVariant="icon"
                      submitVariant="delete"
                    >
                      Are you sure you want to delete this Slot?
                      <span className="mt-[8px] block">
                        This action cannot be undone.
                      </span>
                    </FormDialog>
                  )}
                </div>
              ),
              header: "Action",
              className: "text-right",
              sortable: false,
              isAction: true,
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default Slots;
