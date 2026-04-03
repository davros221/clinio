import { ApiProperty } from "@nestjs/swagger";

export class OfficeHoursInterval {
  @ApiProperty()
  from!: number;

  @ApiProperty()
  to!: number;
}

export class OfficeHoursTemplateDto {
  @ApiProperty({ type: [OfficeHoursInterval] })
  monday!: OfficeHoursInterval[];

  @ApiProperty({ type: [OfficeHoursInterval] })
  tuesday!: OfficeHoursInterval[];

  @ApiProperty({ type: [OfficeHoursInterval] })
  wednesday!: OfficeHoursInterval[];

  @ApiProperty({ type: [OfficeHoursInterval] })
  thursday!: OfficeHoursInterval[];

  @ApiProperty({ type: [OfficeHoursInterval] })
  friday!: OfficeHoursInterval[];

  @ApiProperty({ type: [OfficeHoursInterval] })
  saturday!: OfficeHoursInterval[];

  @ApiProperty({ type: [OfficeHoursInterval] })
  sunday!: OfficeHoursInterval[];
}

export class Office {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  specialization!: string;

  @ApiProperty()
  address!: string;

  @ApiProperty({ type: () => OfficeHoursTemplateDto })
  officeHoursTemplate!: OfficeHoursTemplateDto;

  @ApiProperty({ type: [String] })
  staffIds!: string[];
}
