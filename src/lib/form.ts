import { z } from "zod";

/**
 * Generic flattened errors type for any Zod schema
 */
export type FormErrors<T> = z.core.$ZodFlattenedError<T>;

/**
 * Generic form state for any form
 */
export type FormState<TData, TFieldErrors = FormErrors<TData>["fieldErrors"]> = {
  values?: Partial<TData>;
  fieldErrors?: TFieldErrors;
  globalError?: string;
};

/**
 * Result of parsing form data with a Zod schema
 */
export type ParseFormResult<T> =
  | { success: true; data: T }
  | { success: false; fieldErrors: FormErrors<T>["fieldErrors"]; formErrors: string[] };

/**
 * Parse FormData with a Zod schema and return typed result
 */
export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): ParseFormResult<z.infer<T>> {
  const rawData: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    // Handle multiple values with same key (e.g., checkboxes)
    if (rawData[key] !== undefined) {
      if (Array.isArray(rawData[key])) {
        (rawData[key] as unknown[]).push(value);
      } else {
        rawData[key] = [rawData[key], value];
      }
    } else {
      rawData[key] = value;
    }
  }

  const result = schema.safeParse(rawData);

  if (!result.success) {
    const { fieldErrors, formErrors } = z.flattenError(result.error);
    return { success: false, fieldErrors, formErrors };
  }

  return { success: true, data: result.data };
}

/**
 * Create a redirect response with HX-Redirect header for HTMX
 * and Set-Cookie header if provided
 */
export function htmxRedirect(url: string, cookie?: string): Response {
  const headers: HeadersInit = { "HX-Redirect": url };
  if (cookie) {
    headers["Set-Cookie"] = cookie;
  }
  return new Response(null, { status: 200, headers });
}
