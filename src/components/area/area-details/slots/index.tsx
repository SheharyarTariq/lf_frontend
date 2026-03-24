import React, { useEffect, useState } from "react";
import apiCall from "@/utils/api-call";
import { routes } from "@/utils/routes";
import Card from "@/components/common/Card";
import Select from "@/components/common/Select";
import FormDialog from "@/components/common/form-dailog";
import Input from "@/components/common/Input";
import { validateAndSetErrors } from "@/utils/validation";
import { slotSchema } from "../../schema";
import { X } from "lucide-react";

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

const weekDayOrder = [1, 2, 3, 4, 5, 6, 0];

const weekDayMap: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

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

function formatTime(time: string): string {
  const parts = time.split(":");
  return `${parts[0]}:${parts[1]}`;
}

function Slots({ areaId }: { areaId: string }) {
  const [slotsResponse, setSlotsResponse] = useState<Slot[]>([]);
  const [newSlotWeekDay, setNewSlotWeekDay] = useState<string>("");
  const [newSlotStartTime, setNewSlotStartTime] = useState<string>("");
  const [newSlotEndTime, setNewSlotEndTime] = useState<string>("");
  const [createLoading, setCreateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getSlots = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    const response = await apiCall<SlotsData>({
      endpoint: routes.api.getAreaSlots(areaId),
      method: "GET",
    });
    if (response.success && response?.data) {
      setSlotsResponse(response.data.member);
    }
    if (showLoader) setLoading(false);
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
      successMessage: isActive ? "Slot marked as inactive" : "Slot marked as active",
    });

    if (response.success) {
      await getSlots(false);
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
      await getSlots(false);
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
      await getSlots(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    getSlots();
  }, []);

  const slotsByDay: Record<number, Slot[]> = {};
  for (const day of weekDayOrder) {
    slotsByDay[day] = slotsResponse.filter((s) => s.weekDay === day);
  }

  const maxCells = Math.max(6, ...weekDayOrder.map((d) => slotsByDay[d].length));

  return (
    <div>
      <Card>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-[30px] gap-[16px]">
          <h2 className="text-black font-[500] text-[20px] md:text-[24px]">
            Slots
          </h2>
          <FormDialog
            title="Slots"
            buttonText="+ Add Slot"
            saveButtonText="Save"
            onSubmit={handleCreateSlot}
            loading={createLoading}
          >
            <div className="flex flex-col gap-[20px]">
              <label className="text-black font-[500] text-[14px] block">
                Weekday
              </label>
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

        {loading ? (
          <div className="flex justify-center py-[40px]">
            <div className="flex gap-[6px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[10px] h-[10px] rounded-full bg-[var(--loader-color)] animate-dots"
                  style={{ animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-[12px]">
            {weekDayOrder.map((day, dayIndex) => {
              const daySlots = slotsByDay[day];
              return (
                <div
                  key={day}
                  className="flex items-center gap-[16px] md:gap-[24px] rounded-lg px-[20px] py-[14px] border border-[#e5e7eb]"
                >
                  <span className="text-[#1f2937] font-[600] text-[14px] md:text-[15px] min-w-[90px] md:min-w-[110px] tracking-[0.2px]">
                    {weekDayMap[day]}
                  </span>
                  <div className="flex flex-wrap gap-[10px]">
                    {Array.from({ length: maxCells }).map((_, i) => {
                      const slot = daySlots[i];
                      if (slot) {
                        return (
                          <div
                            key={slot.id}
                            onClick={() => handleToggle(slot.id, slot.isActive)}
                            className={`group relative w-[110px] h-[38px] flex items-center justify-center rounded-lg text-[13px] font-[500] select-none cursor-pointer transition-all duration-200 hover:scale-105 border-dotted ${
                              slot.isActive
                                ? "border-slot-active bg-[#f0fdf4] text-[#166534]"
                                : "border-slot-inactive bg-[#fef2f2] text-[#991b1b]"
                            }`}
                            style={{ borderWidth: "1.5px" }}
                          >
                            {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                            {!slot.isActive && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <FormDialog
                                  title="Delete Slot"
                                  buttonText={
                                    <span className="absolute -top-[8px] -right-[8px] w-[20px] h-[20px] rounded-full bg-slot-inactive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm">
                                      <X size={11} className="text-white" />
                                    </span>
                                  }
                                  saveButtonText="Yes"
                                  onSubmit={() => handleDelete(slot.id)}
                                  triggerVariant="icon"
                                  submitVariant="delete"
                                >
                                  Are you sure you want to delete this Slot?
                                  <span className="mt-[8px] block">
                                    This action cannot be undone.
                                  </span>
                                </FormDialog>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`empty-${i}`}
                          className="relative w-[110px] h-[38px] flex items-center justify-center rounded-lg border-dotted border-[#c5c9d0] text-[#9ca3af] text-[13px] font-[500] select-none"
                          style={{ borderWidth: "1.5px" }}
                        >
                          -
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Slots;

