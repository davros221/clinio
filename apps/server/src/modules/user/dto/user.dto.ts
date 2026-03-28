import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@clinio/shared";

export class User {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}
