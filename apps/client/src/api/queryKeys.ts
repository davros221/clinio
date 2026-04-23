const createQueryKeys = (entity: string) => ({
  all: [entity] as const,
  lists: () => [entity, "list"] as const,
  list: (params?: object) => [entity, "list", params] as const,
  details: () => [entity, "detail"] as const,
  detail: (id: string) => [entity, "detail", id] as const,
});

export const medicalRecordKeys = createQueryKeys("medicalRecords");
export const addressKeys = createQueryKeys("addresses");
export const suggestKeys = createQueryKeys("suggest");
export const appointmentKeys = createQueryKeys("appointments");
export const calendarKeys = createQueryKeys("calendar");
export const officeKeys = createQueryKeys("offices");
export const userKeys = createQueryKeys("users");
export const patientKeys = createQueryKeys("patients");
// Auth servicer is not generic entity / list service, so there should be custom keys
export const authKeys = {
  me: "ME",
};
