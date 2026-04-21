import { z } from "zod";

export const SortOrder = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortOrderSchema = z.nativeEnum(SortOrder).default(SortOrder.ASC);

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const UserSortField = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  EMAIL: "email",
  ROLE: "role",
} as const;

export type UserSortField = (typeof UserSortField)[keyof typeof UserSortField];

export const userListSchema = paginationSchema.extend({
  sortBy: z.nativeEnum(UserSortField).default(UserSortField.LAST_NAME),
  sortOrder: sortOrderSchema,
});

export type UserListQuery = z.infer<typeof userListSchema>;

export const OfficeSortField = {
  NAME: "name",
  SPECIALIZATION: "specialization",
} as const;

export type OfficeSortField =
  (typeof OfficeSortField)[keyof typeof OfficeSortField];

export const officeListSchema = paginationSchema.extend({
  sortBy: z.nativeEnum(OfficeSortField).default(OfficeSortField.NAME),
  sortOrder: sortOrderSchema,
});

export type OfficeListQuery = z.infer<typeof officeListSchema>;

export const PatientSortField = {
  LAST_NAME: "lastName",
  BIRTH_NUMBER: "birthNumber",
  BIRTHDATE: "birthdate",
} as const;

export type PatientSortField =
  (typeof PatientSortField)[keyof typeof PatientSortField];

export const patientListSchema = paginationSchema.extend({
  search: z.string().optional(),
  sortBy: z.nativeEnum(PatientSortField).default(PatientSortField.LAST_NAME),
  sortOrder: sortOrderSchema,
});

export type PatientListQuery = z.infer<typeof patientListSchema>;

export const AppointmentSortField = {
  DATE: "date",
  STATUS: "status",
} as const;

export type AppointmentSortField =
  (typeof AppointmentSortField)[keyof typeof AppointmentSortField];

export const appointmentListSchema = paginationSchema.extend({
  sortBy: z.nativeEnum(AppointmentSortField).default(AppointmentSortField.DATE),
  sortOrder: sortOrderSchema,
});

export type AppointmentListQuery = z.infer<typeof appointmentListSchema>;

export const MedicalRecordSortField = {
  CREATED_AT: "createdAt",
} as const;

export type MedicalRecordSortField =
  (typeof MedicalRecordSortField)[keyof typeof MedicalRecordSortField];

export const medicalRecordListSchema = paginationSchema.extend({
  sortBy: z
    .nativeEnum(MedicalRecordSortField)
    .default(MedicalRecordSortField.CREATED_AT),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
});

export type MedicalRecordListQuery = z.infer<typeof medicalRecordListSchema>;
