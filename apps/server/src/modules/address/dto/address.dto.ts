import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SuggestItemPosition {
  @ApiProperty()
  lon!: number;

  @ApiProperty()
  lat!: number;
}

export class SuggestItemRegionalStructure {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;
}

export class SuggestItem {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty({ type: SuggestItemPosition })
  position!: SuggestItemPosition;

  @ApiPropertyOptional({ type: [SuggestItemRegionalStructure] })
  regionalStructure?: SuggestItemRegionalStructure[];

  @ApiPropertyOptional({ nullable: true })
  zip?: string;
}

export class SuggestResponse {
  @ApiProperty({ type: [SuggestItem] })
  items!: SuggestItem[];
}
