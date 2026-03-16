import * as yup from "yup";

export const categorySchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  position: yup
    .number()
    .transform((val, orig) =>
      orig === "" || orig === undefined ? undefined : val
    )
    .optional()
    .positive("Position must be a positive number")
    .integer("Position must be a whole number"),
});

export const categoryNameSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
});

export const categoryItemSchema = yup.object({
  name: yup.string().trim().required("Item name is required"),
  priceType: yup.string().required("Price type is required"),
  priceWashing: yup
    .number()
    .transform((val, orig) =>
      orig === "" || orig === undefined ? undefined : Number(val)
    )
    .optional()
    .nullable()
    .min(0, "Wash price must be 0 or greater"),
  priceDryCleaning: yup
    .number()
    .transform((val, orig) =>
      orig === "" || orig === undefined ? undefined : Number(val)
    )
    .optional()
    .nullable()
    .min(0, "Dry clean price must be 0 or greater"),
  position: yup
    .number()
    .transform((val, orig) =>
      orig === "" || orig === undefined ? undefined : Number(val)
    )
    .optional()
    .positive("Position must be a positive number")
    .integer("Position must be a whole number"),
});
