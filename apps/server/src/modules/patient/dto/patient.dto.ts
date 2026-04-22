import { ApiProperty } from "@nestjs/swagger";

export class Patient {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  birthNumber?: string | null;

  @ApiProperty({ required: false, nullable: true, type: Date })
  birthdate?: Date | null;

  @ApiProperty({ required: false, nullable: true, type: String })
  phone?: string | null;

  @ApiProperty()
  email!: string;
}
