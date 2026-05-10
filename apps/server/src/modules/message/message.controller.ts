import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthUser } from "../../auth/strategies/jwt.strategy";
import { MessageService } from "./message.service";
import { MessageDto } from "./dto/message.dto";
import { MessageMapper } from "./mapper/MessageMapper";
import {
  PaginatedResponseDto,
  paginatedResponse,
} from "../../common/dto/paginated-response.dto";

const PaginatedMessageResponse = PaginatedResponseDto(MessageDto);

@Controller("rooms/:roomId/messages")
@ApiTags("Message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ operationId: "getMessages" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ type: PaginatedMessageResponse })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiNotFoundResponse({ description: "Room not found" })
  async getMessages(
    @Param("roomId", ParseUUIDPipe) roomId: string,
    @CurrentUser() currentUser: AuthUser,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    const { items, total } = await this.messageService.findByRoom(
      roomId,
      currentUser.id,
      pageNum,
      limitNum
    );

    return paginatedResponse(MessageMapper.toDtoList(items), total, {
      page: pageNum,
      limit: limitNum,
    });
  }
}
