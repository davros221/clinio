import { z } from "zod";

const timeSlotSchema = z.object({
  from: z.number().int().min(0).max(23),
  to: z.number().int().min(0).max(23),
});

export const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const officeHoursTemplateSchema = z.object(
  Object.fromEntries(days.map((day) => [day, z.array(timeSlotSchema)])) as {
    [K in (typeof days)[number]]: z.ZodArray<typeof timeSlotSchema>;
  }
);

export type OfficeHoursTemplate = z.infer<typeof officeHoursTemplateSchema>;

export const createOfficeSchema = z
  .object({
    name: z.string().min(1, "Name is required."),
    specialization: z.string().min(1, "Specialization is required."),
    address: z.string().min(1, "Address is required."),
    officeHoursTemplate: officeHoursTemplateSchema,
    staffIds: z.array(z.uuid()).optional().default([]),
  })
  .required();

export const updateOfficeSchema = createOfficeSchema.partial();
