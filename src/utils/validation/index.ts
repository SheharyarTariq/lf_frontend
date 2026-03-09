import * as yup from 'yup';

export async function validateForm<T extends object>(
  schema: yup.ObjectSchema<any>,
  data: T
): Promise<Record<string, string>> {
  try {
    await schema.validate(data, { abortEarly: false });
    return {};
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      err.inner.forEach((e) => {
        if (e.path && !errors[e.path]) errors[e.path] = e.message;
      });
      return errors;
    }
    return {};
  }
}
