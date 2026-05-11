import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { type AuthUser } from "../../auth/strategies/jwt.strategy";
import { RoomService } from "./room.service";
import { RoomDto } from "./dto/room.dto";
import { RoomMapper } from "./mapper/RoomMapper";

@Controller("rooms")
@ApiTags("Room")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @ApiOperation({ operationId: "getRooms" })
  @ApiOkResponse({ type: [RoomDto] })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  async getRooms(@CurrentUser() currentUser: AuthUser): Promise<RoomDto[]> {
    const rooms = await this.roomService.findAllForUser(currentUser.id);
    return RoomMapper.toDtoList(rooms);
  }

  @Post(":roomId/read")
  @HttpCode(204)
  @ApiOperation({ operationId: "markRoomAsRead" })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiNotFoundResponse({ description: "Room not found" })
  async markRoomAsRead(
    @Param("roomId", ParseUUIDPipe) roomId: string,
    @CurrentUser() currentUser: AuthUser
  ): Promise<void> {
    await this.roomService.markAsRead(roomId, currentUser.id);
  }
}
