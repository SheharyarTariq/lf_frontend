import * as yup from "yup";

export const areaNameSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
});

export const postcodeSchema = yup.object({
  postcodeString: yup
    .string()
    .required("Postcode is required")
    .test(
      "valid-uk-postcode",
      "Please enter a valid UK postcode (e.g. KT21 1PG)",
      (value) => {
        if (!value) return false;
        const stripped = value.replace(/\s/g, "").toUpperCase();
        return /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(stripped);
      }
    ),
});

export const slotSchema = yup.object({
  weekDay: yup
    .string()
    .required("Week day is required")
    .notOneOf([""], "Please select a week day"),
  startTime: yup
    .string()
    .required("Start time is required")
    .matches(/^[0-9:]+$/, "Only numbers and colons (:) are allowed")
    .matches(
      /^\d{2}:\d{2}$/,
      "Start time must be in HH:MM format (e.g. 10:00)"
    ),
  endTime: yup
    .string()
    .required("End time is required")
    .matches(/^[0-9:]+$/, "Only numbers and colons (:) are allowed")
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
