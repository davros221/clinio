import { JwtStrategy, JwtPayload } from "../strategies/jwt.strategy";
import { ConfigService } from "@nestjs/config";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue("test-secret"),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  describe("validate", () => {
    it("should return user object with id and email from payload", () => {
      const payload: JwtPayload = {
        sub: "user-id-123",
        email: "john@example.com",
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: "user-id-123",
        email: "john@example.com",
      });
    });

    it("should map sub to id", () => {
      const payload: JwtPayload = { sub: "abc-123", email: "test@test.com" };

      const result = strategy.validate(payload);

      expect(result.id).toBe(payload.sub);
    });
  });
});
