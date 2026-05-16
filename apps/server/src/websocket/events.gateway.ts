import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { UseGuards, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Server, Socket } from "socket.io";
import { WsJwtGuard } from "./ws-jwt.guard";
import { WsUser } from "../common/decorators/ws-user.decorator";
import type { AuthUser, JwtPayload } from "../auth/strategies/jwt.strategy";
import { RoomService } from "../modules/room/room.service";
import { MessageService } from "../modules/message/message.service";
import { MessageMapper } from "../modules/message/mapper/MessageMapper";
import { RoomMapper } from "../modules/room/mapper/RoomMapper";

interface SendMessagePayload {
  toUserId: string;
  text: string;
}

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/ws",
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  handleConnection(client: Socket) {
    const rawToken =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers?.authorization?.replace("Bearer ", "");

    if (rawToken) {
      try {
        const payload = this.jwtService.verify<JwtPayload>(rawToken, {
          secret: this.configService.getOrThrow<string>("jwt.secret"),
        });
        const user: AuthUser = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };
        client.data.user = user;
        void client.join(user.id);
      } catch {
        // invalid token — socket stays unauthenticated
      }
    }

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("auth")
  handleAuth(@ConnectedSocket() client: Socket, @WsUser() user: AuthUser) {
    void client.join(user.id);
    return { event: "authenticated" };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("join")
  async handleJoin(
    @MessageBody() data: { otherUserId: string },
    @ConnectedSocket() client: Socket,
    @WsUser() user: AuthUser
  ) {
    const room = await this.roomService.findOrCreate(user.id, data.otherUserId);
    await client.join(room.id);

    const roomDto = RoomMapper.toDto(room);

    // Find all connected sockets belonging to the other user and add them to the room
    const allSockets = await this.server.fetchSockets();
    for (const sock of allSockets) {
      const sockUser = (sock.data as { user?: AuthUser }).user;
      if (sockUser?.id === data.otherUserId) {
        await sock.join(room.id);
        sock.emit("roomInvite", roomDto);
      }
    }

    return { event: "joined", data: { roomId: room.id } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("message")
  async handleMessage(
    @MessageBody() data: SendMessagePayload,
    @WsUser() user: AuthUser
  ) {
    const room = await this.roomService.findOrCreate(user.id, data.toUserId);
    const message = await this.messageService.create(
      room.id,
      user.id,
      data.text
    );
    const dto = MessageMapper.toDto(message);
    this.server.to(room.id).emit("message", dto);
  }
}
