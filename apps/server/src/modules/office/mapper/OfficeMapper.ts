import { Office } from "../dto/office.dto";
import { OfficeEntity } from "../office.entity";

export class OfficeMapper {
  static toDto(entity: OfficeEntity): Office {
    return {
      id: entity.id,
      name: entity.name,
      specialization: entity.specialization,
      address: entity.address,
      officeHoursTemplate: entity.officeHoursTemplate,
      staffIds: (entity.staff ?? []).map((u) => u.id),
    };
  }

  static toDtoList(entities: OfficeEntity[]): Office[] {
    return entities.map(this.toDto);
  }
}
