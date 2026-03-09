import * as yup from "yup";

export const areaNameSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
});

export const postcodeSchema = yup.object({
  postcodeString: yup
    .string()
    .required("Postcode is required")
    .min(2, "Postcode must be at least 2 characters"),
});

export const slotSchema = yup.object({
  weekDay: yup
    .string()
    .required("Week day is required")
    .notOneOf([""], "Please select a week day"),
  startTime: yup
    .string()
    .required("Start time is required")
    .matches(
      /^\d{2}:\d{2}$/,
      "Start time must be in HH:MM format (e.g. 10:00)"
    ),
  endTime: yup
    .string()
    .required("End time is required")
    .matches(/^\d{2}:\d{2}$/, "End time must be in HH:MM format (e.g. 12:00)")
    .test(
      "is-after-start",
      "End time must be after start time",
      function (endTime) {
        const { startTime } = this.parent;
        if (!startTime || !endTime) return true;
        return endTime > startTime;
      }
    ),
});
