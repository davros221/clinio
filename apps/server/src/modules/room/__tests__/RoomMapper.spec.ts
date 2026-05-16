import { RoomMapper } from "../mapper/RoomMapper";
import { RoomEntity } from "../room.entity";
import { RoomWithUnread } from "../room.service";
import { UserEntity } from "../../user/user.entity";
import { UserRole } from "@clinio/shared";

function makeUser(id: string): UserEntity {
  const u = new UserEntity();
  u.id = id;
  u.firstName = "John";
  u.lastName = "Doe";
  u.email = `${id}@test.com`;
  u.role = UserRole.DOCTOR;
  return u;
}

function makeRoom(
  id: string,
  participantIds: string[],
  unreadCount = 0
): RoomWithUnread {
  const r = new RoomEntity() as RoomWithUnread;
  r.id = id;
  r.participants = participantIds.map(makeUser);
  r.createdAt = new Date("2024-01-01");
  r.unreadCount = unreadCount;
  return r;
}

describe("RoomMapper", () => {
  it("maps entity to dto including unreadCount", () => {
    const dto = RoomMapper.toDto(makeRoom("r1", ["u1", "u2"], 3));
    expect(dto.id).toBe("r1");
    expect(dto.unreadCount).toBe(3);
    expect(dto.participants).toHaveLength(2);
    expect(dto.participants[0]).toMatchObject({
      id: "u1",
      email: "u1@test.com",
    });
  });

  it("maps unreadCount = 0 correctly", () => {
    const dto = RoomMapper.toDto(makeRoom("r1", ["u1"]));
    expect(dto.unreadCount).toBe(0);
  });

  it("maps list", () => {
    const dtos = RoomMapper.toDtoList([
      makeRoom("r1", ["u1"], 1),
      makeRoom("r2", ["u2"], 0),
    ]);
    expect(dtos).toHaveLength(2);
    expect(dtos[0].unreadCount).toBe(1);
    expect(dtos[1].unreadCount).toBe(0);
  });
});
