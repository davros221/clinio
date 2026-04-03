import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { UserRole } from "@clinio/shared";

export class AuthHelper {
  static getRoles(user?: AuthUser) {
    return {
      isAdmin: Boolean(user?.role === UserRole.ADMIN),
      isStaff: Boolean(user?.role === UserRole.NURSE || user?.role === UserRole.DOCTOR),
      isPatient: Boolean(user?.role === UserRole.CLIENT),
      isPublic: !user,
    };
  }
}
