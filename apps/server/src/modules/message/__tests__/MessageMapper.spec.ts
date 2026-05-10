import { MessageMapper } from "../mapper/MessageMapper";
import { MessageEntity } from "../message.entity";

function makeMessage(id: string): MessageEntity {
  const m = new MessageEntity();
  m.id = id;
  m.roomId = "r1";
  m.senderId = "u1";
  m.text = "hello";
  m.createdAt = new Date("2024-01-01");
  return m;
}

describe("MessageMapper", () => {
  it("maps entity to dto", () => {
    const dto = MessageMapper.toDto(makeMessage("m1"));
    expect(dto).toEqual({
      id: "m1",
      roomId: "r1",
      senderId: "u1",
      text: "hello",
      createdAt: new Date("2024-01-01"),
    });
  });

  it("maps list", () => {
    const dtos = MessageMapper.toDtoList([
      makeMessage("m1"),
      makeMessage("m2"),
    ]);
    expect(dtos).toHaveLength(2);
  });
});
