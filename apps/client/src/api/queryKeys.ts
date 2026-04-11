const createQueryKeys = (entity: string) => ({
  all: [entity] as const,
  lists: () => [entity, "list"] as const,
  list: (params?: object) => [entity, "list", params] as const,
  details: () => [entity, "detail"] as const,
  detail: (id: string) => [entity, "detail", id] as const,
});

export const appointmentKeys = createQueryKeys("appointments");
export const officeKeys = createQueryKeys("offices");
export const patientKeys = createQueryKeys("patients");
export const userKeys = createQueryKeys("users");
