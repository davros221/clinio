import { SetMetadata } from "@nestjs/common";
import { TUserRole } from "@clinio/shared";

export const ROLES_KEY = "roles";
export const Roles = (...roles: TUserRole[]) => SetMetadata(ROLES_KEY, roles);
