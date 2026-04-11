import { z } from "zod";
import { t } from "./index";

/**
 * Global Zod v4 error map that translates standard validation errors via i18n.
 *
 * Handles: invalid_type (required), too_small min(1) (required), invalid_format email.
 *
 * NOTE: In Zod v4, custom schema messages bypass this error map entirely.
 * Use zodI18nResolver (instead of zod4Resolver) to handle those via post-processing.
 */
export function setupZodErrorMap() {
  z.config({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customError: (issue: any) => {
      if (issue.code === "invalid_type") {
        return { message: t("common.validation.required") };
      }
      if (issue.code === "too_small" && issue.minimum === 1) {
        return { message: t("common.validation.required") };
      }
      if (issue.code === "invalid_format" && issue.format === "email") {
        return { message: t("common.validation.email") };
      }
      return { message: issue.message };
    },
  });
}
