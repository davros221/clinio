import { Office, OfficeStaffDto } from "../dto/office.dto";
import { OfficeEntity } from "../office.entity";

export class OfficeMapper {
  static toDto(entity: OfficeEntity): Office {
    return {
      id: entity.id,
      name: entity.name,
      specialization: entity.specialization,
      address: entity.address,
      officeHoursTemplate: entity.officeHoursTemplate,
      staff: (entity.staff ?? []).map(
        (u): OfficeStaffDto => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
        })
      ),
    };
  }

  static toDtoList(entities: OfficeEntity[]): Office[] {
    return entities.map(this.toDto);
  }
}
