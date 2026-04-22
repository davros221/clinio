import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@clinio/shared";

export class AuthPatient {
  @ApiProperty()
  id!: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  birthNumber?: string | null;

  @ApiProperty({ required: false, nullable: true, type: Date })
  birthdate?: Date | null;

  @ApiProperty({ required: false, nullable: true, type: Date })
  phone?: string | null;
}

export class AuthData {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ type: AuthPatient, required: false, nullable: true })
  patient?: AuthPatient | null;
}

export class AuthResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AuthData })
  authData!: AuthData;
}

export class ResetPasswordResponse {
  @ApiProperty()
  email!: string;
}

export class MeResponse {
  @ApiProperty()
  auth!: boolean;

  @ApiProperty({ type: AuthData, nullable: true })
  authData!: AuthData | null;
}
