import { ApiProperty } from "@nestjs/swagger";
import { type TUserRole, UserRole } from "@clinio/shared";

export class AuthData {
  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ enum: UserRole })
  role!: TUserRole;
}

export class AuthResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AuthData })
  authData!: AuthData;
}

export class MeResponse {
  @ApiProperty()
  auth!: boolean;

  @ApiProperty({ type: AuthData, nullable: true })
  authData!: AuthData | null;
}
