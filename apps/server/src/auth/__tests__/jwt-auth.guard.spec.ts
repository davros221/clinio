import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { ErrorCode } from "@clinio/shared";

const mockReflector = () => ({
  getAllAndOverride: jest.fn(),
});

const mockExecutionContext = (): Partial<ExecutionContext> => ({
  getHandler: jest.fn(),
  getClass: jest.fn(),
});

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Pick<Reflector, "getAllAndOverride">>;

  beforeEach(() => {
    reflector = mockReflector() as any;
    guard = new JwtAuthGuard(reflector as any);
  });

  describe("canActivate", () => {
    it("should return true for public routes", async () => {
      reflector.getAllAndOverride.mockReturnValue(true);
      const context = mockExecutionContext() as ExecutionContext;

      const superCanActivate = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), "canActivate");
      superCanActivate.mockRejectedValue(new Error("no token"));

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      superCanActivate.mockRestore();
    });

    it("should call super.canActivate for non-public routes", async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const context = mockExecutionContext() as ExecutionContext;

      const superCanActivate = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), "canActivate");
      superCanActivate.mockResolvedValue(true);

      await guard.canActivate(context);

      expect(superCanActivate).toHaveBeenCalledWith(context);
      superCanActivate.mockRestore();
    });
  });

  describe("handleRequest", () => {
    it("should return user when valid", () => {
      const user = { id: "user-id", email: "test@example.com" };

      const result = guard.handleRequest(null, user);

      expect(result).toEqual(user);
    });

    it("should throw UnauthorizedException when error exists", () => {
      expect(() => guard.handleRequest(new Error("fail"), null)).toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when user is falsy", () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });

    it("should throw with UNAUTHORIZED error code", () => {
      try {
        guard.handleRequest(null, null);
        fail("should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).getResponse()).toMatchObject({
          errorCode: ErrorCode.UNAUTHORIZED,
        });
      }
    });
  });
});
