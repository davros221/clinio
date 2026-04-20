import { Repository } from "typeorm";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { UserRole } from "@clinio/shared";
import { OfficeEntity } from "../../modules/office/office.entity";
import { forbidden } from "../error-messages";

export class AuthHelper {
  static getRoles(user?: AuthUser) {
    return {
      isAdmin: Boolean(user?.role === UserRole.ADMIN),
      isStaff: Boolean(
        user?.role === UserRole.NURSE || user?.role === UserRole.DOCTOR
      ),
      isPatient: Boolean(user?.role === UserRole.CLIENT),
      isPublic: !user,
    };
  }

  static async assertStaffBelongsToOffice(
    officeRepository: Repository<OfficeEntity>,
    userId: string,
    officeId: string
  ): Promise<void> {
    const office = await officeRepository.findOne({
      where: { id: officeId },
      relations: ["staff"],
    });

    if (!office) {
      throw forbidden();
    }

    AuthHelper.assertStaffBelongsToOfficeEntity(office, userId);
  }

  static assertStaffBelongsToOfficeEntity(
    office: OfficeEntity,
    userId: string
  ): void {
    const isMember = office.staff?.some((s) => s.id === userId) ?? false;
    if (!isMember) {
      throw forbidden();
    }
  }
}
