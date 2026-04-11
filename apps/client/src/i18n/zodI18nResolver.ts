import { z } from "zod";
import i18n from "./index";

/**
 * Translate a dynamic string key, returning the raw value if no translation exists.
 * Uses `defaultValue` to satisfy i18next's strict typing for non-literal keys.
 */
function translateDynamic(key: string): string {
  return i18n.exists(key) ? i18n.t(key, { defaultValue: key }) : key;
}

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
  return (values: z.input<T>) => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      errors[field] = translateDynamic(issue.message);
    });
    return errors;
  };
};
