const createQueryKeys = (entity: string) => ({
  all: [entity] as const,
  lists: () => [entity, "list"] as const,
  list: (params?: object) => [entity, "list", params] as const,
  details: () => [entity, "detail"] as const,
  detail: (id: string) => [entity, "detail", id] as const,
});

export const addressKeys = createQueryKeys("addresses");
export const suggestKeys = createQueryKeys("suggest");
export const officeKeys = createQueryKeys("offices");
export const userKeys = createQueryKeys("users");
export const appointmentKeys = createQueryKeys("appointments");
