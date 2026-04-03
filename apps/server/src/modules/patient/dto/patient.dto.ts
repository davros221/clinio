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

  @ApiProperty()
  birthNumber!: string;

  @ApiProperty()
  birthdate!: Date;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  email!: string;
}
