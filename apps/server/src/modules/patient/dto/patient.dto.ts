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

  @ApiProperty({ required: false, nullable: true })
  birthNumber?: string | null;

  @ApiProperty({ required: false, nullable: true })
  birthdate?: Date | null;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty()
  email!: string;
}
