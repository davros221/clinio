import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OfficeHoursTemplate } from "@clinio/shared";

export class Office {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  specialization!: string;

  @ApiProperty()
  address!: string;

  @ApiPropertyOptional({ type: Object, nullable: true })
  officeHoursTemplate!: OfficeHoursTemplate | null;

  @ApiProperty({ type: [String] })
  staffIds!: string[];
}
