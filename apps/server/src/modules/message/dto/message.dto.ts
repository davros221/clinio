import { ApiProperty } from "@nestjs/swagger";

export class MessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  roomId!: string;

  @ApiProperty()
  senderId!: string;

  @ApiProperty()
  text!: string;

  @ApiProperty()
  createdAt!: Date;
}
