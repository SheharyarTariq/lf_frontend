import * as yup from "yup";

export const openItemSchema = yup.object({
  openItemName: yup.string().required("Item name is required"),
  quantity: yup
    .number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
  piece: yup
    .number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .required("Pieces is required")
    .min(1, "Pieces must be at least 1"),
  cleaningMethod: yup
    .string()
    .required("Cleaning method is required")
    .notOneOf([""], "Please select a cleaning method"),
  pricePerUnit: yup
    .number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .required("Price per unit is required")
    .min(0, "Price per unit must be 0 or greater"),
});

export const regularItemSchema = yup.object({
  item: yup
    .string()
    .required("Item is required")
    .notOneOf([""], "Please select an item"),
  quantity: yup
    .number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
  pricePerUnit: yup
    .number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .required("Price per unit is required")
    .min(0, "Price per unit must be 0 or greater"),
});
