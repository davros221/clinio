import { z } from "zod";

export const UserRole = {
  ADMIN: "ADMIN",
  NURSE: "NURSE",
  DOCTOR: "DOCTOR",
  CLIENT: "CLIENT",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]{8,}$/;

const passwordError = "password.notValid";

/**
 * CZECH / SLOVAK birth number
 * birth number generator on url: https://www.daytl.com/cs/birthnumber/
 */
export const isValidBirthNumber = (value: string): boolean => {
  const normalized = value.replace("/", "");

  if (!/^\d{9,10}$/.test(normalized)) return false;

  const year = parseInt(normalized.slice(0, 2), 10);
  let month = parseInt(normalized.slice(2, 4), 10);
  const day = parseInt(normalized.slice(4, 6), 10);

  if (month > 70) month -= 70;
  else if (month > 50) month -= 50;
  else if (month > 20) month -= 20;

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  if (normalized.length === 10) {
    const num = parseInt(normalized, 10);
    if (num % 11 !== 0) return false;
  }

  const fullYear =
    normalized.length === 10
      ? year < 54
        ? 2000 + year
        : 1900 + year
      : 1900 + year;
  const daysInMonth = new Date(fullYear, month, 0).getDate();
  if (day > daysInMonth) return false;

  return true;
};

export const createUserBaseSchema = z.object({
  email: z.email(),
  password: z.string().regex(passwordRegex, passwordError).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(UserRole),
  birthNumber: z
    .string()
    .min(1)
    .refine(isValidBirthNumber, { message: "birthNumber.invalid" })
    .optional(),
  birthdate: z
    .string()
    .min(1, "birthNumber.required")
    .describe("ISO Date string (e.g. 1990-01-01)")
    .pipe(z.coerce.date())
    .pipe(z.date().max(new Date(), { message: "birthDate.inFuture" }))
    .optional(),
  phone: z.string().min(1).optional(),
});

const clientFieldsRefine = (data: {
  role: string;
  birthNumber?: string;
  birthdate?: unknown;
  phone?: string;
}) => {
  if (data.role !== UserRole.CLIENT) return true;
  return !!data.birthNumber && !!data.birthdate && !!data.phone;
};

const clientFieldsMessage = "clientFields.missing";

type BuildCreateUserSchemaOptions = {
  passwordFields?: boolean;
};

export const createUserSchema = createUserBaseSchema.refine(
  clientFieldsRefine,
  { message: clientFieldsMessage }
);

export const buildCreateUserSchema = (opts?: BuildCreateUserSchemaOptions) => {
  if (opts?.passwordFields) {
    return createUserBaseSchema
      .extend({
        password: z.string().regex(passwordRegex, passwordError),
        passwordConfirm: z.string().min(1, "passwordConfirm.invalid"),
      })
      .refine(clientFieldsRefine, { message: clientFieldsMessage })
      .refine((data) => data.password === data.passwordConfirm, {
        message: "passwordConfirm.notMatch",
        path: ["passwordConfirm"],
      });
  }

  return createUserSchema;
};
