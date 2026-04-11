import { z } from "zod";
import { t } from "./index";

/**
 * Zod resolver for Mantine useForm with automatic i18n translation.
 *
 * In Zod v4, custom schema messages (e.g. z.string().length(10, "my.key"))
 * bypass the global error map. This resolver post-processes errors and
 * translates any value that is a known i18n key.
 *
 * Standard Zod errors (required, email, etc.) are handled by the global
 * error map in zodErrorMap.ts.
 *
 * Usage: validate: zodI18nResolver(mySchema)
 */
export const zodI18nResolver = <T extends z.ZodType>(schema: T) => {
  return (values: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = schema.safeParse(values as any);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      const raw = issue.message;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const translated = t(raw as any);
      errors[field] = translated !== raw ? translated : raw;
    });
    return errors;
  };
};
