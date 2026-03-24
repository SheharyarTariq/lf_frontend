import * as yup from "yup";

export const openItemSchema = yup.object({
  openItemName: yup.string().trim().required("Item name is required"),
  quantity: yup
    .number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .integer("Quantity must be a whole number")
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
  piece: yup
    .number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .integer("Pieces must be a whole number")
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
  category: yup
    .string()
    .required("Category is required")
    .notOneOf([""], "Category is required"),
  item: yup
    .string()
    .required("Item is required")
    .notOneOf([""], "Please select an item"),
  quantity: yup
    .number()
    .transform((val, orig) => (orig === "" ? undefined : val))
    .integer("Quantity must be a whole number")
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),
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
