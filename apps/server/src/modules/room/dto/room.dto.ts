import { ApiProperty } from "@nestjs/swagger";

export class RoomParticipant {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;
}

export class RoomDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: [RoomParticipant] })
  participants!: RoomParticipant[];

  @ApiProperty()
  unreadCount!: number;

  @ApiProperty()
  createdAt!: Date;
}
